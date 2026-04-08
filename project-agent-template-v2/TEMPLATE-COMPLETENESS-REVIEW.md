# Template Completeness Review

本文回答两个问题：
1. `project-agent-template-v2` 是否已经把当前项目中的 agent / runner / 协作框架完整提炼出来？
2. 若没有，哪些部分已经覆盖、哪些现在以 optional 形式覆盖、哪些仍应由新项目自行补齐、哪些应明确排除？

结论先行：
- v2 已经把**可复用框架骨架**提炼得比较完整。
- BOA 的真实项目经验又补了一层 **optional governance packs**。
- 它仍然更像“高质量骨架 + 可选治理包 + 接入清单”，而不是“把某个真实项目的全部外延一比一打包”。
- 对新项目最重要的不是继续盲目加文件，而是清楚区分：**captured / optionally covered / still project-specific / intentionally out-of-scope**。

## 1. Captured：已较完整提炼的部分

这些内容已经被 v2 以可迁移形式沉淀下来。

### 1.1 Runner 与监督器骨架

已覆盖：
- `scripts/ralph/ralph.sh`
- `scripts/ralph/ralph-auto.sh`
- `scripts/ralph/README.md`
- `scripts/ralph/CLAUDE.md`
- `scripts/ralph/CODEX.md`
- `scripts/ralph/prompt.md`

已具备的能力：
- `amp` / `claude` / `codex` 三通道
- 单轮 / 有限轮次 loop
- `classic` / `staged-full-auto` 自动监督
- `run-state` / `runner.log` / `progress.txt` 可观测性
- `--check` / `--status` / `--recover`
- retryable tool/network/account wait 区分
- auto-commit / soft gate / wave 调度

### 1.2 Backlog 生命周期骨架

已覆盖：
- `scripts/ralph/prd.json.example`
- `scripts/ralph/task-pack.template.json`
- `scripts/ralph/expand-core-backlog.mjs`

已具备的能力：
- `rolloutWave`
- wave 注入 / up-to-wave 注入
- 保留 `passes` / `notes`
- 刷新结构字段
- 让 backlog 从“手工静态维护”升级为“可同步刷新”

### 1.3 角色协议骨架

已覆盖：
- `scripts/agent/README.md`
- `scripts/agent/planner.md`
- `scripts/agent/porter.md`
- `scripts/agent/reviewer.md`
- `scripts/agent/verifier.md`
- `scripts/agent/data-cartographer.md`
- `scripts/agent/security-sentinel.md`
- `scripts/agent/integrator.md`

### 1.4 根文档与 memory-bank 骨架

已覆盖：
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `memory-bank/README.md`
- `memory-bank/@product-requirements.md`
- `memory-bank/@tech-stack.md`
- `memory-bank/@architecture.md`
- `memory-bank/@coding-rules.md`
- `memory-bank/@ai-task-execution-rules.md`
- `memory-bank/task-command-protocol.md`
- `memory-bank/@project-roadmap.md`
- `memory-bank/@ralph-workflow.md`
- `memory-bank/phase*-playbook.md`

### 1.5 通用 validation 资产骨架

已覆盖：
- `doc/validation/execution_checklist.md`
- `doc/validation/release_checklist.md`
- `doc/validation/event_schema.md`
- `doc/validation/failure_labels.md`
- `doc/validation/metrics_template.md`

## 2. Optionally covered：现在以 optional packs 提供的部分

这些能力不再是“完全缺失”，但也不应被误解为所有项目默认必须启用。

### 2.1 validation governance

现在已通过 optional 模板覆盖：
- `doc/validation/manual-acceptance-checklist.md`
- `doc/validation/parity-checklist.md`
- `doc/validation/compatibility-checklist.md`

意味着：
- 模板现在提供了结构化入口
- 但具体项目仍需要自己填充项目化内容与真实验收记录

### 2.2 migration governance patterns

现在已通过 optional 模板覆盖：
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `memory-bank/licensing-and-clean-room.md`

意味着：
- 迁移/移植项目不必再从零搭治理骨架
- 但非迁移项目不应被迫维护这些文件

### 2.3 Phase 0 governance bootstrap

现在已通过 optional 模板覆盖：
- `memory-bank/phase0-playbook.md`

意味着：
- 复杂项目可以先治理、后开发
- 简单项目仍可直接从 Phase1 开始

### 2.4 Ralph ops memory

现在已通过 optional 模板覆盖：
- `memory-bank/ralph-ops-memory.md`

意味着：
- 长期使用 Ralph 的项目可以把 incident handling 固化下来
- 一次性或短期项目不必默认维护它

## 3. Still project-specific：仍建议由项目自己补齐的部分

### 3.1 rules-gate helper tooling

模板说明了：
- `typecheck:rules`
- `test:rules`

但没有直接内置：
- `package.json` 示例
- `tsconfig.rules.json`
- `vitest.rules.config.ts`
- 严格 JSON / schema helper tooling

### 3.2 framework regression tests

建议项目自行补：
- `ralph.sh`
- `ralph-auto.sh`
- `expand-core-backlog.mjs`

的脚本层回归测试。

### 3.3 dataset guidance / fixture samples

模板有 `doc/datasets/README.md`，但没有提供真实 sample fixture / manifest 示例。

### 3.4 role-specific 深度操作手册

角色边界已覆盖，但复杂团队协作场景仍可继续补：
- role-specific handoff 示例
- 冲突裁决范例
- escalation 路径示例

### 3.5 具体业务领域内容

不应由模板直接内置：
- 项目专属 parity 文本
- 项目专属迁移清单正文
- importer / converter / engine adapter 实现
- 领域术语与目录细节

## 4. Intentionally out-of-scope：应明确排除或只作为项目侧产物存在的部分

### 4.1 本地 Claude harness 配置

例如：
- `.claude/settings.local.json`

### 4.2 Ralph 运行生成物

例如：
- `scripts/ralph/.state/run-state.json`
- `scripts/ralph/.state/runner.log`
- `scripts/ralph/.state/lock/`

### 4.3 dated audit / status docs

例如：
- 某次策略回顾
- 某日项目健康度快照
- 某日进度状态报告

### 4.4 项目专属 importer / converter 工具

例如：
- 特定业务 schema 转换脚本
- 特定资源 importer
- 特定平台 adapter

## 5. 采用建议：如何把这份审计用起来

### 5.1 如果你只是想快速起步

优先复制并定制：
- 根入口文档
- `memory-bank/`
- `scripts/ralph/`
- `scripts/agent/`
- `doc/validation/`

并补齐：
- `prd.json`
- `rolloutWave`
- manual 验收项

### 5.2 如果你要做严肃迁移项目

除基础模板外，建议启用：
- `phase0-playbook.md`
- migration governance 模板
- parity / compatibility / manual acceptance checklist
- Ralph ops memory（若长期运行 Ralph）

### 5.3 如果你要长期维护这套框架

建议把 v2 视作：
- 可复用框架骨架
- 可选治理包
- 明确边界的接入协议
- 而不是“所有项目都必须一模一样拥有的完整文件集”

## 6. 总结判断

最终结论：
- **有提炼出来，而且主干提炼得不错。**
- **BOA 暴露的治理缺口，现在大多已通过 optional packs 补齐。**
- **仍然需要项目自己补的，主要集中在 helper tooling、脚本测试、样例层与项目专属领域内容。**
- 因此最合理的定位是：
  - v2 足够作为新项目的 agent/runtime 模板起点
  - 真实项目再按场景启用 optional governance packs，并补齐少量项目专属能力