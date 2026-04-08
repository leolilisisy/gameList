# AI 任务执行规则

## 执行前必读

- `README.md`
- `memory-bank/README.md`
- `memory-bank/@product-requirements.md`
- `memory-bank/@tech-stack.md`
- `memory-bank/@architecture.md`
- `memory-bank/@coding-rules.md`
- 按任务板推进时，再读对应 phase 的 playbook
- 口令执行时，参考：`memory-bank/task-command-protocol.md`

若项目启用了 optional governance packs，再按任务类型补读：
- migration / porting：`porting-principles.md`、`domain-map.template.md`、`migration-manifest.template.md`
- validation / manual acceptance：`doc/validation/manual-acceptance-checklist.md`、`doc/validation/parity-checklist.md`、`doc/validation/compatibility-checklist.md`
- Ralph troubleshooting：`ralph-ops-memory.md`

## 任务执行约定

1. **任务 ID**：按 phase 任务板中的 ID 执行，例如 `{{TASK_ID_PATTERN}}`
2. **依赖检查**：开始任务前确认其依赖已完成
3. **状态更新**：任务状态只在对应 playbook 中维护；开始时标记为进行中，完成后改为已完成，并在执行记录追加一行
4. **验收**：每任务完成后必须满足其“验收”条件再标记完成
5. **路径**：仓库边界与目录结构以 `memory-bank/@architecture.md` 为准；主工程根目录为 `{{APP_ROOT}}`
6. **canonical path**：新 story、新 target path、新文档优先使用 canonical path；历史路径只能用于说明
7. **closeout sync**：closeout / summary story 不得只改 backlog，必须同步对应状态文档与验证文档

## 状态模型

- `phase0-playbook.md`（若启用）：可选治理阶段状态板
- `phase1-playbook.md`、`phase2-playbook.md`：权威状态板
- `phase1-task-index.md`、`phase2-task-index.md`：仅用于快速定位任务
- `scripts/ralph/prd.json`：Ralph backlog
- `scripts/ralph/progress.txt`：Ralph 运行日志与可复用模式沉淀
- migration manifest（若启用）：迁移范围与状态说明

## backlog 粒度建议

推荐混合使用三类 story：

### 1. capability-pack
适合：
- 一组紧密相关、可形成最小闭环的功能或规则切片

### 2. summary / bridge story
适合：
- 连接两个 capability-pack 之间的 query / legality / adapter / sync 缺口
- 不一定新增很多功能，但能显著降低系统断裂感

### 3. closeout story
适合：
- 同步 playbook / validation / manifest / progress / remaining risks
- 收口当前阶段结论，而不是继续扩 scope

## 交付方式（每次任务输出）

- **任务拆分**：按模块列出要改的文件与新增的文件
- **实现过程**：一次只实现一个可验收最小增量
- **验证步骤**：给出复现路径（运行哪个命令 / 在哪里操作）与预期结果
- **上下文更新**：若架构 / 数据结构 / 目录边界有变化，必须同步更新 `memory-bank/@architecture.md`
- **remaining risks**：诚实记录未覆盖行为、人工待办与后置边界

## closeout / summary story 同步规则

当任务属于 closeout / summary / phase 收口时，至少同步：
- 对应 phase playbook
- `scripts/ralph/prd.json`（若此任务也服务 Ralph）
- `scripts/ralph/progress.txt`（若此任务也服务 Ralph）
- 相关 validation 文档
- migration manifest / domain map（若项目启用）

如果这些文档未同步，就不应宣称该轮已经真正收口。

## 建议输入格式（中文口令）

- 单任务：`执行 P1-W1-T2`
- 多任务：`执行 P1-W1-T2, P1-W1-T3`
- 仅检查：`检查 P1-W5-T1`
- 继续：`继续`

## 禁止事项

- 不批量改动与当前任务无关的文件
- 不引入新依赖库，除非已有或明确批准
- 不把 task index 当作状态板使用
- 不把 Ralph backlog 当作项目总状态板使用
- 不把 historical path 继续当作新 story 的 target path
- 不把需要人工判断的结果伪装成自动完成