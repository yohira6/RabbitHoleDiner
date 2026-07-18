# RabbitHole Diner

夜更けのダイナーを舞台にした、ADVゲーム風の個人作品サイトです。

## 公開ページ

https://yohira6.github.io/RabbitHoleDiner/

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
