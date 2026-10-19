# UI 规范

<!-- baseline:start -->
<!-- 以下由人类在项目启动时定义，PM Agent 只读。与 PM 沉淀条目冲突时以此为准。 -->
- **视觉风格为干净卡通** — 厚描边、圆角、渐变、高光、层叠阴影；避免写实恐怖、血腥与廉价霓虹
- **使用 Tailwind CSS + `globals.css` 设计令牌** — 不引入 UI 组件库；颜色、圆角、阴影用 CSS 变量
- **图标统一使用 FontAwesome 6 Free** — 装饰性图标必须 `aria-hidden`
- **场景封面使用 Unsplash 照片并做双色调处理** — 事件卡插画只用渐变 + 图标 + CSS 形状，不用照片
- **所有 Unsplash 图片必须有渐变 + 图标兜底** — 禁止出现破图
- **可点击元素最小 44x44px，聚焦有 3px 可见环** — 正文对比度达到 WCAG AA
- **必须尊重 `prefers-reduced-motion`** — 并提供“减少动效”设置
- **音效默认关闭** — 音效只使用 Web Audio API 合成，不引入音频文件
<!-- baseline:end -->

<!-- 以下由 PM Agent 从实际开发中沉淀 -->
