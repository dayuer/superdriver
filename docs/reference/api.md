# API 参考

> 完整版参见根目录 [`API_REFERENCE.md`](../../API_REFERENCE.md)

## 服务端基础 URL

| 环境 | 地址 |
|------|------|
| iOS 模拟器 | `http://localhost:3000/api` |
| Android 模拟器 | `http://10.0.2.2:3000/api` |
| 生产环境 | `https://your-api-domain.com/api` |

## 认证

所有请求必须包含 `x-session-id` 头：

```http
x-session-id: <unique-device-id>
```

## API 端点一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/agents` | 获取 AI 专家列表 |
| GET | `/profile` | 获取用户档案 |
| POST | `/profile` | 更新档案 / 签署协议 |
| GET | `/chat/list` | 获取会话列表 |
| GET | `/chat/history` | 获取聊天记录 |
| POST | `/chat/vent` | 发送消息 (支持群聊路由) |
| GET | `/enterprises` | 获取企业列表 |
| POST | `/enterprises` | 企业入驻/绑定 |
| POST | `/service/events` | 创建服务事件 |
| GET | `/service/events` | 获取服务事件列表 |

## 客户端 API 实例

所有 API 调用通过 `services/api.ts` 的统一实例发送：

```typescript
import api from '../services/api';

// GET 请求
const { data } = await api.get('/agents');

// POST 请求
const { data } = await api.post('/profile', {
  action: 'update',
  data: { nickname: '新名字' }
});
```

自动处理：
- Token 注入 (`x-session-id`)
- HMAC-SHA256 签名
- 401 自动刷新 Token + 重放请求
- 错误包装为 `ApiError`
