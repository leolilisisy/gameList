# 模板变量说明书（v2）

本文件列出 `project-agent-template-v2/` 中使用的占位符变量，以及建议填写方式。

## 核心变量

| 变量 | 含义 | 示例 | 必填 |
|---|---|---|---|
| `{{PROJECT_NAME}}` | 项目名 | `AICamera` | 是 |
| `{{PROJECT_TYPE}}` | 项目类型 | `Android AI Camera App` | 是 |
| `{{PRODUCT_ONE_LINER}}` | 一句话产品描述 | `一键去除路人的 AI 相机` | 是 |
| `{{APP_ROOT}}` | 主工程目录 | `project/AICameraApp/` | 是 |
| `{{MAIN_BRANCH}}` | 主分支名 | `main` | 是 |

## 构建与验证变量

| 变量 | 含义 | 示例 | 必填 |
|---|---|---|---|
| `{{BUILD_COMMAND}}` | 主构建命令 | `./gradlew assembleDebug` | 是 |
| `{{LINT_COMMAND}}` | 静态检查命令 | `./gradlew lintDebug` | 是 |
| `{{TEST_COMMAND}}` | 测试命令 | `./gradlew testDebugUnitTest` | 建议 |
| `{{VALIDATION_DIR}}` | 验证资产目录 | `doc/validation/` | 是 |
| `{{EVENT_SCHEMA_PATH}}` | 事件 schema 文件路径 | `doc/validation/event_schema.md` | 是 |

## 任务与流程变量

| 变量 | 含义 | 示例 | 必填 |
|---|---|---|---|
| `{{TASK_ID_PATTERN}}` | 任务编号模式 | `P1-Wx-Ty` | 建议 |
| `{{PERF_METRICS}}` | 性能指标口径 | `P50/P90` | 建议 |
| `{{SAFE_FALLBACK_RULE}}` | 安全回退规则 | `失败时回退原图` | 是 |
| `{{RALPH_BRANCH_PREFIX}}` | Ralph 分支前缀 | `ralph/` | 建议 |

## v2 使用建议

1. backlog 的 story 建议增加 `rolloutWave` 字段，便于 `ralph-auto.sh` staged 模式。
2. 若启用 soft gate，建议在 `package.json` 中定义：
   - `typecheck:rules`
   - `test:rules`
3. 若需要批量注入 story，维护 `scripts/ralph/task-pack.template.json`（或自定义 pack 文件）。
4. 若项目属于 migration / porting 类，先阅读 `BOA-DERIVED-UPGRADES.md` 决定是否启用 optional governance packs。

## optional governance packs 相关说明

以下文件不使用额外占位符，但建议在初始化时决定是否启用：

- `memory-bank/phase0-playbook.md`
- `memory-bank/porting-principles.md`
- `memory-bank/domain-map.template.md`
- `memory-bank/migration-manifest.template.md`
- `memory-bank/licensing-and-clean-room.md`
- `memory-bank/ralph-ops-memory.md`
- `doc/validation/manual-acceptance-checklist.md`
- `doc/validation/parity-checklist.md`
- `doc/validation/compatibility-checklist.md`

若启用这些文件，建议在入口文档中同步：
- 何时使用
- 谁维护
- 哪个文件是真相

## canonical path 约定

如果项目经历过目录重构或路径收口，建议显式记录：
- 当前 canonical path 是什么
- 哪些 historical path 只保留做说明
- 新 story / 新文档必须使用 canonical path

## `manual:` 约定

- `manual:` 表示必须人工执行并记录结果的步骤。
- 不是 shell 命令，不应伪造执行输出。

## 常见错误

- `{{APP_ROOT}}` 与实际工程目录不一致
- 命令变量填写为“理想命令”而非当前可执行命令
- 漏掉 `rolloutWave` 导致 staged 策略不可控
- 把 manual 验收伪装成自动验证
- 启用了 optional governance packs，但入口文档没有同步路由
- 新 story 继续使用 historical path，而不是 canonical path