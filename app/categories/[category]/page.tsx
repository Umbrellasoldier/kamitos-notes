import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getCategories, getPostsByCategory } from "@/lib/posts";

type PageProps = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return getCategories().map(({ name }) => ({ category: name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  return {
    title: `${category}栏目`,
    description: `浏览 Kamito's Notes 中归入“${category}”栏目的文章。`,
    alternates: { canonical: `/categories/${encodeURIComponent(category)}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: rawCategory } = await params;
  const category = decodeURIComponent(rawCategory);
  if (!getCategories().some(({ name }) => name === category)) notFound();
  const posts = getPostsByCategory(category);

  return (
    <main className="page-shell shell">
      <header className="page-intro compact-intro">
        <p className="eyebrow">CATEGORY</p>
        <h1>{category}</h1>
        <p>{posts.length ? `共 ${posts.length} 篇文章。` : "这个栏目正在等待第一篇记录。"}</p>
      </header>
      {posts.length ? (
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="empty-state"><p>内容正在整理中。</p></div>
      )}
    </main>
  );
}
