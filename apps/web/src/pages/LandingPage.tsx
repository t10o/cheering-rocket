import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

import logoSrc from "@/assets/logo.svg";
import { RunnerCityScene } from "@/components/RunnerCityScene";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
};

const supporters = {
  title: "応援者ができること",
  description:
    "リアルタイムでランナーの位置とコンディションをキャッチ。遠く離れていても、あなたの声援をその瞬間に届けられます。",
  points: [
    "ライブマップで軌跡を追跡し、盛り上がるポイントを逃さない",
    "スプリットごとのハイライト動画や写真を共有して熱狂を記録",
    "応援メッセージを即時ポップアップ―走りながらでも読める短文サポート",
  ],
};

const runners = {
  title: "ランナーが体験できること",
  description:
    "走っている最中でもたったひとりじゃない。耳元で届く声援と、視界に浮かぶメッセージで、足取りはどんどん軽くなる。",
  points: [
    "バイブと音声ガイドで応援をリアルタイム受信",
    "ペースの変化を自動分析し、応援側へフィードバック",
    "完走後は軌跡と応援ログをまとめたリプレイムービーを生成",
  ],
};

const runnerCopy = "マラソンは、もう孤独じゃない";

const PANELS = ["hero", "supporters", "runners", "download"] as const;
const WHEEL_THRESHOLD = 160;
const TOUCH_THRESHOLD = 60;

export const LandingPage = () => {
  const panelCount = PANELS.length;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const progress = useMotionValue(0);
  const translateX = useTransform(
    progress,
    [0, 1],
    ["0%", `-${(panelCount - 1) * 100}%`],
  );

  const wheelAccumulatorRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const target = panelCount <= 1 ? 0 : activeIndex / (panelCount - 1);
    isAnimatingRef.current = true;
    const controls = animate(progress, target, {
      duration: 0.75,
      ease: [0.2, 1, 0.3, 1],
      onComplete: () => {
        isAnimatingRef.current = false;
        wheelAccumulatorRef.current = 0;
      },
    });
    return () => controls.stop();
  }, [activeIndex, panelCount, progress]);

  const goToIndex = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(panelCount - 1, next));
      if (clamped === activeIndex || isAnimatingRef.current) return;
      setActiveIndex(clamped);
    },
    [activeIndex, panelCount],
  );

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (isAnimatingRef.current) return;
      wheelAccumulatorRef.current += event.deltaY;
      if (Math.abs(wheelAccumulatorRef.current) < WHEEL_THRESHOLD) return;
      const direction = Math.sign(wheelAccumulatorRef.current);
      wheelAccumulatorRef.current = 0;
      goToIndex(activeIndex + direction);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (isAnimatingRef.current) return;
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        goToIndex(activeIndex + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goToIndex(activeIndex - 1);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const start = touchStartRef.current;
      if (start === null || isAnimatingRef.current) return;
      const current = event.touches[0]?.clientY ?? null;
      if (current === null) return;
      const delta = start - current;
      if (Math.abs(delta) < TOUCH_THRESHOLD) return;
      event.preventDefault();
      touchStartRef.current = current;
      goToIndex(activeIndex + Math.sign(delta));
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeIndex, goToIndex]);

  const sections = useMemo(
    () => [
      <HeroPanel key="hero" onPrimaryClick={() => goToIndex(panelCount - 1)} />, // index 0
      <SectionPanel
        key="supporters"
        id="supporters"
        eyebrow="Supporters"
        title="遠方からでも熱狂の中心に"
        description={supporters.description}
        points={supporters.points}
        accent="bg-finish-500"
      />,
      <SectionPanel
        key="runners"
        id="runners"
        eyebrow="Runners"
        title={runnerCopy}
        description={runners.description}
        points={runners.points}
        accent="bg-marathon-500"
        meta="アプリ側体験"
      />,
      <FinalPanel key="download" />,
    ],
    [goToIndex, panelCount],
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-white text-slate-900"
    >
      <RunnerCityScene progress={progress} />

      <div className="absolute inset-0 z-20 flex flex-col">
        <header className="pointer-events-auto flex items-center justify-between px-12 pt-6">
          <img
            src={logoSrc}
            alt="Cheering Rocket"
            className="h-12 w-auto select-none"
            draggable={false}
          />
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
            <button
              type="button"
              className="transition hover:text-slate-900"
              onClick={() => goToIndex(1)}
            >
              応援者向け
            </button>
            <button
              type="button"
              className="transition hover:text-slate-900"
              onClick={() => goToIndex(2)}
            >
              ランナー向け
            </button>
            <button
              type="button"
              className="transition hover:text-slate-900"
              onClick={() => goToIndex(panelCount - 1)}
            >
              アプリを入手
            </button>
          </nav>
        </header>

        <main className="relative flex-1">
          <motion.div style={{ x: translateX }} className="flex h-full w-full">
            {sections.map((section, index) => (
              <div
                key={PANELS[index]}
                className="flex h-full w-screen flex-shrink-0 items-stretch justify-center"
              >
                {section}
              </div>
            ))}
          </motion.div>
        </main>

        <footer className="pointer-events-none flex justify-center pb-6 text-xs uppercase tracking-[0.4em] text-slate-400">
          <span className="h-px w-16 bg-slate-200" />
          Scroll
        </footer>
      </div>
    </div>
  );
};

type SectionPanelProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  accent: string;
  meta?: string;
};

const HeroPanel = ({ onPrimaryClick }: { onPrimaryClick: () => void }) => (
  <section className="flex h-full w-full flex-col justify-center gap-8 px-10 py-24 md:px-24">
    <div className="max-w-2xl space-y-6">
      <motion.p
        {...fadeUp}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 backdrop-blur"
      >
        <span>遠隔応援 × ランニング</span>
        <span className="h-1 w-1 rounded-full bg-finish-500" />
        <span>リアルタイム体験</span>
      </motion.p>
      <motion.h1
        {...fadeUp}
        transition={{ duration: 1, delay: 0.1 }}
        className="text-balance text-4xl font-black leading-tight text-slate-900 md:text-6xl"
      >
        あなたの応援をロケットに詰めて打ち上げよう
      </motion.h1>
      <motion.p
        {...fadeUp}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-lg leading-relaxed text-slate-500 md:text-xl"
      >
        Cheering Rocket
        は、離れていてもランナーへ熱量を届ける新しい応援プラットフォーム。応援メッセージ、ライブマップ、ハイライト演出をひとつにまとめ、完走の瞬間まで寄り添います。
      </motion.p>
      <motion.div
        {...fadeUp}
        transition={{ duration: 1, delay: 0.3 }}
        className="flex flex-wrap items-center gap-4"
      >
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
          スクロールで世界観を体験
        </span>
      </motion.div>
    </div>
  </section>
);

const SectionPanel = ({
  id,
  eyebrow,
  title,
  description,
  points,
  accent,
  meta,
}: SectionPanelProps) => (
  <section
    id={id}
    className="flex h-full w-full items-center px-10 py-24 md:px-24"
  >
    <div className="max-w-3xl space-y-8">
      <motion.div
        {...fadeUp}
        className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-400"
      >
        <span className={clsx("inline-flex h-2 w-2 rounded-full", accent)} />
        {eyebrow}
        {meta ? (
          <Fragment>
            <span className="h-px w-6 bg-slate-200" />
            <span>{meta}</span>
          </Fragment>
        ) : null}
      </motion.div>
      <motion.h2
        {...fadeUp}
        transition={{ duration: 0.9, delay: 0.1 }}
        className="text-3xl font-bold leading-tight text-slate-900 md:text-5xl"
      >
        {title}
      </motion.h2>
      <motion.p
        {...fadeUp}
        transition={{ duration: 0.9, delay: 0.15 }}
        className="text-base leading-relaxed text-slate-500 md:text-lg"
      >
        {description}
      </motion.p>
      <motion.ul
        {...fadeUp}
        transition={{ duration: 0.9, delay: 0.25 }}
        className="space-y-4 text-sm text-slate-600 md:text-base"
      >
        {points.map((point, index) => (
          <li key={point} className="flex items-start gap-3">
            <span
              className={clsx(
                "mt-1 h-2 w-2 flex-shrink-0 rounded-full",
                accent,
              )}
            />
            <span>{point}</span>
            <motion.span
              className="ml-auto hidden text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 md:block"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
            >
              LIVE
            </motion.span>
          </li>
        ))}
      </motion.ul>
    </div>
  </section>
);

const FinalPanel = () => (
  <section
    id="download"
    className="flex h-full w-full flex-col justify-center gap-10 px-10 py-24 md:px-24"
  >
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.9, delay: 0.1 }}
      className="max-w-xl space-y-6"
    >
      <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-500 backdrop-blur">
        Ready to launch
      </p>
      <h2 className="text-balance text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
        いま、誰かの完走を加速させるロケットを点火しよう
      </h2>
      <p className="text-base text-slate-500 md:text-lg">
        応援者はブラウザから参加、ランナーはアプリで走行ログを共有。スタート前の準備からフィニッシュ後の余韻まで、すべてを同じ熱量で体験できます。
      </p>
    </motion.div>
    <motion.div
      {...fadeUp}
      transition={{ duration: 0.9, delay: 0.2 }}
      className="flex flex-wrap items-center gap-4"
    >
      <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
        * いつの日かリリース予定？？
      </span>
    </motion.div>
  </section>
);
