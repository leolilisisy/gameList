# BOA-Derived Upgrades for `project-agent-template-v2`

本文说明：BattleOfAetherland（BOA）在真实迁移项目中验证出来的改进点，哪些已经回流进 `project-agent-template-v2`，以及这些改进应该如何使用。

> 目标不是把 BOA 的业务细节复制到模板里，而是把 **已经在真实项目中被证明有价值的治理模式** 提炼成可复用框架能力。

## 1. 背景与目标

`project-agent-template-v2` 已经具备较完整的 agent / Ralph / memory-bank / validation 骨架。

但 BOA 的真实迁移实践暴露出几类“模板骨架之外、项目落地时反复需要补”的能力：

- 迁移类项目需要更清晰的治理文档，而不只是 phase playbook
- validation 需要 manual / parity / compatibility 三类更具体的模板
- Ralph 长跑后需要长期 ops memory，而不只是当次 `runner.log`
- closeout story 需要明确同步哪些文档，否则很容易状态漂移
- backlog 需要 capability-pack / summary / closeout 这类更稳的粒度约束
- 历史路径与当前 canonical path 需要显式治理，否则旧文档会持续污染新 story

本轮升级的目标就是把这些模式补齐到模板里，同时保持 **core 与 optional 的边界清晰**。

## 2. 本轮升级总览

本轮新增/强化了 8 个主题：

1. **新增 BOA-derived 总说明文档**
2. **新增可选 Phase 0 治理入口**
3. **新增可选 migration governance 套件**
4. **新增可选 validation 套件**
5. **新增 Ralph ops memory 模式**
6. **加强 canonical path / historical path 治理**
7. **加强 closeout story 的多文档同步规则**
8. **补齐 capability-pack / summary / closeout 的 backlog 粒度指导**

## 3. 具体升级点

### 3.1 可选 Phase 0 治理入口

BOA 暴露的问题：
- 真实迁移项目在写代码前，经常需要先建立边界、清单、验证约束与阶段规则
- 只有 Phase 1 / Phase 2 模板时，这部分容易变成零散文档

本轮泛化处理：
- 新增 `memory-bank/phase0-playbook.md`
- 在入口文档中把它标记为 **optional governance bootstrap**

适用场景：
- 新项目尚未形成稳定 backlog
- 迁移/移植类项目需要先做边界梳理
- 希望先建立文档治理再启用 Ralph

### 3.2 可选 migration governance 套件

BOA 暴露的问题：
- 迁移项目如果没有 `porting-principles`、`domain map`、`manifest`、`clean-room` 这几层文档，就很难稳定控制“从哪里迁、迁到哪里、哪些后置、如何溯源”

本轮泛化处理：
- 新增：
  - `memory-bank/porting-principles.md`
  - `memory-bank/domain-map.template.md`
  - `memory-bank/migration-manifest.template.md`
  - `memory-bank/licensing-and-clean-room.md`
- 明确这些都是 **optional packs**，只在 migration / porting 项目中启用

适用场景：
- 参考旧系统/旧仓库迁移
- 有 source -> target traceability 要求
- 需要 clean-room / licensing 约束

### 3.3 可选 validation 套件

BOA 暴露的问题：
- 通用 validation 资产还不够，真实项目还需要：
  - manual acceptance checklist
  - parity checklist
  - compatibility checklist
- 如果不提供模板，团队很容易每次都从头写，且格式不一致

本轮泛化处理：
- 新增：
  - `doc/validation/manual-acceptance-checklist.md`
  - `doc/validation/parity-checklist.md`
  - `doc/validation/compatibility-checklist.md`
- 保持为通用模板，不内置 BOA / VCMI / battle / Cocos 专有名词

适用场景：
- 需要人工验收
- 需要与参考系统做行为对照
- 需要平台/版本/环境兼容性约束

### 3.4 Ralph ops memory

BOA 暴露的问题：
- `runner.log` 能看到当次故障，但不适合沉淀“跨多次运行可复用的排障经验”
- 例如 `tool_network_unavailable`、`tool_account_unavailable`、stale run-state、manual gate 误判，都需要长期记录

本轮泛化处理：
- 新增 `memory-bank/ralph-ops-memory.md`
- 在 `scripts/ralph/README.md` 与 `memory-bank/README.md` 中加入路由

适用场景：
- 长期使用 Ralph
- 多人共享同一套运行经验
- 需要把 incident 与解法固化到项目记忆层

### 3.5 canonical path / historical path 治理

BOA 暴露的问题：
- 真实迁移项目会经历目录重构、路径收口、命名收口
- 历史文档中的旧路径如果不显式标注，会持续污染新 story

本轮泛化处理：
- 在 `memory-bank/@architecture.md`、`CLAUDE.md`、`AGENTS.md`、`scripts/ralph/CLAUDE.md` 中增加 canonical path 规则
- 要求：
  - 当前 story / 新增文档使用 canonical path
  - 历史路径只能作为说明或迁移映射保留
  - closeout 时显式同步路径真相

### 3.6 closeout story 的多文档同步规则

BOA 暴露的问题：
- closeout story 如果只改 `prd.json`，而不改 playbook / validation / manifest / progress，项目状态会漂移

本轮泛化处理：
- 在执行规则与 Ralph 文档中明确：closeout / summary story 必须同步相关状态文档
- 根据项目是否启用了 optional packs，closeout 需要同步的文档范围不同

推荐同步面：
- phase playbook
- `scripts/ralph/prd.json`
- `scripts/ralph/progress.txt`
- `doc/validation/*`
- migration manifest / domain map（若启用）

### 3.7 backlog 粒度指导：capability-pack / summary / closeout

BOA 暴露的问题：
- backlog 如果只有“纯功能 story”，缺少 pack / summary / closeout 粒度，很容易出现：
  - 单 story 范围过大
  - 状态难收口
  - 验证/文档同步被遗漏

本轮泛化处理：
- 在执行规则、Ralph README、样例 backlog 中增加粒度指导
- 推荐将 story 分成三类：
  - **capability-pack**：一组紧密相关能力的最小闭环
  - **summary/bridge story**：连接两组能力，补 query / legality / adapter 等关键缺口
  - **closeout story**：只做文档同步、验证同步、remaining risks 收口

### 3.8 保持 optional/core 边界

BOA 暴露的问题：
- 真实项目中的治理外延很有价值，但并不适合强制所有项目启用

本轮泛化处理：
- 把 migration / validation / ops memory 统一定位为 **optional governance packs**
- 让模板核心保持轻量：入口、状态边界、Ralph、角色协议仍是默认核心
- 让 adopter 可以按场景启用，而不是被迫一开始就维护所有文档

## 4. 文件级变更清单

### 4.1 本轮新增文件

#### 根目录
- `BOA-DERIVED-UPGRADES.md`

#### `memory-bank/`
- `phase0-playbook.md`
- `porting-principles.md`
- `domain-map.template.md`
- `migration-manifest.template.md`
- `licensing-and-clean-room.md`
- `ralph-ops-memory.md`

#### `doc/validation/`
- `manual-acceptance-checklist.md`
- `parity-checklist.md`
- `compatibility-checklist.md`

### 4.2 本轮更新文件

#### 入口与迁移导航
- `README.md`
- `CLAUDE.md`
- `AGENTS.md`
- `MIGRATION-01-HUB.md`
- `INIT-CHECKLIST.md`
- `USAGE-GUIDE.md`
- `VARIABLES.md`

#### memory-bank / doc 路由与规则
- `memory-bank/README.md`
- `memory-bank/@ai-task-execution-rules.md`
- `memory-bank/@architecture.md`
- `memory-bank/@project-roadmap.md`
- `memory-bank/@ralph-workflow.md`
- `doc/README.md`

#### Ralph 文档与样例
- `scripts/ralph/README.md`
- `scripts/ralph/CLAUDE.md`
- `scripts/ralph/prd.json.example`
- `scripts/ralph/task-pack.template.json`

#### 自评与历史升级说明
- `TEMPLATE-COMPLETENESS-REVIEW.md`
- `FRAMEWORK-DELTA-REPORT.md`

## 5. 哪些能力仍然不应内置

以下内容仍然不应直接模板化：

- BOA 的领域术语与目录路径
- 特定引擎/版本/运行时的项目专名
- 具体业务的 parity case 正文
- 具体领域迁移清单正文
- 具体 importer / converter / engine adapter 实现

原则：**保留模式，不复制领域内容。**

## 6. 如何启用这些升级

### 6.1 通用项目

至少使用：
- 现有 core docs
- `BOA-DERIVED-UPGRADES.md`
- 更新后的 Ralph 文档与执行规则

通常不必启用：
- migration governance pack
- parity checklist
- compatibility checklist

### 6.2 migration / porting 项目

建议启用：
- `phase0-playbook.md`
- `porting-principles.md`
- `domain-map.template.md`
- `migration-manifest.template.md`
- `licensing-and-clean-room.md`
- `parity-checklist.md`

### 6.3 平台/版本约束强的项目

建议启用：
- `compatibility-checklist.md`
- `manual-acceptance-checklist.md`

### 6.4 长期使用 Ralph 的项目

建议启用：
- `ralph-ops-memory.md`
- 更新后的 closeout / troubleshooting / capability-pack 规则

## 7. 维护要求

### 7.1 文档一致性

若启用了 optional packs，closeout 时必须同步它们，而不是只同步 `prd.json`。

### 7.2 source-of-truth 边界

- 项目状态：phase playbook
- Ralph backlog：`scripts/ralph/prd.json`
- Ralph 运行历史：`scripts/ralph/progress.txt`
- validation 资产：`doc/validation/`
- migration 范围：`migration-manifest.template.md` 派生出的项目文件

### 7.3 canonical path 优先

- 新 story、新文档、新 checklist 一律使用 canonical path
- 历史路径只做说明，不再作为新任务 target path

### 7.4 optional/core 边界不要漂移

- optional packs 的价值在于“按需启用”
- 不要把它们写成所有项目默认必须维护的硬要求

## 8. 最终判断

本轮升级后，`project-agent-template-v2` 的定位从：

- **高质量骨架 + 接入清单**

进一步提升为：

- **高质量骨架 + 可选治理包 + 更接近真实项目落地的执行规则**

这不是把 BOA 复制成模板，而是把 BOA 已验证有效的经验回流成更稳的框架能力。