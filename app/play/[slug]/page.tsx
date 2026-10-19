import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GameScreen } from "@/components/game/GameScreen";
import { scenarios } from "@/data/scenarios";
import { getScenarioContent } from "@/lib/scenarios";

interface PlayPageProps {
  params: Promise<{ slug: string }>;
}

/** 七个场景的游戏页全部在构建时预渲染。 */
export function generateStaticParams(): Array<{ slug: string }> {
  return scenarios.map((scenario) => ({ slug: scenario.id }));
}

export async function generateMetadata({
  params,
}: PlayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getScenarioContent(slug);

  if (!content) {
    return { title: "对局不存在 · 末日生存指南：别慌" };
  }

  return {
    title: `第 1 天 · ${content.scenario.title} · 末日生存指南：别慌`,
    description: content.scenario.tagline,
  };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { slug } = await params;
  const content = getScenarioContent(slug);

  if (!content) notFound();

  return <GameScreen content={content} />;
}
