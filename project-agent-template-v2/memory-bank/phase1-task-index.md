# Phase1 任务索引（快速检索）

> 本文件仅用于快速定位任务，不维护状态；Phase1 状态以 `phase1-playbook.md` 为准。

| 任务 ID | 目标 | 依赖 | 主要文件 |
|---|---|---|---|
| P1-W0-T1 | 建立事件/验证 schema | 无 | `doc/validation/`, 遥测相关文件 |
| P1-W0-T2 | 建立固定验证样本或清单 | 无 | `doc/validation/`, `doc/datasets/` |
| P1-W1-T1 | 打通核心主流程 | 无 | 主流程相关核心文件 |
| P1-W1-T2 | 增加安全回退与错误兜底 | P1-W1-T1 | 核心处理文件、错误处理文件 |
| P1-W2-T1 | 建立可观测能力 | P1-W1-T2 | 指标、日志、遥测相关文件 |
| P1-W3-T1 | 发布前最小检查 | P1-W0-T1,P1-W2-T1 | `doc/validation/release_checklist.md` |
