import type { Metadata } from "next";
import Link from "@/components/site-link";
import { notFound } from "next/navigation";
import { CodeCopyButtons } from "@/components/code-copy";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "文章不存在" };

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: `${post.publishedAt}T00:00:00.000Z`,
      modifiedTime: post.updatedAt ? `${post.updatedAt}T00:00:00.000Z` : undefined,
      tags: post.tags,
      images: [{ url: "/og.png", alt: `${post.title}｜Kamito's Notes` }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og.png"],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const { Content } = post;

  return (
    <main className="article-shell shell">
      <article>
        <header className="article-header">
          <Link className="article-category" href={`/categories/${encodeURIComponent(post.category)}`}>
            {post.category}
          </Link>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.description}</p>
          <div className="article-byline">
            <img src="/avatar.png" alt="" width="64" height="50" />
            <div>
              <span>Kamito</span>
              <p>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                {post.updatedAt && post.updatedAt !== post.publishedAt ? (
                  <>
                    {" · 更新于 "}
                    <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <div className="tag-row article-tags" aria-label="文章标签">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                #{tag}
              </Link>
            ))}
          </div>
        </header>
        <div className="article-rule" aria-hidden="true" />
        <div className="prose">
          <Content />
        </div>
        <CodeCopyButtons />
        <footer className="article-footer">
          <p>感谢读到这里。</p>
          <Link href="/posts">← 返回全部文章</Link>
        </footer>
      </article>
    </main>
  );
}
