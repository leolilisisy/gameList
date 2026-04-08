#!/bin/bash
# Ralph auto supervisor: repeatedly runs ralph.sh in batches until done or blocked.
# Usage:
#   ./scripts/ralph/ralph-auto.sh [--tool amp|claude|codex] [--batch-iterations N] [--max-runs N] [--sleep-seconds N]
#   ./scripts/ralph/ralph-auto.sh --mode staged-full-auto [--tool amp|claude|codex] [--round ITERATIONS:RUNS]

set -euo pipefail

TOOL="amp"
MODE="classic"
BATCH_ITERATIONS=6
MAX_RUNS=50
SLEEP_SECONDS=10
AUTO_EXPAND="off"
TARGET_WAVE="all"
MAX_NO_PROGRESS_ROUNDS=2
MAX_RETRYABLE_WAITS=6
MAX_PLACEHOLDER_BLOCKED_BATCHES=4
MAX_PLACEHOLDER_BACKOFF_SECONDS=60
EXPAND_FORCE_PASSES=0
EXPAND_FORCE_NOTES=0
AUTO_COMMIT_ON_PASS=0

ROUND_SPECS=()

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
RUN_STATE_FILE="$SCRIPT_DIR/.state/run-state.json"
STATE_DIR="$SCRIPT_DIR/.state"
RUNNER_LOG_FILE="$STATE_DIR/runner.log"
EXPANDER_SCRIPT="$SCRIPT_DIR/expand-core-backlog.mjs"

LAST_BATCH_EXIT_CODE=0
LAST_BATCH_STATUS=""
LAST_BATCH_OUTCOME=""
LAST_BATCH_RUN_ID=""
LAST_BATCH_MANUAL_REASON=""
LAST_BATCH_BLOCKED_REASON=""
LAST_BATCH_LAST_COMPLETED_STORY_ID=""
LAST_BATCH_LAST_COMPLETED_PASSED_NOW="false"
LAST_BATCH_LABEL=""
LAST_REFRESH_ADDED_WORK="false"
LAST_REFRESH_ADDED_PENDING="0"
LAST_REFRESH_WAVE=""

usage() {
  cat <<'EOF'
Usage:
  ./scripts/ralph/ralph-auto.sh [--tool amp|claude|codex] [--batch-iterations N] [--max-runs N] [--sleep-seconds N]
  ./scripts/ralph/ralph-auto.sh --mode staged-full-auto [options]

Classic mode examples:
  ./scripts/ralph/ralph-auto.sh
  ./scripts/ralph/ralph-auto.sh --tool claude --batch-iterations 8 --max-runs 100

Staged full-auto examples:
  ./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude
  ./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude --round 1:1 --round 2:1 --round 4:2 --round 8:999
  ./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude --auto-expand wave --target-wave 2

Options:
  --mode classic|staged-full-auto
  --tool amp|claude|codex
  --batch-iterations N          Classic mode batch size
  --max-runs N                  Max Ralph batch invocations
  --sleep-seconds N             Sleep between batches/retries
  --round ITERS:RUNS            Repeatable staged round definition
  --auto-expand off|once|wave   Backlog refresh policy (default: off in classic, wave in staged-full-auto)
  --target-wave N|all           Highest rollout wave to auto-expand/run in staged mode
  --max-no-progress-rounds N    Stop staged mode after N consecutive no-progress batches
  --max-retryable-waits N       Stop after N consecutive retryable waiting_manual batches
  --max-placeholder-blocked-batches N
                                Stop staged mode after N consecutive placeholder BLOCKED batches
  --expand-force-passes         Pass --force-passes to the expander
  --expand-force-notes          Pass --force-notes to the expander
  --auto-commit-on-pass         After each newly-passed story, auto-create a git commit
                                "feat: [Story ID] - [Story Title]" (passed to ralph.sh)
EOF
}

timestamp_display() {
  date '+%Y-%m-%d %H:%M:%S'
}

ensure_state_dir() {
  mkdir -p "$STATE_DIR"
}

log_auto() {
  local message="[ralph-auto] $*"
  echo "$message"
  ensure_state_dir
  printf '%s %s\n' "$(timestamp_display)" "$message" >> "$RUNNER_LOG_FILE"
}

warn_auto() {
  local message="[ralph-auto] Warning: $*"
  echo "$message" >&2
  ensure_state_dir
  printf '%s %s\n' "$(timestamp_display)" "$message" >> "$RUNNER_LOG_FILE"
}

die() {
  warn_auto "Error: $*"
  exit 1
}

command_available() {
  command -v "$1" >/dev/null 2>&1
}

normalized_blocked_reason() {
  printf '%s' "${1:-}" \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/^[[:space:]]*//; s/[[:space:]]*$//'
}

is_placeholder_blocked_reason() {
  local reason
  reason="$(normalized_blocked_reason "${1:-}")"

  [[ -z "$reason" ]] && return 0
  [[ "$reason" == "..." || "$reason" == "…" ]] && return 0
  [[ "$reason" == "简短原因" || "$reason" == "待确认" || "$reason" == "待补充" ]] && return 0
  [[ "$reason" == "tbd" || "$reason" == "todo" || "$reason" == "n/a" || "$reason" == "na" || "$reason" == "unknown" ]] && return 0
  [[ "$reason" =~ ^[[:punct:][:space:]]+$ ]] && return 0

  return 1
}

all_stories_passed() {
  jq -e '(.userStories // []) | length > 0 and all(.[]; .passes == true)' "$PRD_FILE" >/dev/null 2>&1
}

remaining_story_count() {
  jq -r '[.userStories[]? | select(.passes != true)] | length' "$PRD_FILE" 2>/dev/null || echo "unknown"
}

next_pending_story_id() {
  jq -r '[(.userStories // [])[] | select(.passes != true)] | sort_by(.priority) | .[0].id // empty' "$PRD_FILE" 2>/dev/null || echo ""
}

run_state_field() {
  local key="$1"
  if [[ -f "$RUN_STATE_FILE" ]]; then
    jq -r --arg key "$key" '.[$key] // empty' "$RUN_STATE_FILE" 2>/dev/null || true
  fi
}

is_hard_blocking_status() {
  local status="$1"
  [[ "$status" == "blocked" || "$status" == "failed" ]]
}

is_expected_batch_boundary() {
  local status="$1"
  local outcome="$2"
  [[ "$status" == "failed" && "$outcome" == "max_iterations_reached" ]]
}

is_retryable_manual_wait() {
  local status="$1"
  local outcome="$2"

  [[ "$status" == "waiting_manual" ]] || return 1
  [[ "$outcome" == "tool_network_unavailable" || "$outcome" == "tool_account_unavailable" ]]
}

should_stop_for_manual_wait() {
  local status="$1"
  local outcome="$2"

  [[ "$status" == "waiting_manual" ]] || return 1

  if is_retryable_manual_wait "$status" "$outcome"; then
    return 1
  fi

  return 0
}

story_rollout_wave() {
  local story_id="$1"
  [[ -n "$story_id" ]] || { echo ""; return 0; }

  jq -r --arg id "$story_id" '
    (.userStories // [])
    | map(select(.id == $id))
    | .[0].rolloutWave // 1
  ' "$PRD_FILE" 2>/dev/null || echo "1"
}

max_rollout_wave_in_prd() {
  jq -r '
    (.userStories // [])
    | map(.rolloutWave // 1)
    | if length == 0 then 1 else max end
  ' "$PRD_FILE" 2>/dev/null || echo "1"
}

target_wave_limit() {
  if [[ "$TARGET_WAVE" == "all" ]]; then
    max_rollout_wave_in_prd
  else
    echo "$TARGET_WAVE"
  fi
}

set_default_rounds_if_needed() {
  if [[ "$MODE" == "staged-full-auto" && "${#ROUND_SPECS[@]}" -eq 0 ]]; then
    ROUND_SPECS=("1:1" "2:1" "4:2" "8:999")
  fi
}

validate_round_specs() {
  local spec
  for spec in "${ROUND_SPECS[@]}"; do
    [[ "$spec" =~ ^[0-9]+:[0-9]+$ ]] || die "Invalid --round value: $spec (expected ITERATIONS:RUNS)"
    local iterations="${spec%%:*}"
    local runs="${spec##*:}"
    [[ "$iterations" -gt 0 ]] || die "Round iterations must be > 0: $spec"
    [[ "$runs" -gt 0 ]] || die "Round runs must be > 0: $spec"
  done
}

run_single_batch() {
  local batch_iterations="$1"
  local run_label="$2"
  LAST_BATCH_LABEL="$run_label"

  local remaining_before current_story
  remaining_before="$(remaining_story_count)"
  current_story="$(next_pending_story_id)"
  log_auto "Batch $run_label started (remaining=$remaining_before, next=${current_story:-unknown}, iterations=$batch_iterations)"

  set +e
  local ralph_args=(--tool "$TOOL" "$batch_iterations")
  if [[ "$AUTO_COMMIT_ON_PASS" -eq 1 ]]; then
    ralph_args+=(--auto-commit-on-pass)
  fi
  "$SCRIPT_DIR/ralph.sh" "${ralph_args[@]}"
  LAST_BATCH_EXIT_CODE=$?
  set -e

  LAST_BATCH_STATUS="$(run_state_field status)"
  LAST_BATCH_OUTCOME="$(run_state_field lastOutcome)"
  LAST_BATCH_RUN_ID="$(run_state_field runId)"
  LAST_BATCH_MANUAL_REASON="$(run_state_field manualInterventionReason)"
  LAST_BATCH_BLOCKED_REASON="$(run_state_field blockedReason)"
  LAST_BATCH_LAST_COMPLETED_STORY_ID="$(run_state_field lastCompletedStoryId)"
  LAST_BATCH_LAST_COMPLETED_PASSED_NOW="$(run_state_field lastCompletedStoryPassedNow)"

  log_auto "Batch $run_label finished (exit=$LAST_BATCH_EXIT_CODE, status=${LAST_BATCH_STATUS:-unknown}, outcome=${LAST_BATCH_OUTCOME:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown})"
}

refresh_backlog() {
  local refresh_mode="$1"
  local refresh_value="$2"
  local command=(node "$EXPANDER_SCRIPT" --report-json)

  if [[ "$refresh_mode" == "wave" ]]; then
    command+=(--wave "$refresh_value")
  elif [[ "$refresh_mode" == "up-to-wave" ]]; then
    command+=(--up-to-wave "$refresh_value")
  else
    die "Unsupported refresh mode: $refresh_mode"
  fi

  if [[ "$EXPAND_FORCE_PASSES" -eq 1 ]]; then
    command+=(--force-passes)
  fi
  if [[ "$EXPAND_FORCE_NOTES" -eq 1 ]]; then
    command+=(--force-notes)
  fi

  local output
  if ! output="$(cd "$REPO_ROOT" && "${command[@]}")"; then
    die "Backlog refresh failed (${refresh_mode}=${refresh_value})"
  fi

  LAST_REFRESH_ADDED_WORK="$(printf '%s\n' "$output" | jq -r '.refreshAddedWork')"
  LAST_REFRESH_ADDED_PENDING="$(printf '%s\n' "$output" | jq -r '.addedPendingCount')"
  LAST_REFRESH_WAVE="$refresh_value"

  log_auto "Refresh result (${refresh_mode}=${refresh_value}): addedPending=${LAST_REFRESH_ADDED_PENDING}, refreshAddedWork=${LAST_REFRESH_ADDED_WORK}."
  local added_story_ids
  added_story_ids="$(printf '%s\n' "$output" | jq -r '(.addedPendingStoryIds // []) | join(", ")')"
  if [[ -n "$added_story_ids" ]]; then
    log_auto "New pending stories: $added_story_ids"
  fi
}

refresh_first_wave_with_work() {
  local start_wave="${1:-1}"
  local wave_limit wave_candidate

  wave_limit="$(target_wave_limit)"

  if ! [[ "$start_wave" =~ ^[0-9]+$ ]]; then
    start_wave=1
  fi
  if [[ "$start_wave" -lt 1 ]]; then
    start_wave=1
  fi
  if [[ "$start_wave" -gt "$wave_limit" ]]; then
    return 1
  fi

  for ((wave_candidate=start_wave; wave_candidate<=wave_limit; wave_candidate++)); do
    refresh_backlog "wave" "$wave_candidate"
    if [[ "$LAST_REFRESH_ADDED_WORK" == "true" ]]; then
      printf '%s\n' "$wave_candidate"
      return 0
    fi
  done

  return 1
}

maybe_seed_staged_backlog() {
  local wave_limit
  wave_limit="$(target_wave_limit)"

  if [[ "$AUTO_EXPAND" == "off" ]]; then
    return 0
  fi

  if [[ "$(remaining_story_count)" != "0" ]]; then
    return 0
  fi

  if [[ "$AUTO_EXPAND" == "once" ]]; then
    refresh_backlog "up-to-wave" "$wave_limit"
  else
    refresh_first_wave_with_work 1 >/dev/null || true
  fi
}

sleep_between_batches() {
  local seconds="${1:-$SLEEP_SECONDS}"
  log_auto "Sleeping ${seconds}s..."
  sleep "$seconds"
}

handle_batch_terminal_state() {
  if all_stories_passed; then
    log_auto "Completed: all stories passed (batch=${LAST_BATCH_LABEL:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown})."
    return 10
  fi

  if [[ "$LAST_BATCH_EXIT_CODE" -ne 0 ]]; then
    warn_auto "ralph.sh exited with code $LAST_BATCH_EXIT_CODE (batch=${LAST_BATCH_LABEL:-unknown}, status=${LAST_BATCH_STATUS:-unknown}, outcome=${LAST_BATCH_OUTCOME:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown})."

    if is_expected_batch_boundary "${LAST_BATCH_STATUS:-}" "${LAST_BATCH_OUTCOME:-}"; then
      return 0
    fi

    if is_hard_blocking_status "${LAST_BATCH_STATUS:-}"; then
      if [[ "$LAST_BATCH_STATUS" == "blocked" ]] && is_placeholder_blocked_reason "$LAST_BATCH_BLOCKED_REASON"; then
        warn_auto "Placeholder BLOCKED reason detected (batch=${LAST_BATCH_LABEL:-unknown}, reason='${LAST_BATCH_BLOCKED_REASON:-empty}'); treat as non-blocking and continue."
        return 0
      fi

      warn_auto "Stop on hard blocking status: $LAST_BATCH_STATUS (batch=${LAST_BATCH_LABEL:-unknown})"
      if [[ -n "$LAST_BATCH_BLOCKED_REASON" ]]; then
        warn_auto "blockedReason: $LAST_BATCH_BLOCKED_REASON"
      fi
      return 20
    fi

    if should_stop_for_manual_wait "${LAST_BATCH_STATUS:-}" "${LAST_BATCH_OUTCOME:-}"; then
      warn_auto "Stop on manual gate: status=$LAST_BATCH_STATUS, outcome=${LAST_BATCH_OUTCOME:-unknown}, batch=${LAST_BATCH_LABEL:-unknown}"
      if [[ -n "$LAST_BATCH_MANUAL_REASON" ]]; then
        warn_auto "manualReason: $LAST_BATCH_MANUAL_REASON"
      fi
      return 21
    fi

    if is_retryable_manual_wait "${LAST_BATCH_STATUS:-}" "${LAST_BATCH_OUTCOME:-}"; then
      warn_auto "Retryable manual wait detected: status=$LAST_BATCH_STATUS, outcome=${LAST_BATCH_OUTCOME:-unknown}, batch=${LAST_BATCH_LABEL:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown}."
      return 22
    fi

    return 23
  fi

  if is_expected_batch_boundary "${LAST_BATCH_STATUS:-}" "${LAST_BATCH_OUTCOME:-}"; then
    return 0
  fi

  if is_hard_blocking_status "${LAST_BATCH_STATUS:-}"; then
    if [[ "$LAST_BATCH_STATUS" == "blocked" ]] && is_placeholder_blocked_reason "$LAST_BATCH_BLOCKED_REASON"; then
      warn_auto "Placeholder BLOCKED reason detected (batch=${LAST_BATCH_LABEL:-unknown}, reason='${LAST_BATCH_BLOCKED_REASON:-empty}'); treat as non-blocking and continue."
      return 0
    fi

    warn_auto "Stop on hard blocking status: $LAST_BATCH_STATUS (outcome=${LAST_BATCH_OUTCOME:-unknown}, batch=${LAST_BATCH_LABEL:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown})"
    if [[ -n "$LAST_BATCH_BLOCKED_REASON" ]]; then
      warn_auto "blockedReason: $LAST_BATCH_BLOCKED_REASON"
    fi
    return 20
  fi

  if should_stop_for_manual_wait "${LAST_BATCH_STATUS:-}" "${LAST_BATCH_OUTCOME:-}"; then
    warn_auto "Stop on manual gate: status=$LAST_BATCH_STATUS (outcome=${LAST_BATCH_OUTCOME:-unknown}, batch=${LAST_BATCH_LABEL:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown})"
    if [[ -n "$LAST_BATCH_MANUAL_REASON" ]]; then
      warn_auto "manualReason: $LAST_BATCH_MANUAL_REASON"
    fi
    return 21
  fi

  return 0
}

run_classic_mode() {
  log_auto "Start classic mode: tool=$TOOL, batchIterations=$BATCH_ITERATIONS, maxRuns=$MAX_RUNS"

  if all_stories_passed; then
    log_auto "All stories already passed. Nothing to do."
    exit 0
  fi

  local run result_code remaining_after
  for ((run=1; run<=MAX_RUNS; run++)); do
    run_single_batch "$BATCH_ITERATIONS" "$run/$MAX_RUNS"
    result_code=0
    handle_batch_terminal_state || result_code=$?

    case "$result_code" in
      0)
        remaining_after="$(remaining_story_count)"
        log_auto "Batch done (batch=${LAST_BATCH_LABEL:-unknown}, remaining=$remaining_after, status=${LAST_BATCH_STATUS:-unknown}, outcome=${LAST_BATCH_OUTCOME:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown})."
        sleep_between_batches
        ;;
      10)
        exit 0
        ;;
      20)
        exit "$LAST_BATCH_EXIT_CODE"
        ;;
      21)
        exit "$LAST_BATCH_EXIT_CODE"
        ;;
      22)
        remaining_after="$(remaining_story_count)"
        warn_auto "Continuing after retryable wait (batch=${LAST_BATCH_LABEL:-unknown}, remaining=$remaining_after)."
        sleep_between_batches
        ;;
      *)
        exit "$LAST_BATCH_EXIT_CODE"
        ;;
    esac
  done

  warn_auto "Reached max runs ($MAX_RUNS) before all stories passed."
  exit 3
}

run_staged_mode() {
  local total_runs=0
  local consecutive_no_progress=0
  local consecutive_retryable_waits=0
  local consecutive_placeholder_blocked=0
  local stage_index=0
  local active_wave=""
  local wave_limit result_code round_spec iterations runs stage_run progress_in_stage=0 run_in_stage

  wave_limit="$(target_wave_limit)"
  maybe_seed_staged_backlog

  log_auto "Start staged-full-auto mode: tool=$TOOL, maxRuns=$MAX_RUNS, autoExpand=$AUTO_EXPAND, targetWave=$TARGET_WAVE, rounds=${ROUND_SPECS[*]}, maxPlaceholderBlockedBatches=$MAX_PLACEHOLDER_BLOCKED_BATCHES"

  while true; do
    local current_story
    current_story="$(next_pending_story_id)"

    if [[ -z "$current_story" ]]; then
      if all_stories_passed; then
        if [[ "$AUTO_EXPAND" == "wave" ]]; then
          local next_wave=1
          local refreshed_wave
          if [[ -n "$active_wave" ]]; then
            next_wave=$((active_wave + 1))
          fi

          if refreshed_wave="$(refresh_first_wave_with_work "$next_wave")"; then
            log_auto "Discovered new pending work at wave $refreshed_wave."
            active_wave=""
            stage_index=0
            consecutive_no_progress=0
            continue
          fi
        fi

        log_auto "Staged full-auto completed within target wave scope."
        exit 0
      fi

      die "No pending story found but backlog is not fully passed."
    fi

    local next_wave
    next_wave="$(story_rollout_wave "$current_story")"
    if [[ -n "$next_wave" && "$next_wave" =~ ^[0-9]+$ && "$next_wave" -gt "$wave_limit" ]]; then
      log_auto "Reached target wave limit ($TARGET_WAVE). Next pending story $current_story belongs to wave $next_wave."
      exit 0
    fi

      if [[ "$next_wave" != "$active_wave" ]]; then
        active_wave="$next_wave"
        stage_index=0
        consecutive_no_progress=0
        consecutive_retryable_waits=0
        consecutive_placeholder_blocked=0
        log_auto "Enter wave $active_wave (next story: $current_story)."
      fi

    round_spec="${ROUND_SPECS[$stage_index]}"
    iterations="${round_spec%%:*}"
    runs="${round_spec##*:}"
    progress_in_stage=0
    run_in_stage=1

    while [[ "$runs" == "999" || "$run_in_stage" -le "$runs" ]]; do
      if [[ "$total_runs" -ge "$MAX_RUNS" ]]; then
        warn_auto "Reached max runs ($MAX_RUNS) during staged full-auto mode."
        exit 3
      fi

      local before_remaining before_last_completed before_wave after_remaining after_story after_wave progressed=false
      local placeholder_blocked_batch=false
      local placeholder_backoff_seconds="$SLEEP_SECONDS"
      before_remaining="$(remaining_story_count)"
      before_last_completed="$(run_state_field lastCompletedStoryId)"
      before_wave="$active_wave"

      total_runs=$((total_runs + 1))
      run_single_batch "$iterations" "stage-$((stage_index + 1))/$run_in_stage total-$total_runs"
      result_code=0
      handle_batch_terminal_state || result_code=$?

      case "$result_code" in
        10)
          if [[ "$AUTO_EXPAND" == "wave" ]]; then
            local refreshed_wave
            local next_expand_wave=$((before_wave + 1))
            if refreshed_wave="$(refresh_first_wave_with_work "$next_expand_wave")"; then
              log_auto "Discovered new pending work at wave $refreshed_wave."
              active_wave=""
              stage_index=0
              consecutive_no_progress=0
              break
            fi
          fi
          log_auto "Staged full-auto completed within target wave scope."
          exit 0
          ;;
        20)
          exit "$LAST_BATCH_EXIT_CODE"
          ;;
        21)
          exit "$LAST_BATCH_EXIT_CODE"
          ;;
        22)
          consecutive_retryable_waits=$((consecutive_retryable_waits + 1))
          if [[ "$consecutive_retryable_waits" -ge "$MAX_RETRYABLE_WAITS" ]]; then
            warn_auto "Stop after $consecutive_retryable_waits consecutive retryable waits."
            exit 4
          fi
          sleep_between_batches
          run_in_stage=$((run_in_stage + 1))
          continue
          ;;
        23)
          exit "$LAST_BATCH_EXIT_CODE"
          ;;
      esac

      consecutive_retryable_waits=0
      after_remaining="$(remaining_story_count)"
      after_story="$(next_pending_story_id)"
      after_wave="$(story_rollout_wave "$after_story")"
      if [[ "$LAST_BATCH_STATUS" == "blocked" ]] && is_placeholder_blocked_reason "$LAST_BATCH_BLOCKED_REASON"; then
        placeholder_blocked_batch=true
        consecutive_placeholder_blocked=$((consecutive_placeholder_blocked + 1))
        placeholder_backoff_seconds=$((SLEEP_SECONDS * consecutive_placeholder_blocked))
        if [[ "$placeholder_backoff_seconds" -gt "$MAX_PLACEHOLDER_BACKOFF_SECONDS" ]]; then
          placeholder_backoff_seconds="$MAX_PLACEHOLDER_BACKOFF_SECONDS"
        fi
        warn_auto "Placeholder BLOCKED streak: $consecutive_placeholder_blocked/$MAX_PLACEHOLDER_BLOCKED_BATCHES (batch=${LAST_BATCH_LABEL:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown})."
        if [[ "$consecutive_placeholder_blocked" -ge "$MAX_PLACEHOLDER_BLOCKED_BATCHES" ]]; then
          warn_auto "Stop after $consecutive_placeholder_blocked consecutive placeholder BLOCKED batches. Please inspect prompt/context or switch tool before retrying."
          exit 6
        fi
      else
        consecutive_placeholder_blocked=0
      fi

      if [[ "$after_remaining" != "$before_remaining" && "$after_remaining" =~ ^[0-9]+$ && "$before_remaining" =~ ^[0-9]+$ && "$after_remaining" -lt "$before_remaining" ]]; then
        progressed=true
      elif [[ "$LAST_BATCH_LAST_COMPLETED_PASSED_NOW" == "true" && -n "$LAST_BATCH_LAST_COMPLETED_STORY_ID" && "$LAST_BATCH_LAST_COMPLETED_STORY_ID" != "$before_last_completed" ]]; then
        progressed=true
      fi

      if [[ "$progressed" == "true" ]]; then
        progress_in_stage=1
        consecutive_no_progress=0
        consecutive_placeholder_blocked=0
      elif [[ "$placeholder_blocked_batch" == "true" ]]; then
        log_auto "Skip no-progress increment for placeholder BLOCKED batch (batch=${LAST_BATCH_LABEL:-unknown})."
      else
        consecutive_no_progress=$((consecutive_no_progress + 1))
        if [[ "$consecutive_no_progress" -ge "$MAX_NO_PROGRESS_ROUNDS" ]]; then
          warn_auto "Stop after $consecutive_no_progress consecutive no-progress batches."
          exit 5
        fi
      fi

      if [[ -n "$after_wave" && "$after_wave" != "$before_wave" ]]; then
        log_auto "Wave $before_wave completed; next active wave is $after_wave."
        active_wave=""
        stage_index=0
        consecutive_no_progress=0
        break
      fi

      if [[ -z "$after_story" && all_stories_passed ]]; then
        if [[ "$AUTO_EXPAND" == "wave" ]]; then
          local refreshed_wave
          local next_expand_wave=$((before_wave + 1))
          if refreshed_wave="$(refresh_first_wave_with_work "$next_expand_wave")"; then
            log_auto "Discovered new pending work at wave $refreshed_wave."
            active_wave=""
            stage_index=0
            consecutive_no_progress=0
            break
          fi
        fi

        log_auto "Staged full-auto completed within target wave scope."
        exit 0
      fi

      log_auto "Stage batch done (batch=${LAST_BATCH_LABEL:-unknown}, wave=$before_wave, remaining=$after_remaining, status=${LAST_BATCH_STATUS:-unknown}, outcome=${LAST_BATCH_OUTCOME:-unknown}, runId=${LAST_BATCH_RUN_ID:-unknown}, progressed=$progressed)."
      if [[ "$placeholder_blocked_batch" == "true" ]]; then
        sleep_between_batches "$placeholder_backoff_seconds"
      else
        sleep_between_batches
      fi
      run_in_stage=$((run_in_stage + 1))
    done

    if [[ "$progress_in_stage" -eq 1 && "$stage_index" -lt $((${#ROUND_SPECS[@]} - 1)) ]]; then
      stage_index=$((stage_index + 1))
      log_auto "Escalate to next validation round: ${ROUND_SPECS[$stage_index]}"
    fi
  done
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      [[ $# -ge 2 ]] || die "--mode requires a value"
      MODE="$2"
      shift 2
      ;;
    --tool)
      [[ $# -ge 2 ]] || die "--tool requires a value"
      TOOL="$2"
      shift 2
      ;;
    --batch-iterations)
      [[ $# -ge 2 ]] || die "--batch-iterations requires a value"
      BATCH_ITERATIONS="$2"
      shift 2
      ;;
    --max-runs)
      [[ $# -ge 2 ]] || die "--max-runs requires a value"
      MAX_RUNS="$2"
      shift 2
      ;;
    --sleep-seconds)
      [[ $# -ge 2 ]] || die "--sleep-seconds requires a value"
      SLEEP_SECONDS="$2"
      shift 2
      ;;
    --round)
      [[ $# -ge 2 ]] || die "--round requires a value"
      ROUND_SPECS+=("$2")
      shift 2
      ;;
    --auto-expand)
      [[ $# -ge 2 ]] || die "--auto-expand requires a value"
      AUTO_EXPAND="$2"
      shift 2
      ;;
    --target-wave)
      [[ $# -ge 2 ]] || die "--target-wave requires a value"
      TARGET_WAVE="$2"
      shift 2
      ;;
    --max-no-progress-rounds)
      [[ $# -ge 2 ]] || die "--max-no-progress-rounds requires a value"
      MAX_NO_PROGRESS_ROUNDS="$2"
      shift 2
      ;;
    --max-retryable-waits)
      [[ $# -ge 2 ]] || die "--max-retryable-waits requires a value"
      MAX_RETRYABLE_WAITS="$2"
      shift 2
      ;;
    --max-placeholder-blocked-batches)
      [[ $# -ge 2 ]] || die "--max-placeholder-blocked-batches requires a value"
      MAX_PLACEHOLDER_BLOCKED_BATCHES="$2"
      shift 2
      ;;
    --expand-force-passes)
      EXPAND_FORCE_PASSES=1
      shift
      ;;
    --expand-force-notes)
      EXPAND_FORCE_NOTES=1
      shift
      ;;
    --auto-commit-on-pass)
      AUTO_COMMIT_ON_PASS=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

[[ "$TOOL" == "amp" || "$TOOL" == "claude" || "$TOOL" == "codex" ]] || die "--tool must be amp, claude, or codex"
[[ "$MODE" == "classic" || "$MODE" == "staged-full-auto" ]] || die "--mode must be classic or staged-full-auto"
[[ "$BATCH_ITERATIONS" =~ ^[0-9]+$ ]] || die "--batch-iterations must be integer"
[[ "$MAX_RUNS" =~ ^[0-9]+$ ]] || die "--max-runs must be integer"
[[ "$SLEEP_SECONDS" =~ ^[0-9]+$ ]] || die "--sleep-seconds must be integer"
[[ "$MAX_NO_PROGRESS_ROUNDS" =~ ^[0-9]+$ ]] || die "--max-no-progress-rounds must be integer"
[[ "$MAX_RETRYABLE_WAITS" =~ ^[0-9]+$ ]] || die "--max-retryable-waits must be integer"
[[ "$MAX_PLACEHOLDER_BLOCKED_BATCHES" =~ ^[0-9]+$ ]] || die "--max-placeholder-blocked-batches must be integer"
[[ "$MAX_PLACEHOLDER_BLOCKED_BATCHES" -gt 0 ]] || die "--max-placeholder-blocked-batches must be > 0"
[[ "$AUTO_EXPAND" == "off" || "$AUTO_EXPAND" == "once" || "$AUTO_EXPAND" == "wave" ]] || die "--auto-expand must be off, once, or wave"
if [[ "$TARGET_WAVE" != "all" ]]; then
  [[ "$TARGET_WAVE" =~ ^[0-9]+$ ]] || die "--target-wave must be integer or all"
fi

if [[ "$MODE" == "staged-full-auto" && "$AUTO_EXPAND" == "off" ]]; then
  AUTO_EXPAND="wave"
fi

set_default_rounds_if_needed
validate_round_specs

command_available jq || die "jq is required"
[[ -f "$PRD_FILE" ]] || die "Missing prd file: $PRD_FILE"
if [[ "$AUTO_EXPAND" != "off" ]]; then
  command_available node || die "node is required when auto-expand is enabled"
  [[ -f "$EXPANDER_SCRIPT" ]] || die "Missing expander script: $EXPANDER_SCRIPT"
fi

cd "$REPO_ROOT"

if [[ "$MODE" == "classic" ]]; then
  run_classic_mode
else
  run_staged_mode
fi
