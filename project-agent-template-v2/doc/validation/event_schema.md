# 事件与遥测 Schema

## 目的

本文件定义项目中统一的事件命名、字段口径与触发时机。
所有日志、埋点、指标事件都应遵守本文件，避免同义事件和字段漂移。

## 命名规则

- 使用统一前缀：按项目填写
- 命名风格统一：例如 snake_case / dot.case / kebab-case
- 同一业务动作只保留一个主事件名
- 不允许在不同模块中对同一动作使用不同名字

## 公共字段

| 字段 | 类型 | 含义 | 必填 |
|---|---|---|---|
| `event_name` | string | 事件名 | 是 |
| `timestamp` | string | 触发时间 | 是 |
| `session_id` | string | 会话 ID | 按项目 |
| `request_id` | string | 请求 / 处理链 ID | 按项目 |
| `result` | string | success / failure / fallback / blocked | 建议 |
| `duration_ms` | number | 耗时（如适用） | 建议 |
| `error_code` | string | 错误码（如失败） | 可选 |
| `error_reason` | string | 失败原因（如失败） | 可选 |

## 关键事件

| 事件名 | 触发时机 | 关键字段 | 说明 |
|---|---|---|---|
| `core_flow_started` | 主流程开始时 | `request_id` | 主流程入口 |
| `core_flow_completed` | 主流程成功结束时 | `duration_ms` | 主流程完成 |
| `core_flow_failed` | 主流程失败时 | `error_code`, `error_reason` | 主流程失败 |
| `core_flow_fallback` | 主流程进入安全回退时 | `error_reason` | 安全回退路径 |
| `quality_check_completed` | 构建/lint/test 结束时 | `result` | 质量门禁结果 |

## 指标口径

- 性能指标统一用：`{{PERF_METRICS}}`
- 耗时字段统一使用：`duration_ms`
- 失败事件必须区分：
  - failure
  - fallback
  - blocked
  - manual_intervention_required

## 禁止事项

- 不新增未登记事件名
- 不使用相同事件名表达不同业务语义
- 不随意更改公共字段含义
