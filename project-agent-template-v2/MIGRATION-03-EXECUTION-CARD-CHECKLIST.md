# Migration Execution Card (Checklist)

> Navigation: `MIGRATION-01-HUB.md` | `MIGRATION-04-PHASED-CHECKLIST.md` | `MIGRATION-03-EXECUTION-CARD-CHECKLIST.md` | `MIGRATION-02-EXECUTION-CARD.md` | `MIGRATION-05-CHECKLIST-COMPACT.md`
>
> 适用场景：边做边勾 / 防遗漏 / 个人执行清单

给实际迁移时边做边勾的一页版卡片。

## 0. optional packs 决策

- [ ] 已读 `BOA-UPGRADE-SUMMARY.md`
- [ ] 已读 `BOA-DERIVED-UPGRADES.md`
- [ ] 已决定是否启用 `phase0-playbook.md`
- [ ] 已决定是否启用 migration governance
- [ ] 已决定是否启用 validation governance
- [ ] 已决定是否启用 `ralph-ops-memory.md`

## 1. 复制

- [ ] 复制 `memory-bank/`
- [ ] 复制 `scripts/ralph/`
- [ ] 复制 `scripts/agent/`
- [ ] 复制 `doc/validation/`
- [ ] 复制根目录 `README.md` / `AGENTS.md` / `CLAUDE.md` / `VARIABLES.md`
- [ ] 不复制 `scripts/ralph/.state/`
- [ ] 不复制旧项目运行期 `runner.log` / `run-state.json`

## 2. 替换变量

- [ ] `PROJECT_NAME`
- [ ] `PROJECT_TYPE`
- [ ] `PRODUCT_ONE_LINER`
- [ ] `APP_ROOT`
- [ ] `MAIN_BRANCH`
- [ ] `BUILD_COMMAND`
- [ ] `LINT_COMMAND`
- [ ] `TEST_COMMAND`
- [ ] `EVENT_SCHEMA_PATH`
- [ ] `SAFE_FALLBACK_RULE`
- [ ] `PERF_METRICS`
- [ ] `RALPH_BRANCH_PREFIX`

## 3. 修入口

- [ ] 修 `README.md`
- [ ] 修 `AGENTS.md`
- [ ] 修 `CLAUDE.md`
- [ ] 修 `scripts/ralph/README.md`
- [ ] 修 `scripts/agent/README.md`
- [ ] 若启用 optional packs，入口可正确路由到这些文档

## 4. 起 backlog

- [ ] 执行：`cp scripts/ralph/prd.json.example scripts/ralph/prd.json`
- [ ] 每个 story 有验收条件
- [ ] 每个 story 有 `rolloutWave`
- [ ] 人工验证写成 `manual:`
- [ ] 至少一个 closeout story
- [ ] backlog 已包含 capability-pack / summary / closeout 的基本粒度
- [ ] 首批 story 只放 build / lint / docs closeout / rules gate 或替代策略 / staged smoke / closeout

## 5. 跑第一轮最小闭环

- [ ] 执行：`./scripts/ralph/ralph.sh --check`
- [ ] 执行：`./scripts/ralph/ralph.sh 1`
- [ ] `--check` 正常
- [ ] Ralph 能消费一个 story
- [ ] `manual:` 没被伪装成命令
- [ ] `progress.txt` 正常生成
- [ ] `.state/run-state.json` 正常生成

## 6. 再开自动模式

- [ ] backlog 已清晰
- [ ] `rolloutWave` 已补齐
- [ ] 接受 supervisor 会对 manual wait / placeholder blocked 做自动判断
- [ ] 执行：`./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude --target-wave 1`
- [ ] 不直接开启长时间无人看守循环

## 7. auto-commit 决策

- [ ] working tree 干净时才考虑开启
- [ ] 已知当前实现会 `git add -A`
- [ ] 没有无关未提交改动
- [ ] 若需要人工 review 后再提交，则保持关闭
- [ ] 若要开启，执行：`./scripts/ralph/ralph.sh --tool claude --auto-commit-on-pass 5`

## 8. soft gate 决策

### Node + rules 层项目
- [ ] `package.json` 提供 `typecheck:rules`
- [ ] `package.json` 提供 `test:rules`
- [ ] story 文本写出相关关键词

### 非 Node 项目
- [ ] 保留 Ralph 主流程
- [ ] 自定义等价 gate
- [ ] 在 story / docs 写清替代策略

## 9. 项目侧补齐项

- [ ] 若启用 manual acceptance checklist，已重写项目内容
- [ ] 若启用 parity checklist，已重写项目内容
- [ ] 若启用 compatibility checklist，已重写项目内容
- [ ] 若启用 migration governance，已重写 principles / domain map / manifest / clean-room
- [ ] 若长期跑 Ralph，已决定如何维护 `ralph-ops-memory.md`
- [ ] rules helper tooling
- [ ] framework regression tests

## 10. closeout 同步检查

- [ ] closeout story 不只更新 `prd.json`
- [ ] 已同步对应 phase playbook
- [ ] 已同步 `scripts/ralph/progress.txt`
- [ ] 已同步 validation 文档（若启用）
- [ ] 已同步 migration docs（若启用）
- [ ] remaining risks 已明确

## 11. 完成定义

- [ ] 入口文档可导航
- [ ] `prd.json` 可消费
- [ ] `ralph.sh --check` / `ralph.sh 1` 正常
- [ ] `manual:` 路径真实可执行
- [ ] 已区分模板源文件 vs 运行生成物
- [ ] 已清楚哪些能力是模板核心，哪些是 optional packs，哪些要项目自己补
- [ ] 新 story 已使用 canonical path