# 数据存储现状

> 首发使用浏览器 localStorage，统一经 `lib/storage.ts` 的 `StorageAdapter` 访问。

## localStorage 键

| key | 内容 | 类型 | 缺失/损坏时 |
| --- | --- | --- | --- |
| `dpsg:v1:progress` | 跨场景进度 | `Progress` | `createDefaultProgress()` |
| `dpsg:v1:settings` | 玩家设置 | `Settings` | `createDefaultSettings()`（音效关、动效开） |
| `dpsg:v1:active-run` | 进行中的一局 | `RunState` | `null` |
| `dpsg:v1:last-result` | 最近一次结算 | `LastResult` | `null` |

## 存储格式

- 信封：`{ "version": 1, "data": <payload> }`；`version` 不为 1 时视为无效。
- JSON 解析失败、结构不符或字段缺失时静默回退默认值，不抛异常。
- `StorageAdapter.resetAll()` 只删除 `dpsg:v1:` 前缀的 key。

## 适配器接口

- `lib/storage.ts` 导出 `StorageAdapter`、`createStorageAdapter(backend?)`、默认单例 `storageAdapter`。
- 读写方法：`getProgress` / `saveProgress`、`getSettings` / `saveSettings`、`getActiveRun` / `saveActiveRun` / `clearActiveRun`、`getLastResult` / `saveLastResult` / `clearLastResult`、`resetAll`。
- 自定义 `StorageBackend`（`getItem` / `setItem` / `removeItem` / `key` / `length`）即可替换存储介质。
