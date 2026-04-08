# Ralph 工作流 — 适用边界与关系说明

Ralph 是 {{PROJECT_NAME}} 中的**更稳的本地监督式 AI agent loop**。详细运行方式以 `scripts/ralph/README.md` 为准。

## 适合什么时候用

- 有一批边界清晰、验收条件明确的小 story。
- 需要人工启动后连续跑若干轮实现。
- 需要在本地环境中重复执行“读 backlog → 实现一个 story → 质量检查 → 进入下一轮”。
- 需要可观察、可恢复、可人工接管的本地 loop。

## 不适合什么时候用

- 需要真机验证、人工体验判断或人工视觉确认的任务。
- 需求仍不清晰、架构仍未定稿的任务。
- 高风险重构、跨很多模块的大改。
- 需要稳定定时、守护、并发控制的无人值守自动化。

## 与项目 phase 的关系

- Phase0/Phase1/Phase2 的项目状态真相仍在各自 playbook 中。
- Ralph 的 `scripts/ralph/prd.json` 是 Ralph 自己的 backlog，不等于项目总任务板。
- Ralph 的 `scripts/ralph/progress.txt` 是运行日志与模式沉淀，不等于项目总进度看板。
- Ralph 的 `.state/run-state.json` 是结构化运行状态，用于监督、诊断与恢复，不等于项目状态板。
- Ralph 的 `.state/runner.log` 记录 runner 心跳与诊断日志，便于排查长时间卡住或 CLI 输出噪音。

## 当前项目的特殊点

- 当前 build / lint / test 可能使用 `manual:` 前缀。
- `manual:` 表示必须输出真实人工验证步骤，而不是 shell 命令。
- 如果某个 story 需要人工构建、人工体验判断、人工检查 Console 或其他人工操作，Ralph 不应伪装成“已全自动验证通过”。
- 遇到必须人工介入的验证点，应输出 `MANUAL_INTERVENTION_REQUIRED`。
- 仅当重新读取 `scripts/ralph/prd.json` 并确认所有 story 都已 `passes: true` 时，才应输出 `COMPLETE`；单个 story 完成后默认不输出 promise marker。

## 推荐 story 粒度

Ralph 更适合以下粒度：
- capability-pack：一个最小可验证闭环
- summary / bridge story：补关键 query / legality / adapter 缺口
- closeout story：同步 playbook / validation / progress / remaining risks

不建议：
- 单个 story 覆盖太多能力面
- 把 closeout 与功能扩展无限混在一起

## 运行前最少要确认

- 已阅读 `scripts/ralph/README.md`
- `prd.json` 的 `branchName` 与当前目标工作流一致
- 运行环境满足 `jq`、`git`、`amp` 或 `claude` 要求
- 当前仓库已经位于 git work tree 中
- 建议先执行一次 `./scripts/ralph/ralph.sh --check`

## retryable wait 与真正 manual gate 的区别

真正的 manual gate：
- 需要人打开设备/工具/场景
- 需要人工观察 UI/Console/体验
- 需要人工做合格/不合格判断

retryable wait：
- 工具网络不可用
- 账号容量不可用
- 当前批次只是 supervisor 等待重试

两者不要混淆。

## closeout sync 规则

当 Ralph 完成的是 closeout / summary story 时，不应只更新：
- `scripts/ralph/prd.json`

还应同步：
- 对应 playbook
- `scripts/ralph/progress.txt`
- 相关 validation 文档
- migration manifest / domain map（若项目启用）

## ops memory

若项目长期使用 Ralph，建议启用：
- `memory-bank/ralph-ops-memory.md`

它用于沉淀：
- 故障模式
- 推荐排查顺序
- supervisor / runner 的稳定操作经验

## 监督边界

Ralph 具备：
- 单实例锁
- 结构化 run-state
- stale lock / stale run 恢复
- blocked / manual intervention 停止语义
- retryable wait 区分
- runner 心跳日志与诊断信息

但它仍然是**本地监督式 loop**，不是无人值守平台。出现以下情况应人工接管：
- 真机验证
- 体验质量判断
- 需求/架构决策
- 环境异常或持续性阻塞

## 质量要求

Ralph 每轮 story 仍应遵守仓库级约束：
- 不引入未批准依赖
- 质量检查通过后再提交
- 改动保持小步
- 涉及真实设备体验的内容要显式标注需人工验证
- 新 story 优先使用 canonical path
- closeout 时诚实记录 remaining risks 与未覆盖行为