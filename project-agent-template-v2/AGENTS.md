# 仓库规范（{{PROJECT_NAME}} · Agent 入口）

本文件是仓库级 agent 规范入口。

## 开工前必读

1. `README.md`
2. `memory-bank/README.md`
3. `memory-bank/@product-requirements.md`
4. `memory-bank/@tech-stack.md`
5. `memory-bank/@architecture.md`
6. `memory-bank/@coding-rules.md`
7. `scripts/ralph/README.md`
8. `scripts/agent/README.md`

若项目启用了 optional governance packs，再按任务类型补读：
- migration / porting：`memory-bank/porting-principles.md`、`memory-bank/domain-map.template.md`、`memory-bank/migration-manifest.template.md`
- validation / manual acceptance：`doc/validation/manual-acceptance-checklist.md`、`doc/validation/parity-checklist.md`、`doc/validation/compatibility-checklist.md`
- Ralph troubleshooting：`memory-bank/ralph-ops-memory.md`

## 工作流选择

- 手动任务流：按 `memory-bank/task-command-protocol.md` 执行。
- Ralph 流：按 `scripts/ralph/README.md` 执行。
- 迁移/移植项目：优先先明确 optional governance packs 是否启用，再开始写 story。

## 核心硬约束

- 一次只实现一个可验收最小增量。
- 不引入新依赖，除非已批准。
- 不得臆造不存在的构建/检查命令。
- 关键主流程必须有安全回退：`{{SAFE_FALLBACK_RULE}}`。
- 关键路径性能口径统一：`{{PERF_METRICS}}`。
- 事件命名与 `{{EVENT_SCHEMA_PATH}}` 保持一致。
- 新 story、新文档、新 target path 优先使用 canonical path。
- 历史路径只能用于说明或映射，不能继续作为新 story 的 target path。

## 状态与文档更新规则

- 项目 phase 状态只在 playbook 维护。
- `scripts/ralph/prd.json` 与 `scripts/ralph/progress.txt` 仅服务 Ralph。
- 若迁移边界或 canonical path 变化，更新 `memory-bank/@architecture.md`。
- 若 runner 行为变化，更新 `scripts/ralph/README.md`。
- 若 closeout story 影响项目级状态，必须同步对应 playbook、validation 文档与已启用的 optional governance docs。
- 若项目启用了 migration governance，closeout 不得只更新 `prd.json`；还应同步 migration manifest / domain map / parity 说明（若适用）。

## backlog 粒度建议

推荐混合使用三类 story：
- capability-pack：一组紧密相关能力的最小闭环
- summary / bridge story：补 query / legality / adapter 等高价值连接缺口
- closeout story：收口文档状态、验证证据与 remaining risks

## 交付要求

- 列出改动文件与验证结果。
- 标注人工验证步骤（如有）。
- 诚实记录 remaining risks，不把人工判断伪装成自动完成。
- 有阻塞时给出 `<promise>BLOCKED</promise>` 与可执行 `<reason>`。