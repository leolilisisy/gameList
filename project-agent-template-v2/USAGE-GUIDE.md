# Usage Guide

本文是 `project-agent-template-v2` 在新项目中的落地手册，重点回答四件事：
- 怎么接入并跑起来
- 哪些能力是模板核心自带
- 哪些能力现在以 optional governance packs 提供
- 哪些仍需要项目自己补

## 1. 快速开始（最小闭环）

1. 复制模板到新仓库根目录
2. 替换 `VARIABLES.md` 中关键占位符
3. 阅读 `BOA-DERIVED-UPGRADES.md`，决定是否启用 optional governance packs
4. 复制 `scripts/ralph/prd.json.example` 为 `scripts/ralph/prd.json`
5. 至少确认以下三件事后再跑：
   - 每个 story 都有清晰验收条件
   - 每个 story 都补了 `rolloutWave`
   - 需要人工验证的项显式写成 `manual:`
6. 执行：

```bash
./scripts/ralph/ralph.sh --check
./scripts/ralph/ralph.sh 1
```

如果你只想验证模板能否工作，这已经足够。
如果你在做真实迁移项目，请继续看后面的 optional packs 与边界章节。

## 2. 推荐初始化顺序

1. 根入口：`README.md`、`AGENTS.md`、`CLAUDE.md`
2. 状态真相：`memory-bank/*playbook.md`
3. Ralph 规则：`scripts/ralph/README.md`
4. 角色协议：`scripts/agent/README.md`
5. 差异总览：`FRAMEWORK-DELTA-REPORT.md`
6. BOA 回流升级：`BOA-DERIVED-UPGRADES.md`
7. 完整性审计：`TEMPLATE-COMPLETENESS-REVIEW.md`

## 3. backlog 组织建议

每个 story 建议包含：
- `id`
- `title`
- `acceptanceCriteria`
- `priority`
- `rolloutWave`
- `passes`
- `notes`

推荐混合使用三类粒度：
- **capability-pack**：一组紧密相关能力的最小闭环
- **summary / bridge story**：补 query / legality / adapter 等关键连接缺口
- **closeout story**：同步 playbook / validation / progress / remaining risks

建议约束：
- 每个 wave 都有一个 closeout story
- manual 验收项显式写 `manual:` 前缀
- rules 层 story 若希望触发 soft gate，应在文本中写出 `typecheck:rules` / `test:rules` / `rules-layer` / `soft gate`

## 4. 日常运行模式

### 4.1 手动模式（推荐默认）

```bash
./scripts/ralph/ralph.sh --tool claude 3
```

适合：
- 新接入模板后的首轮验证
- 高风险改动
- 需要频繁人工观察和收口的阶段

### 4.2 自动批次模式

```bash
./scripts/ralph/ralph-auto.sh --mode classic --tool claude --batch-iterations 6 --max-runs 30
```

适合：
- backlog 已经比较清晰
- 你希望自动重复跑批次，但不需要 wave 调度

### 4.3 分波次自动模式

```bash
./scripts/ralph/ralph-auto.sh --mode staged-full-auto --tool codex --target-wave 2
```

适合：
- backlog 已按 `rolloutWave` 组织
- 你希望从小轮次启动，逐步放大
- 你希望在 wave 边界停住，而不是一口气跑到底

## 5. optional governance packs 什么时候启用

### 5.1 `phase0-playbook.md`

建议启用：
- 项目还没进入正式开发，需要先建立边界和治理文档
- backlog 尚未稳定
- 需要先做 Phase 0 文档治理再进入 Phase 1

不一定需要启用：
- 项目结构简单，直接进入 Phase 1 即可

### 5.2 migration governance pack

包括：
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `memory-bank/licensing-and-clean-room.md`

建议启用：
- 你在参考旧项目/旧版本/旧仓库迁移
- 需要 source -> target traceability
- 需要 canonical path / historical path 治理
- 需要 clean-room / licensing 边界说明

### 5.3 validation governance pack

包括：
- `doc/validation/manual-acceptance-checklist.md`
- `doc/validation/parity-checklist.md`
- `doc/validation/compatibility-checklist.md`

建议启用：
- 需要人工验收
- 需要与参考行为做对照
- 需要平台/版本/环境兼容边界

### 5.4 Ralph ops memory

包括：
- `memory-bank/ralph-ops-memory.md`

建议启用：
- 项目会长期跑 Ralph
- 多人共用同一套 runner/supervisor
- 希望把 incident handling 沉淀成长期知识

## 6. auto-commit 使用建议

启用方式：

```bash
./scripts/ralph/ralph.sh --tool claude --auto-commit-on-pass 5
```

必须知道的前提：
- 当前实现会在提交时执行 `git add -A`
- 也就是会 broad-stage 当前 working tree，而不是只提交当前 story 的改动

建议：
- 首次启用前先确保 working tree 干净
- 若需要人工 review 后再提交，不要开启该选项
- 若本地常有并行未提交改动，不要开启该选项
- 若 soft gate 返回 warning，runner 会**跳过 auto-commit**

## 7. soft gate 使用建议

soft gate 不是模板内置完成品，而是一个**挂接点**。

满足以下条件时自动生效：
- 仓库根目录存在 `package.json`
- `package.json` 中存在 `typecheck:rules` 和 `test:rules`
- story 文本包含 rules gate 关键词

行为：
- 通过：记录 `soft gate passed`
- 失败或不可用：warning，不阻断主流程
- warning 状态下：auto-commit 会被跳过

### 7.1 非 Node 项目如何理解

如果你的项目不是 Node 项目：
- 可以保留 Ralph 主流程
- 但需要把 rules gate 视作“项目自定义质量门禁扩展位”
- 你应自行替换成等价命令/策略，而不是误以为模板已自动提供跨语言支持

## 8. 任务包扩展流程

1. 维护 `scripts/ralph/task-pack.template.json`
2. 按 wave 注入：

```bash
node scripts/ralph/expand-core-backlog.mjs --wave 2 --report-json
```

3. 查看新增项并继续运行 Ralph

需要明确的是：
- 这不是简单 append
- expander 会保留已有 `passes=true` 与非空 `notes`
- 同时刷新结构字段（title / description / acceptanceCriteria / priority / rolloutWave）

## 9. source-of-truth 与运行产物边界

### 9.1 真正的源文件/模板骨架

这些应保留并根据项目定制：
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `memory-bank/`
- `scripts/ralph/README.md`
- `scripts/ralph/ralph.sh`
- `scripts/ralph/ralph-auto.sh`
- `scripts/ralph/CLAUDE.md`
- `scripts/ralph/CODEX.md`
- `scripts/ralph/prompt.md`
- `scripts/ralph/prd.json.example`
- `scripts/ralph/task-pack.template.json`
- `doc/validation/`
- `scripts/agent/`

### 9.2 运行期源文件

这些文件会在项目运行中持续更新，但仍是你项目的一部分：
- `scripts/ralph/prd.json`
- `scripts/ralph/progress.txt`

### 9.3 生成产物 / 不应当作模板静态内容照抄

这些通常不应被当作“模板固定内容”复制到新项目：
- `scripts/ralph/.state/run-state.json`
- `scripts/ralph/.state/runner.log`
- `scripts/ralph/.state/lock/`

## 10. closeout 与文档同步

这是 BOA 实战里最容易被忽略、但最重要的升级点之一。

当一个 capability-pack、summary story 或阶段性切片完成后，不要只更新 `scripts/ralph/prd.json`。

至少应同步：
- phase playbook
- `scripts/ralph/progress.txt`
- 相关 validation 文档
- 若启用了 migration governance，还应同步 manifest / domain map / parity 说明

若这些文档未同步，说明状态仍未真正收口。

## 11. 故障排查

### 11.1 看状态

```bash
./scripts/ralph/ralph.sh --status
cat scripts/ralph/.state/run-state.json
```

重点字段：
- `status`
- `lastOutcome`
- `currentStoryId`
- `lastCompletedStoryId`
- `lastCompletedStoryPassedNow`
- `manualInterventionReason`
- `blockedReason`
- `lastAutoCommitStatus`

### 11.2 看日志

```bash
tail -f scripts/ralph/.state/runner.log
```

### 11.3 stale lock 恢复

```bash
./scripts/ralph/ralph.sh --recover
```

### 11.4 staged 模式常见误解

- placeholder `BLOCKED` reason 不一定会让 supervisor 立刻停机
- `tool_network_unavailable` / `tool_account_unavailable` 类型的 `waiting_manual` 可能被当作可重试等待
- staged/full-auto 依然是监督式工具，不是适合长期无人值守的守护系统
- 若项目长期跑 Ralph，建议把稳定 incident handling 追加到 `memory-bank/ralph-ops-memory.md`

## 12. 团队协作建议

- 以 `scripts/agent/` 角色协议定义 owner 与写入范围
- 每次交付都使用统一 handoff 结构
- 有 manual gate 时，先落文档记录再继续自动循环
- phase 状态仍以 playbook 为准，不要让 `prd.json` 取代项目级状态管理
- 新 story 一律优先使用 canonical path

## 13. 当前模板已覆盖 / optional 覆盖 / 仍需项目自补

### 13.1 模板核心已覆盖
- 根入口文档
- memory-bank 骨架
- Ralph runner / auto supervisor / role protocol
- 通用 validation 骨架

### 13.2 现在以 optional packs 提供
- Phase 0 governance bootstrap
- migration governance
- manual / parity / compatibility checklist
- Ralph ops memory

### 13.3 仍需项目自己补齐
- 项目专属 rules helper tooling
- framework regression tests
- 项目专属 dataset / fixture / manifest 样例
- 具体业务领域的 parity 内容与迁移正文

详见：
- `BOA-DERIVED-UPGRADES.md`
- `TEMPLATE-COMPLETENESS-REVIEW.md`

## 14. 不建议的使用方式

- 未定义验收条件就直接批量跑自动模式
- 把 manual 验收伪装成自动通过
- 在高风险重构中使用长时间无人看守循环
- 在不干净的 working tree 上启用 `--auto-commit-on-pass`
- 把 `.state/` 目录当成模板静态内容一起迁移
- 把 historical path 继续写进新 story 作为 target path