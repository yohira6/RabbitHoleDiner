/// <reference types="vite/client" />

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  updated: string;
  category: string;
  summary: string;
  cover?: string;
  adult: boolean;
  body: string;
  readingMinutes: number;
};

type FrontMatter = Record<string, string>;

const rawPosts = import.meta.glob("../content/blog/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

function parseFrontMatter(source: string) {
  const normalized = source.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {} as FrontMatter, body: normalized.trim() };

  const meta: FrontMatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }

  return { meta, body: match[2].trim() };
}

function readingMinutes(body: string) {
  const characters = body.replace(/[\s#>*_`\-\[\]()!]/g, "").length;
  return Math.max(1, Math.ceil(characters / 500));
}

export const blogPosts: BlogPost[] = Object.entries(rawPosts)
  .flatMap<BlogPost>(([path, source]) => {
    const { meta, body } = parseFrontMatter(source);
    if (meta.published?.toLowerCase() !== "true") return [];

    const slug = path.split("/").pop()?.replace(/\.md$/i, "") ?? "post";
    const post: BlogPost = {
      slug,
      title: meta.title || slug,
      date: meta.date || "",
      updated: meta.updated || meta.date || "",
      category: meta.category || "日記",
      summary: meta.summary || body.split(/\r?\n\r?\n/)[0]?.replace(/^#+\s*/, "") || "",
      adult: meta.adult?.toLowerCase() === "true",
      body,
      readingMinutes: readingMinutes(body),
    };
    if (meta.cover) post.cover = meta.cover;
    return [post];
  })
  .sort((a, b) => b.updated.localeCompare(a.updated));

export function formatBlogDate(date: string) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return date || "日付未設定";
  return `${match[1]}.${match[2]}.${match[3]}`;
}

export function resolveBlogAsset(path: string) {
  if (/^(?:https?:|data:|#)/i.test(path)) return path;
  const cleaned = path.replace(/^\.?\//, "");
  return `${import.meta.env.BASE_URL}${cleaned}`;
}
