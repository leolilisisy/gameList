# {{PROJECT_NAME}} — 路线图与任务导航

本文件是路线图与导航入口。详细索引见 `memory-bank/README.md`。

## 当前阶段

- **Phase0（可选）**：治理 bootstrap、边界建立、可选 packs 决策
- **Phase1**：基础闭环与最小验证
- **Phase2**：能力增强与体验优化

> 并非所有项目都需要启用 Phase0。若项目结构简单，可直接从 Phase1 开始。

## 快速入口

- Phase0（可选）状态板：`memory-bank/phase0-playbook.md`
- Phase1 状态板：`memory-bank/phase1-playbook.md`
- Phase1 快速索引：`memory-bank/phase1-task-index.md`
- Phase1 风险与策略：`memory-bank/phase1-risk-and-strategy.md`
- Phase2 状态板：`memory-bank/phase2-playbook.md`
- Phase2 快速索引：`memory-bank/phase2-task-index.md`
- 任务执行规则：`memory-bank/@ai-task-execution-rules.md`
- 任务口令协议：`memory-bank/task-command-protocol.md`
- Ralph 工作流：`scripts/ralph/README.md`

若项目启用了 optional governance packs：
- migration / porting：`memory-bank/porting-principles.md`、`memory-bank/domain-map.template.md`、`memory-bank/migration-manifest.template.md`
- validation / manual acceptance：`doc/validation/manual-acceptance-checklist.md`、`doc/validation/parity-checklist.md`、`doc/validation/compatibility-checklist.md`
- Ralph troubleshooting：`memory-bank/ralph-ops-memory.md`

## 任务推进原则

- 手动任务流以 phase playbook 为状态真相。
- task index 仅用于快速定位任务，不维护状态。
- Ralph 的 `prd.json` 与 `progress.txt` 只服务 Ralph 自动迭代，不等于项目总状态板。
- 若项目是迁移/移植类项目，建议先决定是否启用 Phase0 与 migration governance packs，再开始写 Phase1 story。
- 若项目存在路径重构或目录收口，新 story 一律使用 canonical path。

## 推荐口令

- `执行 P1-W1-T2`
- `执行 P1-W1-T2, P1-W1-T3`
- `检查 P1-W5-T1`
- `继续`

## optional packs 启用建议

### 建议启用 Phase0 的项目
- 迁移/移植项目
- 多阶段复杂项目
- 需要先明确治理边界的项目

### 建议启用 migration governance 的项目
- 有 source -> target 迁移关系
- 需要 traceability / manifest / clean-room 说明

### 建议启用 validation governance 的项目
- 有人工验收、parity 对照或平台兼容性要求

### 建议启用 Ralph ops memory 的项目
- 计划长期使用 Ralph runner / auto supervisor
- 多人需要共享 incident handling 经验