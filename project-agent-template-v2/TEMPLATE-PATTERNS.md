# Starter Repo Stable Patterns

本文件用于总结 `project-agent-template/` 中应长期保持稳定的通用约定。它不是项目实例记忆，而是模板仓库的框架性规则摘要。

## Governance entrypoints

- Root governance entrypoints are `README.md`, `AGENTS.md`, and `CLAUDE.md`.
- `README.md` is the human-friendly entry.
- `AGENTS.md` is the repo-wide agent contract.
- `CLAUDE.md` is the Claude-specific startup entry.

## Source of truth

- `memory-bank/README.md` is the canonical index for operational memory and source-of-truth mapping.
- Phase task status lives only in `memory-bank/phase1-playbook.md` and `memory-bank/phase2-playbook.md`.
- `memory-bank/phase1-task-index.md` and `memory-bank/phase2-task-index.md` are lookup-only, not status sources.
- Ralph backlog is not project status truth.

## Ralph role and boundaries

- Ralph is a supervised local loop, not unattended automation.
- `scripts/ralph/README.md` is the Ralph operator manual.
- `scripts/ralph/prd.json` is Ralph backlog.
- `scripts/ralph/progress.txt` is Ralph human-readable run history.
- `scripts/ralph/.state/run-state.json` is Ralph structured local run-state.
- `scripts/ralph/.state/lock/` is Ralph single-run protection.

## Ralph operator features

- Ralph supports `--check`, `--status`, and `--recover`.
- Ralph stop markers are:
  - `COMPLETE`
  - `BLOCKED`
  - `MANUAL_INTERVENTION_REQUIRED`

## Template hygiene

- Root `.gitignore` should ignore Ralph local runtime artifacts.
- Validation assets belong in `doc/validation/`.
- Project/task rules belong in `memory-bank/`.
- Changes to execution boundaries should be reflected in `memory-bank/@architecture.md` and `scripts/ralph/README.md`.
