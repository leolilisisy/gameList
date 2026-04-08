# BOA Upgrade Summary

这是 `BOA-DERIVED-UPGRADES.md` 的短版阅读入口，回答 3 个问题：
- 改了什么
- 为什么要改
- 怎么启用

## 1. 改了什么

这轮把 BattleOfAetherland（BOA）真实项目里验证有效的 4 类能力回流到了 `project-agent-template-v2`：

### A. 新增总说明入口
- `BOA-DERIVED-UPGRADES.md`

### B. 新增 optional governance packs
- `memory-bank/phase0-playbook.md`
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `memory-bank/licensing-and-clean-room.md`
- `memory-bank/ralph-ops-memory.md`

### C. 新增 optional validation packs
- `doc/validation/manual-acceptance-checklist.md`
- `doc/validation/parity-checklist.md`
- `doc/validation/compatibility-checklist.md`

### D. 强化现有规则
- closeout story 不能只改 `prd.json`
- 新 story 优先使用 canonical path
- historical path 只保留做说明
- backlog 粒度补齐为 capability-pack / summary / closeout

## 2. 为什么要改

BOA 的真实落地暴露了 4 个高频问题：

1. **迁移项目缺治理骨架**
   - 没有 principles / domain map / manifest / clean-room，很难稳定做 source -> target traceability

2. **validation 骨架太通用**
   - 真实项目经常需要 manual / parity / compatibility 三类更具体的文档

3. **Ralph 长跑缺长期 ops memory**
   - `runner.log` 只够看当次，不够沉淀跨多轮可复用排障经验

4. **closeout 容易状态漂移**
   - 只改 `prd.json`，不改 playbook / validation / manifest，项目状态会失真

## 3. 怎么启用

### 最少做法
只读下面 3 个文件：
- `BOA-UPGRADE-SUMMARY.md`
- `BOA-DERIVED-UPGRADES.md`
- `USAGE-GUIDE.md`

### 如果你是普通项目
通常只需要：
- 保留模板核心
- 理解 closeout / canonical path / backlog 粒度的新规则

### 如果你是 migration / porting 项目
建议启用：
- `memory-bank/phase0-playbook.md`
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `memory-bank/licensing-and-clean-room.md`
- `doc/validation/parity-checklist.md`

### 如果你需要人工验收 / 平台兼容性
建议启用：
- `doc/validation/manual-acceptance-checklist.md`
- `doc/validation/compatibility-checklist.md`

### 如果你会长期运行 Ralph
建议启用：
- `memory-bank/ralph-ops-memory.md`

## 4. 使用时最重要的边界

- 这些新增能力是 **optional**，不是默认强制项
- 新 story / 新文档优先使用 canonical path
- closeout story 必须同步状态文档和验证文档
- 模板回流的是“模式”，不是 BOA 的业务内容

## 5. 先看哪份文档

### 想快速理解
看：
1. `BOA-UPGRADE-SUMMARY.md`
2. `BOA-DERIVED-UPGRADES.md`

### 想直接接入模板
看：
1. `INIT-CHECKLIST.md`
2. `MIGRATION-04-PHASED-CHECKLIST.md`
3. `USAGE-GUIDE.md`

### 想判断某个项目该启用哪些包
看：
1. `BOA-DERIVED-UPGRADES.md`
2. `USAGE-GUIDE.md`
3. `VARIABLES.md`

## 6. 一句话结论

这轮升级把 `project-agent-template-v2` 从“高质量骨架”推进成了“高质量骨架 + 可选治理包 + 更稳的 closeout 规则”。