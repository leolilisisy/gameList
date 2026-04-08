# Framework Delta Report

本文说明 `project-agent-template-v2` 相对旧版 `project-agent-template` 的框架变化、能力提升、迁移收益，以及当前总结里容易被低估的行为细节与接入边界。

> 关于 BattleOfAetherland（BOA）真实项目回流到 v2 的这轮新增升级，请同时阅读：`BOA-DERIVED-UPGRADES.md`。
> 本文仍主要聚焦 **v1 -> v2** 的主干差异；BOA 回流升级作为后续实战增强单独说明。

## 1. 对比范围

- 旧版基线：`project-agent-template/`
- 新版产物：`project-agent-template-v2/`
- 对比重点：agents 组织、runner 能力、自动化控制面、验证门禁、可观测性、迁移完整性

## 2. 目录层面的新增

新增/升级的关键文件：
- `scripts/ralph/ralph-auto.sh`
- `scripts/ralph/CODEX.md`
- `scripts/ralph/expand-core-backlog.mjs`
- `scripts/ralph/task-pack.template.json`
- `scripts/agent/*`（角色协议）
- `USAGE-GUIDE.md`
- `TEMPLATE-COMPLETENESS-REVIEW.md`
- 本文档

## 3. 核心能力变化

| 模块 | 旧版 | v2 | 提升点 |
|---|---|---|---|
| Tool 支持 | `amp` / `claude` | `amp` / `claude` / `codex` | 统一 CLI 入口，支持更多执行环境 |
| Runner | 单脚本 `ralph.sh` | `ralph.sh` + `ralph-auto.sh` | 支持 batch/staged 自动监督策略 |
| Backlog 扩展 | 手工改 `prd.json` | 任务包 + wave 注入 | 降低 backlog 维护成本，提升可重复性 |
| 状态观测 | 基础 run-state | 扩展 run-state + runner log | 更容易定位 manual gate、工具问题、提交状态 |
| 提交策略 | agent 自行提交 | runner `--auto-commit-on-pass` | 减少重复提交，但也引入更明确的 working tree 风险 |
| 软门禁 | 无统一机制 | soft rules gate | 在不阻断主流程前提下增加质量反馈 |
| 角色治理 | 仓库级规则为主 | 增加 `scripts/agent/` 角色协议 | 并行协作可控、handoff 结构一致 |
| 启动 backlog | build/lint/test 就绪优先 | framework operability + rules gate + staged automation + closeout | 启动目标从“能跑”升级为“能持续监督式推进” |

## 4. `ralph.sh` 的真实增强点

### 4.1 多工具执行不只是多一个参数

v2 新增：
- `--tool codex`
- `CODEX_REASONING_EFFORT`
- `scripts/ralph/CODEX.md`

实际影响不只是新增通道，而是 runner 需要适配 Codex 输出结构，对最终回答块做提取，再识别 stop marker。
这意味着 v2 的 Codex 支持是 runner 级行为改造，不只是文档层“声明支持”。

### 4.2 `--auto-commit-on-pass` 是 runner 代提交流程

v2 新增：
- `--auto-commit-on-pass`
- `lastAutoCommitStatus`
- `lastAutoCommitMessage`
- `lastAutoCommitSha`

但需要明确两点：
1. runner 会在 story `passes:false -> true` 后尝试自动提交。
2. 当前实现使用 `git add -A`，即**会 broad-stage 整个 working tree**，不是只提交当前 story 的改动。

### 4.3 soft rules gate 不只是“warning”

v2 会按 story 文本关键词识别 rules-layer 任务，并尝试：
- `npm run typecheck:rules`
- `npm run test:rules`

特性：
- 失败/不可用时只记 warning，不阻断 Ralph 主流程
- 但 **warning 会让 auto-commit 跳过**，避免在已知风险状态下自动提交

### 4.4 run-state 新字段不只是“可观测性增强”

新增字段：
- `currentStoryId`
- `lastCompletedStoryId`
- `lastCompletedStoryPassedNow`
- `manualInterventionReason`
- `blockedReason`
- `lastAutoCommitStatus`
- `lastAutoCommitMessage`
- `lastAutoCommitSha`

这些字段不仅方便人类排障，也被 `ralph-auto.sh` 用来判断：
- 是否发生进度推进
- 是否是 retryable manual wait
- 是否该继续 staged round
- 是否已出现新的 completed story

## 5. `ralph-auto.sh` 的新能力与监督逻辑

### 5.1 classic 模式
- 固定 batch 迭代
- 适合持续消费 backlog
- 更接近“重复调用 `ralph.sh`”的监督器

### 5.2 staged-full-auto 模式
- 小轮次启动，逐步放大
- 支持 `target-wave` 上限控制
- 支持 retryable wait 与 no-progress 控制
- 默认更适合 rolloutWave 明确的 backlog

### 5.3 placeholder BLOCKED 的特殊处理

v2 不会把所有 `<promise>BLOCKED</promise>` 都立即当成最终阻塞。
如果 `blockedReason` 看起来只是占位文本，监督器会把它视为低质量 BLOCKED reason，暂时按“非最终阻塞”处理。

### 5.4 retryable manual wait

v2 会区分真正的人工 gate 与可重试的工具问题。
当状态为 `waiting_manual` 且 outcome 是：
- `tool_network_unavailable`
- `tool_account_unavailable`

staged 模式可继续重试，而不是立即终止整轮自动推进。

### 5.5 no-progress 与 wave 驱动

`ralph-auto.sh` 会基于 run-state / backlog 状态判断：
- 连续多少轮没有推进
- 当前 pending story 属于哪个 `rolloutWave`
- 是否已达到 `target-wave`

### 5.6 auto-expand 策略

v2 支持：
- `off`
- `once`
- `wave`

含义：
- `off`：不自动刷新 backlog
- `once`：一次性按 wave 上限注入任务包
- `wave`：随着推进动态寻找下一波有工作的任务

## 6. 任务包机制的真实语义

旧版：
- backlog 扩展主要靠人工维护 `prd.json`

v2：
- `expand-core-backlog.mjs` 从 task pack 合并 story
- 支持 `--wave` / `--up-to-wave`
- 默认保留已有 `passes=true` 与非空 `notes`
- 可用 `--force-passes` / `--force-notes` 强制覆盖

## 7. Agent 治理变化

旧版：
- 规则集中在根文档与 memory-bank

v2：
- 新增 `scripts/agent/` 协议目录
- 明确 7 个角色职责：planner / porter / reviewer / verifier / data-cartographer / security-sentinel / integrator
- 约束交付统一包含 Summary / Files / Validation / Risks

## 8. v1 -> v2 的框架理念变化

### 8.1 启动目标变化

旧版更偏向：
- build / lint / test 可执行
- Ralph 基本可跑

v2 更偏向：
- framework operability
- soft gate 可挂接
- staged automation 可监督推进
- closeout 文档能收口

### 8.2 文档路由变化

旧版更多依赖：
- 根文档
- memory-bank

v2 则变成三层入口并行：
- `README.md`
- `AGENTS.md`
- `scripts/agent/README.md`

## 9. 对迁移新项目的直接收益

1. 更快启动
- `prd.json.example` 已携带 `rolloutWave`
- 可直接启用 staged supervisor
- task pack 可作为首批 backlog 脚手架

2. 更稳运行
- manual gate、账号问题、网络问题区分更清晰
- `--recover` + 更完整状态字段降低中断成本
- placeholder BLOCKED 过滤降低误停机概率

3. 更好治理
- runner 自动提交减少流程分叉
- 角色协议减少并行协作冲突
- closeout / validation / handoff 更容易标准化

4. 更易审计
- runner log + run-state 字段可回放执行轨迹
- task pack 让 backlog 演进可复用、可对比

## 10. 当前 v2 相对“真实项目外延”仍未完全内置的部分

v2 已经提炼出可复用骨架，但和真实项目相比，仍有几类内容只做到部分提炼或尚未内建：

1. rules-gate helper tooling
- 模板说明了 `typecheck:rules` / `test:rules`
- 但不直接内置具体 `package.json`、`tsconfig.rules.json`、`vitest.rules.config.ts` 这类实现文件

2. framework regression tests
- v2 有 runner / auto / expander 文档与脚本
- 但未内置专门测试这些脚本行为的回归测试样例

3. 更项目化的治理层
- 这部分现在已通过 BOA 回流升级补成 **optional governance packs**
- 详见：`BOA-DERIVED-UPGRADES.md`

## 11. 兼容性与注意事项

- v2 仍然是监督式本地框架，不建议无人值守无限循环。
- soft gate 依赖 `npm` 与 scripts；缺失时只会 warning。对非 Node 项目，它是“可替换策略”，不是内建能力。
- staged 模式建议始终给 story 填 `rolloutWave`。
- `--auto-commit-on-pass` 适合 clean working tree，不适合与无关未提交改动混用。
- `.state/`、`runner.log`、运行时 `prd.json`、`progress.txt` 里有运行产物属性，不应简单当作模板静态文档照抄。

## 12. 迁移判断建议

如果你的目标是：
- 在新项目里快速建立可监督的 AI loop
- 允许 backlog 分波次扩展
- 需要基本的角色分工和文档收口

那么 v2 已经足够作为起点。

如果你的目标还包括：
- migration governance
- manual / parity / compatibility checklist
- Ralph 长期 ops memory
- 更稳的 closeout / capability-pack / canonical-path 规则

那么应继续阅读：
- `BOA-DERIVED-UPGRADES.md`
- `TEMPLATE-COMPLETENESS-REVIEW.md`

并按项目需要启用 optional governance packs。