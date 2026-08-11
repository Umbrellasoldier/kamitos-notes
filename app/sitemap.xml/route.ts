import { getAllPosts, getCategories, getTags } from "@/lib/posts";

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const staticPaths = ["/", "/posts", "/about", "/categories", "/tags"];
  const entries: Array<{ path: string; lastmod?: string }> = [
    ...staticPaths.map((path) => ({ path })),
    ...getAllPosts().map((post) => ({
      path: `/posts/${post.slug}`,
      lastmod: post.updatedAt ?? post.publishedAt,
    })),
    ...getCategories().map(({ name }) => ({ path: `/categories/${encodeURIComponent(name)}` })),
    ...getTags().map(({ name }) => ({ path: `/tags/${encodeURIComponent(name)}` })),
  ];
  const urls = entries
    .map(({ path, lastmod }) => {
      const location = escapeXml(new URL(path, origin).toString());
      return `<url><loc>${location}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
    })
    .join("");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
}
