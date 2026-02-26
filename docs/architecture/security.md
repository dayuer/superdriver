# 安全架构

## 安全层次

```
┌──────────────────────────────────────┐
│          传输层 (HTTPS)               │
├──────────────────────────────────────┤
│    认证层 (Token + HMAC 签名)         │
├──────────────────────────────────────┤
│      存储层 (Keychain + SQLCipher)    │
└──────────────────────────────────────┘
```

## Token 管理 (`lib/security.ts`)

- **存储**: `expo-secure-store` → iOS Keychain / Android Keystore
- **刷新**: API 拦截器自动处理 401 → 重新获取 Token → 重放请求
- **签名**: 每个 API 请求附带 HMAC-SHA256 签名

## 本地数据加密

- **数据库**: SQLCipher AES-256 全库加密
- **密钥来源**: 从 Keychain/Keystore 获取，不存储在代码中
- **迁移**: `services/db/core.ts` 管理 schema 版本迁移

## 安全红线

1. ❌ **零硬编码**: 禁止在代码中硬编码 API Key / Secret
2. ❌ **零明文日志**: 禁止 `console.log` 输出 Token / 密码
3. ✅ 所有凭证通过 `lib/security.ts` 管理
4. ✅ 所有 API 请求通过 `services/api.ts` 认证拦截器
