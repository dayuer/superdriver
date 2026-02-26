## 迭代复盘 — SuperDriver 开发能力建设

### 做得好的

- 测试环境修复高效：从发现问题（expo-device ESM + @testing-library 缺失）到修复并全绿仅用 3 轮迭代
- AGENTS.md 信息密度高：199 行涵盖了目录结构、文件职责、模块依赖、散落组件审计和已知问题
- Diátaxis 文档体系一次到位：8 个文档覆盖四象限
- 用户反馈及时纳入：.agent/ → 全局 ~/.gemini/ 方案立即调整

### 需要改进的

- 初始阶段对 .agent/ 的处理方向错误（用户明确使用全局规则），应提前确认
- @testing-library/react-hooks mock 写了 3 版才正确，对 React Hook 在测试中的渲染机制理解不够深入
- 散落组件归位未执行（风险评估后推迟），下次需专门 Sprint

### 行动项 (沉淀到 lessons.md)

1. **规则**: SuperDriver 项目不使用项目级 .agent/，所有 Agent 规则和工作流在全局 ~/.gemini/ 管理
2. **模式**: React Hook 测试必须在真实渲染上下文中（react-test-renderer.act + React.createElement），不能直接调用
3. **教训**: Expo 原生模块（expo-device 等）在 Jest 中应优先 mock 而非通过 transformIgnorePatterns 解决
