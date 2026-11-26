
'use client';

import { useEffect, useState } from 'react';
import { letter } from '../data/letter';
import { gifts } from '../data/gifts';
import styles from './christmas.module.css';

function Picture({
  src,
  alt,
  className
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [attempt, setAttempt] = useState(0);
  const base = src.replace(/\.[^/.]+$/, '');

  const candidates = [...new Set([
    src,
    `${base}.png`,
    `${base}.jpg`,
    `${base}.jpeg`,
    `${base}.webp`,
    '/placeholder.png'
  ])];

  return (
    <img
      className={className}
      src={candidates[attempt]}
      alt={alt}
      onError={() =>
        setAttempt(v =>
          Math.min(v + 1, candidates.length - 1)
        )
      }
    />
  );
}

type Scene =
  | 'snow'
  | 'umbrella'
  | 'envelope'
  | 'letter'
  | 'box'
  | 'home';

const imagePaths = {
  snow: '/scenes/snow.webp',
  umbrella: '/scenes/umbrella.webp',
  envelope: '/scenes/letter.webp',
  box: '/scenes/box.webp',
  home: '/scenes/home.webp'
};

const giftImage = (n: number) =>
  `/gifts/day${String(n).padStart(2, '0')}.webp`;

// 聖誕倒數日曆設定
const CHRISTMAS_YEAR = 2026;

// 測試模式：正式上線請保持 false
const TEST_MODE = false;
const TEST_DAY = 1;

// 計算目前台灣時間已解鎖的天數
function getUnlockedDay() {
  if (TEST_MODE) {
    return Math.max(0, Math.min(TEST_DAY, 24));
  }

  const now = Date.now();

  const start = new Date(
    `${CHRISTMAS_YEAR}-12-01T00:00:00+08:00`
  ).getTime();

  const elapsed = Math.floor(
    (now - start) / 86400000
  ) + 1;

  return Math.max(0, Math.min(elapsed, 24));
}

export default function Page() {
  const [scene, setScene] = useState<Scene>('snow');
  const [day, setDay] = useState<number | null>(null);
  const [opened, setOpened] = useState<number[]>([]);
  const [unlockedDay, setUnlockedDay] = useState(0);
  const [lockedDay, setLockedDay] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  // 讀取已拆開的禮物及故事進度
  useEffect(() => {
    try {
      const v = JSON.parse(
        localStorage.getItem('xmas-opened') || '[]'
      );

      if (Array.isArray(v)) {
        setOpened(
          [...new Set<number>(
            v.filter(
              n => Number.isInteger(n) && n >= 1 && n <= 24
            )
          )]
        );
      }

      if (
        localStorage.getItem('xmas-story-completed') === 'true'
      ) {
        setScene('home');
      }
    } catch {}

    setUnlockedDay(getUnlockedDay());
    setReady(true);
  }, []);

  // 每秒檢查日期，跨過凌晨自動解鎖
  useEffect(() => {
    const updateDate = () => {
      setUnlockedDay(getUnlockedDay());
    };

    updateDate();

    const timer = window.setInterval(updateDate, 1000);

    window.addEventListener('focus', updateDate);
    document.addEventListener('visibilitychange', updateDate);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', updateDate);
      document.removeEventListener(
        'visibilitychange',
        updateDate
      );
    };
  }, []);

  // 切換場景時回到頁面頂端
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scene]);

  // 提前載入下一幕圖片
  useEffect(() => {
    const nextImages: Partial<Record<Scene, string>> = {
      snow: imagePaths.umbrella,
      umbrella: imagePaths.envelope,
      envelope: imagePaths.box,
      letter: imagePaths.box,
      box: imagePaths.home
    };

    const next = nextImages[scene];

    if (next) {
      const img = new Image();
      img.src = next;
    }
  }, [scene]);

  // 提前載入當天的禮物圖片
  useEffect(() => {
    if (scene === 'home' && unlockedDay > 0) {
      const img = new Image();
      img.src = giftImage(unlockedDay);
    }
  }, [scene, unlockedDay]);

  // Escape 關閉小卡片或上鎖提示
  useEffect(() => {
    if (day === null && lockedDay === null) return;

    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDay(null);
        setLockedDay(null);
      }
    };

    window.addEventListener('keydown', fn);

    return () =>
      window.removeEventListener('keydown', fn);
  }, [day, lockedDay]);

  // 打開每日禮物
  function openGift(n: number) {
    const currentUnlockedDay = getUnlockedDay();

    setUnlockedDay(currentUnlockedDay);

    // 日期還沒到，不可以偷拆
    if (n > currentUnlockedDay) {
      setDay(null);
      setLockedDay(n);
      return;
    }

    setLockedDay(null);
    setDay(n);

    const next = [...new Set([...opened, n])];
    setOpened(next);

    try {
      localStorage.setItem(
        'xmas-opened',
        JSON.stringify(next)
      );
    } catch {}
  }

  // 單擊打開禮物盒並記住故事進度
  function tapBox() {
    setScene('home');

    try {
      localStorage.setItem(
        'xmas-story-completed',
        'true'
      );
    } catch {}
  }

  // 重看故事
  function restartStory() {
    setScene('snow');
    setDay(null);
    setLockedDay(null);
  }

  const card =
    day === null
      ? null
      : gifts.find(g => g.day === day);

  // 不計算測試期間提前拆開的未解鎖禮物
  const openedCount = opened.filter(
    n => n <= unlockedDay
  ).length;

  if (!ready) {
    return (
      <main className={styles.shell}>
        <article className={styles.book}>
          <section className={styles.caption}>
            <p>Preparing your little happiness...</p>
          </section>
        </article>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <article className={styles.book}>

        <header className={styles.header}>
          <span>✦ CHRISTMAS ✦</span>
          <button onClick={restartStory}>
            重看故事 ↻
          </button>
        </header>

        {/* 第一幕：EMO 怪獸 */}
        {scene === 'snow' && (
          <>
            <button
              className={styles.picture}
              onClick={() => setScene('umbrella')}
              aria-label="繼續故事"
            >
              <Picture
                key={scene}
                src={imagePaths.snow}
                alt="EMO怪獸"
              />
            </button>

            <section className={styles.caption}>
              <h1>又有人在偷偷emo</h1>
              <p>每次都喜歡自己躲起來</p>

              <button
                className={styles.primary}
                onClick={() => setScene('umbrella')}
              >
                點一下
              </button>
            </section>
          </>
        )}

        {/* 第二幕：小女生撐傘 */}
        {scene === 'umbrella' && (
          <>
            <button
              className={styles.picture}
              onClick={() => setScene('envelope')}
              aria-label="繼續故事"
            >
              <Picture
                key={scene}
                src={imagePaths.umbrella}
                alt="小女生撐傘"
              />
            </button>

            <section className={styles.caption}>
              <button
                className={styles.primary}
                onClick={() => setScene('envelope')}
              >
                來哄你啦
              </button>
            </section>
          </>
        )}

        {/* 第三幕：小女生遞出信件 */}
        {scene === 'envelope' && (
          <>
            <button
              className={styles.picture}
              onClick={() => setScene('letter')}
              aria-label="打開信件"
            >
              <Picture
                key={scene}
                src={imagePaths.envelope}
                alt="小女生遞出一封信"
              />
            </button>

            <section className={styles.caption}>
              <button
                className={styles.primary}
                onClick={() => setScene('letter')}
              >
                打開信件
              </button>
            </section>
          </>
        )}

        {/* 第四幕：閱讀信件 */}
        {scene === 'letter' && (
          <section className={styles.letter}>

            <div className={styles.letterLabel}>
              A LETTER FOR YOU
            </div>

            <div className={styles.words}>
              {letter}
            </div>

            <button
              className={styles.primary}
              onClick={() => setScene('box')}
            >
              還有一份禮物給你
            </button>

          </section>
        )}

        {/* 第五幕：小女生送出禮物盒 */}
        {scene === 'box' && (
          <>
            <button
              className={styles.picture}
              onClick={tapBox}
              aria-label="打開禮物盒"
            >
              <Picture
                key={scene}
                src={imagePaths.box}
                alt="小女生送出禮物盒"
              />
            </button>

            <section className={styles.caption}>
              <h1>給你準備了一份禮物</h1>

              <button
                className={styles.primary}
                onClick={tapBox}
              >
                打開你的禮物
              </button>
            </section>
          </>
        )}

        {/* 第六幕：聖誕倒數日曆 */}
        {scene === 'home' && (
          <>
            <div className={styles.hero}>

              <Picture
                key={scene}
                src={imagePaths.home}
                alt="溫暖的聖誕小屋"
              />

              <div className={styles.heroText}>
                <h1>24 Days of Happiness</h1>
                <p>每天拆開一點點快樂</p>
              </div>

            </div>

            <section className={styles.calendar}>

              <p>
                已拆開 {openedCount} / 24 份禮物
              </p>

              <div className={styles.grid}>
                {Array.from(
                  { length: 24 },
                  (_, i) => i + 1
                ).map(n => {
                  const isLocked = n > unlockedDay;
                  const isOpened =
                    !isLocked && opened.includes(n);

                  return (
                    <button
                      key={n}
                      className={[
                        styles.gift,
                        isLocked ? styles.locked : '',
                        isOpened ? styles.opened : ''
                      ].join(' ')}
                      onClick={() => openGift(n)}
                      aria-label={
                        `12月${n}日禮物` +
                        (isLocked ? '，尚未解鎖' : '')
                      }
                    >
                      <span>
                        {isLocked ? '🔒' : '🎁'}
                      </span>

                      <b>
                        {String(n).padStart(2, '0')}
                      </b>

                      {isOpened && (
                        <small>♡</small>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className={styles.calendarNote}>
                {unlockedDay === 0
                  ? '12 月 1 日開始每天拆開一點點快樂'
                  : unlockedDay < 24
                    ? 'ＨＡＰＰＹ ＣＨＲＩＳＴＭＡＳ！'
                    : '聖誕快樂小胖子'}
              </p>

            </section>
          </>
        )}

        <footer className={styles.footer}>
          with courage, unfold.
        </footer>

      </article>

      {/* 每日禮物小卡 */}
      {day !== null && day <= unlockedDay && (
        <div
          className={styles.backdrop}
          onClick={() => setDay(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`12月${day}日的小卡`}
            className={styles.modal}
            onClick={e => e.stopPropagation()}
          >

            <button
              autoFocus
              className={styles.close}
              onClick={() => setDay(null)}
              aria-label="關閉"
            >
              ×
            </button>

            <div className={styles.letterLabel}>
              DECEMBER {String(day).padStart(2, '0')}
            </div>

            <Picture
              key={day}
              className={styles.giftImage}
              src={giftImage(day)}
              alt={`第${day}天禮物插畫`}
            />

            <h2>
              {card?.title || `Day ${day}`}
            </h2>

            <p className={styles.words}>
              {card?.message || '小卡片準備中 ♡'}
            </p>

            <button
              className={styles.primary}
              onClick={() => setDay(null)}
            >
              收好今天的快樂
            </button>

          </section>
        </div>
      )}

      {/* 尚未解鎖的禮物提示 */}
      {lockedDay !== null && (
        <div
          className={styles.backdrop}
          onClick={() => setLockedDay(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="禮物尚未解鎖"
            className={`${styles.modal} ${styles.lockedModal}`}
            onClick={e => e.stopPropagation()}
          >

            <button
              autoFocus
              className={styles.close}
              onClick={() => setLockedDay(null)}
              aria-label="關閉"
            >
              ×
            </button>

            <div className={styles.letterLabel}>
              NOT YET
            </div>

            <div className={styles.lockIcon}>
              🔒
            </div>

            <h2>是不是想偷拆</h2>

            <p className={styles.words}>
              這份禮物還沒到時間啦
              {'\n\n'}
              12 月 {lockedDay} 日 00:00 才可以打開
              {'\n\n'}
              乖哈
            </p>

            <button
              className={styles.primary}
              onClick={() => setLockedDay(null)}
            >
              關閉
            </button>

          </section>
        </div>
      )}

    </main>
  );
}
