export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink/10 bg-paper px-4 py-6 text-center text-xs leading-relaxed text-ink-soft sm:text-sm">
      <p>
        本作的生存知识仅供科普与娱乐参考；真实灾害中请以当地官方应急指引为准。
      </p>
      <p className="mt-1">
        封面照片来自{" "}
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-h-11 items-center px-1 align-middle font-semibold underline decoration-2 underline-offset-2 hover:text-ink"
        >
          Unsplash
        </a>
        ，图标来自{" "}
        <a
          href="https://fontawesome.com"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-h-11 items-center px-1 align-middle font-semibold underline decoration-2 underline-offset-2 hover:text-ink"
        >
          Font Awesome Free
        </a>
        。
      </p>
    </footer>
  );
}
