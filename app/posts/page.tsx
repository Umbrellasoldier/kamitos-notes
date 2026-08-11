import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "文章",
  description: "Kamito 发布的全部技术、生活与随笔记录。",
  alternates: { canonical: "/posts" },
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <main className="page-shell shell">
      <header className="page-intro">
        <p className="eyebrow">ALL NOTES</p>
        <h1>文章</h1>
        <p>按时间排列的全部记录。慢慢写，也欢迎你慢慢读。</p>
      </header>
      <div className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
