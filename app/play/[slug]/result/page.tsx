import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { scenarios } from "@/data/scenarios";
import { getScenarioContent } from "@/lib/scenarios";

interface ResultPageProps {
  params: Promise<{ slug: string }>;
}

/** 七个场景的结算页全部在构建时预渲染。 */
export function generateStaticParams(): Array<{ slug: string }> {
  return scenarios.map((scenario) => ({ slug: scenario.id }));
}

export async function generateMetadata({
  params,
}: ResultPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getScenarioContent(slug);

  if (!content) {
    return { title: "结算不存在 · 末日生存指南：别慌" };
  }

  return {
    title: `本局结算 · ${content.scenario.title} · 末日生存指南：别慌`,
    description: content.scenario.tagline,
  };
}

/**
 * 结算页占位。
 *
 * 游戏结束时 `GameScreen` 已把 `LastResult` 写入存储并导航到这里；
 * 完整的结局、评分与复盘展示由 US-012 落地。
 */
export default async function ResultPage({ params }: ResultPageProps) {
  const { slug } = await params;
  const content = getScenarioContent(slug);

  if (!content) notFound();

  const { scenario } = content;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-semibold tracking-[0.18em] text-ink-soft">
          {scenario.title}
        </p>
        <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
          这一局结束了
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          本局结果已经记录。完整的结局、评分与生存复盘正在赶来。
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/scenario/${scenario.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-button border-2 border-ink bg-surface px-4 font-semibold text-ink shadow-button"
          >
            回到场景简报
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-button border-2 border-ink bg-sun px-4 font-semibold text-ink shadow-button"
          >
            返回大厅
          </Link>
        </div>
      </div>
    </main>
  );
}
