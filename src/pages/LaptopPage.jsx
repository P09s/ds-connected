// src/pages/LaptopPage.jsx — Demon Slayer Full Boss Progression
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePartySocket } from '../hooks/usePartySocket'

// ─── BOSS ROSTER ─────────────────────────────────────────────────────────────
// Images go in /public/demons/  e.g. daki.png, gyutaro.png, etc.
// Set image:null if you haven't uploaded yet — falls back to SVG silhouette
const BOSSES = [
  {
    id: 'daki',
    en: 'Daki',
    jp: '堕姫',
    rank: 'Upper Moon Six',
    rankJp: '上弦の陸',
    hp: 400,
    image: '/demons/daki.png',
    color: '#c0392b',
    glow: 'rgba(192,57,43,0.7)',
    special: 'daki', // triggers Gyutaro at 50% HP
  },
  {
    id: 'gyutaro',
    en: 'Gyutaro',
    jp: '妓夫太郎',
    rank: 'Upper Moon Six',
    rankJp: '上弦の陸',
    hp: 500,
    image: '/demons/gyutaro.png',
    color: '#8b0000',
    glow: 'rgba(139,0,0,0.7)',
    special: 'gyutaro',
  },
  {
    id: 'gyokko',
    en: 'Gyokko',
    jp: '玉壺',
    rank: 'Upper Moon Five',
    rankJp: '上弦の伍',
    hp: 600,
    image: '/demons/gyokko.png',
    color: '#1a6b8a',
    glow: 'rgba(26,107,138,0.7)',
  },
  {
    id: 'hantengu',
    en: 'Hantengu',
    jp: '半天狗',
    rank: 'Upper Moon Four',
    rankJp: '上弦の肆',
    hp: 700,
    image: '/demons/hantengu.png',
    color: '#6b3a8a',
    glow: 'rgba(107,58,138,0.7)',
  },
  {
    id: 'akaza',
    en: 'Akaza',
    jp: '猗窩座',
    rank: 'Upper Moon Three',
    rankJp: '上弦の参',
    hp: 850,
    image: '/demons/akaza.png',
    color: '#e74c3c',
    glow: 'rgba(231,76,60,0.8)',
  },
  {
    id: 'doma',
    en: 'Doma',
    jp: '童磨',
    rank: 'Upper Moon Two',
    rankJp: '上弦の弐',
    hp: 1000,
    image: '/demons/doma.png',
    color: '#c9a84c',
    glow: 'rgba(201,168,76,0.7)',
  },
  {
    id: 'kokushibo',
    en: 'Kokushibo',
    jp: '黒死牟',
    rank: 'Upper Moon One',
    rankJp: '上弦の壱',
    hp: 1200,
    image: '/demons/kokushibo.png',
    color: '#8b0000',
    glow: 'rgba(139,0,0,0.9)',
  },
  {
    id: 'muzan',
    en: 'Muzan Kibutsuji',
    jp: '鬼舞辻無惨',
    rank: 'Demon King',
    rankJp: '鬼の王',
    hp: 2000,
    image: '/demons/muzan.png',
    color: '#000000',
    glow: 'rgba(180,0,0,0.9)',
    isFinal: true,
  },
]

// ─── SLASH FX ─────────────────────────────────────────────────────────────────
function spawnSlash(container, x, y, angle, intensity, color = '#e74c3c') {
  const len = Math.min(130 + intensity * 8, 500)
  const thick = Math.max(3, Math.min(intensity * 0.6, 18))
  const r = color

  const el = document.createElement('div')
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;
    width:${len}px;height:${thick}px;
    transform:translate(-50%,-50%) rotate(${angle}deg);
    border-radius:999px;pointer-events:none;
    background:linear-gradient(90deg,transparent,${r}44 15%,${r}f0 38%,#fff 50%,${r}f0 62%,${r}44 85%,transparent);
    box-shadow:0 0 ${thick*2}px ${r},0 0 ${thick*7}px ${r}88,0 0 ${thick*15}px ${r}44;
    z-index:50;`
  el.classList.add('slash-el')
  container.appendChild(el)

  const rs = 60 + intensity * 3
  const rip = document.createElement('div')
  rip.style.cssText = `
    position:absolute;left:${x - rs/2}px;top:${y - rs/2}px;
    width:${rs}px;height:${rs}px;border-radius:50%;
    border:2px solid ${r}cc;pointer-events:none;
    box-shadow:0 0 22px ${r}88;z-index:49;`
  rip.classList.add('ripple-el')
  container.appendChild(rip)

  for (let i = 0; i < Math.floor(5 + intensity * 0.5); i++) {
    const p = document.createElement('div')
    const spread = (Math.random() - 0.5) * 130
    const dist = 40 + Math.random() * 100
    const rad = ((angle + spread) * Math.PI) / 180
    const size = 2 + Math.random() * 7
    p.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:${size}px;height:${size}px;border-radius:50%;
      background:${Math.random() > 0.5 ? r : '#ffcc44'}${Math.floor((0.5 + Math.random() * 0.5) * 255).toString(16).padStart(2,'0')};
      box-shadow:0 0 8px ${r};pointer-events:none;z-index:48;
      --tx:${Math.cos(rad)*dist}px;--ty:${Math.sin(rad)*dist}px;`
    p.classList.add('particle-el')
    container.appendChild(p)
    setTimeout(() => p.remove(), 580)
  }
  setTimeout(() => { el.remove(); rip.remove() }, 800)
}

function spawnDamage(container, x, y, damage, color = '#fff') {
  const el = document.createElement('div')
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y - 44}px;
    transform:translateX(-50%);pointer-events:none;z-index:80;
    font-family:'Cinzel',serif;font-weight:900;
    font-size:${28 + damage * 0.4}px;color:${color};
    text-shadow:0 0 14px rgba(231,76,60,.95),0 0 35px rgba(180,0,0,.8),0 0 3px #000;
    letter-spacing:.04em;`
  el.textContent = `-${Math.floor(damage)}`
  el.classList.add('dmg-el')
  container.appendChild(el)
  setTimeout(() => el.remove(), 1000)
}

// ─── DEMON IMAGE with fallback silhouette ─────────────────────────────────────
function DemonImage({ boss, hit, dead }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div style={{ position: 'relative', width: '280px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!imgFailed && boss.image ? (
        <img
          src={boss.image}
          alt={boss.en}
          onError={() => setImgFailed(true)}
          style={{
            maxWidth: '280px', maxHeight: '340px',
            objectFit: 'contain',
            filter: dead
              ? 'grayscale(1) brightness(0.4)'
              : hit
              ? `brightness(3) saturate(0) drop-shadow(0 0 30px ${boss.color})`
              : `drop-shadow(0 0 20px ${boss.glow}) drop-shadow(0 0 40px ${boss.glow}55)`,
            transition: 'filter 0.2s',
          }}
        />
      ) : (
        // Fallback SVG silhouette
        <svg viewBox="0 0 220 340" width="220" height="340">
          <defs>
            <radialGradient id={`fg-${boss.id}`} cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor={boss.color} stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#0a0005" stopOpacity="1"/>
            </radialGradient>
            <filter id={`fglow-${boss.id}`}>
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <ellipse cx="110" cy="320" rx="75" ry="13" fill="rgba(100,0,0,.12)"/>
          <ellipse cx="110" cy="240" rx="58" ry="75" fill={`url(#fg-${boss.id})`} filter={`url(#fglow-${boss.id})`}/>
          <ellipse cx="110" cy="116" rx="52" ry="57" fill={`url(#fg-${boss.id})`} filter={`url(#fglow-${boss.id})`}/>
          <path d="M76 86 Q55 52 47 26 Q64 50 79 78" fill="#180006" stroke={boss.color} strokeWidth="2"/>
          <path d="M144 86 Q165 52 173 26 Q156 50 141 78" fill="#180006" stroke={boss.color} strokeWidth="2"/>
          <ellipse cx="87" cy="112" rx="14" ry="10" fill={boss.color} style={{filter:`drop-shadow(0 0 8px ${boss.color})`}}/>
          <ellipse cx="133" cy="112" rx="14" ry="10" fill={boss.color} style={{filter:`drop-shadow(0 0 8px ${boss.color})`}}/>
          <ellipse cx="87" cy="112" rx="5" ry="7" fill="#000"/>
          <ellipse cx="133" cy="112" rx="5" ry="7" fill="#000"/>
          <path d="M87 140 Q110 160 133 140" stroke={boss.color} strokeWidth="3" fill="none" strokeLinecap="round"/>
          <polygon points="100,142 96,160 104,142" fill="#ddd0b0" opacity=".85"/>
          <polygon points="114,143 110,162 118,143" fill="#ddd0b0" opacity=".85"/>
          <path d="M54 198 Q18 240 10 287" stroke="#180006" strokeWidth="22" fill="none" strokeLinecap="round"/>
          <path d="M166 198 Q202 240 210 287" stroke="#180006" strokeWidth="22" fill="none" strokeLinecap="round"/>
          {hit && <ellipse cx="110" cy="162" rx="70" ry="90" fill={`${boss.color}33`}/>}
          {dead && <text x="110" y="180" textAnchor="middle" fill={boss.color} fontSize="40" fontFamily="serif" opacity="0.8">滅</text>}
        </svg>
      )}

      {/* Hit flash overlay */}
      {hit && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '8px',
          background: `radial-gradient(circle, ${boss.color}44, transparent 70%)`,
          pointerEvents: 'none',
        }}/>
      )}
    </div>
  )
}

// ─── BOSS DISPLAY ─────────────────────────────────────────────────────────────
function BossUI({ boss, hp, maxHp, hit, dead, connected, bossIndex, totalBosses }) {
  const pct = Math.max(0, (hp / maxHp) * 100)
  const isLow = pct < 30

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
      width: '100%', maxWidth: '500px',
    }}>
      {/* Rank + Name */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '0.42rem', letterSpacing: '0.5em', textTransform: 'uppercase',
          color: `${boss.color}99`, fontFamily: "'Cinzel',serif", marginBottom: '3px',
        }}>
          {boss.rankJp} · {boss.rank}
        </div>
        <div style={{
          fontFamily: "'Shippori Mincho',serif", fontSize: 'clamp(1.4rem,3vw,2rem)',
          fontWeight: 800, color: boss.isFinal ? '#fff' : boss.color,
          textShadow: `0 0 30px ${boss.glow}, 0 0 60px ${boss.glow}55`,
          letterSpacing: '0.12em',
        }}>{boss.jp}</div>
        <div style={{
          fontFamily: "'Cinzel',serif", fontSize: '0.6rem',
          letterSpacing: '0.4em', color: `${boss.color}99`, textTransform: 'uppercase',
        }}>{boss.en}</div>
      </div>

      {/* HP Bar */}
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '0.44rem', letterSpacing: '0.4em', color: `${boss.color}88`, fontFamily: "'Cinzel',serif" }}>生命力</span>
          <span style={{ fontSize: '0.44rem', letterSpacing: '0.2em', color: `${boss.color}88`, fontFamily: "'Cinzel',serif" }}>{Math.max(0, hp)} / {maxHp}</span>
        </div>
        <div style={{
          width: '100%', height: '8px',
          background: 'rgba(80,0,0,0.25)',
          borderRadius: '1px', overflow: 'hidden',
          border: `1px solid ${boss.color}33`,
          boxShadow: `0 0 10px ${boss.color}22`,
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: isLow
              ? `linear-gradient(90deg,#6b0000,#e74c3c)`
              : `linear-gradient(90deg,${boss.color}88,${boss.color})`,
            boxShadow: `0 0 12px ${boss.color}`,
            transition: 'width 0.3s ease-out',
          }}/>
        </div>
        {/* Boss order dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
          {BOSSES.map((b, i) => (
            <div key={b.id} style={{
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: i < bossIndex ? '#8b0000' : i === bossIndex ? boss.color : 'rgba(255,255,255,0.1)',
              boxShadow: i === bossIndex ? `0 0 8px ${boss.color}` : 'none',
              transition: 'all 0.3s',
            }}/>
          ))}
        </div>
      </div>

      {/* Demon */}
      <div
        className={hit ? 'enemy-hit' : dead ? 'enemy-death' : 'enemy-float'}
        style={{
          opacity: connected ? 1 : 0.25,
          transition: 'opacity 0.6s',
          filter: connected ? 'none' : 'saturate(0)',
          position: 'relative',
        }}
      >
        <DemonImage boss={boss} hit={hit} dead={dead}/>

        {!connected && !dead && (
          <div className="breathe" style={{
            position: 'absolute', bottom: '-32px', left: '50%', transform: 'translateX(-50%)',
            fontSize: '0.48rem', letterSpacing: '0.35em',
            color: 'rgba(180,0,0,0.5)', whiteSpace: 'nowrap', fontFamily: "'Cinzel',serif",
          }}>
            ── AWAITING SLAYER ──
          </div>
        )}

        {dead && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            fontFamily: "'Shippori Mincho',serif", fontSize: '2.4rem', fontWeight: 800,
            color: boss.color, letterSpacing: '0.2em', whiteSpace: 'nowrap',
            textShadow: `0 0 30px ${boss.glow}, 0 0 70px ${boss.glow}55`,
          }}>滅 · SLAIN</div>
        )}
      </div>
    </div>
  )
}

// ─── VICTORY SCREEN ───────────────────────────────────────────────────────────
function VictoryScreen({ onRestart }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center,#1a0000,#000)',
    }}>
      <div style={{
        fontFamily: "'Shippori Mincho',serif", fontSize: 'clamp(1.5rem,5vw,3rem)',
        fontWeight: 800, color: '#c9a84c', letterSpacing: '0.15em', textAlign: 'center',
        textShadow: '0 0 40px rgba(201,168,76,0.8)', marginBottom: '16px',
        animation: 'fade-in 1s ease-out',
      }}>
        全ての鬼を滅した
      </div>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 'clamp(0.8rem,2vw,1.1rem)',
        color: 'rgba(201,168,76,0.6)', letterSpacing: '0.4em',
        marginBottom: '48px', animation: 'fade-in 1.4s ease-out',
      }}>ALL DEMONS SLAIN</div>
      <button onClick={onRestart} style={{
        padding: '16px 48px',
        background: 'linear-gradient(135deg,#8b0000,#6b0000)',
        border: '1px solid rgba(231,76,60,0.7)', borderRadius: '2px',
        color: '#fff', fontFamily: "'Cinzel',serif",
        fontSize: '0.8rem', letterSpacing: '0.4em',
        cursor: 'pointer', boxShadow: '0 0 30px rgba(139,0,0,0.5)',
      }}>
        再戦 · FIGHT AGAIN
      </button>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LaptopPage() {
  const { roomId } = useParams()
  const canvasRef = useRef(null)

  // Boss state
  const [bossIndex, setBossIndex] = useState(0)
  const [hp, setHp] = useState(BOSSES[0].hp)
  const hpRef = useRef(BOSSES[0].hp)
  const bossIndexRef = useRef(0)

  // Phase state
  const [dakiPhaseOver, setDakiPhaseOver] = useState(false) // Daki reached 50%, Gyutaro injected
  const dakiPhaseRef = useRef(false)

  // UI state
  const [hit, setHit] = useState(false)
  const [dead, setDead] = useState(false)
  const deadRef = useRef(false)
  const [shaking, setShaking] = useState(false)
  const [connected, setConnected] = useState(false)
  const [slashCount, setSlashCount] = useState(0)
  const [victory, setVictory] = useState(false)

  // Transition text
  const [transition, setTransition] = useState(null) // { text, sub }

  const shake = useCallback(() => {
    setShaking(true); setTimeout(() => setShaking(false), 440)
  }, [])

  const trigHit = useCallback(() => {
    setHit(true); setTimeout(() => setHit(false), 440)
  }, [])

  const showTransition = useCallback((text, sub, duration = 2500) => {
    setTransition({ text, sub })
    setTimeout(() => setTransition(null), duration)
  }, [])

  const advanceBoss = useCallback((nextIndex) => {
    if (nextIndex >= BOSSES.length) {
      setVictory(true)
      return
    }
    const next = BOSSES[nextIndex]
    deadRef.current = false
    bossIndexRef.current = nextIndex
    hpRef.current = next.hp
    setBossIndex(nextIndex)
    setHp(next.hp)
    setDead(false)
    showTransition(next.jp, `${next.rankJp} · ${next.rank} APPEARS`)
  }, [showTransition])

  const slashRef = useRef(null)
  slashRef.current = (data) => {
    if (deadRef.current || victory) return
    setConnected(true)
    setSlashCount(c => c + 1)

    const w = canvasRef.current?.offsetWidth || window.innerWidth
    const h = canvasRef.current?.offsetHeight || window.innerHeight
    const x = data.x * w
    const y = data.y * h
    const boss = BOSSES[bossIndexRef.current]

    if (canvasRef.current) spawnSlash(canvasRef.current, x, y, data.angle, data.intensity, boss.color)

    const dmg = Math.floor(10 + data.intensity * 1.8)
    const newHp = Math.max(0, hpRef.current - dmg)
    hpRef.current = newHp
    setHp(newHp)

    if (canvasRef.current) spawnDamage(canvasRef.current, x, y, dmg, boss.color === '#000000' ? '#e74c3c' : '#fff')

    shake()
    trigHit()

    // Daki special: at 50% HP, inject Gyutaro next
    if (boss.special === 'daki' && !dakiPhaseRef.current && newHp <= boss.hp * 0.5) {
      dakiPhaseRef.current = true
      setDakiPhaseOver(true)
      deadRef.current = true
      setDead(true)
      showTransition('妓夫太郎', 'GYUTARO EMERGES · 上弦の陸 · 真の力', 3000)
      setTimeout(() => advanceBoss(1), 3000)
      return
    }

    if (newHp <= 0 && !deadRef.current) {
      deadRef.current = true
      setDead(true)
      const isLast = bossIndexRef.current === BOSSES.length - 1
      if (isLast) {
        setTimeout(() => setVictory(true), 2000)
      } else {
        const nextIdx = bossIndexRef.current + 1
        const next = BOSSES[nextIdx]
        showTransition(next.jp, `${next.rankJp} · ${next.rank} APPEARS`, 2800)
        setTimeout(() => advanceBoss(nextIdx), 2800)
      }
    }
  }

  const { connState, publish } = usePartySocket(roomId, (event, data) => {
    if (event === 'slash') slashRef.current?.(data)
    if (event === 'join') { setConnected(true); publish('ready', { t: Date.now() }) }
  })

  const handleRestart = useCallback(() => {
    bossIndexRef.current = 0
    hpRef.current = BOSSES[0].hp
    deadRef.current = false
    dakiPhaseRef.current = false
    setBossIndex(0)
    setHp(BOSSES[0].hp)
    setDead(false)
    setVictory(false)
    setDakiPhaseOver(false)
    setSlashCount(0)
  }, [])

  const boss = BOSSES[bossIndex]

  return (
    <div className={shaking ? 'screen-shake' : ''} style={{
      position: 'fixed', inset: 0, overflow: 'hidden',
      fontFamily: "'Cinzel',serif",
    }}>
      {/* ── Infinity Castle Background ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/backgrounds/infinity-castle.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'brightness(0.18) saturate(0.6)',
        zIndex: 0,
      }}/>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 30%,rgba(30,0,8,0.5),rgba(5,0,2,0.85) 70%)',
      }}/>

      {/* Slash canvas */}
      <div ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40 }}/>

      {/* ── TOP HUD ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px',
        background: 'linear-gradient(180deg,rgba(5,0,2,0.96),transparent)',
        borderBottom: `1px solid ${connected ? boss.color + '55' : 'rgba(80,0,0,.15)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: connected ? boss.color : '#6b0000',
            boxShadow: connected ? `0 0 14px ${boss.glow}` : 'none',
          }}/>
          <span style={{ fontSize: '0.48rem', letterSpacing: '0.35em', color: connected ? `${boss.color}cc` : 'rgba(180,0,0,.5)', textTransform: 'uppercase' }}>
            {connected ? '刀 · BLADE CONNECTED' : `待機中 · WAITING · ${connState}`}
          </span>
        </div>
        <div style={{ fontFamily: "'Shippori Mincho',serif", fontSize: '1rem', fontWeight: 700, color: 'rgba(201,168,76,0.3)', letterSpacing: '0.3em' }}>
          鬼滅の刃
        </div>
        <div style={{ fontSize: '0.48rem', letterSpacing: '0.3em', color: 'rgba(180,0,0,.5)' }}>
          {slashCount} 斬 CUTS
        </div>
      </div>

      {/* ── CENTER BOSS AREA ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingTop: '70px', paddingBottom: '20px',
        gap: '0px',
      }}>
        <BossUI
          boss={boss} hp={hp} maxHp={boss.hp}
          hit={hit} dead={dead} connected={connected}
          bossIndex={bossIndex} totalBosses={BOSSES.length}
        />
      </div>

      {/* ── Room card (pre-connection) ── */}
      {!connected && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 30, textAlign: 'center',
        }}>
          <div style={{
            padding: '14px 36px',
            border: '1px solid rgba(139,0,0,.3)', borderRadius: '2px',
            background: 'rgba(139,0,0,.06)', boxShadow: '0 0 40px rgba(139,0,0,.12)',
          }}>
            <div style={{ fontSize: '0.4rem', letterSpacing: '0.5em', color: 'rgba(180,0,0,.4)', marginBottom: '7px' }}>
              部屋番号 · ENTER ON PHONE
            </div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '1.7rem', fontWeight: 700, color: 'rgba(231,76,60,.7)', letterSpacing: '0.25em', textShadow: '0 0 22px rgba(139,0,0,.5)' }}>
              {roomId}
            </div>
          </div>
        </div>
      )}

      {/* ── Boss transition overlay ── */}
      {transition && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
          animation: 'fade-in 0.4s ease-out',
        }}>
          <div style={{
            fontFamily: "'Shippori Mincho',serif", fontSize: 'clamp(2rem,6vw,4rem)',
            fontWeight: 800, color: boss.color,
            textShadow: `0 0 40px ${boss.glow}`, letterSpacing: '0.15em',
            marginBottom: '12px',
          }}>{transition.text}</div>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: '0.65rem',
            letterSpacing: '0.4em', color: 'rgba(201,168,76,0.7)',
          }}>{transition.sub}</div>
        </div>
      )}

      {/* ── Victory ── */}
      {victory && <VictoryScreen onRestart={handleRestart}/>}

      {/* Bottom accent */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '2px', zIndex: 90,
        background: `linear-gradient(90deg,transparent,${boss.color},${boss.color},transparent)`,
        boxShadow: `0 0 16px ${boss.glow}`,
        transition: 'all 0.5s',
      }}/>
    </div>
  )
}