# Licensing and Clean-Room Notes（Optional）

> 本文件是 **可选** 的工程边界说明。
>
> 它不是法律意见；它的目标是帮助项目团队在迁移/参考旧系统时，明确工程边界与记录要求。

## 目标

避免把“参考旧项目的规则/数据/行为”与“直接复制旧项目实现”混为一谈。

## 当前工作原则

- source project 可作为规则、行为、数据组织方式的参考源
- target project 应以自身技术栈原生重建为主，而不是逐行复制旧实现
- 优先参考：
  - 规则模型
  - 数据定义
  - 配置驱动方式
  - 领域边界
- 对平台/UI/client/integration 等强耦合实现保持谨慎

## 每个迁移任务至少记录

- source files
- target files
- 参考的是“行为/规则”还是“数据/结构”
- 当前是否经过了重新建模或重构
- 是否存在改名、拆分、合并

## 风险提示

- 若直接复制过多实现细节，可能带来授权与工程边界问题
- 若不记录 source -> target 映射，后续难以判断哪些实现是参考重建、哪些只是历史复制
- 若 closeout 时不更新 manifest / validation / playbook，后续会失去可审计性

## 建议做法

- 把 source system 当成“规则说明书 + 数据参考源”，而不是目标代码库
- 保持 target implementation：
  - 原生建模
  - 目录边界清晰
  - 可独立验证
  - 可说明已覆盖与未覆盖行为
- 若项目风险较高，建议在 migration manifest 中单独增加授权/clean-room 备注列

## 适用边界

建议在以下项目启用：
- 历史系统迁移
- 参考开源项目重建
- 需要长期保留 source -> target traceability 的项目

若项目并不依赖旧系统参考，可不启用本文件。