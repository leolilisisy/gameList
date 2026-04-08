# {{PROJECT_NAME}} Agent Roles (Template)

该目录用于定义项目内的角色分工协议，供人工协作和 AI 协作共用。

## 推荐角色

- `planner`：任务拆分、依赖排序、最小可验收切片定义
- `porter`：按授权写入范围实现代码/文档迁移
- `reviewer`：边界一致性与回归风险审查
- `verifier`：自动检查与人工验收步骤完整性确认
- `data-cartographer`：source -> target -> schema 映射维护
- `security-sentinel`：高风险命令、配置和凭据风险审查
- `integrator`：并行结果集成、冲突裁决、收口发布

## 最小协作协议

1. 每个任务必须声明 owner 角色与写入范围。
2. 每次交付必须包含：Summary / Files / Validation / Risks。
3. 若存在 manual 验收，必须写出可执行步骤与结果记录位置。
4. phase 状态以 playbook 为准，`scripts/ralph/prd.json` 仅服务 Ralph。

## 与 Ralph 的关系

- Ralph 负责执行节奏与状态记录。
- 角色协议负责职责边界和 handoff 质量。
- 二者应同时存在：一个管“跑起来”，一个管“跑得对”。
