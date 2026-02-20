// src/pages/LaptopPage.jsx — DEMON SLAYER FULL UPGRADE
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePartySocket } from '../hooks/usePartySocket'

// ─── BOSS DATA ─────────────────────────────────────────────────────────────────
const BOSSES = [
  {
    id: 'daki',       en: 'Daki',            jp: '堕姫',      rank: 'Upper Moon Six',   rankJp: '上弦の陸',
    hp: 400,  timer: 90,  image: '/demons/daki.png',
    color: '#e83c6e', glow: 'rgba(232,60,110,0.8)',  special: 'daki',
  },
  {
    id: 'gyutaro',    en: 'Gyutaro',         jp: '妓夫太郎',  rank: 'Upper Moon Six',   rankJp: '上弦の陸',
    hp: 500,  timer: 100, image: '/demons/gyutaro.png',
    color: '#8b0000', glow: 'rgba(139,0,0,0.9)',
  },
  {
    id: 'gyokko',     en: 'Gyokko',          jp: '玉壺',      rank: 'Upper Moon Five',  rankJp: '上弦の伍',
    hp: 600,  timer: 110, image: '/demons/gyokko.png',
    color: '#1a9e8a', glow: 'rgba(26,158,138,0.8)',
  },
  {
    id: 'hantengu',   en: 'Hantengu',        jp: '半天狗',    rank: 'Upper Moon Four',  rankJp: '上弦の肆',
    hp: 700,  timer: 120, image: '/demons/hantengu.png',
    color: '#9b59b6', glow: 'rgba(155,89,182,0.8)',
  },
  {
    id: 'akaza',      en: 'Akaza',           jp: '猗窩座',    rank: 'Upper Moon Three', rankJp: '上弦の参',
    hp: 850,  timer: 130, image: '/demons/akaza.png',
    color: '#e74c3c', glow: 'rgba(231,76,60,0.9)',
  },
  {
    id: 'doma',       en: 'Doma',            jp: '童磨',      rank: 'Upper Moon Two',   rankJp: '上弦の弐',
    hp: 1000, timer: 150, image: '/demons/doma.png',
    color: '#c9a84c', glow: 'rgba(201,168,76,0.8)',
  },
  {
    id: 'kokushibo',  en: 'Kokushibo',       jp: '黒死牟',    rank: 'Upper Moon One',   rankJp: '上弦の壱',
    hp: 1200, timer: 180, image: '/demons/kokushibo.png',
    color: '#c0392b', glow: 'rgba(192,57,43,0.95)',
  },
  {
    id: 'muzan',      en: 'Muzan Kibutsuji', jp: '鬼舞辻無惨', rank: 'Demon King',        rankJp: '鬼の王',
    hp: 2000, timer: 240, image: '/demons/muzan.png',
    color: '#e74c3c', glow: 'rgba(231,76,60,1.0)', isFinal: true,
  },
]

// ─── SLASH VISUAL FX ──────────────────────────────────────────────────────────
function spawnSlash(container, x, y, angle, intensity, color) {
  const len   = Math.min(140 + intensity * 9, 520)
  const thick = Math.max(3, Math.min(intensity * 0.6, 18))
  const c     = color || '#e74c3c'

  const el = document.createElement('div')
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;
    width:${len}px;height:${thick}px;
    transform:translate(-50%,-50%) rotate(${angle}deg);
    border-radius:999px;pointer-events:none;
    background:linear-gradient(90deg,
      transparent,${c}55 12%,${c}ee 36%,
      #fff 50%,${c}ee 64%,${c}55 88%,transparent);
    box-shadow:0 0 ${thick*2}px ${c},0 0 ${thick*7}px ${c}99,0 0 ${thick*16}px ${c}44;
    z-index:50;`
  el.classList.add('slash-el')
  container.appendChild(el)

  const rs  = 65 + intensity * 3
  const rip = document.createElement('div')
  rip.style.cssText = `
    position:absolute;left:${x - rs/2}px;top:${y - rs/2}px;
    width:${rs}px;height:${rs}px;border-radius:50%;
    border:2px solid ${c}cc;pointer-events:none;
    box-shadow:0 0 24px ${c}88;z-index:49;`
  rip.classList.add('ripple-el')
  container.appendChild(rip)

  for (let i = 0; i < Math.floor(5 + intensity * 0.5); i++) {
    const p    = document.createElement('div')
    const rad  = ((angle + (Math.random()-0.5)*130) * Math.PI) / 180
    const dist = 40 + Math.random() * 110
    const sz   = 2 + Math.random() * 7
    p.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:${sz}px;height:${sz}px;border-radius:50%;
      background:${Math.random() > 0.5 ? c : '#ffdd66'};
      box-shadow:0 0 8px ${c};pointer-events:none;z-index:48;
      --tx:${Math.cos(rad)*dist}px;--ty:${Math.sin(rad)*dist}px;`
    p.classList.add('particle-el')
    container.appendChild(p)
    setTimeout(() => p.remove(), 580)
  }
  setTimeout(() => { el.remove(); rip.remove() }, 820)
}

function spawnDamage(container, x, y, dmg) {
  const el = document.createElement('div')
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y-50}px;
    transform:translateX(-50%);pointer-events:none;z-index:80;
    font-family:'Cinzel',serif;font-weight:900;
    font-size:${28 + dmg * 0.38}px;color:#fff;
    text-shadow:0 0 14px rgba(231,76,60,.95),0 0 36px rgba(180,0,0,.8),0 0 3px #000;
    letter-spacing:.04em;`
  el.textContent = `-${Math.floor(dmg)}`
  el.classList.add('dmg-el')
  container.appendChild(el)
  setTimeout(() => el.remove(), 1000)
}

// ─── TIMER HOOK ────────────────────────────────────────────────────────────────
function useTimer(seconds, onExpire, active) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    setTimeLeft(seconds)
  }, [seconds])

  useEffect(() => {
    if (!active) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current); onExpire?.(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [active, onExpire])

  return timeLeft
}

// ─── DEMON IMAGE — full color, full screen ─────────────────────────────────────
function DemonImage({ boss, hit, dead }) {
  const [failed, setFailed] = useState(false)

  // Reset failed state when boss changes
  useEffect(() => setFailed(false), [boss.id])

  const imgStyle = {
    maxWidth:    '100%',
    maxHeight:   '100%',
    objectFit:   'contain',
    objectPosition: 'bottom center',
    // KEY FIX: DO NOT desaturate — use full color + conditional effects
    filter: dead
      ? 'brightness(0.3) saturate(0)'
      : hit
      ? `brightness(2.5) contrast(1.2) drop-shadow(0 0 40px ${boss.color})`
      : `drop-shadow(0 0 25px ${boss.glow}) drop-shadow(0 0 60px ${boss.glow}55) saturate(1.1)`,
    transition: 'filter 0.15s',
  }

  if (!failed && boss.image) {
    return (
      <img
        src={boss.image}
        alt={boss.en}
        onError={() => setFailed(true)}
        style={imgStyle}
      />
    )
  }

  // Fallback SVG silhouette (with boss color)
  return (
    <svg viewBox="0 0 220 340" style={{ maxHeight: '100%', maxWidth: '100%' }}>
      <defs>
        <radialGradient id={`fg${boss.id}`} cx="50%" cy="35%" r="55%">
          <stop offset="0%"   stopColor={boss.color} stopOpacity=".55"/>
          <stop offset="100%" stopColor="#0a0005"    stopOpacity="1"/>
        </radialGradient>
        <filter id={`fgl${boss.id}`}>
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="110" cy="320" rx="75" ry="13" fill="rgba(100,0,0,.12)"/>
      <ellipse cx="110" cy="240" rx="58" ry="75" fill={`url(#fg${boss.id})`} filter={`url(#fgl${boss.id})`}/>
      <ellipse cx="110" cy="116" rx="52" ry="57" fill={`url(#fg${boss.id})`} filter={`url(#fgl${boss.id})`}/>
      <path d="M76 86 Q55 52 47 26 Q64 50 79 78"   fill="#180006" stroke={boss.color} strokeWidth="2"/>
      <path d="M144 86 Q165 52 173 26 Q156 50 141 78" fill="#180006" stroke={boss.color} strokeWidth="2"/>
      <ellipse cx="87"  cy="112" rx="14" ry="10" fill={boss.color} style={{filter:`drop-shadow(0 0 8px ${boss.color})`}}/>
      <ellipse cx="133" cy="112" rx="14" ry="10" fill={boss.color} style={{filter:`drop-shadow(0 0 8px ${boss.color})`}}/>
      <ellipse cx="87"  cy="112" rx="5" ry="7" fill="#000"/>
      <ellipse cx="133" cy="112" rx="5" ry="7" fill="#000"/>
      <path d="M87 140 Q110 160 133 140" stroke={boss.color} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <polygon points="100,142 96,160 104,142" fill="#ddd0b0" opacity=".85"/>
      <polygon points="114,143 110,162 118,143" fill="#ddd0b0" opacity=".85"/>
      <path d="M54 198 Q18 240 10 287"   stroke="#180006" strokeWidth="22" fill="none" strokeLinecap="round"/>
      <path d="M166 198 Q202 240 210 287" stroke="#180006" strokeWidth="22" fill="none" strokeLinecap="round"/>
      {hit  && <ellipse cx="110" cy="162" rx="70" ry="90" fill={`${boss.color}33`}/>}
      {dead && <text x="110" y="200" textAnchor="middle" fill={boss.color} fontSize="44" fontFamily="serif">滅</text>}
    </svg>
  )
}

// ─── TIMER DISPLAY ─────────────────────────────────────────────────────────────
function TimerArc({ timeLeft, total, color }) {
  const pct = timeLeft / total
  const r   = 28
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const urgent = pct < 0.25

  return (
    <div style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="70" height="70" viewBox="0 0 70 70" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
        <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4"/>
        <circle cx="35" cy="35" r={r} fill="none"
          stroke={urgent ? '#e74c3c' : color}
          strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{
            transition: 'stroke-dasharray 0.9s linear',
            filter: `drop-shadow(0 0 6px ${urgent ? '#e74c3c' : color})`,
          }}
        />
      </svg>
      <div style={{
        fontFamily: "'Cinzel',serif", fontWeight: 900,
        fontSize: timeLeft > 99 ? '1rem' : '1.15rem',
        color: urgent ? '#e74c3c' : '#fff',
        textShadow: urgent ? '0 0 12px rgba(231,76,60,.9)' : 'none',
        animation: urgent && timeLeft < 10 ? 'breathe 0.6s ease-in-out infinite' : 'none',
      }}>{timeLeft}</div>
    </div>
  )
}

// ─── VICTORY SCREEN ────────────────────────────────────────────────────────────
function Victory({ onRestart }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center,#1a0000,#000)',
      animation: 'fade-in 1.2s ease-out',
    }}>
      <div style={{
        fontFamily: "'Shippori Mincho',serif",
        fontSize: 'clamp(1.6rem,5vw,3.2rem)', fontWeight: 800,
        color: '#c9a84c', letterSpacing: '.15em', textAlign: 'center',
        textShadow: '0 0 50px rgba(201,168,76,.8)', marginBottom: '14px',
      }}>全ての鬼を滅した</div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.75rem', color: 'rgba(201,168,76,.55)', letterSpacing: '.45em', marginBottom: '52px' }}>
        ALL DEMONS SLAIN
      </div>
      <button onClick={onRestart} style={{
        padding: '16px 50px', fontFamily: "'Cinzel',serif",
        background: 'linear-gradient(135deg,#8b0000,#6b0000)',
        border: '1px solid rgba(231,76,60,.7)', borderRadius: '2px',
        color: '#fff', fontSize: '.8rem', letterSpacing: '.4em',
        cursor: 'pointer', boxShadow: '0 0 32px rgba(139,0,0,.55)',
      }}>再戦 · FIGHT AGAIN</button>
    </div>
  )
}

// ─── TIMEOUT SCREEN ────────────────────────────────────────────────────────────
function TimeoutScreen({ boss, onRetry }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 250,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)',
      animation: 'fade-in 0.5s ease-out',
    }}>
      <div style={{ fontFamily: "'Shippori Mincho',serif", fontSize: 'clamp(1.4rem,4vw,2.5rem)', fontWeight: 800, color: '#e74c3c', letterSpacing: '.15em', marginBottom: '12px', textShadow: '0 0 40px rgba(231,76,60,.9)' }}>
        時間切れ
      </div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.65rem', letterSpacing: '.45em', color: 'rgba(231,76,60,.6)', marginBottom: '8px' }}>TIME'S UP</div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.5rem', letterSpacing: '.25em', color: 'rgba(255,255,255,.3)', marginBottom: '40px' }}>
        {boss.en} survives...
      </div>
      <button onClick={onRetry} style={{
        padding: '15px 48px', fontFamily: "'Cinzel',serif",
        background: 'linear-gradient(135deg,#8b0000,#6b0000)',
        border: '1px solid rgba(231,76,60,.7)', borderRadius: '2px',
        color: '#fff', fontSize: '.78rem', letterSpacing: '.38em',
        cursor: 'pointer', boxShadow: '0 0 28px rgba(139,0,0,.5)',
      }}>
        再挑戦 · RETRY
      </button>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LaptopPage() {
  const { roomId } = useParams()
  const canvasRef  = useRef(null)

  const [bossIdx,   setBossIdx]   = useState(0)
  const bossIdxRef = useRef(0)
  const [hp,        setHp]        = useState(BOSSES[0].hp)
  const hpRef      = useRef(BOSSES[0].hp)
  const dakiRef    = useRef(false) // daki 50% phase triggered

  const [hit,      setHit]      = useState(false)
  const [dead,     setDead]     = useState(false)
  const deadRef    = useRef(false)
  const [shaking,  setShaking]  = useState(false)
  const [connected,setConnected]= useState(false)
  const [cuts,     setCuts]     = useState(0)
  const [victory,  setVictory]  = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [timerActive, setTimerActive] = useState(false)
  const [transition, setTransition]   = useState(null)

  const boss     = BOSSES[bossIdx]
  const maxHp    = boss.hp
  const hpPct    = Math.max(0, (hp / maxHp) * 100)
  const hpColor  = hpPct > 60 ? boss.color : hpPct > 25 ? '#e74c3c' : '#ff2222'

  // helpers
  const shake    = useCallback(() => { setShaking(true);  setTimeout(() => setShaking(false),  440) }, [])
  const trigHit  = useCallback(() => { setHit(true);      setTimeout(() => setHit(false),       440) }, [])

  const showTransition = useCallback((text, sub, dur = 2800) => {
    setTransition({ text, sub }); setTimeout(() => setTransition(null), dur)
  }, [])

  const handleTimeout = useCallback(() => {
    if (deadRef.current || victory) return
    setTimerActive(false)
    setTimedOut(true)
  }, [victory])

  const timeLeft = useTimer(boss.timer, handleTimeout, timerActive && !dead && !timedOut)

  const retryBoss = useCallback(() => {
    hpRef.current  = boss.hp
    deadRef.current = false
    dakiRef.current = bossIdx === 0 ? false : dakiRef.current
    setHp(boss.hp)
    setDead(false)
    setTimedOut(false)
    setTimerActive(true)
  }, [boss, bossIdx])

  const advanceBoss = useCallback((nextIdx) => {
    if (nextIdx >= BOSSES.length) { setVictory(true); return }
    const next = BOSSES[nextIdx]
    deadRef.current  = false
    bossIdxRef.current = nextIdx
    hpRef.current    = next.hp
    setBossIdx(nextIdx)
    setHp(next.hp)
    setDead(false)
    setTimerActive(false)
    showTransition(next.jp, `${next.rankJp} · ${next.rank}`, 2800)
    setTimeout(() => setTimerActive(true), 2900)
  }, [showTransition])

  const slashRef = useRef(null)
  slashRef.current = (data) => {
    if (deadRef.current || timedOut || victory) return
    if (!timerActive) setTimerActive(true) // start timer on first slash
    setConnected(true)
    setCuts(c => c + 1)

    const w = canvasRef.current?.offsetWidth  || window.innerWidth
    const h = canvasRef.current?.offsetHeight || window.innerHeight
    const x = data.x * w, y = data.y * h

    if (canvasRef.current) spawnSlash(canvasRef.current, x, y, data.angle, data.intensity, BOSSES[bossIdxRef.current].color)

    const dmg   = Math.floor(10 + data.intensity * 1.8)
    const newHp = Math.max(0, hpRef.current - dmg)
    hpRef.current = newHp
    setHp(newHp)
    if (canvasRef.current) spawnDamage(canvasRef.current, x, y, dmg)
    shake(); trigHit()

    const cur = BOSSES[bossIdxRef.current]

    // DAKI special: at ≤50% HP trigger Gyutaro
    if (cur.special === 'daki' && !dakiRef.current && newHp <= cur.hp * 0.5) {
      dakiRef.current = true
      deadRef.current = true
      setDead(true)
      setTimerActive(false)
      showTransition('妓夫太郎', '兄が現れた · GYUTARO RISES', 3000)
      setTimeout(() => advanceBoss(1), 3000)
      return
    }

    if (newHp <= 0 && !deadRef.current) {
      deadRef.current = true
      setDead(true)
      setTimerActive(false)
      if (bossIdxRef.current === BOSSES.length - 1) {
        setTimeout(() => setVictory(true), 2000)
      } else {
        const nextIdx = bossIdxRef.current + 1
        showTransition(BOSSES[nextIdx].jp, `${BOSSES[nextIdx].rankJp} · ${BOSSES[nextIdx].rank}`, 2800)
        setTimeout(() => advanceBoss(nextIdx), 2800)
      }
    }
  }

  const { connState, publish } = usePartySocket(roomId, (event, data) => {
    if (event === 'slash') slashRef.current?.(data)
    if (event === 'join') { setConnected(true); publish('ready', { t: Date.now() }) }
  })

  const handleRestart = useCallback(() => {
    bossIdxRef.current = 0; hpRef.current = BOSSES[0].hp
    deadRef.current = false; dakiRef.current = false
    setBossIdx(0); setHp(BOSSES[0].hp); setDead(false)
    setVictory(false); setTimedOut(false); setTimerActive(false); setCuts(0)
  }, [])

  return (
    <div className={shaking ? 'screen-shake' : ''} style={{ position: 'fixed', inset: 0, overflow: 'hidden', fontFamily: "'Cinzel',serif" }}>

      {/* ── BACKGROUND — infinity castle ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'url(/backgrounds/infinity-castle.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center top',
        // Opacity 0.55 — clearly visible
        filter: 'brightness(0.55) saturate(0.7)',
      }}/>
      {/* Subtle vignette only — not a black blanket */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 50%,transparent 30%,rgba(0,0,0,0.55) 100%)',
      }}/>

      {/* Slash canvas */}
      <div ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40 }}/>

      {/* ── FULLSCREEN DEMON ── */}
      <div
        className={hit ? 'enemy-hit' : dead ? 'enemy-death' : 'enemy-float'}
        style={{
          position: 'fixed', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: '0px',
          opacity: connected ? 1 : 0.35,
          transition: 'opacity 0.6s',
          pointerEvents: 'none',
        }}
      >
        <div style={{ height: '88vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <DemonImage boss={boss} hit={hit} dead={dead}/>
        </div>

        {dead && (
          <div style={{
            position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
            fontFamily: "'Shippori Mincho',serif", fontSize: 'clamp(2.5rem,8vw,5rem)',
            fontWeight: 800, color: boss.color, letterSpacing: '.2em',
            textShadow: `0 0 40px ${boss.glow},0 0 100px ${boss.glow}55`,
            pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>滅 · SLAIN</div>
        )}
      </div>

      {/* ── TOP-LEFT: Boss name & rank ── */}
      <div style={{
        position: 'fixed', top: '70px', left: '28px', zIndex: 90,
        display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        <div style={{ fontSize: '.42rem', letterSpacing: '.5em', color: `${boss.color}cc`, textTransform: 'uppercase' }}>
          {boss.rankJp} · {boss.rank}
        </div>
        <div style={{
          fontFamily: "'Shippori Mincho',serif",
          fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800,
          color: '#fff',
          textShadow: `0 0 30px ${boss.glow},0 0 60px ${boss.glow}55`,
          lineHeight: 1,
        }}>{boss.jp}</div>
        <div style={{ fontSize: '.55rem', letterSpacing: '.4em', color: `${boss.color}99`, marginTop: '2px' }}>
          {boss.en}
        </div>

        {/* Boss progress dots */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          {BOSSES.map((b, i) => (
            <div key={b.id} title={b.en} style={{
              width:  i === bossIdx ? '18px' : '7px',
              height: '7px',
              borderRadius: '4px',
              background: i < bossIdx ? '#8b0000' : i === bossIdx ? boss.color : 'rgba(255,255,255,0.12)',
              boxShadow: i === bossIdx ? `0 0 10px ${boss.color}` : 'none',
              transition: 'all 0.4s',
            }}/>
          ))}
        </div>
      </div>

      {/* ── TOP-RIGHT: HP + Timer ── */}
      <div style={{
        position: 'fixed', top: '70px', right: '28px', zIndex: 90,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px',
      }}>
        {/* Timer */}
        <TimerArc timeLeft={timeLeft} total={boss.timer} color={boss.color}/>

        {/* HP bar */}
        <div style={{ width: 'clamp(180px,22vw,300px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '.42rem', letterSpacing: '.4em', color: `${boss.color}88` }}>生命力</span>
            <span style={{ fontSize: '.42rem', letterSpacing: '.2em', color: `${boss.color}88` }}>
              {Math.max(0,hp)} / {maxHp}
            </span>
          </div>
          <div style={{
            width: '100%', height: '8px',
            background: 'rgba(80,0,0,.25)',
            borderRadius: '1px', overflow: 'hidden',
            border: `1px solid ${boss.color}33`,
          }}>
            <div style={{
              width: `${hpPct}%`, height: '100%',
              background: `linear-gradient(90deg,${boss.color}88,${hpColor})`,
              boxShadow: `0 0 12px ${hpColor}`,
              transition: 'width .28s ease-out',
            }}/>
          </div>
        </div>
      </div>

      {/* ── TOP HUD bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 28px', height: '56px',
        background: 'linear-gradient(180deg,rgba(0,0,0,0.75),transparent)',
        borderBottom: `1px solid ${connected ? boss.color+'44' : 'rgba(80,0,0,.15)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: connected ? boss.color : '#6b0000',
            boxShadow: connected ? `0 0 14px ${boss.glow}` : 'none',
          }}/>
          <span style={{ fontSize: '.46rem', letterSpacing: '.35em', color: connected ? `${boss.color}cc` : 'rgba(180,0,0,.5)', textTransform: 'uppercase' }}>
            {connected ? '刀 · BLADE CONNECTED' : `待機中 · WAITING · ${connState}`}
          </span>
        </div>
        <div style={{ fontFamily: "'Shippori Mincho',serif", fontSize: '1rem', fontWeight: 700, color: 'rgba(201,168,76,.4)', letterSpacing: '.3em' }}>
          鬼滅の刃
        </div>
        <div style={{ fontSize: '.46rem', letterSpacing: '.3em', color: `${boss.color}88` }}>
          {cuts} 斬 CUTS
        </div>
      </div>

      {/* ── ROOM code card ── */}
      {!connected && (
        <div style={{
          position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, textAlign: 'center',
        }}>
          <div style={{
            padding: '14px 36px', border: '1px solid rgba(139,0,0,.35)',
            borderRadius: '2px', background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)', boxShadow: '0 0 40px rgba(139,0,0,.15)',
          }}>
            <div style={{ fontSize: '.4rem', letterSpacing: '.5em', color: 'rgba(180,0,0,.5)', marginBottom: '7px' }}>
              部屋番号 · ENTER ON PHONE
            </div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: '1.8rem', fontWeight: 700, color: 'rgba(231,76,60,.8)', letterSpacing: '.25em', textShadow: '0 0 24px rgba(139,0,0,.6)' }}>
              {roomId}
            </div>
          </div>
        </div>
      )}

      {/* ── AWAITING indicator ── */}
      {!connected && (
        <div className="breathe" style={{
          position: 'fixed', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 90, fontSize: '.44rem', letterSpacing: '.35em',
          color: 'rgba(180,0,0,.45)', whiteSpace: 'nowrap', fontFamily: "'Cinzel',serif",
        }}>── AWAITING SLAYER ──</div>
      )}

      {/* ── BOSS TRANSITION overlay ── */}
      {transition && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
          animation: 'fade-in 0.4s ease-out',
        }}>
          <div style={{
            fontFamily: "'Shippori Mincho',serif",
            fontSize: 'clamp(2.2rem,7vw,5rem)', fontWeight: 800,
            color: BOSSES[bossIdxRef.current]?.color || '#e74c3c',
            textShadow: `0 0 50px ${BOSSES[bossIdxRef.current]?.glow || 'rgba(231,76,60,.9)'}`,
            letterSpacing: '.15em', marginBottom: '14px',
          }}>{transition.text}</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: '.65rem', letterSpacing: '.45em', color: 'rgba(201,168,76,.7)' }}>
            {transition.sub}
          </div>
        </div>
      )}

      {/* ── TIMEOUT ── */}
      {timedOut && <TimeoutScreen boss={boss} onRetry={retryBoss}/>}

      {/* ── VICTORY ── */}
      {victory && <Victory onRestart={handleRestart}/>}

      {/* Bottom accent */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '2px', zIndex: 100,
        background: `linear-gradient(90deg,transparent,${boss.color},${boss.color},transparent)`,
        boxShadow: `0 0 18px ${boss.glow}`,
        transition: 'all 0.5s',
      }}/>
    </div>
  )
}