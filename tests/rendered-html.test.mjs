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
  assert.match(html, /算法竞赛进阶指南：基本算法与数据结构/);
  assert.match(html, /CS336 train_bpe 实战：从正确实现到 3\.5 倍性能优化/);
  assert.match(html, /CS336 第二讲笔记：PyTorch、显存与计算资源核算/);
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
    "/posts/karpathy-build-gpt-tokenizer",
    "/posts/cs336-train-bpe-performance",
    "/posts/cs336-lecture-02-pytorch-resource-accounting",
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

test("完整头像用于关于页、文章署名和站点图标", async () => {
  const about = await render("/about");
  assert.equal(about.status, 200);
  const aboutHtml = await about.text();
  assert.match(aboutHtml, /src="\/avatar-kamito-v2\.png"/);
  assert.match(aboutHtml, /width="1024" height="1024"/);

  const post = await render("/posts/karpathy-build-gpt-tokenizer");
  assert.equal(post.status, 200);
  assert.match(await post.text(), /src="\/avatar-kamito-v2\.png"/);

  assert.doesNotMatch(aboutHtml, /src="\/avatar\.png"/);
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
  assert.match(html, /更新于.*2026年8月15日/);
  assert.match(html, /\/posts\/cs336-lecture-01-overview-tokenization\/wei-emergence-plot\.png/);
  assert.match(html, /\/posts\/cs336-lecture-01-overview-tokenization\/transformer-architecture\.png/);
  assert.match(html, /\/posts\/cs336-lecture-01-overview-tokenization\/compute-memory\.png/);
  assert.match(html, /\/posts\/cs336-lecture-01-overview-tokenization\/chinchilla-isoflop\.png/);
  assert.match(html, /\/posts\/cs336-lecture-01-overview-tokenization\/prefill-decode\.png/);
  assert.match(html, /\/posts\/cs336-lecture-01-overview-tokenization\/tokenized-example\.png/);
  assert.match(html, /cs336\.stanford\.edu\/lectures\/\?trace=lecture_01/);
  assert.match(html, /github\.com\/stanford-cs336\/assignment1-basics/);
  assert.match(html, /href="\/posts\/karpathy-build-gpt-tokenizer"/);
});

test("Karpathy tokenizer 笔记覆盖完整视频主线和可运行实现", async () => {
  const response = await render("/posts/karpathy-build-gpt-tokenizer");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Karpathy Tokenizer 视频笔记：从 UTF-8 到 GPT-4 BPE/);
  assert.match(html, /class="toc"/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /pair_counts/);
  assert.match(html, /GPT4_SPLIT_PATTERN/);
  assert.match(html, /SentencePiece/);
  assert.match(html, /SolidGoldMagikarp/);
  assert.match(html, /github\.com\/karpathy\/minbpe/);
  assert.match(html, /youtube\.com\/watch\?v=zduSFxRajkE/);
  assert.match(html, /property="og:title" content="Karpathy Tokenizer/);
  assert.match(html, /name="twitter:card" content="summary"/);
  assert.doesNotMatch(html, /property="og:image"/);
  assert.doesNotMatch(html, /name="twitter:image"/);
});

test("CS336 train_bpe 实战保留性能数据、代码与关联阅读", async () => {
  const response = await render("/posts/cs336-train-bpe-performance");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /CS336 train_bpe 实战：从正确实现到 3\.5 倍性能优化/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /pair_by_counts\.pop/);
  const visibleText = html.replace(/<[^>]+>/g, "");
  assert.match(visibleText, /def pretokenize/);
  assert.match(visibleText, /ProcessPoolExecutor/);
  assert.match(visibleText, /affected_word_ids/);
  assert.match(visibleText, /assert parallel_counts == serial_counts/);
  assert.match(html, /145\.602 秒/);
  assert.match(html, /merge 循环约快了 8\.8 倍/);
  assert.match(html, /href="\/posts\/cs336-lecture-01-overview-tokenization"/);
  assert.match(html, /href="\/posts\/karpathy-build-gpt-tokenizer"/);
  assert.match(html, /property="og:title" content="CS336 train_bpe 实战/);
  assert.match(html, /name="twitter:card" content="summary"/);
  assert.doesNotMatch(html, /property="og:image"/);
  assert.doesNotMatch(html, /name="twitter:image"/);
});

test("CS336 第二讲笔记覆盖 PyTorch、资源核算和显存优化主线", async () => {
  const response = await render(
    "/posts/cs336-lecture-02-pytorch-resource-accounting",
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /CS336 第二讲笔记：PyTorch、显存与计算资源核算/);
  assert.match(html, /class="toc"/);
  assert.match(html, /class="katex-display"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /6ND/);
  assert.match(html, /295\.37/);
  assert.match(html, /arithmetic intensity/);
  assert.match(html, /use_reentrant=False/);
  assert.match(html, /梯度累积/);
  assert.match(html, /激活检查点/);
  assert.match(
    html,
    /\/posts\/cs336-lecture-02-pytorch-resource-accounting\/fp32\.png/,
  );
  assert.match(
    html,
    /\/posts\/cs336-lecture-02-pytorch-resource-accounting\/compute-memory\.png/,
  );
  assert.match(
    html,
    /cs336\.stanford\.edu\/lectures\/\?trace=lecture_02/,
  );
  assert.match(html, /bilibili\.com\/video\/BV11LEA6eEuj/);
  assert.match(html, /docs\.pytorch\.org\/docs\/stable\/checkpoint\.html/);
  assert.match(
    html,
    /property="og:title" content="CS336 第二讲笔记：PyTorch、显存与计算资源核算/,
  );
  assert.match(html, /name="twitter:card" content="summary"/);
  assert.doesNotMatch(html, /property="og:image"/);
  assert.doesNotMatch(html, /name="twitter:image"/);
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
  assert.match(rssText, /Karpathy Tokenizer 视频笔记/);
  assert.match(rssText, /CS336 train_bpe 实战/);
  assert.match(rssText, /CS336 第二讲笔记/);

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
  assert.match(sitemapText, /\/posts\/karpathy-build-gpt-tokenizer/);
  assert.match(sitemapText, /\/posts\/cs336-train-bpe-performance/);
  assert.match(
    sitemapText,
    /\/posts\/cs336-lecture-02-pytorch-resource-accounting/,
  );
  assert.match(sitemapText, /\/categories\/%E6%8A%80%E6%9C%AF/);
  assert.match(sitemapText, /\/categories\/%E9%9A%8F%E7%AC%94/);

  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Sitemap: http:\/\/localhost\/sitemap\.xml/);
});
