import { faCompass } from "@fortawesome/free-regular-svg-icons";
import { faBolt, faSkull } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{ background: "var(--gradient-ice)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: "var(--noise)" }}
      />

      <section className="relative w-full max-w-xl rounded-card border-2 border-ink bg-surface p-8 shadow-card sm:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-card opacity-40"
          style={{ background: "var(--highlight)" }}
        />

        <div className="relative flex flex-col items-center gap-6 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-chip border-2 border-ink text-paper shadow-button"
            style={{ background: "var(--gradient-meteor)" }}
          >
            <FontAwesomeIcon icon={faSkull} className="h-9 w-9" aria-hidden />
          </div>

          <p className="font-numeric text-sm font-semibold tracking-[0.25em] text-ink-soft">
            DAY 0 / 7
          </p>

          <h1 className="font-display text-4xl text-ink sm:text-5xl">
            末日生存指南：别慌
          </h1>

          <p className="max-w-md text-base text-ink-soft">
            城市变成了水族馆，门票是你的房贷。好在你还有七天、四维资源，
            以及一份不太靠谱但很好笑的生存指南。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex min-h-11 items-center gap-2 rounded-chip border-2 border-ink bg-coral px-5 font-numeric font-semibold text-paper shadow-button">
              <FontAwesomeIcon icon={faBolt} aria-hidden />
              即将开始
            </span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-chip border-2 border-ink bg-sun px-5 text-ink shadow-button">
              <FontAwesomeIcon icon={faCompass} aria-hidden />
              探索中
            </span>
          </div>
        </div>
      </section>

      <p className="relative mt-8 font-numeric text-sm text-ink-soft">
        7 个末日场景 · 21 个结局 · 42 张生存知识卡
      </p>
    </main>
  );
}
