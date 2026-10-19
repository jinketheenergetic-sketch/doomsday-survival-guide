# 测试规范

<!-- baseline:start -->
<!-- 以下由人类在项目启动时定义，PM Agent 只读。与 PM 沉淀条目冲突时以此为准。 -->
- **使用 Vitest + jsdom + Testing Library** — 测试放在 `tests/`
- **引擎逻辑必须有单元测试** — 覆盖抽牌、结算、资源钳制、风险概率、评分、星级、结局分支
- **内容必须有校验测试** — 7 个场景各 9 个事件、3 个结局、6 张知识卡；每事件 3 个选项；所有 knowledgeId 可解析
- **每个 story 的最终验收包含 `Typecheck passes`** — 有可测试逻辑的 story 还须包含 `Tests pass`
- **所有 UI story 必须用 agent-browser 在浏览器中验证** — 未做视觉验证不算完成
<!-- baseline:end -->

<!-- 以下由 PM Agent 从实际开发中沉淀 -->
- **存储相关测试用 jsdom 自带的 `window.localStorage`** — 在 `beforeEach` 里 `window.localStorage.clear()` 隔离用例（来自 [US-003]）
- **测试里 `import Home from "@/app/page"` 可顺带验证 `@/*` 别名解析** — 别名配置变动时这类测试会先失败（来自 [US-034]）
