# doc 目录说明

`doc/` 用于保存模板中的验证资产与可复用辅助资料。

## 目录职责

| 路径 | 作用 |
|---|---|
| `doc/validation/` | 验证规则、事件 schema、执行清单、发布清单、失败标签、指标模板，以及可选 manual/parity/compatibility checklist |
| `doc/datasets/` | 固定样本集、manifest、评估输入说明 |

## 与 memory-bank 的区别

- `memory-bank/`：保存规则、任务板、路线图、架构边界、执行协议
- `doc/`：保存验证资产、模板、样本、清单

## 使用建议

- 需要统一“如何验证”时，优先补充 `doc/validation/`
- 需要统一“拿什么验证”时，优先补充 `doc/datasets/`
- 不要把项目状态真相写进 `doc/`，状态仍由 playbook 维护

## validation 目录中的 optional packs

除通用骨架外，`doc/validation/` 现在还包含三份 **optional** 模板：
- `manual-acceptance-checklist.md`
- `parity-checklist.md`
- `compatibility-checklist.md`

适用场景：
- manual acceptance：需要人工打开应用/设备/场景做验收
- parity checklist：需要与参考系统或旧版本做行为对照
- compatibility checklist：存在平台/版本/环境约束

若项目不需要这些能力，可以不启用它们。