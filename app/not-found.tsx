import Link from "@/components/site-link";

export default function NotFound() {
  return (
    <main className="not-found shell">
      <p className="eyebrow">404 / LOST NOTE</p>
      <h1>这一页还没有被写下。</h1>
      <p>链接可能已经改变，也可能只是一次偶然的迷路。</p>
      <Link className="button button-primary" href="/">
        回到首页
      </Link>
    </main>
  );
}
