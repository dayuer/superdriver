# 快速开始

## 环境要求

- Node.js 18+
- Xcode 15+ (iOS 开发)
- Expo CLI (通过 npx 自动使用)

## 首次运行

```bash
# 1. 克隆仓库
git clone <repo-url> superdriver
cd superdriver

# 2. 安装依赖
npm install

# 3. 启动 iOS 模拟器
npm run ios

# 4. 或直接启动 Expo 开发服务器
npm start
```

## 运行测试

```bash
# 运行全部测试 (11 套件 / 121 用例)
npm test

# 带覆盖率
npm run test:coverage

# 监听模式
npm run test:watch
```

## 项目结构速览

```
superdriver/
├── App.tsx          # 应用入口
├── components/      # UI 组件
├── hooks/           # 自定义 Hooks
├── services/        # API + 本地存储
├── lib/             # 安全基础设施
└── packages/        # 内嵌 SDK
```

> 详细结构参见 [AGENTS.md](../../AGENTS.md)

## 后端依赖

SuperDriver 依赖 Survival OS 后端服务：

```bash
# 启动后端 (独立仓库)
cd ../survival
npm run dev
```

API 地址：
- iOS 模拟器: `http://localhost:3000/api`
- Android 模拟器: `http://10.0.2.2:3000/api`
