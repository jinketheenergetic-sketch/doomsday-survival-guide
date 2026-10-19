import { faCompass, faMeteor } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-x-hidden px-4 py-16 sm:px-6">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 22% 20%, rgba(255, 107, 87, 0.16), transparent 45%), radial-gradient(circle at 78% 12%, rgba(25, 185, 167, 0.14), transparent 42%), radial-gradient(circle at 62% 88%, rgba(255, 201, 77, 0.2), transparent 46%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "var(--noise)" }}
      />

      <div className="relative w-full max-w-xl rounded-card border-2 border-ink bg-surface p-8 text-center shadow-card sm:p-12">
        <div
          aria-hidden
          className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-2 border-ink text-paper shadow-button"
          style={{ background: "var(--gradient-meteor)" }}
        >
          <FontAwesomeIcon icon={faMeteor} className="h-14 w-14" />
        </div>

        <p className="mt-6 font-numeric text-sm font-bold tracking-[0.22em] text-ink-soft">
          ERROR 404 · DAY ?? / 7
        </p>

        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          这个末日不存在，但别慌。
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-base text-ink-soft">
          你翻到的那一页可能被灾变卷走了。回到场景大厅，挑一个真实存在的末日重新开始。
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-button border-2 border-ink bg-sun px-6 font-semibold text-ink shadow-button transition-transform duration-[var(--duration-fast)] ease-[var(--ease-cartoon)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_var(--ink)]"
        >
          <FontAwesomeIcon icon={faCompass} aria-hidden />
          回到大厅
        </Link>
      </div>
    </main>
  );
}
