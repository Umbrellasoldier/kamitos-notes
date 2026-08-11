import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/posts";

export const metadata: Metadata = {
  title: "栏目",
  description: "按技术、生活和随笔栏目浏览 Kamito's Notes。",
  alternates: { canonical: "/categories" },
};

const descriptions: Record<string, string> = {
  技术: "工具、方法，以及把复杂问题逐步想清楚的过程。",
  生活: "日常里的兴趣、片段和偶然被注意到的细节。",
  随笔: "没有标准答案，但值得认真展开的想法。",
};

export default function CategoriesPage() {
  return (
    <main className="page-shell shell">
      <header className="page-intro">
        <p className="eyebrow">CATEGORIES</p>
        <h1>栏目</h1>
        <p>不同主题，共同组成这个博客的观察视角。</p>
      </header>
      <div className="taxonomy-grid">
        {getCategories().map(({ name, count }, index) => (
          <Link key={name} className="taxonomy-card" href={`/categories/${encodeURIComponent(name)}`}>
            <span className="taxonomy-index">0{index + 1}</span>
            <h2>{name}</h2>
            <p>{descriptions[name] ?? "围绕这个主题持续更新的记录。"}</p>
            <small>{count} 篇文章</small>
          </Link>
        ))}
      </div>
    </main>
  );
}
