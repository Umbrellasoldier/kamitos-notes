import Link from "@/components/site-link";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/lib/site";

export function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={featured ? "post-card post-card-featured" : "post-card"}>
      <div className="post-meta">
        <Link href={`/categories/${encodeURIComponent(post.category)}`}>
          {post.category}
        </Link>
        <span aria-hidden="true">·</span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      </div>
      <h3>
        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.description}</p>
      <div className="card-footer">
        <div className="tag-row" aria-label="文章标签">
          {post.tags.map((tag) => (
            <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
              #{tag}
            </Link>
          ))}
        </div>
        <Link className="read-more" href={`/posts/${post.slug}`} aria-label={`阅读《${post.title}》`}>
          阅读 <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
