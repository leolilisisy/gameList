# Ralph 工作流 — {{PROJECT_NAME}} (v2)

Ralph 是 {{PROJECT_NAME}} 的**人工启动、有限轮次、本地监督式 AI agent loop**。

v2 在原模板基础上增强了三件事：
- 多工具执行：`amp` / `claude` / `codex`
- 自动批次监督器：`ralph-auto.sh`（classic + staged-full-auto）
- 运行可观测性增强：更完整的 run-state 字段、soft gate、auto-commit 结果追踪

> Ralph 仍然是监督式本地执行，不是无人值守平台。

## 环境要求

- `jq`
- `git`
- `amp`、`claude` 或 `codex` CLI（至少一个，且已登录）
- 当前仓库位于 git work tree

可选（用于 soft gate）：
- `npm`
- `package.json` 中的 `scripts.typecheck:rules` 与 `scripts.test:rules`

## 运行方式

```bash
# 单次 loop（默认 amp，默认 10 轮）
./scripts/ralph/ralph.sh

# 指定工具 + 轮次
./scripts/ralph/ralph.sh --tool claude 5
./scripts/ralph/ralph.sh --tool codex 5

# Codex 推理档位
CODEX_REASONING_EFFORT=low ./scripts/ralph/ralph.sh --tool codex 5

# 每个 story 新通过后自动提交
./scripts/ralph/ralph.sh --tool claude --auto-commit-on-pass 5
```

## 自动批次模式（v2 新增）

```bash
# classic：按固定 batch 反复调用 ralph.sh
./scripts/ralph/ralph-auto.sh --tool claude --batch-iterations 8 --max-runs 100

# staged-full-auto：小轮次起步，逐步放大
./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude

# staged + 只推进到 wave 2
./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool codex --target-wave 2

# staged + 自动提交
./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude --auto-commit-on-pass
```

## 诊断与恢复

```bash
./scripts/ralph/ralph.sh --check
./scripts/ralph/ralph.sh --status
./scripts/ralph/ralph.sh --recover
```

## 关键文件

| 文件 | 作用 |
|---|---|
| `ralph.sh` | 主 loop runner |
| `ralph-auto.sh` | 批次监督器（classic/staged） |
| `prompt.md` | Amp 指令 |
| `CLAUDE.md` | Claude 指令 |
| `CODEX.md` | Codex 指令 |
| `prd.json` | Ralph backlog（运行时） |
| `prd.json.example` | backlog 初始模板 |
| `expand-core-backlog.mjs` | 任务包刷新器（可按 wave 注入） |
| `task-pack.template.json` | 可移植任务包样例 |
| `progress.txt` | 人类可读日志与模式沉淀 |
| `.state/run-state.json` | 结构化状态 |
| `.state/runner.log` | runner/auto 诊断日志 |

## run-state 重点字段（v2）

- `status`：`running` / `waiting_manual` / `blocked` / `completed` / `failed` 等
- `lastOutcome`：本轮结果类型（含 `tool_network_unavailable` 等）
- `currentStoryId` / `lastCompletedStoryId`
- `lastCompletedStoryPassedNow`
- `lastAutoCommitStatus` / `lastAutoCommitSha`
- `manualInterventionReason` / `blockedReason`

## soft rules gate（v2）

`ralph.sh` 会在“疑似规则层 story”上尝试执行：
- `npm run typecheck:rules`
- `npm run test:rules`

识别依据：story 文本包含 `typecheck:rules` / `test:rules` / `rules-layer` / `soft gate` 关键词。

策略：
- 通过：记录 `soft gate passed`
- 不可用或失败：记录 warning，但**不阻断** Ralph 主流程

## auto-commit-on-pass（v2）

开启 `--auto-commit-on-pass` 后：
- 当某个 story 在本轮由 `passes:false -> true`，且 soft gate 允许提交时
- runner 自动执行 commit：`feat: [Story ID] - [Story Title]`

跳过场景：
- working tree 无变更
- soft gate 给出 warning（避免提交已知风险状态）

## staged-full-auto 与 rolloutWave（v2）

`ralph-auto.sh` 的分波次调度基于 story 的 `rolloutWave` 字段：
- 未填时默认视为 `1`
- `--target-wave N` 会在超过目标波次时停止

建议在 `prd.json` / 任务包里为每个 story 补 `rolloutWave`。

## 任务包刷新（v2）

```bash
# 默认使用 scripts/ralph/task-pack.template.json
node scripts/ralph/expand-core-backlog.mjs --report-json

# 仅注入 wave 2
node scripts/ralph/expand-core-backlog.mjs --wave 2 --report-json

# 注入 wave<=3
node scripts/ralph/expand-core-backlog.mjs --up-to-wave 3 --report-json
```

默认合并策略：
- 保留已有 `passes: true`
- 保留已有非空 `notes`
- 用任务包更新 story 结构字段（title/criteria/priority/wave）

## 推荐 story 粒度

推荐混合使用三类 story：
- capability-pack：一组紧密相关能力的最小闭环
- summary / bridge story：补关键 query / legality / adapter 缺口
- closeout story：同步文档状态、验证证据与 remaining risks

## `manual:` 验证约定

- `manual:` 表示必须人工执行的真实验证步骤，不是 shell 命令。
- 不得臆造不存在的 build/lint/test 命令。
- 若当前 story 必须依赖人工运行时操作，输出 `<promise>MANUAL_INTERVENTION_REQUIRED</promise>` 并给出可执行 `<reason>`。

## closeout / summary story 规则

closeout / summary story 不应只把 `prd.json` 某条 story 改成 `passes: true`。

若当前轮影响项目级状态，至少同步：
- 对应 playbook
- `scripts/ralph/progress.txt`
- 相关 validation 文档
- migration governance 文档（若项目启用）

## canonical path 规则

- 新 story、新 target path、新文档优先使用 canonical path
- historical path 只用于解释旧记录或映射关系
- 若路径已经收口，应在 architecture / manifest / closeout 文档中同步反映

## troubleshooting 与 ops memory

如果项目长期使用 Ralph，建议启用：
- `memory-bank/ralph-ops-memory.md`

适合记录：
- `tool_network_unavailable`
- `tool_account_unavailable`
- stale run-state / stale lock
- manual gate 与 retryable wait 误判
- closeout sync 漏项

## 模板初始化最短路径

1. 复制 `scripts/ralph/prd.json.example` 为 `scripts/ralph/prd.json`
2. 先跑 `./scripts/ralph/ralph.sh --check`
3. 再跑 `./scripts/ralph/ralph.sh 1`
4. 需要批次推进时再启用 `ralph-auto.sh`