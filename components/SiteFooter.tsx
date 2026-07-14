export default function SiteFooter() {
  return (
    <footer className="border-t border-dashed border-chalk/15 px-6 py-8 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        Made by{" "}
        <a
          href="https://oviematthew.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-chalk transition hover:text-amber"
        >
          Ovie
        </a>
      </p>
    </footer>
  );
}
