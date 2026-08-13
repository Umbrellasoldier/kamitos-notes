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
  assert.match(html, /src="\/og\.png"/);
  assert.match(html, /欢迎来到 Kamito/);
  assert.match(html, /算法竞赛进阶指南：基本算法与数据结构/);
  assert.doesNotMatch(html, /target="_top"/);
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
    "/posts/graph-theory",
    "/posts/competitive-math",
    "/posts/advanced-data-structures",
    "/posts/atcoder-abc-solutions",
    "/posts/fundamental-algorithms",
    "/posts/search-algorithms",
    "/posts/fundamental-data-structures",
    "/posts/python-competitive-template",
    "/posts/cs336-lecture-01-overview-tokenization",
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

test("CS336 第一讲笔记包含课程主线、BPE 实现和官方资料", async () => {
  const response = await render("/posts/cs336-lecture-01-overview-tokenization");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /CS336 第一讲笔记：从课程全景到 BPE 分词/);
  assert.match(html, /class="toc"/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /train_bpe/);
  assert.match(html, /o200k_base/);
  assert.match(html, /Byte Latent Transformer/);
  assert.match(html, /Foundation Models and Fair Use/);
  assert.match(html, /assignment5-alignment/);
  assert.match(html, /更新于.*2026年8月14日/);
  assert.match(html, /cs336\.stanford\.edu\/lectures\/\?trace=lecture_01/);
  assert.match(html, /github\.com\/stanford-cs336\/assignment1-basics/);
});

test("新整理文章保留合并结构、本地图片和代码高亮", async () => {
  const dataStructures = await render("/posts/fundamental-data-structures");
  assert.equal(dataStructures.status, 200);
  const dataStructuresHtml = await dataStructures.text();
  assert.match(dataStructuresHtml, /基础数据结构：线性结构、二叉树、堆与并查集/);
  assert.match(dataStructuresHtml, /class="toc"/);
  assert.match(dataStructuresHtml, /data-rehype-pretty-code-figure/);
  assert.match(dataStructuresHtml, /href="\/posts\/string-algorithms"/);

  const graphTheory = await render("/posts/graph-theory");
  assert.equal(graphTheory.status, 200);
  const graphTheoryHtml = await graphTheory.text();
  assert.match(graphTheoryHtml, /src="\/posts\/graph-theory\/graph-storage-1\.png"/);
  assert.match(graphTheoryHtml, /class="katex"/);

  const pythonTemplate = await render("/posts/python-competitive-template");
  assert.equal(pythonTemplate.status, 200);
  assert.match(await pythonTemplate.text(), /sys\.stdin\.buffer\.read/);
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
  assert.match(rssText, /AtCoder ABC 题解集/);
  assert.match(rssText, /CS336 第一讲笔记/);

  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const sitemapText = await sitemap.text();
  assert.match(sitemapText, /\/posts\/welcome/);
  assert.match(sitemapText, /\/posts\/algorithm-competition-guide/);
  assert.match(sitemapText, /\/posts\/string-algorithms/);
  assert.match(sitemapText, /\/posts\/greedy-exchange-argument/);
  assert.match(sitemapText, /\/posts\/graph-theory/);
  assert.match(sitemapText, /\/posts\/competitive-math/);
  assert.match(sitemapText, /\/posts\/advanced-data-structures/);
  assert.match(sitemapText, /\/posts\/atcoder-abc-solutions/);
  assert.match(sitemapText, /\/posts\/fundamental-algorithms/);
  assert.match(sitemapText, /\/posts\/search-algorithms/);
  assert.match(sitemapText, /\/posts\/fundamental-data-structures/);
  assert.match(sitemapText, /\/posts\/python-competitive-template/);
  assert.match(sitemapText, /\/posts\/cs336-lecture-01-overview-tokenization/);
  assert.match(sitemapText, /\/categories\/%E6%8A%80%E6%9C%AF/);
  assert.match(sitemapText, /\/categories\/%E9%9A%8F%E7%AC%94/);

  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: http:\/\/localhost\/sitemap\.xml/);
});
