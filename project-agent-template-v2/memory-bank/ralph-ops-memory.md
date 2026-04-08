# Ralph Ops Memory（Optional）

> 本文件是 **可选** 的 Ralph 长期运行经验库。
>
> 适用：长期使用 Ralph、多人共用同一套 runner/supervisor、需要跨多次运行沉淀 incident 与解法的项目。

## 目标

把 `scripts/ralph/.state/runner.log` 与 `scripts/ralph/.state/run-state.json` 中反复出现的故障模式，沉淀成长期可复用的排障记忆。

## 与其他文件的边界

- `scripts/ralph/.state/run-state.json`：当前运行的结构化状态
- `scripts/ralph/.state/runner.log`：当前与历史运行日志
- `scripts/ralph/progress.txt`：人类可读运行历史与 codebase patterns
- **本文件**：跨多次运行仍值得保留的 ops 经验、故障类型、推荐排查顺序

## 推荐记录格式

### [日期] 事件标题
- 症状：
- 影响：
- 真正原因：
- 如何识别：
- 推荐处理步骤：
- 是否需要更新文档/脚本：

---

## 常见模式

### 1. `tool_network_unavailable`
- 先看 `./scripts/ralph/ralph.sh --status`
- 再看 `.state/run-state.json` 与 `.state/runner.log`
- 先做**同环境最小 CLI 探测**，不要先入为主归因网络或沙箱
- 再看代理、base URL、端点连通性与 CLI 登录态

### 2. `tool_account_unavailable`
- 通常是账号容量或服务侧限制，而不是 story 本身失败
- 处理方式应优先是：等待、切换账号、切换工具、降低批次节奏
- 不应把它误记为代码验证失败

### 3. stale run-state / stale lock
- 现象：`run-state.json` 显示仍在运行，但对应 pid/进程已不存在
- 优先用 `./scripts/ralph/ralph.sh --recover`
- 若恢复后仍异常，再查看 `.state/lock/` 与 `runner.log`

### 4. manual gate 与 retryable wait 混淆
- 真正需要人工运行时操作的 case 才应视为 `MANUAL_INTERVENTION_REQUIRED`
- 网络/账号容量这类工具问题，可能只是 retryable wait
- 应区分“必须人类操作场景/设备”与“工具稍后可重试”

### 5. closeout 未同步导致状态漂移
- 症状：playbook、`prd.json`、validation、manifest 结论不一致
- 处理：补一个 closeout story 或 summary story，统一同步状态
- 不要只改 `prd.json`

### 6. auto-commit broad-stage 风险
- 当前 `--auto-commit-on-pass` 可能 broad-stage working tree
- 启用前应尽量确保 working tree 干净
- 若项目存在平行未提交改动，优先关闭 auto-commit

### 7. placeholder `BLOCKED` 误停机
- 若 agent 的 `BLOCKED` reason 只是低质量占位文本，不一定代表真实 blocker
- 先看 run-state 是否已有 completed story 或是否只是 batch 边界
- 再决定是否需要 supervisor 立即停机

## 建议何时更新本文件

出现以下情况时，建议同步更新：
- 某类故障连续出现两次以上
- 某次排查顺序明显比旧做法更有效
- runner / supervisor 语义发生变化
- 团队内部已经形成稳定 incident handling 规则

## 不建议写入本文件的内容

- 某次短期临时执行细节
- 只对当前一轮 story 有意义的上下文
- 可以直接从代码或脚本重新读出来的信息

## 维护原则

- 只保留“未来还会复用”的排障经验
- 记录推荐排查顺序，而不是只记录结论
- 若某条经验已过时，应直接更新或删除