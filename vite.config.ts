import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const base = "/RabbitHoleDiner/";
const siteUrl = "https://yohira6.github.io/RabbitHoleDiner/";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function parseFrontMatter(source: string) {
  const match = source.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {} as Record<string, string>;

  return Object.fromEntries(match[1].split(/\r?\n/).flatMap((line) => {
    const separator = line.indexOf(":");
    if (separator < 0) return [];
    const key = line.slice(0, separator).trim().toLowerCase();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [[key, value]];
  }));
}

function replaceMeta(html: string, attribute: "name" | "property", key: string, value: string) {
  const escaped = escapeHtml(value);
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key}["']\\s+content=["'][^"']*["']\\s*\\/?>(?:\\r?\\n)?`, "i");
  const tag = `<meta ${attribute}="${key}" content="${escaped}" />\n`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `  ${tag}</head>`);
}

function withShareMeta(template: string, data: { title: string; description: string; url: string; image?: string }) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(data.title)}</title>`);
  html = replaceMeta(html, "name", "description", data.description);
  html = replaceMeta(html, "property", "og:title", data.title);
  html = replaceMeta(html, "property", "og:description", data.description);
  html = replaceMeta(html, "property", "og:type", "article");
  html = replaceMeta(html, "property", "og:url", data.url);
  html = replaceMeta(html, "name", "twitter:card", data.image ? "summary_large_image" : "summary");
  html = replaceMeta(html, "name", "twitter:title", data.title);
  html = replaceMeta(html, "name", "twitter:description", data.description);
  if (data.image) {
    html = replaceMeta(html, "property", "og:image", data.image);
    html = replaceMeta(html, "property", "og:image:alt", data.title);
    html = replaceMeta(html, "name", "twitter:image", data.image);
  }
  return html;
}

function blogSharePages(): Plugin {
  return {
    name: "blog-share-pages",
    apply: "build",
    async closeBundle() {
      const outputRoot = path.resolve("dist");
      const template = await readFile(path.join(outputRoot, "index.html"), "utf8");
      const blogRoot = path.resolve("content/blog");
      const files = (await readdir(blogRoot)).filter((file) => file.endsWith(".md"));

      const blogIndex = withShareMeta(template, {
        title: "ブログ | Rabbit Hole Diner",
        description: "RabbitPunchの制作や日々のこと、サイトの更新情報を掲載しています。",
        url: `${siteUrl}blog/`,
      });
      await mkdir(path.join(outputRoot, "blog"), { recursive: true });
      await writeFile(path.join(outputRoot, "blog", "index.html"), blogIndex);

      for (const file of files) {
        const meta = parseFrontMatter(await readFile(path.join(blogRoot, file), "utf8"));
        if (meta.published?.toLowerCase() !== "true") continue;

        const slug = file.replace(/\.md$/i, "");
        const pageUrl = `${siteUrl}blog/${encodeURIComponent(slug)}/`;
        const imageUrl = meta.cover ? new URL(meta.cover.replace(/^\.?\//, ""), siteUrl).href : undefined;
        const articleHtml = withShareMeta(template, {
          title: `${meta.title || slug} | Rabbit Hole Diner`,
          description: meta.summary || "Rabbit Hole Dinerのブログ記事です。",
          url: pageUrl,
          image: imageUrl,
        });
        const articleRoot = path.join(outputRoot, "blog", slug);
        await mkdir(articleRoot, { recursive: true });
        await writeFile(path.join(articleRoot, "index.html"), articleHtml);
      }
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), blogSharePages()],
});
