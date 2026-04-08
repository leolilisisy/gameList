# Domain Map Template（Optional）

> 本文件是 **可选** 的 source -> target 领域映射模板。
>
> 适用：迁移/移植类项目。

## 目标

把 source project 的模块/文件映射到 target project 的目标位置，帮助 AI 与人工在迁移时明确：

- 从哪里看
- 迁到哪里
- 哪些先做
- 哪些后做
- 哪些只做行为参考，不直接迁移

## 使用建议

- 若项目没有“参考源 -> 目标项目”的迁移关系，不必启用本文件。
- 若启用，应与 `porting-principles.md`、`migration-manifest.template.md` 配套使用。
- 本文件关注“领域映射与排序”，不维护具体完成状态。

## 推荐表格

| Source module/file | 用途理解 | Target location | 当前策略 | 依赖层级 | 业务优先级 |
|---|---|---|---|---|---|
| `source/path/A` | 规则/接口/数据语义基线 | `target/path/A` | contract-first / whole-file / thin-slice | D0 | P0 |
| `source/path/B` | 低耦合值对象/配置读取 | `target/path/B` | whole-file preferred | D1 | P0 |
| `source/path/C` | query / legality / repository | `target/path/C` | thin-slice | D2 | P1 |
| `source/path/D` | runtime / callback / orchestrator | `target/path/D` | defer / high-coupling slice | D3 | P1 |
| `source/path/E` | UI / platform / integration | `target/path/E` | reference-only / out-of-scope | D4 | P3 |

## 依赖层级说明

- `D0`：接口、命名、数据语义基线
- `D1`：低耦合值对象、配置读取、轻量结构
- `D2`：中等耦合 query / legality / repository / adapter
- `D3`：高耦合 runtime / callback / state mutation
- `D4`：最重 orchestration / platform / UI / integration

## 业务优先级说明

- `P0`：核心目标最小闭环
- `P1`：高价值扩展
- `P2`：重要但可后置
- `P3`：长期演进项

## 推荐阅读顺序

1. `porting-principles.md`
2. 本文件
3. `migration-manifest.template.md`
4. 对应 phase playbook
5. `doc/validation/parity-checklist.md`（若启用）

## 注意

- domain map 不是状态板，不维护“已完成/进行中”。
- 当前是否完成，以 playbook 或 migration manifest 为准。
- 若 target path 已收口，旧路径只保留在说明列或备注列中，不要继续作为新 story 的 target。