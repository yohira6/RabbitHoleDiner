# RabbitHole Diner

サークルRabbitPunchの個人サイトです。

## 公開ページ

https://yohira6.github.io/RabbitHoleDiner/

ブログ: https://yohira6.github.io/RabbitHoleDiner/#/blog

## ブログを更新する

`content/blog/_template.md` を複製して本文を書くだけで、新しい記事を追加できます。
詳しい手順は `BLOG_EDIT_GUIDE.md` を参照してください。

## ローカル実行

Node.js 22以降とpnpmを使用します。

```bash
pnpm install
pnpm dev
```

## ビルド

```bash
pnpm build
```

生成物は `dist/` に出力されます。`main` ブランチへpushすると、GitHub ActionsによってGitHub Pagesへ自動公開されます。
