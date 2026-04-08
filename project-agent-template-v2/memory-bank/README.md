# memory-bank 目录索引

`memory-bank/` 是本仓库的人类 + AI 持久操作记忆层，负责保存产品目标、技术约束、任务板、执行协议和阶段规划。

## 目录职责

| 路径 | 作用 |
|---|---|
| `@product-requirements.md` | 产品定位、核心需求、最危险假设 |
| `@tech-stack.md` | 技术栈、平台约束、目录约定 |
| `@architecture.md` | 仓库拓扑、系统高层结构、执行面、扩展点 |
| `@coding-rules.md` | 编码与工程约束 |
| `@ai-task-execution-rules.md` | 按任务板执行时的统一规则 |
| `task-command-protocol.md` | 中文任务口令协议与统一输出格式 |
| `@project-roadmap.md` | 路线图与导航入口 |
| `@ralph-workflow.md` | Ralph 的使用边界与适用场景 |
| `phase0-playbook.md` | 可选的 Phase 0 治理任务板 |
| `phase1-playbook.md` | Phase1 权威任务状态板 |
| `phase1-task-index.md` | Phase1 快速索引 |
| `phase1-risk-and-strategy.md` | Phase1 风险与验证策略 |
| `phase2-playbook.md` | Phase2 权威任务状态板 |
| `phase2-task-index.md` | Phase2 快速索引 |
| `porting-principles.md` | 可选的迁移/移植原则与边界 |
| `domain-map.template.md` | 可选的 source -> target 领域映射模板 |
| `migration-manifest.template.md` | 可选的迁移清单模板 |
| `licensing-and-clean-room.md` | 可选的授权边界与 clean-room 说明 |
| `ralph-ops-memory.md` | 可选的 Ralph 长期排障经验库 |

## 按场景阅读

> 模板接入前，建议先在根目录阅读：`VARIABLES.md`、`INIT-CHECKLIST.md`、`BOA-DERIVED-UPGRADES.md`

### 新 agent 首次进入

1. `README.md`
2. `memory-bank/README.md`
3. `@product-requirements.md`
4. `@tech-stack.md`
5. `@architecture.md`
6. `@coding-rules.md`

### 手动按任务口令执行

1. `@ai-task-execution-rules.md`
2. `task-command-protocol.md`
3. 对应 phase 的 playbook
4. 对应 phase 的 task index

### 使用 Ralph 自动迭代

1. `scripts/ralph/README.md`
2. `@ralph-workflow.md`
3. `scripts/ralph/prd.json`
4. `scripts/ralph/progress.txt`
5. `ralph-ops-memory.md`（若启用）

### 做 migration / porting 项目

1. `phase0-playbook.md`（若启用）
2. `porting-principles.md`
3. `domain-map.template.md`
4. `migration-manifest.template.md`
5. `licensing-and-clean-room.md`
6. `doc/validation/parity-checklist.md`（若启用）

### 做人工验收 / 兼容性约束项目

1. `doc/validation/manual-acceptance-checklist.md`
2. `doc/validation/compatibility-checklist.md`
3. 对应 phase playbook

### 查看阶段规划

- Phase0（可选）：`phase0-playbook.md`
- Phase1：`phase1-playbook.md`、`phase1-task-index.md`、`phase1-risk-and-strategy.md`
- Phase2：`phase2-playbook.md`、`phase2-task-index.md`

## Source of truth

| 主题 | 唯一真相 | 非真相文档 |
|---|---|---|
| Phase0 任务状态（若启用） | `phase0-playbook.md` | 其他摘要文档 |
| Phase1 任务状态 | `phase1-playbook.md` | `phase1-task-index.md` |
| Phase2 任务状态 | `phase2-playbook.md` | `phase2-task-index.md` |
| 手动任务执行规则 | `@ai-task-execution-rules.md` | `@project-roadmap.md` |
| 任务口令 | `task-command-protocol.md` | 其他摘要文档 |
| Ralph 运行方式 | `scripts/ralph/README.md` | `@ralph-workflow.md` |
| Ralph backlog | `scripts/ralph/prd.json` | phase playbook |
| Ralph 运行日志/模式沉淀 | `scripts/ralph/progress.txt` | phase playbook |
| Ralph 结构化运行状态 | `scripts/ralph/.state/run-state.json` | phase playbook |
| migration 范围（若启用） | 项目化 migration manifest | 其他摘要文档 |
| validation 证据（若启用） | `doc/validation/*.md` | playbook |

## 边界说明

- `memory-bank/`：保存“为什么这样做、做到哪一步、如何推进”
- `doc/validation/`：保存验证模板、事件 schema、发布清单、Go/No-Go 资产
- `scripts/ralph/`：保存 Ralph loop 的脚本、prompt、backlog、运行日志、运行时状态
- `{{APP_ROOT}}`：主工程实现

## 模板使用时的重写要求

### 必须重写

- `@product-requirements.md`
- `@project-roadmap.md`
- `phase1-playbook.md`
- `phase1-task-index.md`
- `phase1-risk-and-strategy.md`
- `phase2-playbook.md`
- `phase2-task-index.md`

### 按需启用并重写

- `phase0-playbook.md`
- `porting-principles.md`
- `domain-map.template.md`
- `migration-manifest.template.md`
- `licensing-and-clean-room.md`
- `ralph-ops-memory.md`

### 主要替换变量即可

- `@tech-stack.md`
- `@architecture.md`
- `@coding-rules.md`
- `@ralph-workflow.md`

### 通常可直接复用结构

- `@ai-task-execution-rules.md`
- `task-command-protocol.md`
- `README.md`

## 更新规则

- 任务状态只在 playbook 中维护。
- task index 只做任务定位，不重复维护状态。
- 架构、目录边界、canonical path 变化时，更新 `@architecture.md`。
- Ralph 运行行为或限制变化时，优先更新 `scripts/ralph/README.md`。
- 若启用了 optional governance packs，closeout 时必须同步它们，而不是只改 `scripts/ralph/prd.json`。