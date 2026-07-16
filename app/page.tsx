"use client";

import { useEffect, useMemo, useState } from "react";

type Scene = "home" | "menu" | "about" | "links";

const dialogue: Record<Scene, string> = {
  home: "いらっしゃいませ。気になるものを、ゆっくり見ていってね。",
  menu: "今日のメニューだよ。作品名を押すと、そのページへ案内するね。",
  about: "ここは、絵と小さな作品を置いている夜更かしダイナーです。",
  links: "電話帳には、外の世界へつながるリンクをまとめてあるよ。",
};

const works = [
  { tag: "PC SOFTWARE", title: "Midnight Order", note: "短編ノベルゲーム / 制作中" },
  { tag: "WEB APP", title: "Tiny Recipe Book", note: "小さな献立記録アプリ" },
  { tag: "ILLUSTRATION", title: "Rabbit Hole Sketches", note: "ダイナーの設定画集" },
];

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scene, setScene] = useState<Scene>("home");
  const [line, setLine] = useState(dialogue.home);
  const [typed, setTyped] = useState("");
  const [eyeFrame, setEyeFrame] = useState<"open" | "half" | "closed">("open");
  const [mouthFrame, setMouthFrame] = useState<"closed" | "half" | "open">("closed");
  const isTyping = loaded && typed.length < line.length;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 4, 100);
        if (next === 100) window.clearInterval(timer);
        return next;
      });
    }, 55);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loaded) {
      setTyped("");
      return;
    }

    setTyped("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(line.slice(0, index));
      if (index >= line.length) window.clearInterval(timer);
    }, 42);
    return () => window.clearInterval(timer);
  }, [line, loaded]);

  useEffect(() => {
    const timers: number[] = [];
    let cancelled = false;

    const scheduleBlink = () => {
      const wait = 2400 + Math.random() * 3200;
      timers.push(window.setTimeout(() => {
        if (cancelled) return;
        setEyeFrame("half");
        timers.push(window.setTimeout(() => setEyeFrame("closed"), 65));
        timers.push(window.setTimeout(() => setEyeFrame("half"), 150));
        timers.push(window.setTimeout(() => {
          setEyeFrame("open");
          scheduleBlink();
        }, 225));
      }, wait));
    };

    scheduleBlink();
    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (!isTyping) {
      setMouthFrame("closed");
      return;
    }

    const frames: Array<"closed" | "half" | "open"> = ["half", "open", "half", "closed", "half"];
    let index = 0;
    setMouthFrame(frames[index]);
    const timer = window.setInterval(() => {
      index += 1;
      setMouthFrame(frames[index % frames.length]);
    }, 90);

    return () => window.clearInterval(timer);
  }, [isTyping]);

  const sceneTitle = useMemo(
    () => ({ home: "DINER", menu: "MENU BOOK", about: "ABOUT", links: "LINKS" })[scene],
    [scene],
  );

  const openScene = (next: Scene) => {
    setScene(next);
    setLine(dialogue[next]);
  };

  if (!loaded) {
    return (
      <main className="loading-screen">
        <header className="brand brand--loading">
          <span>RabbitHole</span>
          <span>Diner</span>
          <span className="brand-rabbit" aria-hidden="true">♧</span>
        </header>
        <section className="loading-card" aria-live="polite">
          <div className="loading-rabbit" aria-hidden="true">
            <i className="ear ear--left" />
            <i className="ear ear--right" />
            <b>×</b>
          </div>
          <p className="eyebrow">WELCOME, NIGHT OWL</p>
          <h1>Now Loading…</h1>
          <div className="loading-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="loading-count">{progress.toString().padStart(3, "0")}%</p>
          <button className="enter-button" type="button" disabled={progress < 100} onClick={() => setLoaded(true)}>
            {progress < 100 ? "PREPARING TABLE…" : "ENTER THE DINER"}
          </button>
        </section>
        <footer className="loading-footer">OPEN AFTER MIDNIGHT · TABLE No. 07</footer>
      </main>
    );
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <button className="brand brand--button" onClick={() => openScene("home")} aria-label="ホームへ戻る">
          <span>RabbitHole</span><span>Diner</span><span aria-hidden="true">♧</span>
        </button>
        <div className="open-sign"><span /> OPEN <small>00:00—05:00</small></div>
      </header>

      <section className={`game-frame ${scene !== "home" ? "game-frame--overlay" : ""}`} aria-label="RabbitHole Diner 店内">
        <div className="scene-label">SCENE 01 / {sceneTitle}</div>
        <div className="diner-window" aria-hidden="true">
          <span className="moon" />
          <span className="star star--one">✦</span>
          <span className="star star--two">·</span>
          <div className="window-copy">WELCOME<br />TO THE<br />RABBIT HOLE</div>
        </div>

        <div className="booth booth--left" aria-hidden="true"><i /><i /><i /></div>
        <div className="booth booth--right" aria-hidden="true"><i /><i /><i /></div>
        <div className="floor" aria-hidden="true" />

        <button className="hotspot bell" onClick={() => setLine("ちりん……ご注文が決まったら、また鳴らしてね。")} aria-label="呼び鈴を鳴らす">
          <span className="bell-dome" /><span className="bell-base" /><em>RING</em>
        </button>

        <div className="table" aria-hidden="true"><span /></div>

        <button className="hotspot menu-object" onClick={() => openScene("menu")} aria-label="メニューブックを開く">
          <span>MENU</span><em>OPEN</em>
        </button>

        <button className="hotspot phone" onClick={() => openScene("links")} aria-label="電話からリンクを見る">
          <span className="receiver" /><span className="dial">•••<br />•••</span><em>CALL</em>
        </button>

        <button className="hotspot picture" onClick={() => openScene("about")} aria-label="壁の絵からこのサイトについて見る">
          <span className="picture-rabbit" aria-hidden="true"><i /><b>×</b></span>
          <em>ABOUT</em>
        </button>

        {scene !== "home" && <div className="scene-dimmer" aria-hidden="true" />}

        <aside className={`character ${scene !== "home" ? "character--overlay" : ""}`} aria-label="案内役のキャラクター">
          <div className="character-shadow" />
          <div className="character-art" aria-hidden="true">
            <img className="character-base" src="/character/base.png" alt="" />
            {(["open", "half", "closed"] as const).map((frame) => (
              <img
                key={`eyes-${frame}`}
                className={`character-layer character-eyes ${eyeFrame === frame ? "is-active" : ""}`}
                src={`/character/eyes-${frame}.png`}
                alt=""
              />
            ))}
            {(["closed", "half", "open"] as const).map((frame) => (
              <img
                key={`mouth-${frame}`}
                className={`character-layer character-mouth ${mouthFrame === frame ? "is-active" : ""}`}
                src={`/character/mouth-${frame}.png`}
                alt=""
              />
            ))}
          </div>
          <p>STAFF / NO.07</p>
        </aside>

        {scene !== "home" && (
          <section className={`overlay-panel overlay-panel--${scene}`} aria-label={sceneTitle}>
            <button className="panel-close" onClick={() => openScene("home")} aria-label="閉じる">×</button>
            {scene === "menu" && (
              <div className="book">
                <div className="book-page">
                  <p className="book-kicker">TONIGHT&apos;S SPECIALS</p>
                  <h2>MENU</h2>
                  {works.slice(0, 2).map((work, index) => (
                    <a href="#dialogue" onClick={() => setLine(`${work.title}。${work.note}だよ。`)} className="work-link" key={work.title}>
                      <small>0{index + 1} / {work.tag}</small><strong>{work.title}</strong><span>{work.note}</span>
                    </a>
                  ))}
                </div>
                <div className="book-page">
                  <p className="book-kicker">DESSERT &amp; ART</p>
                  <h2>GALLERY</h2>
                  <a href="#dialogue" onClick={() => setLine(`${works[2].title}。${works[2].note}だよ。`)} className="work-link">
                    <small>03 / {works[2].tag}</small><strong>{works[2].title}</strong><span>{works[2].note}</span>
                  </a>
                  <div className="menu-note">NEW ITEMS<br />COMING SOON…</div>
                </div>
              </div>
            )}
            {scene === "about" && (
              <div className="info-card">
                <p className="book-kicker">ABOUT THIS PLACE</p><h2>夜だけ開く、作品置き場。</h2>
                <p>イラスト、ゲーム、Web作品などを並べるための個人サイトです。店内のものに触れながら、少しずつページを巡れます。</p>
                <dl><div><dt>OWNER</dt><dd>Your Name</dd></div><div><dt>STATUS</dt><dd>OPEN / WORK IN PROGRESS</dd></div></dl>
              </div>
            )}
            {scene === "links" && (
              <div className="info-card links-card">
                <p className="book-kicker">OUTSIDE LINE</p><h2>どこへ電話する？</h2>
                <a href="#dialogue" onClick={() => setLine("イラストを置いている場所につなぐね。")}>ILLUSTRATION SNS <span>→</span></a>
                <a href="#dialogue" onClick={() => setLine("制作記録のページにつなぐね。")}>DEV LOG <span>→</span></a>
                <a href="mailto:hello@example.com">MAIL <span>→</span></a>
              </div>
            )}
          </section>
        )}

        <section className="dialogue" id="dialogue" onClick={() => setTyped(line)} aria-live="polite">
          <div className="speaker"><small>STAFF</small><strong>No.07</strong></div>
          <p>{typed}<span className="typing-cursor" aria-hidden="true">▾</span></p>
          <button type="button" aria-label="文章を最後まで表示する" onClick={() => setTyped(line)}>NEXT</button>
        </section>
      </section>

      <nav className="page-nav" aria-label="ページメニュー">
        {(["home", "menu", "about", "links"] as Scene[]).map((item, index) => (
          <button key={item} className={scene === item ? "active" : ""} onClick={() => openScene(item)}>
            <span>0{index + 1}</span>{item.toUpperCase()}
          </button>
        ))}
      </nav>
      <footer className="site-footer"><span>© 2026 RABBIT HOLE DINER</span><span>BEST VIEWED AFTER DARK</span></footer>
    </main>
  );
}
