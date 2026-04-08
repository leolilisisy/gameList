# Porting Principles（Optional）

> 本文件是 **可选** 的 migration / porting 治理文档。
>
> 只有当项目存在“参考旧系统/旧仓库/旧版本迁移”的情况时才建议启用。

## 目标

定义迁移项目的边界、优先级和实施原则，避免项目退化成“机械翻译旧代码”。

## 核心原则

### 1. 先迁规则/数据/契约，再迁高耦合运行时
优先级建议：
- 接口与命名基线
- 数据结构与配置语义
- 可独立验证的规则切片
- 高耦合 runtime / callback / orchestration
- UI / platform / integration 外延

### 2. Source project 是参考源，不是目标代码库
- 参考其规则模型、数据组织、行为边界
- 不逐行复制实现
- 不把旧项目的类层次、平台耦合、历史包袱原样搬到新工程

### 3. Target project 以目标技术栈原生设计为主
- 目标项目优先使用自己的语言、目录与边界设计
- 平台/API 依赖尽量留在 adapter 层
- 核心规则应尽量可脱离平台独立验证

### 4. 一次只迁一个可验收最小切片
每轮只完成一个可被验证的最小增量，例如：
- 一个数据子集
- 一个 query slice
- 一个 legality slice
- 一个 bonus/spell/runtime capability pack
- 一个 closeout/sync story

### 5. 优先保持可追溯性
每个迁移任务都应记录：
- source files
- target files
- 当前覆盖行为
- 当前未覆盖行为
- 验证方式
- 若发生改名/拆分/合并，记录映射说明

### 6. 优先保持 canonical path 清晰
- 新 story、新文档使用当前 canonical path
- 历史路径只作为迁移说明保留
- 若路径收口发生变化，优先更新 architecture / manifest / closeout 文档

### 7. 实现尽量大，验收保持小
- 对低耦合、可独立验证文件，可优先整文件迁移
- 对高耦合模块，先做 header-first / contract-first / thin-slice
- 即使实现范围较大，完成标准仍按最小验收边界判定

### 8. No evidence, not done
- 没有验证证据，就不算完成
- `manual:` 验收必须诚实写出人工步骤
- 不能把人工判断伪装成自动完成

## 推荐迁移排序

建议同时记录两套优先级：

### 依赖层级
- `D0`：接口/数据基线
- `D1`：低耦合值对象/配置读取
- `D2`：轻中耦合规则与 query
- `D3`：中高耦合 runtime 逻辑
- `D4`：高耦合 orchestration / integration / platform

### 业务优先级
- `P0`：核心目标最小闭环
- `P1`：高价值补强
- `P2`：重要但可后置
- `P3`：长期演进项

推荐顺序：**先 D0 -> D4，再 P0 -> P3；同级优先低耦合且可独立验证的文件。**

## 当前轮必须记录的信息

每个迁移 story 至少记录：
- Source files
- Target files
- Canonical target path
- Historical path（若有）
- 当前覆盖行为
- 当前未覆盖行为
- 验收方式
- parity scenario（若适用）
- remaining risks

## 不应直接迁移的典型内容

通常应谨慎或延后处理：
- client / UI / platform 层
- 高耦合 callback / global state / orchestration
- 依赖旧平台生命周期的模块
- 仅为兼容旧实现而存在的历史包袱

## Closeout 要求

当某一批迁移 story 收口时，应同步：
- phase playbook
- migration manifest
- validation checklist
- `scripts/ralph/prd.json`
- `scripts/ralph/progress.txt`

若这几类文档未同步，不应把该批 story 视为真正收口。