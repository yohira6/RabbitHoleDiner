"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Scene = "home" | "menu" | "about" | "links";

const dialogue: Record<Scene, string> = {
  home: "いらっしゃいませ。気になるものを、ゆっくり見ていってね。",
  menu: "今日のメニューだよ。作品名を押すと、そのページへ案内するね。",
  about: "ここは、絵と小さな作品を置いている夜更かしダイナーです。",
  links: "パソコンを起動したよ。アイコンから、店の外へ出られるようにしておくね。",
};

const works = [
  { tag: "PC SOFTWARE", title: "Midnight Order", note: "短編ノベルゲーム / 制作中" },
  { tag: "WEB APP", title: "Tiny Recipe Book", note: "小さな献立記録アプリ" },
  { tag: "ILLUSTRATION", title: "Rabbit Hole Sketches", note: "ダイナーの設定画集" },
];

type PcLink = {
  id: string;
  label: string;
  detail: string;
  glyph: string;
  href: string;
  adult?: boolean;
  status?: string;
};

const pcLinks: PcLink[] = [
  { id: "youtube", label: "YouTube", detail: "VIDEO", glyph: "▶", href: "https://www.youtube.com/@RabbitPunch_678" },
  { id: "niconico", label: "niconico", detail: "VIDEO", glyph: "N", href: "https://www.nicovideo.jp/user/89488699" },
  { id: "x", label: "X", detail: "SNS", glyph: "X", href: "https://x.com/R_P_art" },
  { id: "x-r18", label: "X / R18", detail: "SNS", glyph: "X", href: "https://x.com/R_P_art_R18", adult: true },
  { id: "pixiv", label: "pixiv", detail: "GALLERY", glyph: "P", href: "https://www.pixiv.net/users/45724265", adult: true },
  { id: "fanbox", label: "FANBOX", detail: "GALLERY", glyph: "F", href: "https://yohira6.fanbox.cc/", status: "準備中" },
  { id: "booth", label: "BOOTH", detail: "STORE", glyph: "B", href: "https://yohira6.booth.pm/" },
];

const ambientDialogue = [
  "……静かな夜だね。こういう時間、嫌いじゃないよ。",
  "窓の向こう、さっきから景色が少しずつ違って見える。",
  "急がなくていいよ。席はまだ空いてるから。",
  "今日は何を描いてたの？　あとで少し見せてほしいな。",
  "店内の音って、ぼんやり聞いていると眠くなるね……。",
  "メニューにないものでも、話くらいなら聞けるよ。",
];

const characterDialogue: Record<"head" | "chest", string[]> = {
  head: [
    "……帽子、ずれてた？　触るなら、やさしくしてね。",
    "頭を撫でても、裏メニューは出てこないよ……。",
    "髪、気になる？　今朝ちゃんと整えたつもりなんだけど。",
    "……くすぐったい。あまり何度も触らないでね。",
    "この帽子は制服の一部。持っていっちゃだめだよ。",
    "ふふ……そんなに気に入ったなら、もう少しだけね。",
  ],
  chest: [
    "そこは注文ボタンじゃないよ……メニューなら、テーブルの上。",
    "……近い。用があるなら、普通に呼んでくれればいいのに。",
    "ちょっと……そこを呼び鈴みたいに押さないで。",
    "何度触っても、追加注文は受け付けないからね……。",
    "……接客中なんだけど。少しは遠慮してほしいかも。",
    "呼び鈴と間違えるには、ずいぶん無理があると思う……。",
  ],
};

type LoadingScreenProps = {
  progress: number;
  exiting?: boolean;
  onEnter: () => void;
  soundEnabled: boolean;
  soundVolume: number;
  onToggleSound: () => void;
  onVolumeChange: (value: number) => void;
};

type SoundControlsProps = {
  enabled: boolean;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (value: number) => void;
  compact?: boolean;
};

function SoundControls({ enabled, volume, onToggle, onVolumeChange, compact = false }: SoundControlsProps) {
  return (
    <div className={`sound-controls ${compact ? "sound-controls--compact" : ""}`} aria-label="音声設定">
      <button type="button" className="sound-toggle" aria-pressed={enabled} onClick={onToggle}>
        <span aria-hidden="true">{enabled ? "♪" : "×"}</span>{enabled ? "SOUND ON" : "SOUND OFF"}
      </button>
      <label className="volume-control">
        <span>VOLUME</span>
        <input type="range" min="0" max="100" step="1" value={volume} onChange={(event) => onVolumeChange(Number(event.target.value))} aria-label="音量" />
        <output>{volume.toString().padStart(2, "0")}</output>
      </label>
    </div>
  );
}

function LoadingScreen({ progress, exiting = false, onEnter, soundEnabled, soundVolume, onToggleSound, onVolumeChange }: LoadingScreenProps) {
  return (
    <main className={`loading-screen ${exiting ? "loading-screen--exiting" : ""}`}>
      <header className="brand brand--loading">
        <span className="brand-logo"><img src="/branding/logo.png" alt="Rabbit Hole Diner" /></span>
      </header>
      <section className="loading-card" aria-live="polite">
        <div className="loading-rabbit-badge" aria-hidden="true">
          <img src="/branding/rabbit-loading.png" alt="" />
        </div>
        <p className="eyebrow">WELCOME, GUEST</p>
        <h1>Now Loading…</h1>
        <div className="loading-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="loading-count">{progress.toString().padStart(3, "0")}%</p>
        <p className="audio-notice"><strong>♪ AUDIO NOTICE</strong> このサイトではBGMと効果音が流れます。入店前に音量を調整できます。</p>
        <SoundControls enabled={soundEnabled} volume={soundVolume} onToggle={onToggleSound} onVolumeChange={onVolumeChange} />
        <button className="enter-button" type="button" disabled={progress < 100 || exiting} onClick={onEnter}>
          {progress < 100 ? "PREPARING TABLE…" : "ENTER THE DINER"}
        </button>
      </section>
      <footer className="loading-footer">© 2026 RABBIT PUNCH</footer>
    </main>
  );
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [loadingExiting, setLoadingExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scene, setScene] = useState<Scene>("home");
  const [line, setLine] = useState(dialogue.home);
  const [typed, setTyped] = useState("");
  const [eyeFrame, setEyeFrame] = useState<"open" | "half" | "closed">("open");
  const [mouthFrame, setMouthFrame] = useState<"closed" | "half" | "open">("closed");
  const [characterReaction, setCharacterReaction] = useState<"head" | "chest" | null>(null);
  const [characterReactionRun, setCharacterReactionRun] = useState(0);
  const [dialogueRun, setDialogueRun] = useState(0);
  const [forcedHalfLine, setForcedHalfLine] = useState<string | null>(null);
  const [pendingPcLink, setPendingPcLink] = useState<PcLink | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(35);
  const bgmRef = useRef<HTMLAudioElement>(null);
  const bellAudioRef = useRef<HTMLAudioElement>(null);
  const bgmFadeRef = useRef<number | null>(null);
  const bellStopTimerRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const isTyping = loaded && typed.length < line.length;
  const displayedEyeFrame = forcedHalfLine ? "half" : eyeFrame;

  const fadeBgmTo = (targetVolume: number, duration: number, pauseAfter = false) => {
    const audio = bgmRef.current;
    if (!audio) return;
    if (bgmFadeRef.current !== null) window.cancelAnimationFrame(bgmFadeRef.current);

    const from = audio.volume;
    const target = Math.min(1, Math.max(0, targetVolume));
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progressValue = Math.min(1, (now - startedAt) / duration);
      const eased = progressValue * progressValue * (3 - 2 * progressValue);
      audio.volume = from + (target - from) * eased;
      if (progressValue < 1) {
        bgmFadeRef.current = window.requestAnimationFrame(tick);
      } else {
        bgmFadeRef.current = null;
        if (pauseAfter) audio.pause();
      }
    };

    bgmFadeRef.current = window.requestAnimationFrame(tick);
  };

  const startBgm = () => {
    const audio = bgmRef.current;
    if (!audio || !soundEnabled) return;
    audio.volume = 0;
    void audio.play().then(() => fadeBgmTo(soundVolume / 100, 1400)).catch(() => undefined);
  };

  const toggleSound = () => {
    const nextEnabled = !soundEnabled;
    setSoundEnabled(nextEnabled);
    if (nextEnabled) {
      if (loaded) {
        const audio = bgmRef.current;
        if (audio) {
          audio.volume = 0;
          void audio.play().then(() => fadeBgmTo(soundVolume / 100, 900)).catch(() => undefined);
        }
      }
      return;
    }

    fadeBgmTo(0, 700, true);
    if (bellStopTimerRef.current !== null) window.clearTimeout(bellStopTimerRef.current);
    if (bellAudioRef.current) {
      bellAudioRef.current.pause();
      bellAudioRef.current.currentTime = 0;
    }
  };

  const changeSoundVolume = (value: number) => {
    setSoundVolume(value);
    if (soundEnabled && loaded && bgmRef.current && !bgmRef.current.paused) fadeBgmTo(value / 100, 220);
    if (bellAudioRef.current) bellAudioRef.current.volume = value / 100;
  };

  const playBellSound = () => {
    const audio = bellAudioRef.current;
    if (!audio || !soundEnabled) return;
    if (bellStopTimerRef.current !== null) window.clearTimeout(bellStopTimerRef.current);
    audio.pause();
    audio.currentTime = 0;
    audio.volume = soundVolume / 100;
    void audio.play().catch(() => undefined);
    bellStopTimerRef.current = window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      bellStopTimerRef.current = null;
    }, 5000);
  };

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

  useEffect(() => () => {
    if (bgmFadeRef.current !== null) window.cancelAnimationFrame(bgmFadeRef.current);
    if (bellStopTimerRef.current !== null) window.clearTimeout(bellStopTimerRef.current);
  }, []);

  useEffect(() => {
    if (!loadingExiting) return;
    const timer = window.setTimeout(() => setShowLoading(false), 720);
    return () => window.clearTimeout(timer);
  }, [loadingExiting]);

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
  }, [line, loaded, dialogueRun]);

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

  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);

  useEffect(() => {
    if (!loaded || scene !== "home") return;

    let cancelled = false;
    let timer = 0;
    const scheduleDialogue = () => {
      if (cancelled) return;
      const wait = 18000 + Math.random() * 14000;
      timer = window.setTimeout(() => {
        if (!isTypingRef.current) {
          setLine((current) => {
            const candidates = ambientDialogue.filter((candidate) => candidate !== current);
            return candidates[Math.floor(Math.random() * candidates.length)] ?? current;
          });
        }
        scheduleDialogue();
      }, wait);
    };

    scheduleDialogue();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [loaded, scene]);

  useEffect(() => {
    if (!forcedHalfLine) return;
    if (line !== forcedHalfLine || typed === forcedHalfLine) {
      setForcedHalfLine(null);
    }
  }, [forcedHalfLine, line, typed]);

  useEffect(() => {
    if (!characterReaction) return;
    const timer = window.setTimeout(() => setCharacterReaction(null), 520);
    return () => window.clearTimeout(timer);
  }, [characterReaction, characterReactionRun]);

  const sceneTitle = useMemo(
    () => ({ home: "DINER", menu: "MENU BOOK", about: "ABOUT", links: "DESKTOP" })[scene],
    [scene],
  );

  const openScene = (next: Scene) => {
    setForcedHalfLine(null);
    setPendingPcLink(null);
    setScene(next);
    setLine(dialogue[next]);
  };

  const reactToObject = (nextLine: string) => {
    if (scene === "home") setLine(nextLine);
  };

  const reactToCharacter = (target: "head" | "chest") => {
    const lines = characterDialogue[target];
    const candidates = lines.filter((candidate) => candidate !== line);
    const pool = candidates.length > 0 ? candidates : lines;
    const nextLine = pool[Math.floor(Math.random() * pool.length)];
    setTyped("");
    setDialogueRun((current) => current + 1);
    setCharacterReactionRun((current) => current + 1);
    setCharacterReaction(target);
    setForcedHalfLine(target === "chest" ? nextLine : null);
    setLine(nextLine);
  };

  const openPcLink = (link: PcLink) => {
    setPendingPcLink(link);
    setTyped("");
    setDialogueRun((current) => current + 1);
    setLine(`${link.label}は外部サイトにつながっているよ。移動しても大丈夫なら、確認ボタンを押してね。`);
  };

  const confirmPcLink = () => {
    if (!pendingPcLink) return;
    window.open(pendingPcLink.href, "_blank", "noopener,noreferrer");
    setPendingPcLink(null);
  };

  const enterDiner = () => {
    if (progress < 100 || loadingExiting) return;
    startBgm();
    setLoaded(true);
    setLoadingExiting(true);
  };

  return (
    <>
      <audio ref={bgmRef} src="/audio/lofi-loop.mp3" loop preload="auto" />
      <audio ref={bellAudioRef} src="/audio/service-bell.mp3" preload="auto" />
      {showLoading && <LoadingScreen progress={progress} exiting={loadingExiting} onEnter={enterDiner} soundEnabled={soundEnabled} soundVolume={soundVolume} onToggleSound={toggleSound} onVolumeChange={changeSoundVolume} />}
      {loaded && <main className="site-shell">
      <header className="topbar">
        <button className="brand brand--button" onClick={() => openScene("home")} aria-label="ホームへ戻る">
          <span className="brand-logo"><img src="/branding/logo.png" alt="Rabbit Hole Diner" /></span>
        </button>
        <div className="topbar-actions">
          <SoundControls compact enabled={soundEnabled} volume={soundVolume} onToggle={toggleSound} onVolumeChange={changeSoundVolume} />
          <div className="open-sign"><span /> OPEN <small>00:00—05:00</small></div>
        </div>
      </header>

      <section className={`game-frame ${scene !== "home" ? "game-frame--overlay" : ""}`} aria-label="RabbitHole Diner 店内">
        <div className="scene-label">SCENE 01 / {sceneTitle}</div>
        <div className="cube-stage">
          <button
            className="cube-trigger"
            type="button"
            disabled={scene !== "home"}
            aria-label="窓の奥で回転する立方体に触れる"
            onMouseEnter={() => reactToObject("淡い立方体が、音もなく窓の奥で回り続けている。")}
            onClick={() => reactToObject("こつん……触れた感触だけが、少し遅れて返ってきた。")}
          >
            <span className="cube-float" aria-hidden="true">
              <span className="void-cube">
              <span className="cube-face cube-face--front" />
              <span className="cube-face cube-face--back" />
              <span className="cube-face cube-face--right" />
              <span className="cube-face cube-face--left" />
              <span className="cube-face cube-face--top" />
              <span className="cube-face cube-face--bottom" />
              </span>
            </span>
          </button>
        </div>
        <img className="scene-background" src="/backgrounds/rhd-main.png" alt="" aria-hidden="true" />
        <img className="scene-object-art scene-object-art--ring" src="/objects/ring.png" alt="" aria-hidden="true" />
        <img className="scene-object-art scene-object-art--menu" src="/objects/menu.png" alt="" aria-hidden="true" />
        <img className="scene-object-art scene-object-art--pc" src="/objects/pc.png" alt="" aria-hidden="true" />
        <img className="scene-object-art scene-object-art--picture" src="/objects/picture.png" alt="" aria-hidden="true" />

        <button className="hotspot bell" disabled={scene !== "home"} onMouseEnter={() => reactToObject("小さな呼び鈴。触れなくても、かすかに音が聞こえる気がする。")} onClick={() => { playBellSound(); reactToObject("ちりん……ご注文が決まったら、また鳴らしてね。"); }} aria-label="呼び鈴を鳴らす">
          <em>RING</em>
        </button>

        <button className="hotspot menu-object" disabled={scene !== "home"} onMouseEnter={() => reactToObject("使い込まれたメニューブック。今夜のおすすめが挟まっているみたい。")} onClick={() => openScene("menu")} aria-label="メニューブックを開く">
          <em>OPEN</em>
        </button>

        <button className="hotspot pc-object" disabled={scene !== "home"} onMouseEnter={() => reactToObject("小さなノートPC。画面の向こうは、店の外へ繋がっている。")} onClick={() => openScene("links")} aria-label="パソコンからリンクを見る">
          <em>OPEN</em>
        </button>

        <button className="hotspot picture" disabled={scene !== "home"} onMouseEnter={() => reactToObject("壁に掛けられた絵。近づくと、少しだけこちらを見返してくる。")} onClick={() => openScene("about")} aria-label="壁の絵からこのサイトについて見る">
          <em>ABOUT</em>
        </button>

        {scene !== "home" && <div className="scene-dimmer" aria-hidden="true" />}

        <aside className={`character ${scene !== "home" ? "character--overlay" : ""} ${characterReaction ? `character--reaction-${characterReaction}` : ""}`} aria-label="案内役のキャラクター">
          <div className="character-shadow" />
          <div className="character-art" aria-hidden="true" key={characterReactionRun}>
            <img className="character-base" src="/character/base.png" alt="" />
            {(["open", "half", "closed"] as const).map((frame) => (
              <img
                key={`eyes-${frame}`}
                className={`character-layer character-eyes ${displayedEyeFrame === frame ? "is-active" : ""}`}
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
            <button className="character-touch-zone character-touch-zone--head" type="button" onClick={() => reactToCharacter("head")} aria-label="キャラクターの頭に触れる" />
            <button className="character-touch-zone character-touch-zone--chest" type="button" onClick={() => reactToCharacter("chest")} aria-label="キャラクターの胸元に触れる" />
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
                    <button type="button" onClick={() => setLine(`${work.title}。${work.note}だよ。`)} className="work-link" key={work.title}>
                      <small>0{index + 1} / {work.tag}</small><strong>{work.title}</strong><span>{work.note}</span>
                    </button>
                  ))}
                </div>
                <div className="book-page">
                  <p className="book-kicker">DESSERT &amp; ART</p>
                  <h2>GALLERY</h2>
                  <button type="button" onClick={() => setLine(`${works[2].title}。${works[2].note}だよ。`)} className="work-link">
                    <small>03 / {works[2].tag}</small><strong>{works[2].title}</strong><span>{works[2].note}</span>
                  </button>
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
              <div className="pc-window">
                <div className="pc-titlebar">
                  <span className="pc-window-controls" aria-hidden="true"><i /><i /><i /></span>
                  <strong>RHD://OUTSIDE-LINE</strong>
                  <span className="pc-title-status">ONLINE</span>
                </div>
                <div className="pc-desktop">
                  <div className="pc-icon-grid" aria-label="外部リンク">
                    {pcLinks.map((link) => (
                      <button type="button" className={`pc-icon ${link.adult ? "pc-icon--adult" : ""}`} key={link.id} onClick={() => openPcLink(link)}>
                        <span className={`pc-icon-picture pc-icon-picture--${link.id}`} aria-hidden="true">{link.glyph}</span>
                        <strong>{link.label}</strong>
                        <small>{link.detail}</small>
                        {link.status && <span className="pc-icon-badge">{link.status}</span>}
                        {link.adult && <span className="pc-icon-badge pc-icon-badge--adult">18+</span>}
                      </button>
                    ))}
                  </div>
                  {pendingPcLink && (
                    <div className="pc-confirm-screen">
                      <section className={`pc-confirm ${pendingPcLink.adult ? "pc-confirm--adult" : ""}`} role="dialog" aria-modal="true" aria-labelledby="pc-confirm-title">
                        <p className="pc-confirm-kicker">EXTERNAL LINK</p>
                        <h3 id="pc-confirm-title">{pendingPcLink.label}</h3>
                        <p>これからRabbitHole Dinerを離れて、外部サイトへ移動します。開いても大丈夫？</p>
                        {pendingPcLink.adult && (
                          <div className="pc-adult-warning">
                            <strong>18+ / 成人向けコンテンツ</strong>
                            <p>リンク先には成人向けの内容が含まれます。18歳未満の方は移動しないでください。</p>
                          </div>
                        )}
                        <div className="pc-confirm-actions">
                          <button type="button" onClick={() => setPendingPcLink(null)}>戻る</button>
                          <button type="button" className="pc-confirm-open" onClick={confirmPcLink}>{pendingPcLink.adult ? "18歳以上として移動" : "外部サイトへ移動"} ↗</button>
                        </div>
                      </section>
                    </div>
                  )}
                </div>
                <div className="pc-taskbar">
                  <span className="pc-start">RHD</span>
                  <span className="pc-connection"><i /> NETWORK CONNECTED</span>
                  <time>00:07</time>
                </div>
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
      <footer className="site-footer"><span>© 2026 RABBIT PUNCH</span><span>BEST VIEWED AFTER DARK</span></footer>
      </main>}
    </>
  );
}
