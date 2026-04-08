# 模板初始化清单（v2）

## 阶段 0：复制模板

- [ ] 复制 `project-agent-template-v2/` 到新项目根目录
- [ ] 确认目录存在：`memory-bank/`、`scripts/ralph/`、`scripts/agent/`、`doc/validation/`
- [ ] 阅读 `FRAMEWORK-DELTA-REPORT.md`、`BOA-DERIVED-UPGRADES.md` 与 `TEMPLATE-COMPLETENESS-REVIEW.md`，明确模板边界

## 阶段 1：替换关键变量

- [ ] `{{PROJECT_NAME}}`
- [ ] `{{PROJECT_TYPE}}`
- [ ] `{{PRODUCT_ONE_LINER}}`
- [ ] `{{APP_ROOT}}`
- [ ] `{{MAIN_BRANCH}}`
- [ ] `{{BUILD_COMMAND}}`
- [ ] `{{LINT_COMMAND}}`
- [ ] `{{TEST_COMMAND}}`
- [ ] `{{EVENT_SCHEMA_PATH}}`
- [ ] `{{SAFE_FALLBACK_RULE}}`
- [ ] `{{PERF_METRICS}}`
- [ ] `{{RALPH_BRANCH_PREFIX}}`

## 阶段 2：入口文档修正

- [ ] `README.md`
- [ ] `AGENTS.md`
- [ ] `CLAUDE.md`
- [ ] `scripts/ralph/README.md`
- [ ] `scripts/agent/README.md`
- [ ] 确认 README 能导航到 delta / upgrades / usage / completeness 四类文档

## 阶段 3：决定是否启用 optional governance packs

- [ ] 是否启用 `memory-bank/phase0-playbook.md`
- [ ] 是否启用 migration governance：
  - [ ] `memory-bank/porting-principles.md`
  - [ ] `memory-bank/domain-map.template.md`
  - [ ] `memory-bank/migration-manifest.template.md`
  - [ ] `memory-bank/licensing-and-clean-room.md`
- [ ] 是否启用 validation governance：
  - [ ] `doc/validation/manual-acceptance-checklist.md`
  - [ ] `doc/validation/parity-checklist.md`
  - [ ] `doc/validation/compatibility-checklist.md`
- [ ] 是否启用 `memory-bank/ralph-ops-memory.md`

## 阶段 4：初始化 backlog

- [ ] 复制 `scripts/ralph/prd.json.example` 为 `scripts/ralph/prd.json`
- [ ] 根据项目实际调整 `userStories`
- [ ] 每个 story 补 `rolloutWave`
- [ ] 每个需要人工验证的验收项显式写为 `manual:`
- [ ] 至少规划一个 capability-pack story
- [ ] 至少规划一个 summary / bridge story（如需要）
- [ ] 每个 wave 至少有一个 closeout story

可选：
- [ ] 维护 `scripts/ralph/task-pack.template.json`
- [ ] 验证 `expand-core-backlog.mjs --report-json`

## 阶段 5：Runner 预检

- [ ] `./scripts/ralph/ralph.sh --check`
- [ ] `./scripts/ralph/ralph.sh --status`
- [ ] `./scripts/ralph/ralph.sh 1`
- [ ] 确认 `manual:` 验证不会被误写成伪造 shell 命令
- [ ] 若计划长期运行 Ralph，确认 `memory-bank/ralph-ops-memory.md` 的维护方式

## 阶段 6：Auto supervisor（可选）

- [ ] `./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool claude --target-wave 1`
- [ ] 观察 `.state/run-state.json` 与 `.state/runner.log`
- [ ] 理解 staged/full-auto 仍是监督式执行，而非长期无人值守守护进程
- [ ] 理解 retryable wait（如 network/account unavailable）与真实 manual gate 的区别

## 阶段 7：软门禁（可选）

- [ ] `package.json` 存在 `typecheck:rules` 与 `test:rules`
- [ ] 在 story 验收条件中出现上述关键字（用于 soft gate 识别）
- [ ] 若不是 Node 项目，明确替代 gate 策略并写入 story / docs

## 阶段 8：项目侧补齐项（按需）

以下内容中，部分已经由模板提供 **optional packs**；是否启用仍由项目决定：

- [ ] migration governance：重写并启用 optional 模板，而不是继续空白占位
- [ ] validation governance：重写并启用 optional checklist，而不是只保留通用骨架
- [ ] rules helper tooling（如 rules 专用 typecheck/test 配置）
- [ ] framework regression tests（针对 `ralph.sh` / `ralph-auto.sh` / `expand-core-backlog.mjs`）

## 阶段 9：auto-commit（可选）

- [ ] 启用前确认 working tree 干净
- [ ] 明确知晓当前实现会 `git add -A`
- [ ] 若本地常有平行未提交改动，保持关闭

## 完成定义

- [ ] 入口文档可导航
- [ ] phase 状态真相边界清晰
- [ ] 若启用了 optional packs，已在入口文档中正确路由
- [ ] Ralph `--check/--status` 正常
- [ ] 首批 story 可被稳定消费
- [ ] manual 验收路径可执行、可追踪
- [ ] closeout story 的同步面已定义清楚
- [ ] 已明确哪些文件是模板源文件，哪些是运行生成物
- [ ] 已明确哪些能力由模板核心提供，哪些是 optional packs，哪些仍由项目自行补齐