#!/bin/bash
# Ralph Wiggum - supervised local AI agent loop
# Usage: ./ralph.sh [--tool amp|claude|codex] [--check|--status|--recover] [max_iterations]

set -euo pipefail

TOOL="amp"
MAX_ITERATIONS=10
MODE="run"
MODE_SET=0
SLEEP_SECONDS=2
HEARTBEAT_SECONDS=15
# Codex speed/quality trade-off:
# - low: fastest, lower reasoning depth
# - medium: balanced (default for Ralph codex runs)
# - high: deeper reasoning, typically slower
CODEX_REASONING_EFFORT="${CODEX_REASONING_EFFORT:-medium}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"
STATE_DIR="$SCRIPT_DIR/.state"
RUN_STATE_FILE="$STATE_DIR/run-state.json"
RUNNER_LOG_FILE="$STATE_DIR/runner.log"
LOCK_DIR="$STATE_DIR/lock"
LOCK_META_FILE="$LOCK_DIR/metadata"
AMP_PROMPT_FILE="$SCRIPT_DIR/prompt.md"
CLAUDE_PROMPT_FILE="$SCRIPT_DIR/CLAUDE.md"
CODEX_PROMPT_FILE="$SCRIPT_DIR/CODEX.md"

AUTO_COMMIT_ON_PASS=0

LOCK_HELD=0
RUN_STARTED=0
FINALIZED=0
INTERRUPTED=0
CURRENT_ITERATION=0
CURRENT_BRANCH=""
RUN_ID=""
RUN_STARTED_AT=""
RUN_FINISHED_AT=""
RUN_STATE_STATUS="idle"
RUN_LAST_OUTCOME=""
RUN_LAST_MESSAGE=""
RUN_LAST_AGENT_SIGNAL=""
RUN_BLOCKED_REASON=""
RUN_MANUAL_REASON=""
RUN_CURRENT_STORY_ID=""
RUN_LAST_COMPLETED_STORY_ID=""
RUN_LAST_COMPLETED_STORY_PASSED_NOW=false
RUN_LAST_AUTO_COMMIT_STATUS=""
RUN_LAST_AUTO_COMMIT_MESSAGE=""
RUN_LAST_AUTO_COMMIT_SHA=""
RUN_EXIT_CODE=""

PRECHECK_ERRORS=()
PRECHECK_WARNINGS=()
PRECHECK_INFOS=()

usage() {
  cat <<'EOF'
Usage:
  ./scripts/ralph/ralph.sh [--tool amp|claude|codex] [--auto-commit-on-pass] [max_iterations]
  ./scripts/ralph/ralph.sh --check [--tool amp|claude|codex] [--auto-commit-on-pass] [max_iterations]
  ./scripts/ralph/ralph.sh --status
  ./scripts/ralph/ralph.sh --recover
  ./scripts/ralph/ralph.sh --help

Modes:
  --check    Run preflight checks without starting the loop
  --status   Show current Ralph lock/run-state status
  --recover  Recover a stale lock or stale running state
  --help     Show this help message

Options:
  --auto-commit-on-pass   When a story newly passes validation, automatically
                          create a git commit: "feat: [Story ID] - [Story Title]"
                          Only commits when soft gate passes (or is not applicable).
                          Skips silently if no staged changes exist.

Environment:
  CODEX_REASONING_EFFORT  low|medium|high (default: medium for --tool codex)

Examples:
  ./scripts/ralph/ralph.sh
  ./scripts/ralph/ralph.sh 3
  ./scripts/ralph/ralph.sh --tool claude 5
  ./scripts/ralph/ralph.sh --tool codex 5
  ./scripts/ralph/ralph.sh --tool claude --auto-commit-on-pass 3
  ./scripts/ralph/ralph.sh --check --tool amp --auto-commit-on-pass
  ./scripts/ralph/ralph.sh --status
  ./scripts/ralph/ralph.sh --recover
EOF
}

timestamp_display() {
  date '+%Y-%m-%d %H:%M:%S'
}

timestamp_iso() {
  date -u '+%Y-%m-%dT%H:%M:%SZ'
}

log() {
  local message="[ralph] $*"
  printf '%s\n' "$message"
  if [[ -n "${RUNNER_LOG_FILE:-}" ]]; then
    ensure_state_dir
    printf '%s %s\n' "$(timestamp_display)" "$message" >> "$RUNNER_LOG_FILE"
  fi
}

warn() {
  local message="[ralph] Warning: $*"
  printf '%s\n' "$message" >&2
  if [[ -n "${RUNNER_LOG_FILE:-}" ]]; then
    ensure_state_dir
    printf '%s %s\n' "$(timestamp_display)" "$message" >> "$RUNNER_LOG_FILE"
  fi
}

die() {
  local message="$1"
  local code="${2:-1}"
  printf '[ralph] Error: %s\n' "$message" >&2
  exit "$code"
}

selected_prompt_file() {
  case "$TOOL" in
    claude)
      printf '%s\n' "$CLAUDE_PROMPT_FILE"
      ;;
    codex)
      printf '%s\n' "$CODEX_PROMPT_FILE"
      ;;
    *)
      printf '%s\n' "$AMP_PROMPT_FILE"
      ;;
  esac
}

tool_login_hint() {
  case "$TOOL" in
    claude)
      printf '%s\n' "Run /login for Claude in the shell that executes Ralph, then retry."
      ;;
    codex)
      printf '%s\n' "Run codex login in the shell that executes Ralph, then retry."
      ;;
    amp)
      printf '%s\n' "Login to Amp in the shell that executes Ralph, then retry."
      ;;
    *)
      printf '%s\n' "Authenticate the selected tool in the shell that executes Ralph, then retry."
      ;;
  esac
}

tool_network_hint() {
  case "$TOOL" in
    codex)
      printf '%s\n' "Check network/DNS connectivity for Codex CLI/OpenAI endpoint (or rerun Ralph with network-enabled execution context), then retry."
      ;;
    amp)
      printf '%s\n' "Check network/DNS connectivity for Amp endpoint (or rerun Ralph with network-enabled execution context), then retry."
      ;;
    *)
      printf '%s\n' "Check network/DNS connectivity for Claude CLI (or rerun Ralph with network-enabled execution context), then retry."
      ;;
  esac
}

tool_capacity_hint() {
  case "$TOOL" in
    codex)
      printf '%s\n' "Retry later when API/account capacity recovers, switch to another authenticated account/API key, or switch tool if available."
      ;;
    amp)
      printf '%s\n' "Retry later when Amp account capacity recovers, switch to another authenticated account, or switch tool if available."
      ;;
    *)
      printf '%s\n' "Retry later when account capacity recovers, switch to another authenticated account, or switch tool if available."
      ;;
  esac
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    die "Required command '$cmd' is not available."
  fi
}

command_available() {
  command -v "$1" >/dev/null 2>&1
}

add_precheck_error() {
  PRECHECK_ERRORS+=("$1")
}

add_precheck_warning() {
  PRECHECK_WARNINGS+=("$1")
}

add_precheck_info() {
  PRECHECK_INFOS+=("$1")
}

print_precheck_report() {
  echo "Ralph preflight report"
  echo "===================="
  for line in "${PRECHECK_INFOS[@]+"${PRECHECK_INFOS[@]}"}"; do
    echo "[ok] $line"
  done
  for line in "${PRECHECK_WARNINGS[@]+"${PRECHECK_WARNINGS[@]}"}"; do
    echo "[warn] $line"
  done
  for line in "${PRECHECK_ERRORS[@]+"${PRECHECK_ERRORS[@]}"}"; do
    echo "[error] $line"
  done
}

is_pid_running() {
  local pid="${1:-}"
  [[ -n "$pid" && "$pid" =~ ^[0-9]+$ ]] && kill -0 "$pid" 2>/dev/null
}

lock_field() {
  local key="$1"
  if [[ -f "$LOCK_META_FILE" ]]; then
    awk -F= -v k="$key" '$1 == k { print substr($0, index($0, "=") + 1); exit }' "$LOCK_META_FILE"
  fi
}

run_state_field() {
  local key="$1"
  if [[ -f "$RUN_STATE_FILE" ]] && command_available jq; then
    jq -r --arg key "$key" '.[$key] // empty' "$RUN_STATE_FILE" 2>/dev/null || true
  fi
}

all_stories_passed() {
  [[ -f "$PRD_FILE" ]] && jq -e '(.userStories // []) | length > 0 and all(.[]; .passes == true)' "$PRD_FILE" >/dev/null 2>&1
}

remaining_story_count() {
  jq -r '[.userStories[]? | select(.passes != true)] | length' "$PRD_FILE" 2>/dev/null || echo "unknown"
}

next_pending_story_id() {
  jq -r '[(.userStories // [])[] | select(.passes != true)] | sort_by(.priority) | .[0].id // empty' "$PRD_FILE" 2>/dev/null || echo ""
}

story_passes_value() {
  local story_id="$1"
  [[ -n "$story_id" ]] || { echo ""; return 0; }
  jq -r --arg id "$story_id" '(.userStories[]? | select(.id == $id) | .passes) // empty' "$PRD_FILE" 2>/dev/null || echo ""
}

story_requires_rules_gate() {
  local story_id="$1"
  [[ -n "$story_id" ]] || return 1

  jq -e --arg id "$story_id" '
    (.userStories[]? | select(.id == $id)) as $s
    | (
        ($s.description // "") + "\n"
        + ($s.notes // "") + "\n"
        + (($s.acceptanceCriteria // []) | join("\n"))
      ) as $text
    | ($text | test("typecheck:rules|test:rules|rules[ -]?layer|soft[ -]?gate"; "i"))
  ' "$PRD_FILE" >/dev/null 2>&1
}

rules_gate_ready() {
  if ! command_available npm; then
    return 1
  fi
  if [[ ! -f "$REPO_ROOT/package.json" ]]; then
    return 2
  fi
  if ! jq -e '.scripts["typecheck:rules"] != null' "$REPO_ROOT/package.json" >/dev/null 2>&1; then
    return 3
  fi
  if ! jq -e '.scripts["test:rules"] != null' "$REPO_ROOT/package.json" >/dev/null 2>&1; then
    return 4
  fi
  return 0
}

rules_gate_reason_from_code() {
  case "$1" in
    1) printf '%s\n' "npm command is unavailable." ;;
    2) printf '%s\n' "package.json is missing at repo root." ;;
    3) printf '%s\n' "package.json is missing scripts.typecheck:rules." ;;
    4) printf '%s\n' "package.json is missing scripts.test:rules." ;;
    *) printf '%s\n' "unknown readiness error." ;;
  esac
}

last_nonempty_line() {
  awk 'NF { line=$0 } END { print line }'
}

run_soft_rules_gate() {
  local story_id="$1"
  [[ -n "$story_id" ]] || return 0

  if ! story_requires_rules_gate "$story_id"; then
    append_runner_event "soft gate skipped" \
      "storyId: $story_id" \
      "reason: Story does not target rules-layer code."
    return 0
  fi

  local ready_code=0
  rules_gate_ready || ready_code=$?
  if [[ "$ready_code" -ne 0 ]]; then
    local reason
    reason="$(rules_gate_reason_from_code "$ready_code")"
    warn "Soft gate skipped for $story_id: $reason"
    append_runner_event "soft gate skipped" \
      "storyId: $story_id" \
      "reason: $reason"
    return 0
  fi

  local typecheck_status=0 test_status=0
  local typecheck_output="" test_output=""
  local typecheck_tail="" test_tail=""

  if typecheck_output="$(cd "$REPO_ROOT" && npm run typecheck:rules 2>&1)"; then
    typecheck_status=0
  else
    typecheck_status=$?
  fi

  if test_output="$(cd "$REPO_ROOT" && npm run test:rules 2>&1)"; then
    test_status=0
  else
    test_status=$?
  fi

  if [[ "$typecheck_status" -eq 0 && "$test_status" -eq 0 ]]; then
    log "Soft gate passed for $story_id (typecheck + test)."
    append_runner_event "soft gate passed" \
      "storyId: $story_id" \
      "validation: npm run typecheck:rules (ok)" \
      "validation: npm run test:rules (ok)"
    return 0
  fi

  typecheck_tail="$(printf '%s\n' "$typecheck_output" | last_nonempty_line)"
  test_tail="$(printf '%s\n' "$test_output" | last_nonempty_line)"
  warn "Soft gate warning for $story_id (typecheck=$typecheck_status, test=$test_status)."

  append_runner_event "soft gate warning" \
    "storyId: $story_id" \
    "validation: npm run typecheck:rules (exit=$typecheck_status)" \
    "validation: npm run test:rules (exit=$test_status)" \
    "typecheck.lastLine: ${typecheck_tail:-n/a}" \
    "test.lastLine: ${test_tail:-n/a}" \
    "impact: soft gate only (does not block Ralph progression)."
}

# Run the soft rules gate and write the result to SOFT_GATE_RESULT:
#   passed | warning | skipped_not_applicable | skipped_unavailable
SOFT_GATE_RESULT=""
run_soft_rules_gate_with_result() {
  local story_id="$1"
  SOFT_GATE_RESULT=""
  [[ -n "$story_id" ]] || { SOFT_GATE_RESULT="skipped_not_applicable"; return 0; }

  if ! story_requires_rules_gate "$story_id"; then
    SOFT_GATE_RESULT="skipped_not_applicable"
    append_runner_event "soft gate skipped" \
      "storyId: $story_id" \
      "reason: Story does not target rules-layer code."
    return 0
  fi

  local ready_code=0
  rules_gate_ready || ready_code=$?
  if [[ "$ready_code" -ne 0 ]]; then
    local reason
    reason="$(rules_gate_reason_from_code "$ready_code")"
    SOFT_GATE_RESULT="skipped_unavailable"
    warn "Soft gate skipped for $story_id: $reason"
    append_runner_event "soft gate skipped" \
      "storyId: $story_id" \
      "reason: $reason"
    return 0
  fi

  local typecheck_status=0 test_status=0
  local typecheck_output="" test_output=""
  local typecheck_tail="" test_tail=""

  if typecheck_output="$(cd "$REPO_ROOT" && npm run typecheck:rules 2>&1)"; then
    typecheck_status=0
  else
    typecheck_status=$?
  fi

  if test_output="$(cd "$REPO_ROOT" && npm run test:rules 2>&1)"; then
    test_status=0
  else
    test_status=$?
  fi

  if [[ "$typecheck_status" -eq 0 && "$test_status" -eq 0 ]]; then
    SOFT_GATE_RESULT="passed"
    log "Soft gate passed for $story_id (typecheck + test)."
    append_runner_event "soft gate passed" \
      "storyId: $story_id" \
      "validation: npm run typecheck:rules (ok)" \
      "validation: npm run test:rules (ok)"
    return 0
  fi

  SOFT_GATE_RESULT="warning"
  typecheck_tail="$(printf '%s\n' "$typecheck_output" | last_nonempty_line)"
  test_tail="$(printf '%s\n' "$test_output" | last_nonempty_line)"
  warn "Soft gate warning for $story_id (typecheck=$typecheck_status, test=$test_status)."

  append_runner_event "soft gate warning" \
    "storyId: $story_id" \
    "validation: npm run typecheck:rules (exit=$typecheck_status)" \
    "validation: npm run test:rules (exit=$test_status)" \
    "typecheck.lastLine: ${typecheck_tail:-n/a}" \
    "test.lastLine: ${test_tail:-n/a}" \
    "impact: soft gate only (does not block Ralph progression)."
}

story_title_by_id() {
  local story_id="$1"
  jq -r --arg id "$story_id" \
    '(.userStories[]? | select(.id == $id) | .title) // empty' \
    "$PRD_FILE" 2>/dev/null || true
}

maybe_auto_commit_story() {
  local story_id="$1"
  local gate_result="$2"   # passed | warning | skipped_not_applicable | skipped_unavailable

  RUN_LAST_AUTO_COMMIT_STATUS=""
  RUN_LAST_AUTO_COMMIT_MESSAGE=""
  RUN_LAST_AUTO_COMMIT_SHA=""

  # Only commit when gate passed or not applicable; skip on warning/unavailable
  if [[ "$gate_result" == "warning" ]]; then
    RUN_LAST_AUTO_COMMIT_STATUS="skipped"
    append_runner_event "auto commit skipped" \
      "storyId: $story_id" \
      "reason: soft gate returned warning; commit deferred to avoid committing broken state."
    return 0
  fi

  # Read title from prd.json
  local title
  title="$(story_title_by_id "$story_id")"
  local commit_msg="feat: $story_id - ${title:-untitled}"

  # Check for uncommitted changes
  local git_status
  git_status="$(git -C "$REPO_ROOT" status --porcelain 2>/dev/null || true)"
  if [[ -z "$git_status" ]]; then
    RUN_LAST_AUTO_COMMIT_STATUS="skipped"
    append_runner_event "auto commit skipped" \
      "storyId: $story_id" \
      "reason: no uncommitted changes in working tree."
    return 0
  fi

  log "Auto-committing story $story_id: $commit_msg"
  local commit_sha=""
  local commit_ok=0
  (
    cd "$REPO_ROOT"
    git add -A
    git commit -m "$commit_msg"
  ) && commit_ok=1 || commit_ok=0

  if [[ "$commit_ok" -eq 1 ]]; then
    commit_sha="$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || true)"
    RUN_LAST_AUTO_COMMIT_STATUS="committed"
    RUN_LAST_AUTO_COMMIT_MESSAGE="$commit_msg"
    RUN_LAST_AUTO_COMMIT_SHA="$commit_sha"
    append_runner_event "auto commit passed" \
      "storyId: $story_id" \
      "commitMessage: $commit_msg" \
      "sha: ${commit_sha:-unknown}"
    log "Auto-commit created: $commit_sha"
  else
    RUN_LAST_AUTO_COMMIT_STATUS="failed"
    RUN_LAST_AUTO_COMMIT_MESSAGE="$commit_msg"
    append_runner_event "auto commit failed" \
      "storyId: $story_id" \
      "commitMessage: $commit_msg" \
      "reason: git commit returned non-zero (continuing Ralph)."
    warn "Auto-commit failed for $story_id. Ralph will continue."
  fi
}

ensure_state_dir() {
  mkdir -p "$STATE_DIR"
}

sanitize_tool_output() {
  local file_path="$1"
  local python_cmd=""
  [[ -f "$file_path" ]] || return 0

  if command_available python3; then
    python_cmd="python3"
  elif command_available python; then
    python_cmd="python"
  else
    return 0
  fi

  "$python_cmd" - "$file_path" <<'PY'
import pathlib
import re
import sys

path = pathlib.Path(sys.argv[1])
text = path.read_text(encoding='utf-8', errors='replace')
patterns = [
    re.compile(r'^.*\[3P telemetry\].*$', re.MULTILINE),
    re.compile(r'^.*OTEL diag error:.*$', re.MULTILINE),
]
for pattern in patterns:
    text = pattern.sub('', text)
text = re.sub(r'\n{3,}', '\n\n', text)
path.write_text(text.lstrip('\n'), encoding='utf-8')
PY
}

ensure_archive_dir() {
  mkdir -p "$ARCHIVE_DIR"
}

initialize_progress_file() {
  cat > "$PROGRESS_FILE" <<EOF
# Ralph Progress Log
Started: $(timestamp_display)
---

## Codebase Patterns

EOF
}

ensure_progress_file() {
  if [[ ! -f "$PROGRESS_FILE" ]]; then
    initialize_progress_file
  fi
}

append_runner_event() {
  local title="$1"
  shift
  ensure_progress_file
  {
    echo
    echo "## [runner] $(timestamp_display) - $title"
    echo "- runId: ${RUN_ID:-unknown}"
    echo "- tool: $TOOL"
    if [[ -n "$CURRENT_BRANCH" ]]; then
      echo "- branch: $CURRENT_BRANCH"
    fi
    if [[ "$CURRENT_ITERATION" -gt 0 ]]; then
      echo "- iteration: $CURRENT_ITERATION/$MAX_ITERATIONS"
    fi
    for line in "$@"; do
      if [[ -n "$line" ]]; then
        echo "- $line"
      fi
    done
    echo "---"
  } >> "$PROGRESS_FILE"
}

write_run_state() {
  ensure_state_dir
  local remaining
  remaining="$(remaining_story_count)"

  jq -n \
    --arg version "1" \
    --arg runId "$RUN_ID" \
    --arg status "$RUN_STATE_STATUS" \
    --arg tool "$TOOL" \
    --arg pid "$$" \
    --arg startedAt "$RUN_STARTED_AT" \
    --arg updatedAt "$(timestamp_iso)" \
    --arg finishedAt "$RUN_FINISHED_AT" \
    --arg branchName "$CURRENT_BRANCH" \
    --arg remainingStories "$remaining" \
    --arg lastOutcome "$RUN_LAST_OUTCOME" \
    --arg lastMessage "$RUN_LAST_MESSAGE" \
    --arg lastAgentSignal "$RUN_LAST_AGENT_SIGNAL" \
    --arg blockedReason "$RUN_BLOCKED_REASON" \
    --arg manualInterventionReason "$RUN_MANUAL_REASON" \
    --arg currentStoryId "$RUN_CURRENT_STORY_ID" \
    --arg lastCompletedStoryId "$RUN_LAST_COMPLETED_STORY_ID" \
    --arg lastAutoCommitStatus "$RUN_LAST_AUTO_COMMIT_STATUS" \
    --arg lastAutoCommitMessage "$RUN_LAST_AUTO_COMMIT_MESSAGE" \
    --arg lastAutoCommitSha "$RUN_LAST_AUTO_COMMIT_SHA" \
    --arg progressFile "$PROGRESS_FILE" \
    --arg prdFile "$PRD_FILE" \
    --arg runnerLogFile "$RUNNER_LOG_FILE" \
    --argjson iteration "$CURRENT_ITERATION" \
    --argjson maxIterations "$MAX_ITERATIONS" \
    --argjson lastCompletedStoryPassedNow "$RUN_LAST_COMPLETED_STORY_PASSED_NOW" \
    '{
      version: $version,
      runId: (if $runId == "" then null else $runId end),
      status: $status,
      tool: $tool,
      pid: ($pid | tonumber),
      startedAt: (if $startedAt == "" then null else $startedAt end),
      updatedAt: $updatedAt,
      finishedAt: (if $finishedAt == "" then null else $finishedAt end),
      iteration: $iteration,
      maxIterations: $maxIterations,
      branchName: (if $branchName == "" then null else $branchName end),
      remainingStories: (if $remainingStories == "" then null else $remainingStories end),
      lastOutcome: (if $lastOutcome == "" then null else $lastOutcome end),
      lastMessage: (if $lastMessage == "" then null else $lastMessage end),
      lastAgentSignal: (if $lastAgentSignal == "" then null else $lastAgentSignal end),
      blockedReason: (if $blockedReason == "" then null else $blockedReason end),
      manualInterventionReason: (if $manualInterventionReason == "" then null else $manualInterventionReason end),
      currentStoryId: (if $currentStoryId == "" then null else $currentStoryId end),
      lastCompletedStoryId: (if $lastCompletedStoryId == "" then null else $lastCompletedStoryId end),
      lastCompletedStoryPassedNow: $lastCompletedStoryPassedNow,
      lastAutoCommitStatus: (if $lastAutoCommitStatus == "" then null else $lastAutoCommitStatus end),
      lastAutoCommitMessage: (if $lastAutoCommitMessage == "" then null else $lastAutoCommitMessage end),
      lastAutoCommitSha: (if $lastAutoCommitSha == "" then null else $lastAutoCommitSha end),
      progressFile: $progressFile,
      prdFile: $prdFile,
      runnerLogFile: $runnerLogFile
    }' > "$RUN_STATE_FILE"
}

mark_existing_run_state_stale() {
  if [[ -f "$RUN_STATE_FILE" ]] && command_available jq; then
    CURRENT_BRANCH="${CURRENT_BRANCH:-$(jq -r '.branchName // empty' "$RUN_STATE_FILE" 2>/dev/null || true)}"
    RUN_ID="${RUN_ID:-$(jq -r '.runId // empty' "$RUN_STATE_FILE" 2>/dev/null || true)}"
    RUN_STARTED_AT="${RUN_STARTED_AT:-$(jq -r '.startedAt // empty' "$RUN_STATE_FILE" 2>/dev/null || true)}"
    RUN_STATE_STATUS="stale"
    RUN_LAST_OUTCOME="stale_recovered"
    RUN_LAST_MESSAGE="$1"
    RUN_LAST_AGENT_SIGNAL=""
    RUN_BLOCKED_REASON=""
    RUN_MANUAL_REASON=""
    RUN_FINISHED_AT="$(timestamp_iso)"
    write_run_state
  fi
}

print_lock_status() {
  if [[ -d "$LOCK_DIR" ]]; then
    local pid tool branch started
    pid="$(lock_field pid)"
    tool="$(lock_field tool)"
    branch="$(lock_field branchName)"
    started="$(lock_field startedAt)"
    if is_pid_running "$pid"; then
      echo "lock: active"
      echo "lock.pid: ${pid:-unknown}"
      echo "lock.tool: ${tool:-unknown}"
      echo "lock.branch: ${branch:-unknown}"
      echo "lock.startedAt: ${started:-unknown}"
    else
      echo "lock: stale"
      echo "lock.pid: ${pid:-unknown}"
      echo "lock.tool: ${tool:-unknown}"
      echo "lock.branch: ${branch:-unknown}"
      echo "lock.startedAt: ${started:-unknown}"
    fi
  else
    echo "lock: none"
  fi
}

print_run_state_summary() {
  if [[ -f "$RUN_STATE_FILE" ]] && command_available jq; then
    jq -r '
      "runState: " + (.status // "unknown"),
      "runState.runId: " + ((.runId // "none") | tostring),
      "runState.iteration: " + ((.iteration // 0) | tostring) + "/" + ((.maxIterations // 0) | tostring),
      "runState.remainingStories: " + ((.remainingStories // "unknown") | tostring),
      "runState.lastOutcome: " + ((.lastOutcome // "none") | tostring),
      "runState.lastMessage: " + ((.lastMessage // "none") | tostring),
      "runState.currentStoryId: " + ((.currentStoryId // "none") | tostring),
      "runState.lastCompletedStoryId: " + ((.lastCompletedStoryId // "none") | tostring),
      "runState.lastCompletedStoryPassedNow: " + ((.lastCompletedStoryPassedNow // false) | tostring),
      "runState.lastAutoCommitStatus: " + ((.lastAutoCommitStatus // "none") | tostring),
      "runState.lastAutoCommitSha: " + ((.lastAutoCommitSha // "none") | tostring),
      "runState.runnerLogFile: " + ((.runnerLogFile // "none") | tostring),
      "runState.updatedAt: " + ((.updatedAt // "unknown") | tostring)
    ' "$RUN_STATE_FILE"
  else
    echo "runState: none"
  fi
}

print_status() {
  echo "Ralph status"
  echo "============"
  echo "repoRoot: $REPO_ROOT"
  echo "tool: $TOOL"
  if [[ -f "$PRD_FILE" ]] && command_available jq; then
    echo "branchName: $(jq -r '.branchName // "unknown"' "$PRD_FILE" 2>/dev/null || echo "unknown")"
    echo "remainingStories: $(remaining_story_count)"
  else
    echo "branchName: unknown"
    echo "remainingStories: unknown"
  fi
  print_lock_status
  print_run_state_summary
}

acquire_lock() {
  ensure_state_dir

  if mkdir "$LOCK_DIR" 2>/dev/null; then
    LOCK_HELD=1
    cat > "$LOCK_META_FILE" <<EOF
pid=$$
tool=$TOOL
branchName=$CURRENT_BRANCH
startedAt=$(timestamp_iso)
repoRoot=$REPO_ROOT
EOF
    return 0
  fi

  local existing_pid
  existing_pid="$(lock_field pid)"
  if is_pid_running "$existing_pid"; then
    echo "Ralph already running."
    print_lock_status
    return 1
  fi

  echo "Detected stale Ralph lock."
  print_lock_status
  return 2
}

release_lock() {
  if [[ "$LOCK_HELD" -eq 1 && -d "$LOCK_DIR" ]]; then
    local lock_pid
    lock_pid="$(lock_field pid)"
    if [[ "$lock_pid" == "$$" || -z "$lock_pid" ]]; then
      rm -rf "$LOCK_DIR"
    fi
  fi
  LOCK_HELD=0
}

archive_previous_run_if_branch_changed() {
  if [[ -f "$PRD_FILE" && -f "$LAST_BRANCH_FILE" ]]; then
    local last_branch archive_folder folder_name timestamp
    last_branch="$(cat "$LAST_BRANCH_FILE" 2>/dev/null || true)"

    if [[ -n "$CURRENT_BRANCH" && -n "$last_branch" && "$CURRENT_BRANCH" != "$last_branch" ]]; then
      ensure_archive_dir
      timestamp="$(date +%Y-%m-%d-%H%M%S)"
      folder_name="$(printf '%s' "$last_branch" | sed 's|^ralph/||; s|[^A-Za-z0-9._-]|-|g')"
      archive_folder="$ARCHIVE_DIR/$timestamp-$folder_name"

      log "Archiving previous run: $last_branch"
      mkdir -p "$archive_folder"
      [[ -f "$PRD_FILE" ]] && cp "$PRD_FILE" "$archive_folder/"
      [[ -f "$PROGRESS_FILE" ]] && cp "$PROGRESS_FILE" "$archive_folder/"
      log "Archived to: $archive_folder"

      initialize_progress_file
    fi
  fi
}

track_current_branch() {
  if [[ -n "$CURRENT_BRANCH" ]]; then
    printf '%s\n' "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
  fi
}

run_preflight() {
  PRECHECK_ERRORS=()
  PRECHECK_WARNINGS=()
  PRECHECK_INFOS=()
  CURRENT_BRANCH=""

  if command_available jq; then
    add_precheck_info "Found command: jq"
  else
    add_precheck_error "Missing command: jq"
  fi

  if command_available git; then
    add_precheck_info "Found command: git"
  else
    add_precheck_error "Missing command: git"
  fi

  if command_available "$TOOL"; then
    add_precheck_info "Found command: $TOOL"
  else
    add_precheck_error "Missing command: $TOOL"
  fi

  if command_available git; then
    if git -C "$REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      add_precheck_info "Git work tree detected: $REPO_ROOT"
    else
      add_precheck_error "Not inside a git work tree: $REPO_ROOT"
    fi
  fi

  local prompt_file
  prompt_file="$(selected_prompt_file)"
  if [[ -f "$prompt_file" ]]; then
    add_precheck_info "Prompt file exists: $prompt_file"
  else
    add_precheck_error "Missing prompt file: $prompt_file"
  fi

  if [[ -f "$PRD_FILE" ]]; then
    add_precheck_info "PRD file exists: $PRD_FILE"
    if command_available jq; then
      if jq -e . "$PRD_FILE" >/dev/null 2>&1; then
        add_precheck_info "PRD file is valid JSON"
        CURRENT_BRANCH="$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || true)"
        local story_count
        story_count="$(jq -r '(.userStories // []) | length' "$PRD_FILE" 2>/dev/null || echo "0")"
        if [[ -n "$CURRENT_BRANCH" ]]; then
          add_precheck_info "PRD branchName: $CURRENT_BRANCH"
        else
          add_precheck_error "PRD missing non-empty branchName"
        fi
        if [[ "$story_count" =~ ^[0-9]+$ ]] && [[ "$story_count" -gt 0 ]]; then
          add_precheck_info "PRD stories: $story_count"
          add_precheck_info "Remaining stories: $(remaining_story_count)"
        else
          add_precheck_error "PRD has no userStories"
        fi
      else
        add_precheck_error "PRD file is not valid JSON"
      fi
    fi
  else
    add_precheck_error "Missing PRD file: $PRD_FILE"
  fi

  if [[ -e "$PROGRESS_FILE" ]]; then
    if [[ -w "$PROGRESS_FILE" ]]; then
      add_precheck_info "progress.txt is writable"
    else
      add_precheck_error "progress.txt is not writable"
    fi
  else
    if [[ -w "$SCRIPT_DIR" ]]; then
      add_precheck_info "progress.txt can be initialized"
    else
      add_precheck_error "Ralph directory is not writable, cannot initialize progress.txt"
    fi
  fi

  if [[ -e "$ARCHIVE_DIR" ]]; then
    if [[ -w "$ARCHIVE_DIR" ]]; then
      add_precheck_info "archive directory is writable"
    else
      add_precheck_error "archive directory is not writable"
    fi
  else
    if [[ -w "$SCRIPT_DIR" ]]; then
      add_precheck_info "archive directory can be created"
    else
      add_precheck_error "Ralph directory is not writable, cannot create archive directory"
    fi
  fi

  if [[ -d "$LOCK_DIR" ]]; then
    local existing_pid
    existing_pid="$(lock_field pid)"
    if is_pid_running "$existing_pid"; then
      add_precheck_warning "Active Ralph lock detected (pid ${existing_pid:-unknown})"
    else
      add_precheck_warning "Stale Ralph lock detected"
    fi
  else
    add_precheck_info "No active Ralph lock"
  fi

  if [[ -f "$RUN_STATE_FILE" ]] && command_available jq; then
    add_precheck_info "Last run-state: $(jq -r '.status // "unknown"' "$RUN_STATE_FILE" 2>/dev/null || echo "unknown")"
  else
    add_precheck_info "No existing run-state file"
  fi

  if command_available jq; then
    local rules_gate_code=0
    rules_gate_ready || rules_gate_code=$?
    if [[ "$rules_gate_code" -eq 0 ]]; then
      add_precheck_info "Soft rules gate ready: npm run typecheck:rules + npm run test:rules"
    else
      add_precheck_warning "Soft rules gate unavailable: $(rules_gate_reason_from_code "$rules_gate_code")"
    fi
  fi

  if [[ "$AUTO_COMMIT_ON_PASS" -eq 1 ]]; then
    add_precheck_info "Auto-commit-on-pass: ENABLED (will commit after each newly-passed story)"
    if command_available git; then
      local dirty_check
      dirty_check="$(git -C "$REPO_ROOT" status --porcelain 2>/dev/null || true)"
      if [[ -n "$dirty_check" ]]; then
        add_precheck_warning "Working tree is dirty before Ralph starts. Auto-commit will include pre-existing changes in the first commit."
      else
        add_precheck_info "Working tree is clean before Ralph starts."
      fi
    fi
  else
    add_precheck_info "Auto-commit-on-pass: disabled (use --auto-commit-on-pass to enable)"
  fi

  if [[ "$TOOL" == "codex" ]]; then
    add_precheck_info "Codex reasoning effort: $CODEX_REASONING_EFFORT (override with CODEX_REASONING_EFFORT=low|medium|high)"
  fi

  [[ "${#PRECHECK_ERRORS[@]}" -eq 0 ]]
}

setup_traps() {
  trap 'cleanup EXIT' EXIT
  trap 'handle_signal INT 130' INT
  trap 'handle_signal TERM 143' TERM
}

handle_signal() {
  local signal_name="$1"
  local code="$2"
  INTERRUPTED=1
  RUN_EXIT_CODE="$code"
  RUN_LAST_MESSAGE="Received signal $signal_name"
  exit "$code"
}

cleanup() {
  local origin="$1"
  local shell_exit_code="$?"
  local exit_code="${RUN_EXIT_CODE:-$shell_exit_code}"

  trap - EXIT INT TERM

  if [[ "$FINALIZED" -eq 0 && "$RUN_STARTED" -eq 1 ]]; then
    RUN_FINISHED_AT="$(timestamp_iso)"

    if [[ "$INTERRUPTED" -eq 1 ]]; then
      RUN_STATE_STATUS="interrupted"
      RUN_LAST_OUTCOME="interrupted"
      write_run_state || true
      append_runner_event "run interrupted" \
        "remainingStories: $(remaining_story_count)" \
        "message: ${RUN_LAST_MESSAGE:-Ralph interrupted.}" || true
    elif [[ "$origin" == "EXIT" && "$exit_code" -ne 0 ]]; then
      RUN_STATE_STATUS="failed"
      RUN_LAST_OUTCOME="runner_failed"
      if [[ -z "$RUN_LAST_MESSAGE" ]]; then
        RUN_LAST_MESSAGE="Ralph exited unexpectedly."
      fi
      write_run_state || true
      append_runner_event "run failed" \
        "remainingStories: $(remaining_story_count)" \
        "message: $RUN_LAST_MESSAGE" || true
    fi
  fi

  release_lock || true
  exit "$exit_code"
}

extract_reason() {
  local output="$1"
  local reason_regex='<reason>([^<]+)</reason>'
  if [[ "$output" =~ $reason_regex ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
  fi
}

detect_agent_signal() {
  local output="$1"

  if [[ "$output" == *"<promise>BLOCKED</promise>"* ]]; then
    printf 'BLOCKED\n'
  elif [[ "$output" == *"<promise>MANUAL_INTERVENTION_REQUIRED</promise>"* ]]; then
    printf 'MANUAL_INTERVENTION_REQUIRED\n'
  elif [[ "$output" == *"<promise>COMPLETE</promise>"* ]]; then
    printf 'COMPLETE\n'
  else
    printf '\n'
  fi
}

extract_agent_output() {
  local output="$1"

  # Codex CLI logs may include transcript roles plus many `exec` blocks.
  # Promise markers should be parsed from the final model answer block only.
  if [[ "$TOOL" == "codex" ]]; then
    printf '%s\n' "$output" | awk '
      BEGIN { capture = 0; saw_model = 0; block = "" }
      /^[[:space:]]*(assistant|codex)[[:space:]]*$/ {
        capture = 1
        saw_model = 1
        block = ""
        next
      }
      /^[[:space:]]*(user|system|tool|exec)[[:space:]]*$/ {
        if (capture) {
          capture = 0
        }
      }
      {
        if (capture) {
          block = block $0 ORS
        }
      }
      END {
        if (saw_model) {
          printf "%s", block
        }
      }
    '
    return 0
  fi

  printf '%s\n' "$output"
}

finalize_run() {
  local status="$1"
  local outcome="$2"
  local message="$3"
  local signal="${4:-}"
  local reason="${5:-}"

  RUN_STATE_STATUS="$status"
  RUN_LAST_OUTCOME="$outcome"
  RUN_LAST_MESSAGE="$message"
  RUN_LAST_AGENT_SIGNAL="$signal"
  RUN_BLOCKED_REASON=""
  RUN_MANUAL_REASON=""

  if [[ "$status" == "blocked" ]]; then
    RUN_BLOCKED_REASON="$reason"
  fi
  if [[ "$status" == "waiting_manual" ]]; then
    RUN_MANUAL_REASON="$reason"
  fi

  RUN_FINISHED_AT="$(timestamp_iso)"
  FINALIZED=1
  write_run_state

  local lines=(
    "remainingStories: $(remaining_story_count)"
    "message: $message"
  )

  if [[ -n "$signal" ]]; then
    lines+=("agentSignal: $signal")
  fi
  if [[ -n "$reason" ]]; then
    lines+=("reason: $reason")
  fi

  append_runner_event "run $status" "${lines[@]}"
}

detect_tool_issue() {
  local output="$1"
  local exit_code="${2:-0}"
  local nonzero_exit=0
  if [[ "$exit_code" =~ ^[0-9]+$ ]] && [[ "$exit_code" -ne 0 ]]; then
    nonzero_exit=1
  fi

  if [[ "$output" == *"Not logged in · Please run /login"* ]] || [[ "$output" == *"Run codex login"* ]] || [[ "$output" == *"Please run codex login"* ]] || [[ "$output" == *"Authentication required"* ]]; then
    printf 'NOT_LOGGED_IN\n'
  elif [[ "$output" == *"No available accounts"* ]] || [[ "$output" == *"API Error: 503"* ]] || [[ "$output" == *"429 Too Many Requests"* ]] || [[ "$output" == *"rate limit"* ]] || [[ "$output" == *"Rate limit"* ]] || [[ "$output" == *"RATE_LIMIT"* ]]; then
    if [[ "$nonzero_exit" -eq 1 ]]; then
      printf 'ACCOUNT_UNAVAILABLE\n'
    else
      printf '\n'
    fi
  elif [[ "$output" == *"API Error: Unable to connect to API"* ]] || [[ "$output" == *"ENOTFOUND"* ]] || [[ "$output" == *"EAI_AGAIN"* ]] || [[ "$output" == *"ECONNREFUSED"* ]] || [[ "$output" == *"ETIMEDOUT"* ]] || [[ "$output" == *"Connection error"* ]] || [[ "$output" == *"stream disconnected before completion"* ]] || [[ "$output" == *"error sending request for url"* ]]; then
    if [[ "$nonzero_exit" -eq 1 ]]; then
      printf 'NETWORK_UNAVAILABLE\n'
    else
      printf '\n'
    fi
  else
    printf '\n'
  fi
}

run_iteration() {
  local output_file exit_file cmd_pid start_ts elapsed
  output_file="$STATE_DIR/tool-output.$$.$CURRENT_ITERATION.log"
  exit_file="$STATE_DIR/tool-exit.$$.$CURRENT_ITERATION"
  start_ts="$(date +%s)"

  rm -f "$output_file" "$exit_file"

  case "$TOOL" in
    amp)
      (
        set -o pipefail
        amp --dangerously-allow-all < "$AMP_PROMPT_FILE" 2>&1 | tee "$output_file"
        printf '%s\n' "$?" > "$exit_file"
      ) &
      ;;
    claude)
      (
        set -o pipefail
        claude --dangerously-skip-permissions --print < "$CLAUDE_PROMPT_FILE" 2>&1 | tee "$output_file"
        printf '%s\n' "$?" > "$exit_file"
      ) &
      ;;
    codex)
      (
        set -o pipefail
        codex exec \
          --dangerously-bypass-approvals-and-sandbox \
          -c "model_reasoning_effort=\"$CODEX_REASONING_EFFORT\"" \
          < "$CODEX_PROMPT_FILE" 2>&1 | tee "$output_file"
        printf '%s\n' "$?" > "$exit_file"
      ) &
      ;;
    *)
      die "Unsupported tool '$TOOL' in run_iteration."
      ;;
  esac
  cmd_pid=$!

  log "Waiting for $TOOL to finish (iteration $CURRENT_ITERATION/$MAX_ITERATIONS, pid $cmd_pid)..."
  RUN_LAST_OUTCOME="iteration_in_progress"
  RUN_LAST_MESSAGE="Waiting for $TOOL to finish iteration $CURRENT_ITERATION (pid $cmd_pid)."
  write_run_state

  while is_pid_running "$cmd_pid"; do
    sleep "$HEARTBEAT_SECONDS"
    if is_pid_running "$cmd_pid"; then
      elapsed=$(( $(date +%s) - start_ts ))
      RUN_LAST_OUTCOME="iteration_in_progress"
      RUN_LAST_MESSAGE="Still waiting for $TOOL iteration $CURRENT_ITERATION (pid $cmd_pid, ${elapsed}s elapsed)."
      write_run_state
      log "Still running: iteration $CURRENT_ITERATION/$MAX_ITERATIONS, pid $cmd_pid, elapsed ${elapsed}s."
    fi
  done

  wait "$cmd_pid" || true

  local exit_code=0
  if [[ -f "$exit_file" ]]; then
    exit_code="$(tr -d '\r\n' < "$exit_file")"
  fi
  [[ "$exit_code" =~ ^[0-9]+$ ]] || exit_code=1

  sanitize_tool_output "$output_file"

  local output=""
  if [[ -f "$output_file" ]]; then
    output="$(cat "$output_file")"
  fi

  rm -f "$output_file" "$exit_file"

  printf '%s\n__RALPH_EXIT_CODE__=%s\n' "$output" "$exit_code"
}

recover_stale_run() {
  local recovered=0

  if [[ -d "$LOCK_DIR" ]]; then
    local existing_pid
    existing_pid="$(lock_field pid)"
    if is_pid_running "$existing_pid"; then
      die "Active Ralph run detected (pid ${existing_pid}). Refusing to recover." 3
    fi

    mark_existing_run_state_stale "Recovered stale lock from pid ${existing_pid:-unknown}."
    rm -rf "$LOCK_DIR"
    recovered=1
    log "Recovered stale Ralph lock."
  fi

  if [[ -f "$RUN_STATE_FILE" ]] && command_available jq; then
    local state_status state_pid
    state_status="$(run_state_field status)"
    state_pid="$(run_state_field pid)"

    if [[ "$state_status" =~ ^(starting|running)$ ]] && ! is_pid_running "$state_pid"; then
      CURRENT_BRANCH="$(run_state_field branchName)"
      RUN_ID="$(run_state_field runId)"
      RUN_STARTED_AT="$(run_state_field startedAt)"
      mark_existing_run_state_stale "Recovered stale run-state from pid ${state_pid:-unknown}."
      recovered=1
      log "Recovered stale Ralph run-state."
    fi
  fi

  if [[ "$recovered" -eq 0 ]]; then
    log "Nothing to recover. No stale lock or stale running state detected."
  fi
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --help|-h)
        MODE="help"
        MODE_SET=1
        shift
        ;;
      --check)
        if [[ "$MODE_SET" -eq 1 && "$MODE" != "check" ]]; then
          die "Only one mode flag can be used at a time."
        fi
        MODE="check"
        MODE_SET=1
        shift
        ;;
      --status)
        if [[ "$MODE_SET" -eq 1 && "$MODE" != "status" ]]; then
          die "Only one mode flag can be used at a time."
        fi
        MODE="status"
        MODE_SET=1
        shift
        ;;
      --recover)
        if [[ "$MODE_SET" -eq 1 && "$MODE" != "recover" ]]; then
          die "Only one mode flag can be used at a time."
        fi
        MODE="recover"
        MODE_SET=1
        shift
        ;;
      --tool)
        [[ $# -ge 2 ]] || die "Missing value for --tool"
        TOOL="$2"
        shift 2
        ;;
      --tool=*)
        TOOL="${1#*=}"
        shift
        ;;
      --auto-commit-on-pass)
        AUTO_COMMIT_ON_PASS=1
        shift
        ;;
      *)
        if [[ "$1" =~ ^[0-9]+$ ]]; then
          MAX_ITERATIONS="$1"
          shift
        else
          die "Unknown argument: $1"
        fi
        ;;
    esac
  done
}

parse_args "$@"

if [[ "$MODE" == "help" ]]; then
  usage
  exit 0
fi

if [[ "$TOOL" != "amp" && "$TOOL" != "claude" && "$TOOL" != "codex" ]]; then
  die "Invalid tool '$TOOL'. Must be 'amp', 'claude', or 'codex'."
fi

if ! [[ "$MAX_ITERATIONS" =~ ^[0-9]+$ ]] || [[ "$MAX_ITERATIONS" -le 0 ]]; then
  die "max_iterations must be a positive integer."
fi

case "$MODE" in
  check)
    if run_preflight; then
      print_precheck_report
      exit 0
    else
      print_precheck_report
      exit 2
    fi
    ;;
  status)
    print_status
    exit 0
    ;;
  recover)
    recover_stale_run
    exit 0
    ;;
  run)
    if ! run_preflight; then
      print_precheck_report
      die "Preflight failed. Fix the reported issues or run --check for diagnostics." 2
    fi

    ensure_state_dir

    if ! acquire_lock; then
      lock_result=$?
      if [[ "$lock_result" -eq 2 ]]; then
        die "Stale lock detected. Run ./scripts/ralph/ralph.sh --recover before starting a new run." 3
      fi
      die "Another Ralph run is already active." 3
    fi

    setup_traps
    ensure_archive_dir

    CURRENT_BRANCH="$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || true)"
    RUN_ID="$(date +%Y%m%d-%H%M%S)-$$"
    RUN_STARTED_AT="$(timestamp_iso)"
    RUN_STATE_STATUS="starting"
    RUN_LAST_OUTCOME="preflight_passed"
    RUN_LAST_MESSAGE="Ralph preflight checks passed."
    write_run_state

    archive_previous_run_if_branch_changed
    track_current_branch
    ensure_progress_file

    RUN_STARTED=1
    RUN_STATE_STATUS="running"
    RUN_LAST_OUTCOME="run_started"
    RUN_LAST_MESSAGE="Ralph started."
    write_run_state
    append_runner_event "run started" \
      "remainingStories: $(remaining_story_count)" \
      "maxIterations: $MAX_ITERATIONS"

    if all_stories_passed; then
      finalize_run "completed" "all_stories_passed" "All stories were already marked as passed in prd.json."
      log "Ralph completed all tasks before entering the loop."
      exit 0
    fi

    log "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS"

    for i in $(seq 1 "$MAX_ITERATIONS"); do
      CURRENT_ITERATION="$i"
      ITERATION_STORY_ID="$(next_pending_story_id)"
      ITERATION_STORY_PASSES_BEFORE="$(story_passes_value "$ITERATION_STORY_ID")"
      RUN_CURRENT_STORY_ID="$ITERATION_STORY_ID"
      RUN_LAST_COMPLETED_STORY_PASSED_NOW=false
      RUN_STATE_STATUS="running"
      RUN_LAST_OUTCOME="iteration_started"
      RUN_LAST_MESSAGE="Starting iteration $i."
      write_run_state

      echo
      echo "==============================================================="
      echo "  Ralph Iteration $i of $MAX_ITERATIONS ($TOOL)"
      echo "==============================================================="

      append_runner_event "iteration started" "remainingStories: $(remaining_story_count)"

      iteration_result="$(run_iteration)"
      tool_exit_code="$(printf '%s\n' "$iteration_result" | awk -F= '/__RALPH_EXIT_CODE__=/{print $2; exit}')"
      OUTPUT="$(printf '%s\n' "$iteration_result" | awk '!/__RALPH_EXIT_CODE__=/' )"
      AGENT_OUTPUT="$(extract_agent_output "$OUTPUT")"
      agent_signal="$(detect_agent_signal "$AGENT_OUTPUT")"
      agent_reason="$(extract_reason "$AGENT_OUTPUT")"
      tool_issue="$(detect_tool_issue "$OUTPUT" "$tool_exit_code")"
      ITERATION_STORY_PASSES_AFTER="$(story_passes_value "$ITERATION_STORY_ID")"

      if [[ -n "$ITERATION_STORY_ID" && "$ITERATION_STORY_PASSES_BEFORE" != "true" && "$ITERATION_STORY_PASSES_AFTER" == "true" ]]; then
        RUN_LAST_COMPLETED_STORY_ID="$ITERATION_STORY_ID"
        RUN_LAST_COMPLETED_STORY_PASSED_NOW=true
        run_soft_rules_gate_with_result "$ITERATION_STORY_ID"
        if [[ "$AUTO_COMMIT_ON_PASS" -eq 1 ]]; then
          maybe_auto_commit_story "$ITERATION_STORY_ID" "$SOFT_GATE_RESULT"
        fi
      fi

      if [[ "$agent_signal" == "BLOCKED" ]]; then
        finalize_run "blocked" "agent_blocked" "Ralph stopped because the agent reported a blocker." "$agent_signal" "$agent_reason"
        log "Ralph stopped: blocked."
        RUN_EXIT_CODE=4
        exit 4
      fi

      if [[ "$agent_signal" == "MANUAL_INTERVENTION_REQUIRED" ]]; then
        finalize_run "waiting_manual" "manual_intervention_required" "Ralph stopped because manual intervention is required." "$agent_signal" "$agent_reason"
        log "Ralph stopped: manual intervention required."
        RUN_EXIT_CODE=5
        exit 5
      fi

      if [[ "$agent_signal" == "COMPLETE" ]]; then
        finalize_run "completed" "agent_signaled_complete" "Ralph completed all tasks." "$agent_signal"
        log "Ralph completed all tasks!"
        RUN_EXIT_CODE=0
        exit 0
      fi

      if [[ "$tool_issue" == "NOT_LOGGED_IN" ]]; then
        finalize_run "waiting_manual" "tool_login_required" "The selected tool requires login in the current shell environment." "$agent_signal" "$(tool_login_hint)"
        log "Ralph stopped: selected tool login required."
        RUN_EXIT_CODE=6
        exit 6
      fi

      if [[ "$tool_issue" == "NETWORK_UNAVAILABLE" ]]; then
        finalize_run "waiting_manual" "tool_network_unavailable" "The selected tool could not reach the API endpoint." "$agent_signal" "$(tool_network_hint)"
        log "Ralph stopped: selected tool cannot reach API endpoint."
        RUN_EXIT_CODE=7
        exit 7
      fi

      if [[ "$tool_issue" == "ACCOUNT_UNAVAILABLE" ]]; then
        finalize_run "waiting_manual" "tool_account_unavailable" "The selected tool reported account or capacity unavailable." "$agent_signal" "$(tool_capacity_hint)"
        log "Ralph stopped: selected tool account capacity unavailable."
        RUN_EXIT_CODE=8
        exit 8
      fi

      if all_stories_passed; then
        finalize_run "completed" "all_stories_passed" "Ralph detected all stories passed in prd.json."
        log "Ralph detected all stories passed in prd.json."
        RUN_EXIT_CODE=0
        exit 0
      fi

      if [[ "$tool_exit_code" != "0" ]]; then
        finalize_run "failed" "tool_command_failed" "The selected tool exited with a non-zero status ($tool_exit_code)."
        log "Ralph stopped because the selected tool exited with code $tool_exit_code."
        RUN_EXIT_CODE="$tool_exit_code"
        exit "$tool_exit_code"
      fi

      RUN_LAST_OUTCOME="iteration_finished"
      RUN_LAST_MESSAGE="Iteration $i finished without terminal signal."
      RUN_CURRENT_STORY_ID=""
      write_run_state
      append_runner_event "iteration finished" \
        "remainingStories: $(remaining_story_count)" \
        "agentSignal: none"

      log "Iteration $i complete. Remaining stories: $(remaining_story_count). Continuing..."
      sleep "$SLEEP_SECONDS"
    done

    finalize_run "failed" "max_iterations_reached" "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
    log "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
    log "Remaining stories: $(remaining_story_count)"
    log "Check $PROGRESS_FILE for status."
    exit 1
    ;;
esac
