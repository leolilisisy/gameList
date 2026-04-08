# {{PROJECT_NAME}} — 架构说明

## 1. 仓库拓扑

```text
{{PROJECT_NAME}}/
├── README.md                # 仓库入口与治理导航
├── AGENTS.md                # 仓库级 agent 入口规范
├── CLAUDE.md                # Claude 启动入口
├── memory-bank/             # 持久上下文、任务板、执行规则、阶段规划
├── scripts/ralph/           # Ralph loop 脚本、prompt、backlog、运行日志、运行时状态
├── doc/
│   └── validation/          # 验证资产、Go/No-Go、事件 schema、可选 validation checklist
└── {{APP_ROOT}}             # 主工程目录
```

## 2. 系统分层与高层数据流

### 分层职责

| 层 | 职责 | 示例 |
|---|---|---|
| UI / Interaction | 用户交互、状态展示、输入输出 | 按项目填写 |
| Domain / Core | 核心业务逻辑、策略抽象 | 按项目填写 |
| Data / Integration | 存储、接口、遥测、外部依赖 | 按项目填写 |
| Util / Shared | 通用工具与共享能力 | 按项目填写 |

### 高层数据流

```text
用户触发主流程
  → 输入准备
  → 核心业务处理
  → 安全回退 / 错误兜底
  → 指标/事件记录
  → 输出结果
```

## 3. 执行面

### 手动任务执行面

- 入口：`memory-bank/@ai-task-execution-rules.md`
- 协议：`memory-bank/task-command-protocol.md`
- 状态真相：
  - Phase0（若启用）：`memory-bank/phase0-playbook.md`
  - Phase1：`memory-bank/phase1-playbook.md`
  - Phase2：`memory-bank/phase2-playbook.md`
- 快速索引：
  - `memory-bank/phase1-task-index.md`
  - `memory-bank/phase2-task-index.md`

### Ralph 执行面

- 入口：`scripts/ralph/README.md`
- loop runner：`scripts/ralph/ralph.sh`
- backlog：`scripts/ralph/prd.json`
- 人类可读运行日志：`scripts/ralph/progress.txt`
- 结构化运行状态：`scripts/ralph/.state/run-state.json`
- 单实例保护：`scripts/ralph/.state/lock/`

Ralph 当前定位为**人工启动、有限轮次、本地监督式自动循环**。它具备基础的锁、状态、恢复与监督停止语义，但不等同于长期无人值守调度系统。

## 4. 文档与状态边界

| 主题 | 唯一真相 | 说明 |
|---|---|---|
| Phase0/Phase1/Phase2 任务状态 | 对应 playbook | 项目级状态板 |
| task index | `phase1-task-index.md` / `phase2-task-index.md` | 只做快速定位 |
| Ralph 自动迭代 backlog | `scripts/ralph/prd.json` | 只服务 Ralph |
| Ralph 人类可读运行历史 | `scripts/ralph/progress.txt` | 运行日志，不等于项目总状态 |
| Ralph 结构化运行状态 | `scripts/ralph/.state/run-state.json` | 用于监督、诊断、恢复 |
| 验收标准/验证资产 | `{{VALIDATION_DIR}}` | schema、checklist、metrics、labels |
| migration 范围（若启用） | 项目化 migration manifest | source -> target 范围与状态说明 |

## 5. canonical path 与 historical path 规则

### canonical path
- 当前项目约定的正式目录与文件路径
- 新 story、新文档、新 target file 一律优先使用 canonical path

### historical path
- 旧文档、旧迁移轮次、旧目录结构中的历史路径
- 只能作为说明、映射、兼容历史记录使用
- 不应继续作为新 story 的 target path

### 发生路径收口时
至少同步：
- 本文件
- 相关 playbook
- migration manifest（若启用）
- closeout/validation 文档中的路径说明

## 6. optional governance packs 的位置

以下文件属于 optional governance packs：
- `memory-bank/phase0-playbook.md`
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `memory-bank/licensing-and-clean-room.md`
- `memory-bank/ralph-ops-memory.md`
- `doc/validation/manual-acceptance-checklist.md`
- `doc/validation/parity-checklist.md`
- `doc/validation/compatibility-checklist.md`

它们不是所有项目的默认强制项；只有项目启用后，才进入常规维护范围。

## 7. 扩展点与更新触发条件

### 扩展点

- Core 业务抽象：按项目填写
- 遥测系统接入点：按项目填写
- 安全回退机制：`{{SAFE_FALLBACK_RULE}}`
- Ralph `.state/`：可继续扩展监督型运行元数据，但不应替代项目级状态板

### 出现以下变化时必须更新本文件

- 仓库顶层目录职责变化
- 主工程路径或核心分层变化
- 高层数据流变化
- 新增或改变手动任务执行流 / Ralph 执行流
- Ralph 的本地运行状态层、锁机制或监督停止语义发生变化
- canonical path / historical path 边界发生变化