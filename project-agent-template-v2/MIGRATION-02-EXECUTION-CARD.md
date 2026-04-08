# Migration Execution Card

> Navigation: `MIGRATION-01-HUB.md` | `MIGRATION-04-PHASED-CHECKLIST.md` | `MIGRATION-03-EXECUTION-CARD-CHECKLIST.md` | `MIGRATION-02-EXECUTION-CARD.md` | `MIGRATION-05-CHECKLIST-COMPACT.md`
>
> 适用场景：最快动手 / 一页顺序执行 / 个人快速迁移

给实际操作时边做边对照的一页卡片。

## 0. 先决定 optional packs

先读：
- `BOA-UPGRADE-SUMMARY.md`
- `BOA-DERIVED-UPGRADES.md`

先决定是否启用：
- `phase0-playbook.md`
- migration governance（principles / domain map / manifest / clean-room）
- validation governance（manual / parity / compatibility）
- `ralph-ops-memory.md`

## 1. 复制

复制进新项目：
- `memory-bank/`
- `scripts/ralph/`
- `scripts/agent/`
- `doc/validation/`
- `README.md` / `AGENTS.md` / `CLAUDE.md` / `VARIABLES.md`

不要复制：
- `scripts/ralph/.state/`
- 旧项目运行期 `runner.log` / `run-state.json`

## 2. 替换变量

必须替换：
- `PROJECT_NAME`
- `PROJECT_TYPE`
- `PRODUCT_ONE_LINER`
- `APP_ROOT`
- `MAIN_BRANCH`
- `BUILD_COMMAND`
- `LINT_COMMAND`
- `TEST_COMMAND`
- `EVENT_SCHEMA_PATH`
- `SAFE_FALLBACK_RULE`
- `PERF_METRICS`
- `RALPH_BRANCH_PREFIX`

## 3. 修入口

至少修这 5 个文件：
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `scripts/ralph/README.md`
- `scripts/agent/README.md`

如果启用了 optional packs，也要确认入口能路由到：
- migration docs
- validation docs
- `ralph-ops-memory.md`

## 4. 起 backlog

```bash
cp scripts/ralph/prd.json.example scripts/ralph/prd.json
```

`prd.json` 最低要求：
- 每个 story 有验收条件
- 每个 story 有 `rolloutWave`
- 人工验证写成 `manual:`
- 至少一个 closeout story
- 推荐混合 capability-pack / summary / closeout 三类粒度

首批 story 建议：
- build
- lint
- docs closeout
- rules gate / 替代策略
- staged smoke
- closeout

## 5. 第一轮只跑最小闭环

```bash
./scripts/ralph/ralph.sh --check
./scripts/ralph/ralph.sh 1
```

通过标准：
- `--check` 正常
- Ralph 能消费一个 story
- `manual:` 没被伪装成命令
- `progress.txt` 和 `.state/run-state.json` 正常生成

## 6. 再开自动模式

只有 backlog 清晰、wave 补齐后再开：

```bash
./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude --target-wave 1
```

不要一上来就长时间无人看守。

## 7. auto-commit 只在这时开启

开启前必须满足：
- working tree 干净
- 接受当前实现会 `git add -A`
- 没有无关未提交改动

```bash
./scripts/ralph/ralph.sh --tool claude --auto-commit-on-pass 5
```

需要人工 review 后再提交流程时，不开。

## 8. soft gate 怎么判断

Node + rules 层项目：
- 提供 `typecheck:rules`
- 提供 `test:rules`
- story 文本写相关关键词

非 Node 项目：
- 保留 Ralph 主流程
- 自定义等价 gate
- 在 story / docs 写清替代策略

## 9. 项目侧还要补什么

如果启用了 optional packs，应重写并维护它们，而不是保留空模板：
- manual acceptance checklist
- parity / compatibility checklist
- migration governance
- `ralph-ops-memory.md`

通常还要补：
- rules helper tooling
- framework regression tests

## 10. closeout 最容易漏什么

closeout story 不应只改：
- `scripts/ralph/prd.json`

还应同步：
- phase playbook
- `scripts/ralph/progress.txt`
- 相关 validation 文档
- migration docs（若启用）

## 11. 完成定义

满足以下就算稳定接入：
- 入口文档可导航
- `prd.json` 可消费
- `ralph.sh --check` / `ralph.sh 1` 正常
- `manual:` 路径真实可执行
- 已区分模板源文件 vs 运行生成物
- 已清楚哪些能力是模板核心，哪些是 optional packs，哪些要项目自己补
- 新 story 已优先使用 canonical path，而不是 historical path