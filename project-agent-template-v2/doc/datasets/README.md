# datasets 目录说明

`doc/datasets/` 用于存放固定验证样本、评估输入、manifest 与相关说明。

## 什么时候需要这个目录

适用于以下项目：

- 主流程需要固定样本做回归验证
- 需要跨版本比较输出质量或性能
- 需要给人工验证提供统一输入集
- 需要给 Ralph 或人工任务流提供稳定测试样本

## 推荐组织方式

```text
doc/datasets/
  fixed-sample/
    README.md
    manifest.csv
    sample-001.ext
    sample-002.ext
```

## manifest 建议字段

- `sample_id`
- `file_name`
- `scenario`
- `expected_behavior`
- `notes`

## 使用原则

- 样本集优先保持小而稳定
- Phase1 先准备最小样本集，不追求一次覆盖所有场景
- 若样本涉及敏感信息，应使用脱敏版本
- 样本清单应与 `doc/validation/` 中的验证规则保持一致
