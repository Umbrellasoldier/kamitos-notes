import type { Metadata } from "next";
import Link from "@/components/site-link";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 Kamito 和这个记录技术、生活与思考的个人博客。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="about-shell shell">
      <section className="about-portrait" aria-label="Kamito 的头像">
        <span className="portrait-number">ABOUT / 01</span>
        <img src="/avatar.png" alt="Kamito 的粉色动漫人物头像" width="858" height="668" />
      </section>
      <article className="about-copy">
        <p className="eyebrow">NICE TO MEET YOU</p>
        <h1>你好，我是 Kamito。</h1>
        <p className="about-lead">
          我喜欢把复杂的问题一点点拆开，也喜欢保存日常里那些容易被忽略的细节。
          Kamito&apos;s Notes 是这两种兴趣相遇的地方。
        </p>
        <div className="about-prose">
          <p>
            这里会出现技术学习、工具实践，也会有生活片段和不那么急着得到结论的随笔。
            我不想把它做成一个追赶更新频率的内容机器，而更希望它是一份长期、诚实、可以回看的个人记录。
          </p>
          <p>
            写作对我来说也是一种调试：把含糊的直觉变成句子，把跳过的步骤补回来，
            再看看原来的答案是否真的站得住。
          </p>
        </div>
        <blockquote>保持好奇，持续记录，也允许自己的答案慢慢变化。</blockquote>
        <Link className="button button-primary" href="/posts">
          从第一篇开始阅读
        </Link>
      </article>
    </main>
  );
}
