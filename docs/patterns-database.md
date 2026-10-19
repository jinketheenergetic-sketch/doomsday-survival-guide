# 数据与存储规范

<!-- baseline:start -->
<!-- 以下由人类在项目启动时定义，PM Agent 只读。与 PM 沉淀条目冲突时以此为准。 -->
- **首发只使用 localStorage，不接入 SQLite** — 数据访问统一封装在 `lib/storage.ts`
- **所有 key 以 `dpsg:v1:` 开头** — 包括 `progress`、`settings`、`active-run`、`last-result`
- **所有存储数据带 `version: 1`** — 解析失败或字段缺失时回退默认值，不得抛异常
- **重置进度只清除 `dpsg:v1:*` 前缀** — 不影响其他站点数据
- **`StorageAdapter` 方法签名需兼容未来 SQLite 实现** — 页面不得依赖 localStorage 特有 API
<!-- baseline:end -->

<!-- 以下由 PM Agent 从实际开发中沉淀 -->
