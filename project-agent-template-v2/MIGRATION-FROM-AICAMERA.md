# 从 AICamera 提炼模板的映射说明

本文件说明当前 `project-agent-template/` 是如何从 AICamera 项目提炼出来的，帮助后续维护模板时区分：哪些是通用框架，哪些来自具体项目经验。

## 映射原则

- 保留框架性的结构与契约
- 抽象掉 AICamera 特有的业务内容
- 保留 Ralph 运行内核
- 保留 playbook / task-index / risk 的任务系统结构
- 保留 validation 文档骨架，移除项目专用指标与样本内容

## 文件映射

| AICamera 原文件 | 模板文件 | 处理方式 |
|---|---|---|
| `README.md` | `project-agent-template/README.md` | 保留结构，改为占位符模板 |
| `AGENTS.md` | `project-agent-template/AGENTS.md` | 保留结构，改为通用仓库级 agent 规范 |
| `CLAUDE.md` | `project-agent-template/CLAUDE.md` | 保留结构，改为 Claude 启动入口模板 |
| `memory-bank/README.md` | `project-agent-template/memory-bank/README.md` | 保留 source-of-truth 与信息架构说明 |
| `memory-bank/@game-design-document.md` | `project-agent-template/memory-bank/@product-requirements.md` | 改名并抽象为通用产品需求模板 |
| `memory-bank/@tech-stack.md` | `project-agent-template/memory-bank/@tech-stack.md` | 参数化保留 |
| `memory-bank/@architecture.md` | `project-agent-template/memory-bank/@architecture.md` | 保留边界模型，抽象业务实现 |
| `memory-bank/@coding-rules.md` | `project-agent-template/memory-bank/@coding-rules.md` | 保留规则分层，抽象平台特有项 |
| `memory-bank/@ai-migration-playbook.md` | `project-agent-template/memory-bank/@project-roadmap.md` | 改名并抽象为路线图导航模板 |
| `memory-bank/@ai-task-execution-rules.md` | `project-agent-template/memory-bank/@ai-task-execution-rules.md` | 基本保留结构 |
| `memory-bank/task-command-protocol.md` | `project-agent-template/memory-bank/task-command-protocol.md` | 基本保留结构 |
| `memory-bank/@ralph-workflow.md` | `project-agent-template/memory-bank/@ralph-workflow.md` | 保留 Ralph 边界说明 |
| `memory-bank/phase1-playbook.md` | `project-agent-template/memory-bank/phase1-playbook.md` | 保留 Phase1 状态板骨架 |
| `memory-bank/phase1-task-index.md` | `project-agent-template/memory-bank/phase1-task-index.md` | 保留索引骨架 |
| `memory-bank/phase1-risk-and-strategy.md` | `project-agent-template/memory-bank/phase1-risk-and-strategy.md` | 保留风险模板骨架 |
| `memory-bank/phase2-playbook.md` | `project-agent-template/memory-bank/phase2-playbook.md` | 保留 Phase2 骨架 |
| `memory-bank/phase2-task-index.md` | `project-agent-template/memory-bank/phase2-task-index.md` | 保留索引骨架 |
| `scripts/ralph/README.md` | `project-agent-template/scripts/ralph/README.md` | 保留 operator manual 结构 |
| `scripts/ralph/CLAUDE.md` | `project-agent-template/scripts/ralph/CLAUDE.md` | 参数化保留 |
| `scripts/ralph/prompt.md` | `project-agent-template/scripts/ralph/prompt.md` | 参数化保留 |
| `scripts/ralph/ralph.sh` | `project-agent-template/scripts/ralph/ralph.sh` | 原样保留为通用 loop 内核 |
| `scripts/ralph/prd.json` | `project-agent-template/scripts/ralph/prd.json.example` | 改为 backlog 示例模板 |
| `scripts/ralph/progress.txt` | `project-agent-template/scripts/ralph/progress.txt` | 保留结构，改为占位符版本 |
| `doc/validation/*` | `project-agent-template/doc/validation/*` | 抽象为通用验证模板 |

## 被抽象掉的 AICamera 特有内容

- Android AI 相机具体业务场景
- 路人消除、双图保存等具体产品需求
- Android / CameraX / ML Kit / OpenCV 的具体实现细节
- AICamera 的具体阶段任务内容
- AICamera 的特有数据集和验证样本
- AICamera 的具体事件命名与指标阈值

## 被保留下来的通用经验

- 根目录入口 + memory-bank + Ralph + validation 四层结构
- source-of-truth 规则
- playbook / task-index / risk 的任务系统拆分
- Ralph 的 supervised local loop 模型
- `--check` / `--status` / `--recover` 的运维模式
- `COMPLETE` / `BLOCKED` / `MANUAL_INTERVENTION_REQUIRED` 的监督型停止语义

## 使用建议

将此模板接入新项目时：

1. 先阅读 `VARIABLES.md`
2. 再执行 `INIT-CHECKLIST.md`
3. 优先替换入口文档和主工程路径
4. 最后再写 Phase1 的第一批故事和 Ralph backlog
