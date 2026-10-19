import type { Metadata } from "next";
import { Suspense } from "react";

import { CodexScreen } from "@/components/codex/CodexScreen";

export const metadata: Metadata = {
  title: "生存手册 · 末日生存指南：别慌",
  description: "查阅 42 张真实生存知识卡，看看你还差多少。",
};

/** 预渲染用占位：与正式内容的标题结构一致，避免筛选参数就绪前布局跳动。 */
function CodexFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="rounded-card border-2 border-ink bg-surface p-5 shadow-card sm:p-7">
        <p className="font-numeric text-xs font-bold tracking-[0.22em] text-ink-soft">
          CODEX / 生存手册
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
          末日求生图鉴
        </h1>
        <p className="mt-2 text-sm text-ink-soft">正在翻开手册……</p>
      </section>
    </div>
  );
}

export default function CodexPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={<CodexFallback />}>
        <CodexScreen />
      </Suspense>
    </main>
  );
}
