"use client";

import { faCompass } from "@fortawesome/free-regular-svg-icons";
import {
  faBookOpen,
  faSkull,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useSyncExternalStore } from "react";

import { storageAdapter } from "@/lib/storage";

const soundListeners = new Set<() => void>();

/** 设置存放在 localStorage，用外部存储订阅让开关在 SSR 下也能安全渲染。 */
function subscribeSound(listener: () => void): () => void {
  soundListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    soundListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSoundSnapshot(): boolean {
  return storageAdapter.getSettings().soundEnabled;
}

function getServerSoundSnapshot(): boolean {
  return false;
}

function isScenariosRoute(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/scenario") ||
    pathname.startsWith("/play")
  );
}

function NavLinks({
  scenariosActive,
  codexActive,
}: {
  scenariosActive: boolean;
  codexActive: boolean;
}) {
  return (
    <nav aria-label="主导航" className="flex items-center gap-1 sm:gap-2">
      <Link
        href="/"
        aria-current={scenariosActive ? "page" : undefined}
        className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-chip border-2 px-3 font-semibold transition-colors duration-[var(--duration-fast)] sm:px-4 ${
          scenariosActive
            ? "border-ink bg-sun text-ink shadow-button"
            : "border-transparent text-ink-soft hover:border-ink/20 hover:bg-white/70"
        }`}
      >
        <FontAwesomeIcon icon={faCompass} aria-hidden />
        <span className="sm:hidden">场景</span>
        <span className="hidden sm:inline">场景大厅</span>
      </Link>

      <Link
        href="/codex"
        aria-current={codexActive ? "page" : undefined}
        className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-chip border-2 px-3 font-semibold transition-colors duration-[var(--duration-fast)] sm:px-4 ${
          codexActive
            ? "border-ink bg-sun text-ink shadow-button"
            : "border-transparent text-ink-soft hover:border-ink/20 hover:bg-white/70"
        }`}
      >
        <FontAwesomeIcon icon={faBookOpen} aria-hidden />
        <span className="sm:hidden">手册</span>
        <span className="hidden sm:inline">生存手册</span>
      </Link>
    </nav>
  );
}

/** usePathname 必须在 Suspense 内读取，否则会阻塞 cacheComponents 的静态预渲染。 */
function HeaderNav() {
  const pathname = usePathname() ?? "/";
  return (
    <NavLinks
      scenariosActive={isScenariosRoute(pathname)}
      codexActive={pathname.startsWith("/codex")}
    />
  );
}

/** 预渲染用占位：与 HeaderNav 同结构但不高亮，避免布局跳动。 */
function HeaderNavFallback() {
  return <NavLinks scenariosActive={false} codexActive={false} />;
}

export function SiteHeader() {
  const soundEnabled = useSyncExternalStore(
    subscribeSound,
    getSoundSnapshot,
    getServerSoundSnapshot,
  );

  function toggleSound() {
    const settings = storageAdapter.getSettings();
    storageAdapter.saveSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
    for (const listener of soundListeners) listener();
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label="末日生存指南：别慌，返回场景大厅"
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-button px-1"
        >
          <span
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-chip border-2 border-ink text-paper shadow-button"
            style={{ background: "var(--gradient-meteor)" }}
          >
            <FontAwesomeIcon icon={faSkull} className="h-5 w-5" />
          </span>
          <span className="hidden whitespace-nowrap font-display text-xl text-ink sm:inline">
            末日生存指南：别慌
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <Suspense fallback={<HeaderNavFallback />}>
            <HeaderNav />
          </Suspense>

          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "关闭音效" : "开启音效"}
            title={soundEnabled ? "关闭音效" : "开启音效"}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-chip border-2 border-ink bg-surface text-ink shadow-button transition-colors duration-[var(--duration-fast)] hover:bg-paper active:shadow-none"
          >
            <FontAwesomeIcon
              icon={soundEnabled ? faVolumeHigh : faVolumeXmark}
              aria-hidden
            />
          </button>
        </div>
      </div>
    </header>
  );
}
