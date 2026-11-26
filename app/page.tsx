
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

export default function Page() {
  const [scene, setScene] = useState<Scene>('snow');
  const [day, setDay] = useState<number | null>(null);
  const [opened, setOpened] = useState<number[]>([]);

  // 讀取已拆開的禮物紀錄
  useEffect(() => {
    try {
      const v = JSON.parse(
        localStorage.getItem('xmas-opened') || '[]'
      );

      if (Array.isArray(v)) {
        setOpened(
          v.filter(
            n => Number.isInteger(n) && n >= 1 && n <= 24
          )
        );
      }
    } catch {}
  }, []);

  // 切換場景時回到頁面頂端
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [scene]);

  // Escape 關閉禮物小卡
  useEffect(() => {
    if (day === null) return;

    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDay(null);
    };

    window.addEventListener('keydown', fn);

    return () =>
      window.removeEventListener('keydown', fn);
  }, [day]);

  // 打開每日禮物
  function openGift(n: number) {
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

  // 單擊打開禮物盒
  function tapBox() {
    setScene('home');
  }

  // 重看故事
  function restartStory() {
    setScene('snow');
    setDay(null);
  }

  const card =
    day === null
      ? null
      : gifts.find(g => g.day === day);

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
                已拆開 {opened.length} / 24 份禮物
              </p>

              <div className={styles.grid}>
                {Array.from(
                  { length: 24 },
                  (_, i) => i + 1
                ).map(n => (
                  <button
                    key={n}
                    className={`${styles.gift} ${
                      opened.includes(n)
                        ? styles.opened
                        : ''
                    }`}
                    onClick={() => openGift(n)}
                    aria-label={`12月${n}日禮物`}
                  >
                    <span>🎁</span>

                    <b>
                      {String(n).padStart(2, '0')}
                    </b>

                    {opened.includes(n) && (
                      <small>♡</small>
                    )}
                  </button>
                ))}
              </div>

            </section>
          </>
        )}

        <footer className={styles.footer}>
          with courage, unfold.
        </footer>

      </article>

      {/* 每日禮物小卡 */}
      {day !== null && (
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

    </main>
  );
}
