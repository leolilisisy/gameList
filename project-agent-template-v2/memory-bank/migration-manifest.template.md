# Migration Manifest Template（Optional）

> 本文件是 **可选** 的迁移清单模板。
>
> 适用：需要明确记录 source -> target、范围、状态、验证与 remaining risks 的迁移项目。

## 目标

记录迁移范围、优先级、来源文件、目标文件、实施策略与当前状态。

## 使用方式

- 本文件是模板，实际项目应复制并改成项目名相关文件。
- 若项目没有 source -> target 迁移需求，可不启用。
- 若启用，本文件应成为“迁移范围与状态”的唯一说明之一，并与 playbook / validation 文档保持一致。

## 路径规范

- **Canonical target path**：当前新 story 与新文档必须使用的目标路径
- **Historical path**：仅用于说明旧记录、旧迁移轮次、旧目录结构
- 历史路径不能继续作为新 story 的 target path

## 推荐范围划分

### In scope
- 低耦合、可独立验证的基础迁移项
- 核心闭环必须的 query / legality / runtime slices
- source -> target traceability
- 对应 validation 与 closeout 同步

### Out of scope
- 高风险大重构
- 平台/UI/client 直译
- 未明确验收条件的功能扩展
- 当前阶段不需要的长尾能力

## 推荐清单格式

| Story ID | Manifest ID | Domain | Source files | Canonical target files | Historical path | Strategy | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| `MIG-001` | `MM-W1-001` | baseline contract | `source/A` | `target/A` | `legacy/A` | contract-first | 待开始 | 最小契约先行 |
| `MIG-002` | `MM-W1-002` | low-coupling data | `source/B` | `target/B` |  | whole-file preferred | 待开始 | 优先整文件迁移 |
| `MIG-003` | `MM-W2-001` | runtime slice | `source/C` | `target/C` | `legacy/C` | thin-slice | 待开始 | callback-heavy 行为后置 |
| `MIG-CLOSEOUT` | `MM-W2-999` | closeout sync | docs only | playbook + validation + prd + progress |  | closeout | 待开始 | 收口同步 |

## 状态约定

- `待开始`
- `进行中`
- `已完成`
- `已延期`
- `需人工验证`
- `暂不开始`

## 每条记录至少补充的信息

- Source files
- Canonical target files
- Historical path（若有）
- 当前覆盖行为
- 当前未覆盖行为
- 验收方式
- parity scenario（若适用）
- automatic checks
- manual steps
- rollback / remaining risks

## Closeout 规则

当一个 capability-pack、summary story 或阶段性迁移面收口时，至少同步：

- phase playbook
- migration manifest
- `doc/validation/manual-acceptance-checklist.md`（若启用）
- `doc/validation/parity-checklist.md`（若启用）
- `doc/validation/compatibility-checklist.md`（若启用）
- `scripts/ralph/prd.json`
- `scripts/ralph/progress.txt`

## 重要提醒

- manifest 记录的是“迁移范围与收口状态”，不是 backlog 的替代品。
- Ralph 的 `prd.json` 只服务 Ralph；project-level 迁移范围不能只写在 `prd.json` 里。
- 若 manifest 与 playbook / validation 结论不一致，应优先先做 closeout sync。