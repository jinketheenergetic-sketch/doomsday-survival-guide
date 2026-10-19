import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResultScreen } from "@/components/game/ResultScreen";
import { scenarios } from "@/data/scenarios";
import { createSkeletonEvents } from "@/data/scenarios/skeleton";
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
 * 结算页。
 *
 * 服务端只负责场景校验与内容注入；本局结果从本地存储读取，
 * 由 `ResultScreen` 在客户端完成进度写回、结局展示与生存复盘。
 */
export default async function ResultPage({ params }: ResultPageProps) {
  const { slug } = await params;
  const content = getScenarioContent(slug);

  if (!content) notFound();

  // 与游戏页保持一致：真实事件未接入时用占位牌组复盘本局决策。
  const events =
    content.events.length > 0
      ? content.events
      : createSkeletonEvents(content.scenario);

  return (
    <ResultScreen
      scenario={content.scenario}
      endings={content.endings}
      knowledge={content.knowledge}
      events={events}
    />
  );
}
