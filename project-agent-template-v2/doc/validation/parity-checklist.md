# Parity Checklist（Optional）

> 本文件是 **可选** 的 parity / reference-behavior 对照模板。
>
> 适用：需要把 target project 与 source system / 旧版本 / 参考实现做行为对照的项目。

## 目标

记录每个已迁移或已重建规则点，当前是否与参考行为保持一致，或存在哪些已知差异。

## 单条规则模板

- 规则名称：
- Source files：
- Target files：
- 当前覆盖行为：
- 当前未覆盖行为：
- 预期结果：
- 自动检查结果：
- 人工对照步骤：
- 是否通过：

## 推荐检查维度

- 最小 happy path 是否一致
- 关键边界条件是否一致
- 已知 deferred 行为是否仍明确标注
- 测试命名 / 文档描述 / source traceability 是否一致

## Story 级模板

### [STORY-ID] [Story Title]

- 规则名称：
- Source files：
- Target files：
- 当前覆盖行为：
  - 
- 当前未覆盖行为：
  - 
- 预期结果：
- 自动检查结果：
- 人工对照步骤：
  - 
- 是否通过：

## 注意

- parity checklist 不是要求“100% 一致”，而是要求“当前差异被诚实记录”
- 若项目采用原生重建而非逐行复制，更应明确哪些行为是 deliberate divergence
- 若 closeout 时未同步 parity 文档，迁移范围就不够可审计