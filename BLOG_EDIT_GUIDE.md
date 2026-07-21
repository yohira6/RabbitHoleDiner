# ブログの更新方法

プログラムを変更せず、文章ファイルを追加するだけでブログを更新できます。

## GitHubの画面から新しい記事を書く

1. GitHubでこのサイトのリポジトリを開きます。
2. `content` → `blog` → `_template.md` の順に開き、中身をコピーします。
3. `blog` フォルダへ戻り、右上の `Add file` → `Create new file` を押します。
4. ファイル名へ `2026-07-21-好きな英数字.md` のような名前を入力します。
5. コピーしたテンプレートを貼り付け、内容を書き換えます。
6. `published: false` を `published: true` に変更します。
7. `Commit changes...` を押します。

`_template.md` 自体は書き換えず、毎回新しいファイルを作るのがポイントです。

数分待つと、ブログ一覧へ自動的に記事が追加されます。

## 記事上部の設定

```text
---
title: 記事タイトル
date: 2026-07-21
category: 日記
summary: 一覧に表示する短い説明文
published: true
cover: blog/images/画像ファイル名.png
---
```

- `title`：記事のタイトル
- `date`：公開日。`年-月-日`の順で入力します
- `category`：`日記`、`お知らせ`、`制作記録`など自由に入力できます
- `summary`：記事一覧に表示する短い紹介文です
- `published`：`true`で公開、`false`で非公開になります
- `cover`：記事の表紙画像です。不要なら空欄のままで構いません

`cover`を設定した記事は、記事URLをSNSやDiscordへ貼ったときにも、その画像と記事タイトルがリンクカードへ使われます。
公開後の記事URLは `https://yohira6.github.io/RabbitHoleDiner/blog/記事ファイル名/` の形になります。

## 本文の書き方

```text
# 大きな見出し
## 小さな見出し

普通の文章です。

**太字です。**

- 箇条書き
- 箇条書き

[リンク名](https://example.com/)

![画像の説明](blog/images/sample.png)
```

## 画像を載せる

画像は `public/blog/images` フォルダへアップロードします。

ファイル名には半角英数字とハイフンを使うと安全です。例：`new-illust-01.png`

記事内では次のように指定します。

```text
![新しいイラスト](blog/images/new-illust-01.png)
```

## 記事を一時的に隠す

記事上部の設定を次のように変更します。

```text
published: false
```

ファイルを削除しなくても、ブログには表示されなくなります。
