import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { blogPosts, formatBlogDate, resolveBlogAsset, type BlogPost } from "./blog-data";

type BlogProps = {
  route: string;
};

function InlineText({ text }: { text: string }) {
  const tokens: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|!?\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > cursor) tokens.push(text.slice(cursor, match.index));
    const token = match[0];

    if (token.startsWith("**")) {
      tokens.push(<strong key={`${match.index}-strong`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`")) {
      tokens.push(<code key={`${match.index}-code`}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("![")) {
      const image = token.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (image) tokens.push(<img key={`${match.index}-image`} src={resolveBlogAsset(image[2])} alt={image[1]} loading="lazy" />);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        const external = /^https?:/i.test(link[2]);
        tokens.push(<a key={`${match.index}-link`} href={external ? link[2] : resolveBlogAsset(link[2])} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{link[1]}</a>);
      }
    }
    cursor = match.index + token.length;
  }

  if (cursor < text.length) tokens.push(text.slice(cursor));
  return <>{tokens.map((token, index) => <Fragment key={index}>{token}</Fragment>)}</>;
}

function MarkdownBody({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`}>{paragraph.map((line, index) => <Fragment key={index}>{index > 0 && <br />}<InlineText text={line} /></Fragment>)}</p>);
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((item, index) => <li key={index}><InlineText text={item} /></li>);
    blocks.push(list.ordered ? <ol key={`ol-${blocks.length}`}>{items}</ol> : <ul key={`ul-${blocks.length}`}>{items}</ul>);
    list = null;
  };
  const flushQuote = () => {
    if (!quote.length) return;
    blocks.push(<blockquote key={`quote-${blocks.length}`}><InlineText text={quote.join(" ")} /></blockquote>);
    quote = [];
  };

  lines.forEach((line, index) => {
    if (line.trim().startsWith("```")) {
      flushParagraph(); flushList(); flushQuote();
      if (code) {
        blocks.push(<pre key={`code-${blocks.length}`}><code>{code.join("\n")}</code></pre>);
        code = null;
      } else {
        code = [];
      }
      return;
    }
    if (code) { code.push(line); return; }

    const image = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (image) {
      flushParagraph(); flushList(); flushQuote();
      blocks.push(<figure key={`image-${index}`}><img src={resolveBlogAsset(image[2])} alt={image[1]} loading="lazy" />{image[1] && <figcaption>{image[1]}</figcaption>}</figure>);
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList(); flushQuote();
      const content = <InlineText text={heading[2]} />;
      if (heading[1].length === 1) blocks.push(<h2 key={`h2-${index}`}>{content}</h2>);
      if (heading[1].length === 2) blocks.push(<h3 key={`h3-${index}`}>{content}</h3>);
      if (heading[1].length === 3) blocks.push(<h4 key={`h4-${index}`}>{content}</h4>);
      return;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph(); flushQuote();
      const isOrdered = Boolean(ordered);
      if (list && list.ordered !== isOrdered) flushList();
      if (!list) list = { ordered: isOrdered, items: [] };
      list.items.push((ordered || unordered)![1]);
      return;
    }

    const quoteLine = line.match(/^>\s?(.*)$/);
    if (quoteLine) {
      flushParagraph(); flushList();
      quote.push(quoteLine[1]);
      return;
    }

    if (/^---+$/.test(line.trim())) {
      flushParagraph(); flushList(); flushQuote();
      blocks.push(<hr key={`hr-${index}`} />);
      return;
    }

    if (!line.trim()) {
      flushParagraph(); flushList(); flushQuote();
      return;
    }

    flushList(); flushQuote();
    paragraph.push(line);
  });

  flushParagraph(); flushList(); flushQuote();
  const unfinishedCode = code as string[] | null;
  if (unfinishedCode) blocks.push(<pre key={`code-${blocks.length}`}><code>{unfinishedCode.join("\n")}</code></pre>);
  return <div className="blog-markdown">{blocks}</div>;
}

function BlogBrand() {
  return (
    <header className="blog-topbar">
      <a className="blog-logo" href="#/" aria-label="Rabbit Hole Dinerへ戻る">
        <span className="brand-logo"><img src={`${import.meta.env.BASE_URL}branding/logo.png`} alt="Rabbit Hole Diner" /></span>
      </a>
      <div className="blog-topbar-copy"><small>OWNER&apos;S LOG / RHD</small><strong>BLOG</strong></div>
      <a className="blog-back-diner" href="#/">← DINERへ戻る</a>
    </header>
  );
}

function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  return (
    <article className={`blog-card ${featured ? "blog-card--featured" : ""}`}>
      {post.cover && <a className="blog-card-cover" href={`#/blog/${encodeURIComponent(post.slug)}`} tabIndex={-1}><img src={resolveBlogAsset(post.cover)} alt="" loading="lazy" /></a>}
      <div className="blog-card-body">
        <div className="blog-meta"><time dateTime={post.date}>{formatBlogDate(post.date)}</time><span>{post.category}</span><span>{post.readingMinutes} MIN READ</span></div>
        <h2><a href={`#/blog/${encodeURIComponent(post.slug)}`}>{post.title}</a></h2>
        <p>{post.summary}</p>
        <a className="blog-read-more" href={`#/blog/${encodeURIComponent(post.slug)}`}>記事を読む <span>→</span></a>
      </div>
    </article>
  );
}

function BlogIndex() {
  const [category, setCategory] = useState("ALL");
  const categories = useMemo(() => ["ALL", ...Array.from(new Set(blogPosts.map((post) => post.category)))], []);
  const filtered = category === "ALL" ? blogPosts : blogPosts.filter((post) => post.category === category);
  const [featured, ...rest] = filtered;

  useEffect(() => {
    document.title = "BLOG | Rabbit Hole Diner";
  }, []);

  return (
    <>
      <section className="blog-hero">
        <p className="blog-eyebrow">FROM THE OWNER&apos;S DESK</p>
        <h1>夜更けの<br />オーナーズログ。</h1>
        <p>制作の話や日々のこと、サイトの更新情報を置いています。</p>
      </section>

      <nav className="blog-category-nav" aria-label="記事カテゴリ">
        {categories.map((item) => <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
      </nav>

      <section className="blog-post-list" aria-live="polite">
        {!featured && <div className="blog-empty"><strong>NO POSTS YET</strong><p>このカテゴリの記事は、まだありません。</p></div>}
        {featured && <PostCard post={featured} featured />}
        {rest.length > 0 && <div className="blog-card-grid">{rest.map((post) => <PostCard key={post.slug} post={post} />)}</div>}
      </section>
    </>
  );
}

function BlogArticle({ post }: { post: BlogPost }) {
  useEffect(() => {
    document.title = `${post.title} | Rabbit Hole Diner`;
  }, [post.title]);

  return (
    <article className="blog-article">
      <a className="blog-list-back" href="#/blog">← 記事一覧へ戻る</a>
      <header className="blog-article-header">
        <div className="blog-meta"><time dateTime={post.date}>{formatBlogDate(post.date)}</time><span>{post.category}</span><span>{post.readingMinutes} MIN READ</span></div>
        <h1>{post.title}</h1>
        <p>{post.summary}</p>
      </header>
      {post.cover && <figure className="blog-article-cover"><img src={resolveBlogAsset(post.cover)} alt="" /></figure>}
      <MarkdownBody source={post.body} />
      <footer className="blog-article-footer"><span>END OF LOG</span><a href="#/blog">ほかの記事を見る →</a></footer>
    </article>
  );
}

export default function Blog({ route }: BlogProps) {
  const slug = decodeURIComponent(route.replace(/^#\/blog\/?/, ""));
  const post = slug ? blogPosts.find((item) => item.slug === slug) : undefined;

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [route]);

  return (
    <main className="blog-shell">
      <BlogBrand />
      <div className="blog-page">
        {slug && !post ? <section className="blog-not-found"><small>404 / LOST LOG</small><h1>記事が見つかりません。</h1><a href="#/blog">ブログ一覧へ戻る</a></section> : post ? <BlogArticle post={post} /> : <BlogIndex />}
      </div>
      <footer className="blog-footer"><span>© 2026 RABBIT PUNCH</span><span>RABBIT HOLE DINER / OWNER&apos;S LOG</span></footer>
    </main>
  );
}
