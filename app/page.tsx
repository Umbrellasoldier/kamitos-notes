import Link from "@/components/site-link";
import { PostCard } from "@/components/post-card";
import { getAllPosts, getCategories } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();
  const categories = getCategories();
  const featured = posts.length > 1 ? posts.find((post) => post.featured) : null;
  const latest = featured
    ? posts.filter((post) => post.slug !== featured.slug).slice(0, 4)
    : posts.slice(0, 4);

  return (
    <main>
      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">KAMITO&apos;S NOTES · 个人博客</p>
          <h1 id="hero-title">记录技术、生活与思考</h1>
          <p className="hero-lead">
            你好，我是 Kamito。这里收集正在探索的问题、值得留下的日常，
            以及那些还没有标准答案的想法。
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/posts">
              阅读文章
            </Link>
            <Link className="button button-quiet" href="/about">
              关于我
            </Link>
          </div>
        </div>
        <div className="avatar-stage" aria-label="Kamito 的头像">
          <span className="avatar-orbit" aria-hidden="true" />
          <img
            className="hero-avatar"
            src="/avatar.png"
            alt="Kamito 的粉色动漫人物头像"
            width="858"
            height="668"
          />
          <span className="avatar-caption">保持好奇，持续记录。</span>
        </div>
      </section>

      <section className="category-strip shell" aria-labelledby="category-title">
        <div>
          <p className="section-kicker">从这里开始</p>
          <h2 id="category-title">在不同的切面里认识我</h2>
        </div>
        <div className="category-links">
          {categories.map(({ name, count }) => (
            <Link key={name} href={`/categories/${encodeURIComponent(name)}`}>
              <span>{name}</span>
              <small>{count.toString().padStart(2, "0")}</small>
            </Link>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="section shell" aria-labelledby="featured-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Editor&apos;s pick</p>
              <h2 id="featured-title">精选文章</h2>
            </div>
            <Link className="text-link" href="/posts">
              查看全部
            </Link>
          </div>
          <PostCard post={featured} featured />
        </section>
      ) : null}

      <section className="section shell" aria-labelledby="latest-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Latest notes</p>
            <h2 id="latest-title">最新文章</h2>
          </div>
          {posts.length > latest.length ? (
            <Link className="text-link" href="/posts">
              查看全部
            </Link>
          ) : null}
        </div>
        {latest.length ? (
          <div className="post-grid">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>第一篇记录正在路上。</p>
          </div>
        )}
      </section>

      <section className="closing-note shell">
        <p className="section-kicker">A quiet corner</p>
        <p>
          不追逐更新频率，只认真保存值得反复阅读的东西。
          <Link href="/about">了解这个博客 →</Link>
        </p>
      </section>
    </main>
  );
}
