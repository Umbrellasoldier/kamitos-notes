import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getPostsByTag, getTags } from "@/lib/posts";

type PageProps = { params: Promise<{ tag: string }> };

export function generateStaticParams() {
  return getTags().map(({ name }) => ({ tag: name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  return {
    title: `#${tag}`,
    description: `浏览 Kamito's Notes 中标记为“${tag}”的文章。`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  if (!getTags().some(({ name }) => name === tag)) notFound();
  const posts = getPostsByTag(tag);

  return (
    <main className="page-shell shell">
      <header className="page-intro compact-intro">
        <p className="eyebrow">TAG</p>
        <h1>#{tag}</h1>
        <p>共 {posts.length} 篇文章。</p>
      </header>
      <div className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
