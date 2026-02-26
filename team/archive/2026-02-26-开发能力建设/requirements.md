# 需求：审计整理 SuperDriver 项目，建立全套开发能力

## 背景

SuperDriver（超级司机）是 Survival OS 的移动端入口，已有一定代码体量（92 组件 / 16 服务 / 11 Hooks），但开发基础设施严重缺失。项目仅有 3 次 Git commit，处于初始化阶段，缺乏架构文档、Agent 规则、工作流、文档体系和可运行的测试环境。

本需求旨在：**一次性建立项目的全部开发基础设施**，使项目具备团队协作、AI Agent 辅助开发、文档自维护、测试驱动的标准开发能力。

## 用户故事

作为**项目负责人**，我希望**SuperDriver 项目具备完整的开发基础设施（架构文档、Agent 规则、工作流、Diátaxis 文档体系、可运行的测试）**，以便**后续开发迭代能按照标准化流程高效推进**。

## 验收标准

### 架构文档
- [ ] **AC-1**: Given 项目根目录, When 查看 `AGENTS.md`, Then 能看到完整的目录结构树 + 每文件核心职责 + 模块间依赖关系
- [ ] **AC-2**: Given `AGENTS.md`, When 新开发者阅读, Then 能在 5 分钟内理解项目整体架构

### Agent 规则
- [ ] **AC-3**: Given 项目根目录, When 查看 `.agent/rules/`, Then 存在项目级 Gemini 规则文件（引用全局角色）
- [ ] **AC-4**: Given `.agent/workflows/`, When 查看, Then 存在从全局工作流适配的项目级工作流

### 开发基础设施
- [ ] **AC-5**: Given 已安装依赖, When 执行 `npm test`, Then 所有现有测试通过
- [ ] **AC-6**: Given 项目根目录, When 查看 `team/` 目录, Then 目录结构就绪（含 archive/）
- [ ] **AC-7**: Given 项目, When 查看 `.gitignore`, Then 正确忽略 team/ 中间文件 + node_modules + coverage 等

### 文档体系
- [ ] **AC-8**: Given `docs/` 目录, When 查看结构, Then 具备 Diátaxis 四象限: getting-started / architecture / guides / reference
- [ ] **AC-9**: Given `docs/README.md`, When 查看, Then 是完整的文档索引页
- [ ] **AC-10**: Given `docs/architecture/`, When 查看, Then 包含模块架构说明文档

### 代码审计
- [ ] **AC-11**: Given 整理后的项目, When 检查代码组织, Then 根目录无散落的业务组件（应归入子目录）
- [ ] **AC-12**: Given `README.md`, When 查看, Then 内容与项目实际结构一致（无过时信息）

## 优先级: P0

## 任务拆解

| # | 任务 | 负责角色 | 预估 | 状态 |
|---|------|----------|------|------|
| 1 | 安装依赖 + 验证测试环境 | Alpha | 0.5h | ⬜ |
| 2 | 深度审计代码架构：模块边界、依赖关系、坏味道 | Alpha | 1h | ⬜ |
| 3 | 创建 `AGENTS.md`：目录结构树 + 文件职责 + 依赖关系图 | Alpha | 1h | ⬜ |
| 4 | 建立 `.agent/rules/` + `.agent/workflows/`（引用全局规则） | Alpha | 0.5h | ⬜ |
| 5 | 建立 Diátaxis 文档体系 (`docs/`) | Beta | 1h | ⬜ |
| 6 | 根目录文件整理：散落组件归位、README 同步 | Beta | 0.5h | ⬜ |
| 7 | 补充 `team/` 协作目录结构 | Beta | 0.5h | ⬜ |
| 8 | 代码审查 | Reviewer | 0.5h | ⬜ |
| 9 | 文档沉淀 | Documenter | 0.5h | ⬜ |
| 10 | 验收 + 归档 | PM | 0.5h | ⬜ |
