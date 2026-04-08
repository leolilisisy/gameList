# Changelog

## v0.2.0

基于 BattleOfAetherland 当前可运行框架提炼的第二版模板。

### Added

- `scripts/ralph/CODEX.md`
- `scripts/ralph/ralph-auto.sh`（classic + staged-full-auto）
- `scripts/ralph/expand-core-backlog.mjs`（通用任务包合并器）
- `scripts/ralph/task-pack.template.json`
- `scripts/agent/` 角色协议目录（7 个角色）
- `FRAMEWORK-DELTA-REPORT.md`（新旧框架差异说明）
- `USAGE-GUIDE.md`（落地与迁移使用文档）

### Changed

- `scripts/ralph/ralph.sh`
  - 支持 `--tool codex`
  - 支持 `--auto-commit-on-pass`
  - soft rules gate 与 run-state 字段增强
- `scripts/ralph/prd.json.example`
  - 增加 `rolloutWave` 示例
- 根目录说明与初始化清单升级到 v2 流程

### Notes

- v2 仍是监督式本地框架，不是无人值守平台。
- 若新项目没有 rules 层命令，可跳过 soft gate（会 warning，不阻断主流程）。

## v0.1.0

首个可复用模板版本，基于 AICamera 的规则体系、memory-bank 信息架构与 Ralph 本地监督式 loop 抽象而来。
