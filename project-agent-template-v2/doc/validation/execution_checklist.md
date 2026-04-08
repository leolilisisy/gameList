# 执行验证清单

## 目的

本清单用于在开发、联调、提测或任务验收时，快速确认核心流程是否满足最小可运行要求。

## 基础检查

- [ ] 仓库规则入口文档可读：`README.md`、`memory-bank/README.md`
- [ ] 主工程路径正确：`{{APP_ROOT}}`
- [ ] 构建命令可执行：`{{BUILD_COMMAND}}`
- [ ] 静态检查命令可执行：`{{LINT_COMMAND}}`
- [ ] 测试命令可执行或已明确说明暂无测试命令：`{{TEST_COMMAND}}`

## 主流程检查

- [ ] 核心主流程可从输入走到输出
- [ ] 出现异常时满足安全回退规则：`{{SAFE_FALLBACK_RULE}}`
- [ ] 关键路径具备性能指标采集：`{{PERF_METRICS}}`
- [ ] 核心事件命名符合 `{{EVENT_SCHEMA_PATH}}`

## 文档与状态检查

- [ ] 当前任务状态已更新到对应 playbook
- [ ] task index 未被当作状态板使用
- [ ] 若有架构变化，已同步更新 `memory-bank/@architecture.md`
- [ ] 若有 Ralph 运行行为变化，已同步更新 `scripts/ralph/README.md`

## Ralph 检查（如适用）

- [ ] `./scripts/ralph/ralph.sh --check` 通过
- [ ] `./scripts/ralph/ralph.sh --status` 输出正常
- [ ] 无 stale lock
- [ ] `prd.json` 可解析
- [ ] `progress.txt` 可写
- [ ] 当前工作区适合进入 Ralph（无不相关脏改动）

## 结果记录

- 验证日期：按项目填写
- 验证人：按项目填写
- 验证范围：按项目填写
- 结果：通过 / 阻塞 / 需人工复核
- 备注：按项目填写
