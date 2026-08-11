import type { ComponentType } from "react";
import {
  assertUniqueSlugs,
  comparePostsNewestFirst,
  countValues,
  isPublished,
  type PostFrontmatter,
  validatePostFrontmatter,
} from "./post-schema";
import { siteConfig } from "./site";

type MdxModule = {
  default: ComponentType;
  frontmatter: unknown;
};

export type Post = PostFrontmatter & {
  slug: string;
  Content: ComponentType;
};

const modules = import.meta.glob<MdxModule>("/content/posts/*.mdx", {
  eager: true,
});
function slugFromPath(path: string): string {
  return path.split("/").pop()?.replace(/\.mdx$/i, "") ?? "";
}

const allPosts = (() => {
  const entries = Object.entries(modules);
  assertUniqueSlugs(entries.map(([path]) => slugFromPath(path)));
  const posts = entries.map(([path, module]) => {
    const slug = slugFromPath(path);
    const frontmatter = validatePostFrontmatter(module.frontmatter, slug);
    return {
      ...frontmatter,
      slug,
      Content: module.default,
    } satisfies Post;
  });
  return posts.sort(comparePostsNewestFirst);
})();

export function getAllPosts(options?: { includeDrafts?: boolean }): Post[] {
  return allPosts.filter((post) => options?.includeDrafts || isPublished(post));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getCategories(): Array<{ name: string; count: number }> {
  const published = getAllPosts();
  const counts = new Map(
    countValues(published.map((post) => post.category)).map((entry) => [
      entry.name,
      entry.count,
    ]),
  );
  return [
    ...siteConfig.initialCategories.map((name) => ({
      name,
      count: counts.get(name) ?? 0,
    })),
    ...[...counts.entries()]
      .filter(([name]) => !siteConfig.initialCategories.some((category) => category === name))
      .map(([name, count]) => ({ name, count })),
  ];
}

export function getTags(): Array<{ name: string; count: number }> {
  return countValues(getAllPosts().flatMap((post) => post.tags));
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((post) => post.category === category);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter((post) => post.tags.includes(tag));
}
