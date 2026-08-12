import type { Metadata } from "next";
import Link from "@/components/site-link";
import { getTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "标签",
  description: "通过标签发现 Kamito's Notes 中相互关联的文章。",
  alternates: { canonical: "/tags" },
};

export default function TagsPage() {
  const tags = getTags();
  return (
    <main className="page-shell shell">
      <header className="page-intro">
        <p className="eyebrow">INDEX</p>
        <h1>标签</h1>
        <p>沿着关键词，在不同文章之间穿行。</p>
      </header>
      <div className="tag-cloud">
        {tags.map(({ name, count }) => (
          <Link key={name} href={`/tags/${encodeURIComponent(name)}`}>
            <span>#{name}</span>
            <small>{count}</small>
          </Link>
        ))}
      </div>
    </main>
  );
}
