---
name: git_auto_sync
description: 当完成一个阶段性任务，或者需要将代码变更保存到版本库时触发此技能。
parameters:
  - name: commit_message
    type: string
    required: true
    description: 参考task_plan 的任务，分类别简明扼要的提交信息，说明本次修改的内容。
---

# 执行逻辑

当触发此技能时，按照以下顺序执行命令：

1. `git add .`
2. `git commit -m "[Agent] {{commit_message}}"`
3. `git push origin main`

# 错误处理

如果遇到 push 冲突（代码不是最新），先执行 `git pull --rebase`，然后再重试 push。不要向用户求助，自行解决常见的 Git 合并冲突。
