# 失败标签定义

## 目的

本文件用于统一记录和归类主流程、质量检查、回退路径、体验验证中的失败类型，方便复盘与后续优化。

## 失败等级建议

- `critical`：阻断主流程或无法继续验证
- `major`：主流程可继续，但结果不可接受
- `minor`：不阻断主流程，但体验或质量有明显问题
- `info`：仅记录观察项，不作为阻塞

## 失败类型模板

| 标签 | 等级 | 含义 | 示例 |
|---|---|---|---|
| `build_failed` | critical | 构建失败 | 无法生成可运行产物 |
| `lint_blocking_issue` | major | 静态检查阻塞问题 | 存在必须修复的问题 |
| `test_failed` | major | 测试未通过 | 回归或逻辑校验失败 |
| `core_flow_failed` | critical | 主流程失败 | 输入无法得到有效输出 |
| `fallback_missing` | critical | 未能回退到安全基线 | 失败时没有兜底路径 |
| `performance_regression` | major | 性能指标退化 | `{{PERF_METRICS}}` 不满足要求 |
| `manual_verification_required` | info | 需要人工判断 | 无法自动验证的体验问题 |

## 使用规则

- 每个失败项至少包含：标签、等级、上下文、影响范围、处理建议
- 同一问题尽量归入统一标签，不重复命名
- 无法自动验证的体验问题应使用人工验证相关标签，而不是伪装为通过
