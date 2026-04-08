# Migration Phased Checklist

> Navigation: `MIGRATION-01-HUB.md` | `MIGRATION-04-PHASED-CHECKLIST.md` | `MIGRATION-03-EXECUTION-CARD-CHECKLIST.md` | `MIGRATION-02-EXECUTION-CARD.md` | `MIGRATION-05-CHECKLIST-COMPACT.md`
>
> 适用场景：团队迁移 / 分阶段推进 / 真实项目作业单

给真实迁移过程使用的“按阶段折叠”作业单。

---

## Phase 0 · 复制模板骨架

### 保留并复制
- [ ] `memory-bank/`
- [ ] `scripts/ralph/`
- [ ] `scripts/agent/`
- [ ] `doc/validation/`
- [ ] 根目录 `README.md` / `AGENTS.md` / `CLAUDE.md` / `VARIABLES.md`

### 明确不复制
- [ ] `scripts/ralph/.state/`
- [ ] 旧项目运行期 `runner.log`
- [ ] 旧项目运行期 `run-state.json`

---

## Phase 1 · 替换变量与修入口

### 替换变量
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

### 修 5 个入口
- [ ] `README.md`
- [ ] `AGENTS.md`
- [ ] `CLAUDE.md`
- [ ] `scripts/ralph/README.md`
- [ ] `scripts/agent/README.md`

### 入口完成标准
- [ ] 文档可导航
- [ ] 项目名 / 主工程路径 / 主分支都已替换
- [ ] 没有残留关键模板占位符
- [ ] 若启用 optional packs，入口已能正确路由

---

## Phase 2 · 决定是否启用 optional governance packs

### 先读
- [ ] `BOA-UPGRADE-SUMMARY.md`
- [ ] `BOA-DERIVED-UPGRADES.md`

### 做决策
- [ ] 是否启用 `phase0-playbook.md`
- [ ] 是否启用 migration governance：
  - [ ] `porting-principles.md`
  - [ ] `domain-map.template.md`
  - [ ] `migration-manifest.template.md`
  - [ ] `licensing-and-clean-room.md`
- [ ] 是否启用 validation governance：
  - [ ] `manual-acceptance-checklist.md`
  - [ ] `parity-checklist.md`
  - [ ] `compatibility-checklist.md`
- [ ] 是否启用 `ralph-ops-memory.md`

### 若启用，对应要求
- [ ] 已明确谁维护这些文档
- [ ] 已明确哪些文件是真相，哪些只是模板入口
- [ ] 已明确 closeout 时需要同步哪些 optional docs

---

## Phase 3 · 初始化 backlog

### 创建运行 backlog
- [ ] 执行：`cp scripts/ralph/prd.json.example scripts/ralph/prd.json`

### backlog 最低要求
- [ ] 每个 story 有验收条件
- [ ] 每个 story 有 `rolloutWave`
- [ ] 人工验证写成 `manual:`
- [ ] 至少一个 closeout story
- [ ] 推荐同时具备 capability-pack / summary / closeout 三类粒度

### 首批 story 建议
- [ ] build baseline
- [ ] lint baseline
- [ ] Ralph 文档收口
- [ ] rules gate 或替代策略
- [ ] staged smoke
- [ ] closeout

---

## Phase 4 · 首轮最小闭环验证

### 先跑最小命令
- [ ] 执行：`./scripts/ralph/ralph.sh --check`
- [ ] 执行：`./scripts/ralph/ralph.sh 1`

### 验证结果
- [ ] `--check` 正常
- [ ] Ralph 能消费一个 story
- [ ] `manual:` 没被伪装成命令
- [ ] `progress.txt` 正常生成
- [ ] `.state/run-state.json` 正常生成

### 这一阶段不要做的事
- [ ] 不直接进入长时间自动循环
- [ ] 不在 backlog 仍混乱时开启 auto-commit

---

## Phase 5 · 接入自动推进

### 开启前提
- [ ] backlog 已清晰
- [ ] `rolloutWave` 已补齐
- [ ] 能接受 supervisor 对 manual wait / placeholder blocked 做自动判断

### 推荐首轮命令
- [ ] 执行：`./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude --target-wave 1`

### 验证点
- [ ] staged 模式能启动
- [ ] wave 边界符合预期
- [ ] `.state/run-state.json` 可读
- [ ] `.state/runner.log` 可读

---

## Phase 6 · 决定是否接入 auto-commit / soft gate

### auto-commit
- [ ] working tree 干净
- [ ] 已知当前实现会 `git add -A`
- [ ] 没有无关未提交改动
- [ ] 若仍需人工 review 后提交，则保持关闭
- [ ] 若要开启，执行：`./scripts/ralph/ralph.sh --tool claude --auto-commit-on-pass 5`

### soft gate（Node + rules 层项目）
- [ ] `package.json` 提供 `typecheck:rules`
- [ ] `package.json` 提供 `test:rules`
- [ ] story 文本写出相关关键词

### soft gate（非 Node 项目）
- [ ] 保留 Ralph 主流程
- [ ] 自定义等价 gate
- [ ] 在 story / docs 写清替代策略

---

## Phase 7 · 项目化补齐

这部分不是每个项目都必须当天完成，但严肃项目建议补齐。

### 若启用了 optional packs
- [ ] `phase0-playbook.md` 已按项目实际重写
- [ ] migration docs 已按项目实际重写
- [ ] validation docs 已按项目实际重写
- [ ] `ralph-ops-memory.md` 已决定是否维护

### 通常仍需补齐
- [ ] rules helper tooling
- [ ] framework regression tests
- [ ] 项目专属 fixture / manifest / dataset guidance

---

## Phase 8 · closeout 同步规则

### 必须检查
- [ ] closeout story 不只更新 `scripts/ralph/prd.json`
- [ ] phase playbook 已同步
- [ ] `scripts/ralph/progress.txt` 已同步
- [ ] validation 文档已同步（若启用）
- [ ] migration docs 已同步（若启用）
- [ ] remaining risks 与未覆盖行为已明确

### 路径规则
- [ ] 新 story 使用 canonical path
- [ ] historical path 只保留在说明中

---

## Final Gate · 迁移完成定义

- [ ] 入口文档可导航
- [ ] `prd.json` 可消费
- [ ] `ralph.sh --check` / `ralph.sh 1` 正常
- [ ] `manual:` 路径真实可执行
- [ ] 已区分模板源文件 vs 运行生成物
- [ ] 已清楚哪些能力是模板核心，哪些是 optional packs，哪些仍需项目自己补
- [ ] closeout 规则已在团队内达成一致
- [ ] 新 story 已优先使用 canonical path