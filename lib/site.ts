export const siteConfig = {
  name: "Kamito's Notes",
  author: "Kamito",
  tagline: "记录技术、生活与思考",
  description:
    "Kamito 的个人博客，记录技术探索、生活片段，以及那些值得慢慢想清楚的问题。",
  initialCategories: ["技术", "生活", "随笔"],
} as const;

type HeaderReader = {
  get(name: string): string | null;
};

export function requestOrigin(headerList: HeaderReader): string {
  const rawHost =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3000";
  const host = rawHost.split(",")[0]?.trim() || "localhost:3000";
  const rawProtocol = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol =
    rawProtocol === "http" || rawProtocol === "https"
      ? rawProtocol
      : host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";

  return `${protocol}://${host}`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
