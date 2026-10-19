import type { Metadata } from "next";
import { Baloo_2, Noto_Sans_SC, ZCOOL_KuaiLe } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const zcool = ZCOOL_KuaiLe({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-zcool",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "末日生存指南：别慌",
  description:
    "一款纯前端决策卡牌 Roguelite 末日生存小游戏：7 个末日场景、每局 7 天、21 个结局。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${zcool.variable} ${notoSansSC.variable} ${baloo2.variable}`}
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
