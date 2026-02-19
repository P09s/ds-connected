// src/pages/LaptopPage.jsx
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAblyChannel } from '../hooks/useAbly'

// ── VFX helpers ──────────────────────────────────────────────
function spawnSlash(container, x, y, angle, intensity) {
  const len = Math.min(100 + intensity * 6, 400)
  const thick = Math.max(3, Math.min(intensity * 0.5, 14))
  const el = document.createElement('div')
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;
    width:${len}px;height:${thick}px;
    transform:translate(-50%,-50%) rotate(${angle}deg);
    border-radius:999px;pointer-events:none;
    background:linear-gradient(90deg,transparent 0%,rgba(0,200,255,0.3) 15%,rgba(125,249,255,0.95) 40%,#fff 50%,rgba(125,249,255,0.95) 60%,rgba(0,200,255,0.3) 85%,transparent 100%);
    box-shadow:0 0 ${thick*2}px rgba(125,249,255,1),0 0 ${thick*5}px rgba(0,200,255,0.7),0 0 ${thick*12}px rgba(0,150,255,0.35);
    z-index:50;
  `
  el.classList.add('slash-el')
  container.appendChild(el)

  // Ripple
  const rip = document.createElement('div')
  const rs = 50 + intensity * 2
  rip.style.cssText = `
    position:absolute;left:${x-rs/2}px;top:${y-rs/2}px;
    width:${rs}px;height:${rs}px;border-radius:50%;
    border:2px solid rgba(125,249,255,0.8);pointer-events:none;
    box-shadow:0 0 16px rgba(0,200,255,0.5);z-index:49;
  `
  rip.classList.add('ripple-el')
  container.appendChild(rip)

  // Particles
  for (let i = 0; i < Math.floor(4 + intensity * 0.4); i++) {
    const p = document.createElement('div')
    const spread = (Math.random() - 0.5) * 100
    const dist = 30 + Math.random() * 80
    const rad = ((angle + spread) * Math.PI) / 180
    const size = 2 + Math.random() * 5
    p.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:${size}px;height:${size}px;border-radius:50%;
      background:rgba(125,249,255,${0.5+Math.random()*0.5});
      box-shadow:0 0 6px rgba(0,200,255,0.8);pointer-events:none;z-index:48;
      --tx:${Math.cos(rad)*dist}px;--ty:${Math.sin(rad)*dist}px;
    `
    p.classList.add('particle-el')
    container.appendChild(p)
    setTimeout(() => p.remove(), 550)
  }

  setTimeout(() => { el.remove(); rip.remove() }, 750)
}

function spawnDamageNumber(container, x, y, damage) {
  const el = document.createElement('div')
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y-40}px;
    transform:translateX(-50%);pointer-events:none;z-index:80;
    font-family:'Cinzel',serif;font-weight:700;
    font-size:${24 + damage * 0.4}px;
    color:#fff;text-shadow:0 0 10px rgba(125,249,255,0.9),0 0 25px rgba(0,200,255,0.6);
    letter-spacing:0.05em;
  `
  el.textContent = `-${Math.floor(damage)}`
  el.classList.add('dmg-el')
  container.appendChild(el)
  setTimeout(() => el.remove(), 950)
}

// ── Enemy component ──────────────────────────────────────────
function Enemy({ hp, maxHp, hit, dead, name }) {
  const barPct = Math.max(0, (hp / maxHp) * 100)
  const barColor = barPct > 60 ? '#ff4444' : barPct > 30 ? '#ff8800' : '#ff0000'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Enemy name */}
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: '0.7rem',
        letterSpacing: '0.4em', color: 'rgba(255,100,100,0.7)',
        textTransform: 'uppercase',
      }}>
        {name}
      </div>

      {/* HP bar */}
      <div style={{ width: '300px', maxWidth: '60vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: 'rgba(255,100,100,0.5)' }}>HP</span>
          <span style={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(255,100,100,0.5)' }}>{Math.max(0,hp)} / {maxHp}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,0,0,0.15)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,50,50,0.2)' }}>
          <div style={{
            width: `${barPct}%`, height: '100%',
            background: barColor,
            boxShadow: `0 0 8px ${barColor}`,
            transition: 'width 0.3s ease-out',
            borderRadius: '3px',
          }}/>
        </div>
      </div>

      {/* Enemy SVG — Demon silhouette */}
      <div
        className={hit ? 'enemy-hit' : dead ? 'enemy-death' : 'enemy-float'}
        style={{ position: 'relative' }}
      >
        <svg viewBox="0 0 200 300" width="200" height="300" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="demon-grad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#4a0010"/>
              <stop offset="100%" stopColor="#1a0005"/>
            </radialGradient>
            <filter id="demon-glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Body */}
          <ellipse cx="100" cy="220" rx="55" ry="70" fill="url(#demon-grad)" filter="url(#demon-glow)"/>
          {/* Head */}
          <ellipse cx="100" cy="110" rx="48" ry="52" fill="url(#demon-grad)" filter="url(#demon-glow)"/>
          {/* Horns */}
          <path d="M 68 78 Q 55 40 45 20 Q 58 45 72 72" fill="#2a0008" stroke="#8b0000" strokeWidth="2"/>
          <path d="M 132 78 Q 145 40 155 20 Q 142 45 128 72" fill="#2a0008" stroke="#8b0000" strokeWidth="2"/>
          {/* Eyes */}
          <ellipse cx="82" cy="105" rx="10" ry="8" fill="#ff2020"/>
          <ellipse cx="118" cy="105" rx="10" ry="8" fill="#ff2020"/>
          <ellipse cx="82" cy="105" rx="5" ry="5" fill="#ff6060"/>
          <ellipse cx="118" cy="105" rx="5" ry="5" fill="#ff6060"/>
          {/* Glow pupils */}
          <ellipse cx="82" cy="105" rx="3" ry="3" fill="#ffaaaa" opacity="0.9"/>
          <ellipse cx="118" cy="105" rx="3" ry="3" fill="#ffaaaa" opacity="0.9"/>
          {/* Mouth */}
          <path d="M 80 135 Q 100 148 120 135" stroke="#ff2020" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Fangs */}
          <polygon points="90,137 86,150 94,137" fill="#ffdddd" opacity="0.8"/>
          <polygon points="110,137 106,150 114,137" fill="#ffdddd" opacity="0.8"/>
          {/* Arms */}
          <path d="M 50 190 Q 20 230 15 270" stroke="#2a0008" strokeWidth="18" fill="none" strokeLinecap="round"/>
          <path d="M 150 190 Q 180 230 185 270" stroke="#2a0008" strokeWidth="18" fill="none" strokeLinecap="round"/>
          {/* Claws */}
          <path d="M 12 268 Q 5 280 0 285 M 15 272 Q 10 284 8 290 M 18 274 Q 15 286 14 292" stroke="#8b0000" strokeWidth="2" fill="none"/>
          <path d="M 188 268 Q 195 280 200 285 M 185 272 Q 190 284 192 290 M 182 274 Q 185 286 186 292" stroke="#8b0000" strokeWidth="2" fill="none"/>

          {/* Aura / miasma */}
          <ellipse cx="100" cy="260" rx="70" ry="20" fill="rgba(139,0,0,0.15)"/>
          {hit && <ellipse cx="100" cy="150" rx="60" ry="80" fill="rgba(255,50,50,0.2)"/>}
        </svg>

        {dead && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            fontFamily: "'Shippori Mincho', serif", fontSize: '2rem', fontWeight: 800,
            color: '#ff4444', letterSpacing: '0.3em', whiteSpace: 'nowrap',
            textShadow: '0 0 20px rgba(255,0,0,0.8)',
          }}>
            滅 SLAIN
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Laptop Page ─────────────────────────────────────────
const ENEMY_NAMES = ['Muzan\'s Servant', 'Lower Moon Demon', 'Hand Demon', 'Temple Demon', 'Swamp Demon']
const MAX_HP = 300

export default function LaptopPage() {
  const { roomId } = useParams()
  const canvasRef = useRef(null)
  const screenRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [phoneConnected, setPhoneConnected] = useState(false)
  const [slashCount, setSlashCount] = useState(0)
  const [hp, setHp] = useState(MAX_HP)
  const [enemyHit, setEnemyHit] = useState(false)
  const [enemyDead, setEnemyDead] = useState(false)
  const [enemyName] = useState(() => ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)])
  const [shaking, setShaking] = useState(false)
  const hpRef = useRef(MAX_HP)

  useEffect(() => {
    setTimeout(() => setConnected(true), 600)
  }, [])

  const triggerShake = useCallback(() => {
    setShaking(true)
    setTimeout(() => setShaking(false), 420)
  }, [])

  const triggerEnemyHit = useCallback(() => {
    setEnemyHit(true)
    setTimeout(() => setEnemyHit(false), 420)
  }, [])

  const respawnEnemy = useCallback(() => {
    setTimeout(() => {
      hpRef.current = MAX_HP
      setHp(MAX_HP)
      setEnemyDead(false)
    }, 2000)
  }, [])

  const handleSlash = useCallback((data) => {
    if (enemyDead) return
    setPhoneConnected(true)
    setSlashCount(c => c + 1)

    const w = canvasRef.current?.offsetWidth || window.innerWidth
    const h = canvasRef.current?.offsetHeight || window.innerHeight
    const x = data.x * w
    const y = data.y * h

    // Spawn VFX
    if (canvasRef.current) {
      spawnSlash(canvasRef.current, x, y, data.angle, data.intensity)
    }

    // Deal damage
    const dmg = Math.floor(8 + data.intensity * 1.5)
    const newHp = Math.max(0, hpRef.current - dmg)
    hpRef.current = newHp
    setHp(newHp)

    // Damage number
    if (canvasRef.current) {
      spawnDamageNumber(canvasRef.current, x, y, dmg)
    }

    triggerShake()
    triggerEnemyHit()

    if (newHp <= 0 && !enemyDead) {
      setEnemyDead(true)
      respawnEnemy()
    }
  }, [enemyDead, triggerShake, triggerEnemyHit, respawnEnemy])

  const { publish: laptopPublish } = useAblyChannel(roomId, (event, data) => {
    if (event === 'slash') handleSlash(data)
    if (event === 'join') {
      setPhoneConnected(true)
      laptopPublish('ready', { t: Date.now() })
    }
  })

  return (
    <div
      ref={screenRef}
      className={shaking ? 'screen-shake' : ''}
      style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, #0d1a2e 0%, #020b18 70%)',
        overflow: 'hidden',
      }}
    >
      {/* Water line bg */}
      <svg className="fixed inset-0 w-full h-full opacity-[0.06] pointer-events-none">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i}
            d={`M -200 ${40 + i * 80} Q ${window.innerWidth*0.4} ${20+i*80} ${window.innerWidth*0.7} ${55+i*80} T ${window.innerWidth+200} ${40+i*80}`}
            stroke="#7DF9FF" strokeWidth="1" fill="none"
          />
        ))}
      </svg>

      {/* Canvas layer for VFX */}
      <div ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }}/>

      {/* Top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 90,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 24px',
        background: 'linear-gradient(180deg, rgba(2,11,24,0.9) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: phoneConnected ? '#7DF9FF' : connected ? '#ffaa00' : '#444',
            boxShadow: phoneConnected ? '0 0 10px rgba(125,249,255,0.9)' : 'none',
          }}/>
          <span style={{ fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(125,249,255,0.5)', textTransform: 'uppercase' }}>
            {phoneConnected ? 'Sword Connected' : connected ? `Waiting · Room ${roomId}` : 'Connecting...'}
          </span>
        </div>
        <div style={{
          fontFamily: "'Shippori Mincho', serif", fontSize: '1rem', fontWeight: 700,
          color: 'rgba(125,249,255,0.3)', letterSpacing: '0.3em',
        }}>
          水の呼吸
        </div>
        <div style={{ fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(125,249,255,0.4)' }}>
          {slashCount} strikes
        </div>
      </div>

      {/* Room ID display when waiting */}
      {!phoneConnected && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30, textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
        }}>
          <div className="breathe" style={{ fontSize: '0.6rem', letterSpacing: '0.5em', color: 'rgba(125,249,255,0.4)', textTransform: 'uppercase' }}>
            Waiting for sword...
          </div>
          <div style={{
            padding: '16px 32px',
            border: '1px solid rgba(125,249,255,0.2)',
            borderRadius: '4px',
            background: 'rgba(125,249,255,0.03)',
          }}>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.4em', color: 'rgba(125,249,255,0.3)', marginBottom: '8px' }}>ROOM ID</div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: '2rem', fontWeight: 700,
              color: '#7DF9FF', letterSpacing: '0.3em',
              textShadow: '0 0 20px rgba(0,200,255,0.5)',
            }}>{roomId}</div>
            <div style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: 'rgba(125,249,255,0.3)', marginTop: '8px' }}>
              Enter this on your phone
            </div>
          </div>

          {/* Pulse ring animation */}
          <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 0.4, 0.8].map((delay, i) => (
              <div key={i} style={{
                position: 'absolute', width: '100%', height: '100%',
                borderRadius: '50%', border: '1px solid rgba(125,249,255,0.4)',
                animation: `pulse-ring 1.5s ease-out ${delay}s infinite`,
              }}/>
            ))}
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#7DF9FF', boxShadow: '0 0 12px rgba(0,200,255,0.8)' }}/>
          </div>
        </div>
      )}

      {/* Enemy - centered */}
      {phoneConnected && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20, textAlign: 'center',
        }}>
          <Enemy hp={hp} maxHp={MAX_HP} hit={enemyHit} dead={enemyDead} name={enemyName}/>
          {enemyDead && (
            <div style={{ marginTop: '16px', fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(255,100,100,0.5)' }}>
              Respawning...
            </div>
          )}
        </div>
      )}
    </div>
  )
}