# Migration Checklist (Compact)

> Navigation: `MIGRATION-01-HUB.md` | `MIGRATION-04-PHASED-CHECKLIST.md` | `MIGRATION-03-EXECUTION-CARD-CHECKLIST.md` | `MIGRATION-02-EXECUTION-CARD.md` | `MIGRATION-05-CHECKLIST-COMPACT.md`
>
> 适用场景：快速扫流程 / 最短迁移说明 / 动手前快速过一遍

这是给“下一个项目直接套模板”的最小迁移清单。
目标不是解释所有细节，而是用最少步骤把模板稳定接起来。

## A. 先复制哪些目录

保留并迁移：
- `memory-bank/`
- `scripts/ralph/`
- `scripts/agent/`
- `doc/validation/`
- 根目录：`README.md` / `AGENTS.md` / `CLAUDE.md` / `VARIABLES.md`

不要把运行生成物当模板复制：
- `scripts/ralph/.state/`
- 旧项目里的运行期 `runner.log` / `run-state.json`

## B. 先做一个决定

先看：
- `BOA-UPGRADE-SUMMARY.md`
- `BOA-DERIVED-UPGRADES.md`

然后决定是否启用：
- `phase0-playbook.md`
- migration governance
- validation governance
- `ralph-ops-memory.md`

## C. 必改项

先替换这些变量：
- `{{PROJECT_NAME}}`
- `{{PROJECT_TYPE}}`
- `{{PRODUCT_ONE_LINER}}`
- `{{APP_ROOT}}`
- `{{MAIN_BRANCH}}`
- `{{BUILD_COMMAND}}`
- `{{LINT_COMMAND}}`
- `{{TEST_COMMAND}}`
- `{{EVENT_SCHEMA_PATH}}`
- `{{SAFE_FALLBACK_RULE}}`
- `{{PERF_METRICS}}`
- `{{RALPH_BRANCH_PREFIX}}`

然后修这 5 个入口：
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `scripts/ralph/README.md`
- `scripts/agent/README.md`

## D. 最小 backlog 怎么起

1. 复制：

```bash
cp scripts/ralph/prd.json.example scripts/ralph/prd.json
```

2. 改 `scripts/ralph/prd.json` 时至少保证：
- 每个 story 有清晰验收条件
- 每个 story 有 `rolloutWave`
- 需要人工验证的项写成 `manual:`
- 至少有一个 closeout story
- 最好有 capability-pack / summary / closeout 三类粒度

3. 第一批 story 建议只放：
- build baseline
- lint baseline
- Ralph 文档收口
- rules gate 接入或替代策略
- staged smoke
- closeout

## E. 第一轮验证怎么跑

先跑：

```bash
./scripts/ralph/ralph.sh --check
./scripts/ralph/ralph.sh 1
```

确认这 4 件事：
- `--check` 通过
- Ralph 能正确选中一个 story
- `manual:` 没被伪装成 shell 命令
- `progress.txt` / `.state/run-state.json` 正常生成

## F. 自动模式什么时候开

只有在下面都满足时再开：
- backlog 已经比较清晰
- `rolloutWave` 已补齐
- 你能接受 supervisor 在 manual wait / placeholder blocked 上做自动判断

建议顺序：

```bash
./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude --target-wave 1
```

不要一开始就跑长时间无人看守循环。

## G. auto-commit 要不要开

只在以下情况开启：
- working tree 干净
- 你接受当前实现会 `git add -A`
- 没有无关的本地未提交改动

启用方式：

```bash
./scripts/ralph/ralph.sh --tool claude --auto-commit-on-pass 5
```

如果你需要人工 review 后再提交，就别开。

## H. soft gate 要不要接

如果项目是 Node 项目，并且你确实有 rules 层：
- 在 `package.json` 里提供 `typecheck:rules`
- 在 `package.json` 里提供 `test:rules`
- 在 story 文本里写出相关关键词

如果项目不是 Node 项目：
- 保留 Ralph 主流程
- 自己定义等价 gate
- 在 story / docs 里写清替代策略

## I. closeout 最容易漏什么

closeout story 不应只改：
- `scripts/ralph/prd.json`

还应同步：
- phase playbook
- `scripts/ralph/progress.txt`
- validation 文档（若启用）
- migration docs（若启用）

## J. 哪些还要项目自己补

如果项目是严肃迁移/长期维护项目，建议你额外补：
- 已启用 optional packs 的项目化内容
- rules helper tooling
- 针对 `ralph.sh` / `ralph-auto.sh` / `expand-core-backlog.mjs` 的回归测试
- 项目专属 fixture / manifest / dataset guidance

## K. 迁移完成的最小定义

做到这些，就算模板已经稳定接入：
- 入口文档可导航
- `prd.json` 可消费
- `ralph.sh --check` / `ralph.sh 1` 正常
- `manual:` 验收路径真实可执行
- 你已经分清模板源文件 vs 运行生成物
- 你知道哪些能力是模板核心，哪些是 optional packs，哪些仍需项目自己补
- 新 story 已优先使用 canonical path

## L. 还想看详细说明时

继续看：
- `BOA-UPGRADE-SUMMARY.md`
- `BOA-DERIVED-UPGRADES.md`
- `USAGE-GUIDE.md`
- `FRAMEWORK-DELTA-REPORT.md`
- `TEMPLATE-COMPLETENESS-REVIEW.md`