# {{PROJECT_NAME}}

{{PRODUCT_ONE_LINER}}

## 仓库结构

| 路径 | 作用 |
|---|---|
| `memory-bank/` | 持久上下文、任务板、执行规则、阶段规划 |
| `scripts/ralph/` | Ralph 本地监督式 AI loop（含 auto supervisor） |
| `scripts/agent/` | 角色分工协议（planner/porter/reviewer/verifier 等） |
| `doc/validation/` | 验证资产、事件 schema、可选 validation checklist |
| `{{APP_ROOT}}` | 主工程目录 |

## v2 亮点

- 多工具支持：`amp` / `claude` / `codex`
- `ralph-auto.sh`：classic + staged-full-auto 自动批次
- `auto-commit-on-pass`：story 新通过后自动提交
- soft rules gate：`typecheck:rules` + `test:rules`（warning 不阻断）
- `rolloutWave` + 任务包刷新器：支持按波次扩展 backlog
- closeout / capability-pack / summary story 粒度更清晰
- canonical path / historical path 治理更明确

## BOA 实战回流升级

BattleOfAetherland（BOA）真实项目验证后，本模板补入了一组 **optional governance packs**，用于解决迁移项目、人工验收项目与长期使用 Ralph 的项目在落地时最常见的缺口。

先看：
- `BOA-UPGRADE-SUMMARY.md`
- `BOA-DERIVED-UPGRADES.md`
- `TEMPLATE-COMPLETENESS-REVIEW.md`
- `USAGE-GUIDE.md`

可选能力包括：
- Phase 0 governance bootstrap
- migration governance（`porting-principles` / `domain-map` / `migration-manifest` / `licensing-and-clean-room`）
- validation governance（manual / parity / compatibility checklist）
- Ralph ops memory

> 这些能力是 **optional**，不是所有项目默认都必须启用。

## 从哪里开始

推荐顺序：

1. `MIGRATION-01-HUB.md`（迁移总入口）
2. `VARIABLES.md`
3. `MIGRATION-04-PHASED-CHECKLIST.md`（按阶段折叠的迁移作业单）
4. `MIGRATION-03-EXECUTION-CARD-CHECKLIST.md`（一页勾选版执行卡片）
5. `MIGRATION-02-EXECUTION-CARD.md`（一页执行顺序卡片）
6. `MIGRATION-05-CHECKLIST-COMPACT.md`（最快速的迁移落地顺序）
7. `INIT-CHECKLIST.md`
8. `AGENTS.md`
9. `CLAUDE.md`
10. `memory-bank/README.md`
11. `scripts/ralph/README.md`
12. `FRAMEWORK-DELTA-REPORT.md`（查看 v2 相对旧模板的升级点）
13. `BOA-UPGRADE-SUMMARY.md`（查看 BOA 回流升级的短版摘要）
14. `BOA-DERIVED-UPGRADES.md`（查看 BOA 回流升级点）
15. `TEMPLATE-COMPLETENESS-REVIEW.md`（查看当前模板已覆盖 / 可选覆盖 / 仍需项目自补 / 应排除项）

## 两条工作流

### 1. 手动任务流
- 任务协议：`memory-bank/task-command-protocol.md`
- 执行规则：`memory-bank/@ai-task-execution-rules.md`
- 状态真相：phase playbook

### 2. Ralph 自动流
- loop runner：`scripts/ralph/ralph.sh`
- batch supervisor：`scripts/ralph/ralph-auto.sh`
- backlog：`scripts/ralph/prd.json`
- ops memory（可选）：`memory-bank/ralph-ops-memory.md`

## optional governance packs 何时启用

### migration / porting 项目
建议启用：
- `memory-bank/phase0-playbook.md`
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `memory-bank/licensing-and-clean-room.md`

### 需要人工验收 / 对照 / 兼容约束的项目
建议启用：
- `doc/validation/manual-acceptance-checklist.md`
- `doc/validation/parity-checklist.md`
- `doc/validation/compatibility-checklist.md`

### 长期运行 Ralph 的项目
建议启用：
- `memory-bank/ralph-ops-memory.md`

## 状态模型

| 主题 | 唯一真相 |
|---|---|
| 项目 phase 状态 | `memory-bank/phase*-playbook.md`（若启用，也包括 `phase0-playbook.md`） |
| Ralph backlog | `scripts/ralph/prd.json` |
| Ralph 运行历史 | `scripts/ralph/progress.txt` |
| Ralph 结构化状态 | `scripts/ralph/.state/run-state.json` |
| Ralph 诊断日志 | `scripts/ralph/.state/runner.log` |
| migration 范围（可选） | 项目化 migration manifest |
| validation 资产（可选） | `doc/validation/*.md` |

## 首次启动（最短路径）

```bash
cp scripts/ralph/prd.json.example scripts/ralph/prd.json
./scripts/ralph/ralph.sh --check
./scripts/ralph/ralph.sh 1
```

需要自动批次时：

```bash
./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude
```

## 重要提醒

- 新 story 与新文档优先使用 canonical path。
- 历史路径只用于说明，不应继续作为新任务 target path。
- closeout story 不应只改 `prd.json`；应同步对应 playbook、validation 与其他已启用的治理文档。
- `manual:` 是真实人工步骤，不是 shell 命令。