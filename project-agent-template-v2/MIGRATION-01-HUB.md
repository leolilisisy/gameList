# Migration Hub

> Navigation: `MIGRATION-01-HUB.md` | `MIGRATION-04-PHASED-CHECKLIST.md` | `MIGRATION-03-EXECUTION-CARD-CHECKLIST.md` | `MIGRATION-02-EXECUTION-CARD.md` | `MIGRATION-05-CHECKLIST-COMPACT.md`
>
> 适用场景：迁移总览 / 选文档入口 / 初次评估 v2 迁移路径

这是 `project-agent-template-v2` 的迁移总入口。
如果你准备把模板移植到新项目，按下面的路径选文档即可。

## 1. 我只想最快开始

先看：
1. `VARIABLES.md`
2. `MIGRATION-02-EXECUTION-CARD.md`
3. `MIGRATION-05-CHECKLIST-COMPACT.md`

适合：
- 已经理解模板大概结构
- 只想尽快把模板接到新项目里
- 需要一个最短操作路径

## 2. 我想边做边勾

先看：
1. `MIGRATION-03-EXECUTION-CARD-CHECKLIST.md`
2. `MIGRATION-04-PHASED-CHECKLIST.md`

适合：
- 迁移时希望有勾选感
- 想把工作拆成阶段推进
- 希望减少遗漏

## 3. 我想按阶段推进

先看：
1. `MIGRATION-04-PHASED-CHECKLIST.md`
2. `INIT-CHECKLIST.md`
3. `BOA-DERIVED-UPGRADES.md`

适合：
- 真实项目迁移
- 需要明确 Phase 0 ~ Final Gate
- 希望团队按统一作业单执行
- 需要判断是否启用 optional governance packs

## 4. 我想先理解框架差异和边界

先看：
1. `FRAMEWORK-DELTA-REPORT.md`
2. `BOA-UPGRADE-SUMMARY.md`
3. `BOA-DERIVED-UPGRADES.md`
4. `TEMPLATE-COMPLETENESS-REVIEW.md`
5. `USAGE-GUIDE.md`

适合：
- 你在判断 v2 值不值得迁
- 你想知道哪些能力已经模板化
- 你想知道哪些能力现在以 optional pack 形式提供
- 你想知道哪些能力仍需项目自己补

## 5. 我想看完整初始化手册

先看：
1. `INIT-CHECKLIST.md`
2. `USAGE-GUIDE.md`
3. `scripts/ralph/README.md`
4. `scripts/agent/README.md`

适合：
- 第一次正式接入模板
- 想要完整初始化顺序
- 需要 runner / agent 协议的细节

## 6. 我在做 migration / porting 项目

先看：
1. `BOA-DERIVED-UPGRADES.md`
2. `memory-bank/porting-principles.md`
3. `memory-bank/domain-map.template.md`
4. `memory-bank/migration-manifest.template.md`
5. `memory-bank/licensing-and-clean-room.md`
6. `doc/validation/parity-checklist.md`

适合：
- 有 source -> target 迁移关系
- 需要 traceability / clean-room / parity 文档
- 需要显式区分 canonical path 与 historical path

## 7. 我在做人工验收或兼容性敏感项目

先看：
1. `doc/validation/manual-acceptance-checklist.md`
2. `doc/validation/compatibility-checklist.md`
3. `USAGE-GUIDE.md`

适合：
- 需要人工打开工具/设备/场景做验收
- 需要版本或平台兼容边界

## 8. 推荐阅读路径

### 路径 A：最快落地
- `VARIABLES.md`
- `MIGRATION-02-EXECUTION-CARD.md`
- `MIGRATION-05-CHECKLIST-COMPACT.md`
- `scripts/ralph/README.md`

### 路径 B：稳妥迁移
- `VARIABLES.md`
- `MIGRATION-04-PHASED-CHECKLIST.md`
- `INIT-CHECKLIST.md`
- `USAGE-GUIDE.md`
- `FRAMEWORK-DELTA-REPORT.md`
- `BOA-DERIVED-UPGRADES.md`
- `TEMPLATE-COMPLETENESS-REVIEW.md`

### 路径 C：做迁移决策前先评估
- `FRAMEWORK-DELTA-REPORT.md`
- `BOA-UPGRADE-SUMMARY.md`
- `BOA-DERIVED-UPGRADES.md`
- `TEMPLATE-COMPLETENESS-REVIEW.md`
- `USAGE-GUIDE.md`
- `MIGRATION-05-CHECKLIST-COMPACT.md`

### 路径 D：迁移治理优先
- `BOA-DERIVED-UPGRADES.md`
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `doc/validation/parity-checklist.md`

## 9. 这些文档分别解决什么问题

- `MIGRATION-02-EXECUTION-CARD.md`
  - 一页顺序版，适合快速操作
- `MIGRATION-03-EXECUTION-CARD-CHECKLIST.md`
  - 一页勾选版，适合边做边打勾
- `MIGRATION-04-PHASED-CHECKLIST.md`
  - 分阶段作业单，适合真实迁移流程
- `MIGRATION-05-CHECKLIST-COMPACT.md`
  - 精简说明版，适合快速扫一遍全流程
- `INIT-CHECKLIST.md`
  - 正式初始化检查表
- `FRAMEWORK-DELTA-REPORT.md`
  - 看 v2 比旧模板升级了什么
- `BOA-UPGRADE-SUMMARY.md`
  - 看 BOA 回流升级的短版摘要
- `BOA-DERIVED-UPGRADES.md`
  - 看 BOA 真实项目回流到了哪些 optional/core 升级
- `TEMPLATE-COMPLETENESS-REVIEW.md`
  - 看哪些已提炼、哪些现在是 optional 覆盖、哪些仍缺失
- `USAGE-GUIDE.md`
  - 看如何落地使用，以及模板边界

## 10. 一句话建议

如果你不想思考太多，直接从：
- `MIGRATION-04-PHASED-CHECKLIST.md`

开始。

如果你在做迁移/移植项目，先看：
- `BOA-DERIVED-UPGRADES.md`

再决定启用哪些 optional governance packs。