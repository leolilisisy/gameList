# CLAUDE.md（{{PROJECT_NAME}}）

本文件是 Claude 在 {{PROJECT_NAME}} 仓库中的启动入口。

## 开始前先读

1. `README.md`
2. `AGENTS.md`
3. `memory-bank/README.md`
4. `memory-bank/@product-requirements.md`
5. `memory-bank/@tech-stack.md`
6. `memory-bank/@architecture.md`
7. `memory-bank/@coding-rules.md`

根据任务类型继续：

- 按 Phase 执行：对应 playbook + `memory-bank/@ai-task-execution-rules.md` + `memory-bank/task-command-protocol.md`
- 使用 Ralph：`scripts/ralph/README.md`
- 使用角色协议：`scripts/agent/README.md`
- 做 migration / porting（若启用）：`memory-bank/porting-principles.md`、`memory-bank/domain-map.template.md`、`memory-bank/migration-manifest.template.md`、`memory-bank/licensing-and-clean-room.md`
- 做 validation / manual acceptance（若启用）：`doc/validation/manual-acceptance-checklist.md`、`doc/validation/parity-checklist.md`、`doc/validation/compatibility-checklist.md`
- 做 Ralph troubleshooting（若启用）：`memory-bank/ralph-ops-memory.md`

## 必须遵守

- 一次只实现一个可验收最小增量。
- 不引入新依赖，除非已批准。
- 不得臆造不存在的构建/lint/test 命令。
- 核心流程必须具备安全回退：`{{SAFE_FALLBACK_RULE}}`。
- 关键路径性能指标统一：`{{PERF_METRICS}}`。
- 事件命名与 `{{EVENT_SCHEMA_PATH}}` 一致。
- 新 story、新文档、新 target path 优先使用 canonical path。
- 历史路径只用于说明，不应继续作为新 story 的目标路径。
- optional governance packs 只在项目明确启用时维护；不要把 optional 文档误写成所有项目默认强制项。

## 状态真相

- 项目 phase 状态：`memory-bank/*playbook.md`（若启用，也包括 `memory-bank/phase0-playbook.md`）
- Ralph backlog：`scripts/ralph/prd.json`
- Ralph 运行历史：`scripts/ralph/progress.txt`
- Ralph 结构化状态：`scripts/ralph/.state/run-state.json`
- Ralph 诊断日志：`scripts/ralph/.state/runner.log`
- migration 范围（若启用）：项目化 migration manifest
- validation 证据（若启用）：`doc/validation/*.md`

## closeout 规则

- closeout / summary story 不应只改 `scripts/ralph/prd.json`。
- 若本轮影响项目级状态，至少同步：
  - 对应 playbook
  - `scripts/ralph/progress.txt`
  - 相关 validation 文档
  - 已启用的 migration governance 文档（若适用）
- 若只是单个 capability-pack 完成，但 backlog 未清空，不应误报项目已完成。

## Ralph v2 提醒

- 先执行 `./scripts/ralph/ralph.sh --check`
- 可选工具：`amp` / `claude` / `codex`
- 可启用 `--auto-commit-on-pass`
- 可用 `ralph-auto.sh` 做 staged-full-auto 波次推进
- 若验收条件为 `manual:`，必须输出真实人工步骤
- 若是长期运行 Ralph 的项目，建议把可复用 incident/解法追加到 `memory-bank/ralph-ops-memory.md`

## BOA-derived optional packs 提醒

以下文件是可选模板，不要求所有项目默认启用：

- `memory-bank/phase0-playbook.md`
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `memory-bank/licensing-and-clean-room.md`
- `memory-bank/ralph-ops-memory.md`
- `doc/validation/manual-acceptance-checklist.md`
- `doc/validation/parity-checklist.md`
- `doc/validation/compatibility-checklist.md`

具体何时启用，先看：`BOA-DERIVED-UPGRADES.md`。