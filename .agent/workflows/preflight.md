---
description: 每次对话开始时的预检流程 — 确保 rules 和 docs 被优先读取
---

# Preflight Checklist (对话预检)

每次新对话开始前，按以下顺序执行：

// turbo-all

1. **读取项目规则文件**: 扫描 `.agent/rules/` 目录下的所有 `.md` 文件，逐个读取并遵守其中的指令。

```bash
find .agent/rules -name "*.md" -type f
```

2. **读取项目文档 (Single Source of Truth)**: 根据用户问题，优先检索 `docs/` 下的相关文档。

```bash
# 按需检索，优先级：docs/ > codebase > external
ls docs/**/*.md
```

3. **检查已有 workflows**: 看当前任务是否有匹配的 workflow。

```bash
ls .agent/workflows/
```

4. 完成以上步骤后，再开始回答用户的问题。
