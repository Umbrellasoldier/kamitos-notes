import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

function render(pathname = "/") {
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("首页呈现正式品牌、精选旧文且不会重复", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Kamito(?:'|&#x27;)s Notes<\/title>/i);
  assert.match(html, /记录技术、生活与思考/);
  assert.match(html, /src="\/avatar\.png"/);
  assert.match(html, /欢迎来到 Kamito/);
  assert.match(html, /算法竞赛进阶指南：基本算法与数据结构/);
  assert.match(html, /target="_top"/);
  assert.doesNotMatch(html, /\/_next\/static\/chunks\/link-[^"]+\.js/);
  assert.equal(
    (html.match(/<article class="post-card post-card-featured"/g) ?? []).length,
    1,
  );
  assert.equal(
    (html.match(/href="\/posts\/algorithm-competition-guide"/g) ?? []).length,
    2,
  );
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|Building your site/);
});

test("主题初始化脚本支持系统偏好和持久化", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /kamito-theme/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.match(html, /当前为自动主题/);
});

test("主要页面和聚合页均可渲染", async () => {
  const paths = [
    "/posts",
    "/posts/welcome",
    "/posts/algorithm-competition-guide",
    "/posts/string-algorithms",
    "/posts/greedy-exchange-argument",
    "/about",
    "/categories",
    "/categories/%E6%8A%80%E6%9C%AF",
    "/categories/%E9%9A%8F%E7%AC%94",
    "/tags",
    "/tags/%E7%AE%97%E6%B3%95%E7%AB%9E%E8%B5%9B",
    "/tags/%E5%BC%80%E5%A7%8B",
  ];
  for (const path of paths) {
    const response = await render(path);
    assert.equal(response.status, 200, `${path} should render`);
  }
});

test("迁移文章保留目录、公式和代码高亮", async () => {
  const response = await render("/posts/greedy-exchange-argument");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /class="toc"/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /用交换论证推导贪心排序规则/);
});

test("不存在的文章返回 404", async () => {
  const response = await render("/posts/does-not-exist");
  assert.equal(response.status, 404);
  assert.match(await response.text(), /这一页还没有被写下/);
});

test("RSS、站点地图和 robots 只包含已发布内容", async () => {
  const rss = await render("/rss.xml");
  assert.equal(rss.status, 200);
  assert.match(rss.headers.get("content-type") ?? "", /application\/rss\+xml/);
  const rssText = await rss.text();
  assert.match(rssText, /欢迎来到 Kamito/);
  assert.match(rssText, /算法竞赛进阶指南/);

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const sitemapText = await sitemap.text();
  assert.match(sitemapText, /\/posts\/welcome/);
  assert.match(sitemapText, /\/posts\/algorithm-competition-guide/);
  assert.match(sitemapText, /\/posts\/string-algorithms/);
  assert.match(sitemapText, /\/posts\/greedy-exchange-argument/);
  assert.match(sitemapText, /\/categories\/%E6%8A%80%E6%9C%AF/);
  assert.match(sitemapText, /\/categories\/%E9%9A%8F%E7%AC%94/);

  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: http:\/\/localhost\/sitemap\.xml/);
});
