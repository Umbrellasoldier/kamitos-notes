import Link from "@/components/site-link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner shell">
        <div>
          <p className="footer-title">Kamito&apos;s Notes</p>
          <p>记录技术、生活与思考。</p>
        </div>
        <div className="footer-links">
          <Link href="/rss.xml">RSS</Link>
          <Link href="/about">关于</Link>
          <a href="#main-content">回到顶部 ↑</a>
        </div>
        <p className="footer-copy">© {new Date().getUTCFullYear()} Kamito</p>
      </div>
    </footer>
  );
}
