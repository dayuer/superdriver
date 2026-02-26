# Alpha 实现笔记 — SuperDriver 开发能力建设

## 技术决策

| 决策 | 选项 A | 选项 B | 选择 | 理由 |
|------|--------|--------|------|------|
| 测试 Mock 策略 | 安装 @testing-library/react-hooks | 自建最小 Mock | B | 该库已弃用，自建 mock 基于 react-test-renderer 更轻量 |
| TS 诊断策略 | 测试文件也严格检查 | `diagnostics: false` | B | 测试文件的灵活性 > 类型安全，生产代码仍 strict |
| 散落组件处理 | 本次移动归位 | 仅审计标注 | B | 24 个组件移动风险高（App.tsx 直接引用），单独迭代更安全 |
| Agent 规则位置 | 项目 .agent/ | 全局 ~/.gemini/ | B | 用户明确要求使用全局规则 |

## 已完成

- [x] **Spike-1**: npm install 成功 + npm test 从 9/11 修复到 11/11 全通过
- [x] **Spike-2**: 散落组件依赖分析完成，24 个组件归位方案已标注在 AGENTS.md
- [x] Jest 配置修复: transformIgnorePatterns + expo-device mock + diagnostics:false
- [x] @testing-library/react-hooks 最小化 Mock (基于 react-test-renderer)
- [x] expo-device + expo-haptics 全局 Mock
- [x] AGENTS.md 创建 (完整目录树 + 文件职责 + 模块依赖 + 散落组件审计)
- [x] .gitignore 修正 (移除 .agent/* 忽略，添加 team/ 中间文件规则)
- [x] README.md 同步更新 (版本号修正 52→54, 目录结构同步)
- [x] Diátaxis 文档体系建立:
  - docs/README.md (索引页)
  - docs/getting-started/quickstart.md
  - docs/architecture/modules.md
  - docs/architecture/security.md
  - docs/guides/testing.md
- [x] team/ + team/archive/ 目录创建

## Beta TODO（交接给 Beta 的任务）

- [ ] 补充 `docs/guides/add-agent.md` — 如何新增 AI 专家的操作指南
- [ ] 补充 `docs/reference/api.md` — 将现有 API_REFERENCE.md 内容迁移到 Diátaxis reference 目录
- [ ] 补充 `docs/reference/types.md` — 全局类型定义文档
- [ ] 检查 `app.json` 配置与当前架构一致性（B6 边界条件）
- [ ] 在 `team/archive/` 放置一个 `.gitkeep` 确保空目录可提交

## 已知风险

- ⚠️ `react-test-renderer` 已被 React 官方弃用（有 deprecation warning），长期应迁移到 `@testing-library/react-native`
- ⚠️ 24 个散落组件未归位，下次迭代需专门处理
- ⚠️ `constants.ts` 根文件 `@deprecated` 但仍被 `config/constants.ts` re-export，需逐步消除引用

## 测试结果

```
Test Suites: 11 passed, 11 total
Tests:       121 passed, 121 total
Time:        3.685 s
```
