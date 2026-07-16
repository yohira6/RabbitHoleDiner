import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RabbitHole Diner",
  description: "夜更かしダイナーを巡る、ADVゲーム風の個人作品サイト。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
