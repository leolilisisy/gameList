# Phase 0 Playbook（Optional Governance Bootstrap）

> 本文件是 **可选** 的 Phase 0 治理任务板。
>
> 适用：迁移/移植项目、规则重建项目、复杂多阶段项目。
> 不适用：结构简单、无需额外治理即可直接进入 Phase 1 的项目。

## 使用方式

- 若项目需要先建立边界、清单、验证与运行规则，再进入正式开发，可启用本文件。
- 若项目不需要 Phase 0，可保留本文件但不维护状态，或在根文档中显式说明未启用。
- Phase 0 的状态真相只在本文件中维护。

## 状态约定

- `待开始`
- `进行中`
- `已完成`
- `已延期`
- `需人工验证`
- `不启用`

## 推荐任务板

| Task ID | 状态 | 依赖 | 目标 | 验收 |
|---|---|---|---|---|
| P0-W0-T1 | 待开始 | 无 | 建立仓库入口与 source-of-truth 边界 | `README.md` / `AGENTS.md` / `CLAUDE.md` / `memory-bank/README.md` 可导航 |
| P0-W0-T2 | 待开始 | P0-W0-T1 | 建立 Phase 路线与最小 playbook | `@project-roadmap.md` 与 phase playbook 已建立 |
| P0-W1-T1 | 待开始 | P0-W0-T2 | 决定是否启用 optional governance packs | 已明确 migration / validation / Ralph ops memory 是否启用 |
| P0-W1-T2 | 待开始 | P0-W1-T1 | 若为迁移项目，建立 migration governance 基线 | `porting-principles` / `domain map` / `migration manifest` 已初始化 |
| P0-W1-T3 | 待开始 | P0-W1-T1 | 若需要人工验收或平台约束，建立 validation 基线 | manual / parity / compatibility checklist 已初始化 |
| P0-W2-T1 | 待开始 | P0-W1-T2, P0-W1-T3 | 初始化 Ralph backlog 与分 wave 粒度 | `scripts/ralph/prd.json` 初版可执行 |
| P0-W2-T2 | 待开始 | P0-W2-T1 | 预检 Ralph / auto supervisor / manual gate 语义 | `./scripts/ralph/ralph.sh --check` 通过或已记录替代策略 |
| P0-W2-T3 | 待开始 | P0-W2-T2 | Phase 0 收口 | optional packs、状态边界、remaining risks 已同步 |

## 执行记录

- 尚未开始。

## Closeout 检查

Phase 0 收口时，至少检查：

- 入口文档是否能路由到当前启用的治理文件
- source-of-truth 是否一致
- optional docs 是否被错误写成默认强制项
- `scripts/ralph/prd.json` 是否已按当前阶段组织 story
- manual 验收项是否明确写成 `manual:`
- 若启用了 migration governance，canonical path 与 source -> target 记录是否已明确