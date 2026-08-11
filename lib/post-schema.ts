export type PostFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  featured: boolean;
  draft: boolean;
  cover?: string;
};

type DatedPost = Pick<PostFrontmatter, "publishedAt">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireText(
  input: Record<string, unknown>,
  field: string,
  slug: string,
): string {
  const value = input[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`文章 ${slug} 的 ${field} 必须是非空文本。`);
  }
  return value.trim();
}

function optionalText(
  input: Record<string, unknown>,
  field: string,
  slug: string,
): string | undefined {
  const value = input[field];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`文章 ${slug} 的 ${field} 必须是非空文本。`);
  }
  return value.trim();
}

function requireBoolean(
  input: Record<string, unknown>,
  field: string,
  slug: string,
): boolean {
  const value = input[field];
  if (typeof value !== "boolean") {
    throw new Error(`文章 ${slug} 的 ${field} 必须是布尔值。`);
  }
  return value;
}

function requireDate(value: string, field: string, slug: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`文章 ${slug} 的 ${field} 必须使用 YYYY-MM-DD。`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`文章 ${slug} 的 ${field} 不是有效日期。`);
  }
  return value;
}

export function validatePostFrontmatter(
  value: unknown,
  slug: string,
): PostFrontmatter {
  if (!isRecord(value)) {
    throw new Error(`文章 ${slug} 缺少有效的 frontmatter。`);
  }

  const rawTags = value.tags;
  if (
    !Array.isArray(rawTags) ||
    rawTags.some((tag) => typeof tag !== "string" || !tag.trim())
  ) {
    throw new Error(`文章 ${slug} 的 tags 必须是非空文本数组。`);
  }
  const tags = [...new Set(rawTags.map((tag) => (tag as string).trim()))];

  const publishedAt = requireDate(
    requireText(value, "publishedAt", slug),
    "publishedAt",
    slug,
  );
  const rawUpdatedAt = optionalText(value, "updatedAt", slug);
  const updatedAt = rawUpdatedAt
    ? requireDate(rawUpdatedAt, "updatedAt", slug)
    : undefined;

  const cover = optionalText(value, "cover", slug);

  return {
    title: requireText(value, "title", slug),
    description: requireText(value, "description", slug),
    publishedAt,
    ...(updatedAt ? { updatedAt } : {}),
    category: requireText(value, "category", slug),
    tags,
    featured: requireBoolean(value, "featured", slug),
    draft: requireBoolean(value, "draft", slug),
    ...(cover ? { cover } : {}),
  };
}

export function comparePostsNewestFirst(a: DatedPost, b: DatedPost): number {
  return b.publishedAt.localeCompare(a.publishedAt);
}

export function countValues(values: string[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export function assertUniqueSlugs(slugs: string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (!slug || seen.has(slug)) {
      throw new Error(`检测到无效或重复的文章 slug：${slug || "(empty)"}`);
    }
    seen.add(slug);
  }
}

export function isPublished(post: Pick<PostFrontmatter, "draft">): boolean {
  return post.draft === false;
}
