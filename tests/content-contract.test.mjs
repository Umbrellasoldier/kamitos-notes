import assert from "node:assert/strict";
import test from "node:test";
import {
  assertUniqueSlugs,
  comparePostsNewestFirst,
  countValues,
  isPublished,
  validatePostFrontmatter,
} from "../lib/post-schema.ts";

const valid = {
  title: "一篇文章",
  description: "简短摘要",
  publishedAt: "2026-08-12",
  category: "技术",
  tags: ["React", "写作"],
  featured: false,
  draft: false,
};

test("frontmatter 合约接受完整内容并清理重复标签", () => {
  const result = validatePostFrontmatter({ ...valid, tags: ["React", "React"] }, "valid");
  assert.deepEqual(result.tags, ["React"]);
  assert.equal(result.title, valid.title);
});

test("frontmatter 合约拒绝缺失字段和无效日期", () => {
  assert.throws(
    () => validatePostFrontmatter({ ...valid, title: "" }, "missing-title"),
    /title/,
  );
  assert.throws(
    () => validatePostFrontmatter({ ...valid, publishedAt: "2026-02-30" }, "bad-date"),
    /有效日期/,
  );
});

test("slug 必须唯一且有效", () => {
  assert.doesNotThrow(() => assertUniqueSlugs(["first", "second"]));
  assert.throws(() => assertUniqueSlugs(["same", "same"]), /重复/);
  assert.throws(() => assertUniqueSlugs([""]), /无效/);
});

test("文章按发布日期倒序并过滤草稿", () => {
  const posts = [
    { publishedAt: "2025-01-01", draft: false },
    { publishedAt: "2026-08-12", draft: true },
    { publishedAt: "2026-01-01", draft: false },
  ];
  assert.deepEqual(posts.filter(isPublished).sort(comparePostsNewestFirst), [
    { publishedAt: "2026-01-01", draft: false },
    { publishedAt: "2025-01-01", draft: false },
  ]);
});

test("栏目和标签聚合按数量排序", () => {
  assert.deepEqual(countValues(["生活", "技术", "技术"]), [
    { name: "技术", count: 2 },
    { name: "生活", count: 1 },
  ]);
});
