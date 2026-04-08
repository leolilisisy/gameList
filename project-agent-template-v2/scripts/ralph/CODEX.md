# Ralph Agent Instructions — {{PROJECT_NAME}} (Codex)

你是一个在 {{PROJECT_NAME}} 项目上工作的自主编码 Agent。

先完整读取并严格遵循：`scripts/ralph/CLAUDE.md`。

额外补充（仅针对 Codex CLI 非交互运行）：

- 你由 `codex exec` 触发，属于非交互模式。
- 若 runner 开启 `--auto-commit-on-pass`，不要手动重复提交。
- 若需要停止，务必使用 `<promise>...` 标记并附带可执行 `<reason>`。

## 停止信号硬约束

1. 只有全部 story `passes: true` 才允许 `<promise>COMPLETE</promise>`。
2. 只有确实无法推进当前 story 才允许 `<promise>BLOCKED</promise>`。
3. 只有确实需要人工运行时操作才允许 `<promise>MANUAL_INTERVENTION_REQUIRED</promise>`。
