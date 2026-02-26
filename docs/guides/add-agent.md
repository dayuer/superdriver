# 添加新 Agent 指南

## 概述

SuperDriver 的 AI 专家团由 6 位专家组成，每位专家有独立的 ID、人设和专业领域。本指南说明如何添加一个新的 AI 专家。

## 步骤

### 1. 定义 Agent 配置

在 `config/constants.ts` 的 `DEFAULT_AGENTS` 对象中添加新条目：

```typescript
export const DEFAULT_AGENTS: Record<string, Agent> = {
  // ... 现有 Agent
  
  new_expert: {
    id: 'new_expert',
    name: '新专家名',
    title: '职称',
    avatar: '/avatars/new_expert.png',
    description: '专家简介，描述其专业领域和能力。',
    systemPrompt: '系统人设提示词...',
    knowledgePrefix: '知识前缀...',
    style: { color: '#FF6600' },
    keywords: ['关键词1', '关键词2'],
    isPaid: false,
    companyName: 'SuperDriver',
    priority: 7,  // 数字越小优先级越高
    category: 'native',
    welcomeMessage: '你好，我是新专家，有什么可以帮你的？',
  },
};
```

### 2. 添加头像资源

将专家头像放入 `assets/avatars/` 目录：
- 格式: PNG
- 建议尺寸: 200x200px
- 文件名与 `id` 对应

### 3. 后端注册

在 Survival OS 后端的 Agent 配置中同步添加：
- Agent 路由规则（群聊关键词匹配）
- System Prompt（详细人设）
- Knowledge Base（专业知识库）

### 4. 验证

```bash
# 运行测试确认配置正确
npm test

# 启动应用验证 Agent 出现在群聊成员列表中
npm run ios
```

## Agent 数据结构

```typescript
interface Agent {
  id: string;           // 唯一标识，用于 API 路由
  name: string;         // 显示名称（中文）
  title: string;        // 职称
  avatar: string;       // 头像路径
  description: string;  // 简介
  systemPrompt?: string; // AI 人设提示词
  style: { color: string }; // 主题色
  keywords: string[];   // 群聊路由关键词
  isPaid: boolean;      // 是否付费专家
  category: string;     // 分类: 'native' | 'premium'
  priority: number;     // 排序优先级
}
```
