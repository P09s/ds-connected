// src/pages/PhonePage.jsx — Demon Slayer theme with metallic slash sound
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePartySocket } from '../hooks/usePartySocket'

// ─── Black Nichirin Blade ─────────────────────────────────────────────────────
function NichirinBlade({ slashing, size = 'full' }) {
  const h = size === 'preview' ? '190px' : 'min(56vh,390px)'
  return (
    <svg viewBox="0 0 130 620" style={{
      height: h, width: 'auto',
      filter: slashing
        ? 'drop-shadow(0 0 24px rgba(220,30,30,1)) drop-shadow(0 0 60px rgba(180,0,0,.9))'
        : 'drop-shadow(0 0 8px rgba(180,0,0,.5)) drop-shadow(0 0 24px rgba(100,0,0,.3))',
      transition: 'filter .12s',
      animation: slashing ? 'swordSlash .3s ease-out' : 'swordGlow 2.5s ease-in-out infinite',
    }}>
      <defs>
        <linearGradient id="bl" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1a1a1a"/>
          <stop offset="28%"  stopColor="#383838"/>
          <stop offset="50%"  stopColor="#505050"/>
          <stop offset="72%"  stopColor="#282828"/>
          <stop offset="100%" stopColor="#111"/>
        </linearGradient>
        <linearGradient id="blh" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3a0000"/>
          <stop offset="28%"  stopColor="#8b0000"/>
          <stop offset="50%"  stopColor="#e74c3c"/>
          <stop offset="72%"  stopColor="#8b0000"/>
          <stop offset="100%" stopColor="#3a0000"/>
        </linearGradient>
        <linearGradient id="gd" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#d4a843"/>
          <stop offset="40%"  stopColor="#f0c850"/>
          <stop offset="100%" stopColor="#8a6020"/>
        </linearGradient>
        <filter id="bg">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Blade */}
      <polygon points="65,8 55,415 75,415" fill={slashing ? 'url(#blh)' : 'url(#bl)'} filter="url(#bg)"/>
      <line x1="65" y1="8"  x2="63" y2="415" stroke={slashing ? 'rgba(231,76,60,.9)' : 'rgba(160,160,160,.4)'} strokeWidth="1"/>
      <line x1="61" y1="30" x2="58" y2="405" stroke={slashing ? 'rgba(231,76,60,.55)' : 'rgba(70,70,70,.5)'} strokeWidth="1.2"/>
      {slashing && <>
        <line x1="62" y1="30" x2="70" y2="380" stroke="rgba(255,80,80,.65)" strokeWidth="1.5" opacity=".8"/>
        <ellipse cx="65" cy="200" rx="9" ry="92" fill="rgba(231,76,60,.09)"/>
      </>}

      {/* Habaki */}
      <rect x="52" y="410" width="26" height="20" rx="1" fill="#b8902a"/>
      <rect x="54" y="412" width="22" height="16" rx="1" fill="#d4a843" opacity=".7"/>

      {/* Tsuba with rhombus detail */}
      <ellipse cx="65" cy="442" rx="38" ry="14" fill="url(#gd)"/>
      <ellipse cx="65" cy="442" rx="34" ry="10" fill="none" stroke="#f0c850" strokeWidth="1.5"/>
      <polygon points="65,432 70,442 65,452 60,442" fill="rgba(0,0,0,.38)" stroke="#c9a030" strokeWidth="1"/>
      <polygon points="48,438 52,442 48,446 44,442" fill="rgba(0,0,0,.3)"  stroke="#c9a030" strokeWidth=".8"/>
      <polygon points="82,438 86,442 82,446 78,442" fill="rgba(0,0,0,.3)"  stroke="#c9a030" strokeWidth=".8"/>
      <path d="M34 442 Q42 436 50 442 Q58 448 66 442 Q74 436 82 442" stroke="rgba(231,76,60,.45)" strokeWidth="1.2" fill="none"/>

      {/* Handle — black with red diamond wrap */}
      <rect x="57" y="456" width="16" height="130" rx="8" fill="#0e0e0e"/>
      {Array.from({ length: 9 }, (_, i) => (
        <polygon key={i}
          points={`57,${464+i*13} 65,${460+i*13} 73,${464+i*13} 65,${468+i*13}`}
          fill="rgba(180,0,0,.55)" stroke="rgba(231,76,60,.28)" strokeWidth=".5"
        />
      ))}
      <rect x="57" y="456" width="16" height="130" rx="8" fill="none" stroke="#0a0a0a" strokeWidth="1.5"/>

      {/* Kashira */}
      <ellipse cx="65" cy="590" rx="11" ry="9" fill="#b8902a"/>
      <ellipse cx="65" cy="588" rx="8"  ry="5" fill="#d4a843"/>
    </svg>
  )
}

// ─── METALLIC SWORD SLASH SOUND ───────────────────────────────────────────────
// Layered approach: high-frequency metallic zing + mid air-cut whoosh + low thud
function makeSlashSound(intensity) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const vol = Math.min(0.15 + intensity * 0.012, 0.8)

    // ── Layer 1: High metallic ZING (the "blade ring") ──
    const zingOsc = ctx.createOscillator()
    const zingGain = ctx.createGain()
    const zingFilter = ctx.createBiquadFilter()
    zingOsc.type = 'sawtooth'
    zingOsc.frequency.setValueAtTime(3200, now)
    zingOsc.frequency.exponentialRampToValueAtTime(800, now + 0.08)
    zingOsc.frequency.exponentialRampToValueAtTime(200, now + 0.22)
    zingFilter.type = 'highpass'
    zingFilter.frequency.value = 1200
    zingGain.gain.setValueAtTime(vol * 0.45, now)
    zingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    zingOsc.connect(zingFilter)
    zingFilter.connect(zingGain)
    zingGain.connect(ctx.destination)
    zingOsc.start(now); zingOsc.stop(now + 0.22)

    // ── Layer 2: Mid air-cut WHOOSH (fast noise burst) ──
    const whooshBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate)
    const whooshData = whooshBuf.getChannelData(0)
    for (let i = 0; i < whooshData.length; i++) {
      // Shaped noise — peaks early then fades
      const env = Math.pow(1 - i / whooshData.length, 0.4)
      whooshData[i] = (Math.random() * 2 - 1) * env
    }
    const whooshSrc = ctx.createBufferSource()
    whooshSrc.buffer = whooshBuf
    const whooshFilter = ctx.createBiquadFilter()
    whooshFilter.type = 'bandpass'
    whooshFilter.frequency.setValueAtTime(2800, now)
    whooshFilter.frequency.exponentialRampToValueAtTime(400, now + 0.18)
    whooshFilter.Q.value = 0.6
    const whooshGain = ctx.createGain()
    whooshGain.gain.setValueAtTime(vol * 0.7, now)
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    whooshSrc.connect(whooshFilter)
    whooshFilter.connect(whooshGain)
    whooshGain.connect(ctx.destination)
    whooshSrc.start(now); whooshSrc.stop(now + 0.18)

    // ── Layer 3: Blade impact CLICK/CRACK ──
    const impactBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate)
    const impactData = impactBuf.getChannelData(0)
    for (let i = 0; i < impactData.length; i++) {
      impactData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impactData.length, 3)
    }
    const impactSrc = ctx.createBufferSource()
    impactSrc.buffer = impactBuf
    const impactFilter = ctx.createBiquadFilter()
    impactFilter.type = 'highshelf'
    impactFilter.frequency.value = 5000
    impactFilter.gain.value = 12
    const impactGain = ctx.createGain()
    impactGain.gain.setValueAtTime(vol * 0.5, now)
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
    impactSrc.connect(impactFilter)
    impactFilter.connect(impactGain)
    impactGain.connect(ctx.destination)
    impactSrc.start(now); impactSrc.stop(now + 0.04)

    setTimeout(() => ctx.close(), 600)
  } catch (_) {}
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PhonePage() {
  const { roomId } = useParams()
  const [screen, setScreen] = useState('intro') // 'intro' | 'connecting' | 'active'
  const [slashing, setSlashing] = useState(false)
  const [slashCount, setSlashCount] = useState(0)
  const [motionLevel, setMotionLevel] = useState(0)
  const [permError, setPermError] = useState('')

  const lastAccel = useRef({ x: 0, y: 0, z: 0 })
  const lastSlashTime = useRef(0)
  const decayTimer = useRef(null)
  const joinInterval = useRef(null)
  const motionActive = useRef(false)

  const socketActive = screen === 'connecting' || screen === 'active'
  const { publish, connState } = usePartySocket(
    socketActive ? roomId : null,
    (event) => { if (event === 'ready') clearInterval(joinInterval.current) }
  )

  useEffect(() => {
    if (screen !== 'connecting') return
    const boot = setTimeout(() => {
      publish('join', { roomId, t: Date.now() })
      setScreen('active')
      joinInterval.current = setInterval(() => publish('join', { roomId, t: Date.now() }), 1200)
    }, 600)
    return () => { clearTimeout(boot); clearInterval(joinInterval.current) }
  }, [screen, publish, roomId])

  const handleMotion = useCallback((e) => {
    const a = e.accelerationIncludingGravity; if (!a) return
    const ax = a.x ?? 0, ay = a.y ?? 0, az = a.z ?? 0
    const dx = ax - lastAccel.current.x
    const dy = ay - lastAccel.current.y
    const dz = az - lastAccel.current.z
    lastAccel.current = { x: ax, y: ay, z: az }
    const intensity = Math.sqrt(dx*dx + dy*dy + dz*dz)

    setMotionLevel(intensity)
    clearTimeout(decayTimer.current)
    decayTimer.current = setTimeout(() => setMotionLevel(0), 180)

    const now = Date.now()
    if (intensity > 2.2 && now - lastSlashTime.current > 160) {
      lastSlashTime.current = now
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      publish('slash', { angle, intensity, x: 0.25 + Math.random() * 0.5, y: 0.15 + Math.random() * 0.55, t: now })
      setSlashing(true)
      setSlashCount(c => c + 1)
      makeSlashSound(intensity)
      setTimeout(() => setSlashing(false), 280)
    }
  }, [publish])

  const handleUnsheathe = async () => {
    setPermError('')
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
      try {
        const res = await DeviceMotionEvent.requestPermission()
        if (res !== 'granted') { setPermError('Motion permission denied. Allow in Settings → Safari.'); return }
      } catch { setPermError('Could not request permission. Try reloading.'); return }
    }
    if (!motionActive.current) {
      window.addEventListener('devicemotion', handleMotion, true)
      motionActive.current = true
    }
    setScreen('connecting')
  }

  useEffect(() => () => {
    window.removeEventListener('devicemotion', handleMotion, true)
    clearInterval(joinInterval.current)
    clearTimeout(decayTimer.current)
  }, [handleMotion])

  const barPct = Math.min(motionLevel * 4.5, 100)
  const accentBar = {
    position: 'fixed', left: 0, right: 0, height: '3px',
    background: 'linear-gradient(90deg,transparent,#8b0000,#e74c3c,#8b0000,transparent)',
    boxShadow: '0 0 20px rgba(231,76,60,.8)',
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%,#200008,#110005 55%,#080002 100%)',
      padding: '28px', fontFamily: "'Cinzel',serif", gap: '0px',
      backgroundImage: 'url(/backgrounds/infinity-castle.jpg)',
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      {/* Dark overlay */}
      <div style={{ position:'fixed',inset:0,background:'rgba(5,0,2,0.82)',zIndex:0 }}/>
      <div style={{ ...accentBar, top: 0, zIndex: 10 }}/>

      <div style={{ position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'14px',width:'100%' }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Shippori Mincho',serif",
            fontSize: 'clamp(1.8rem,10vw,2.8rem)', fontWeight: 800,
            background: 'linear-gradient(180deg,#c9a84c,#f0c850,#8a6020)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(201,168,76,.5))',
            letterSpacing: '.08em',
          }}>鬼滅の刃</div>
          <div style={{ fontSize: '.52rem', letterSpacing: '.45em', color: 'rgba(231,76,60,.5)', marginTop: '2px' }}>
            KIMETSU NO YAIBA
          </div>
        </div>

        {/* Room badge */}
        <div style={{
          padding: '7px 20px', border: '1px solid rgba(139,0,0,.35)',
          borderRadius: '2px', background: 'rgba(139,0,0,.07)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '.38rem', letterSpacing: '.4em', color: 'rgba(201,168,76,.28)', marginBottom: '2px' }}>部屋番号 · ROOM</div>
          <div style={{ fontSize: '1rem', letterSpacing: '.28em', fontWeight: 700, color: 'rgba(231,76,60,.7)' }}>{roomId}</div>
        </div>

        {/* Blade */}
        <NichirinBlade slashing={false} size="preview"/>

        {/* Error */}
        {permError && (
          <div style={{ fontSize: '.54rem', color: '#e74c3c', letterSpacing: '.1em', textAlign: 'center', maxWidth: '270px', padding: '8px', border: '1px solid rgba(231,76,60,.3)', borderRadius: '3px', background: 'rgba(180,0,0,.06)' }}>
            {permError}
          </div>
        )}

        {/* Button */}
        <button onClick={handleUnsheathe} style={{
          padding: '18px 52px',
          background: 'linear-gradient(135deg,rgba(139,0,0,.25),rgba(80,0,0,.12))',
          border: '1px solid rgba(231,76,60,.65)', borderRadius: '2px',
          color: '#e74c3c', fontFamily: "'Cinzel',serif", fontSize: '.85rem',
          letterSpacing: '.38em', textTransform: 'uppercase', cursor: 'pointer',
          boxShadow: '0 0 32px rgba(139,0,0,.38),inset 0 0 20px rgba(139,0,0,.1)',
          WebkitTapHighlightColor: 'transparent',
        }}>
          抜 刀 · UNSHEATHE
        </button>

        <div style={{ fontSize: '.44rem', letterSpacing: '.2em', color: 'rgba(255,255,255,.16)', textAlign: 'center' }}>
          Open Battlefield on your laptop first
        </div>
      </div>
      <div style={{ ...accentBar, bottom: 0, zIndex: 10 }}/>
    </div>
  )

  // ── ACTIVE ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      background: 'radial-gradient(ellipse at 50% 30%,#200008,#110005 55%,#080002 100%)',
      paddingTop: '32px', paddingBottom: '20px', fontFamily: "'Cinzel',serif",
    }}>
      <div style={{ ...accentBar, top: 0 }}/>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: connState === 'connected' ? '#e74c3c' : '#8b0000',
            boxShadow: connState === 'connected' ? '0 0 12px rgba(231,76,60,.9)' : 'none',
          }}/>
          <span style={{ fontSize: '.48rem', letterSpacing: '.3em', color: 'rgba(231,76,60,.5)', textTransform: 'uppercase' }}>
            {connState === 'connected' ? `ROOM ${roomId} · LIVE` : `ROOM ${roomId} · ${connState.toUpperCase()}`}
          </span>
        </div>
        <div style={{ fontSize: '.42rem', letterSpacing: '.25em', color: 'rgba(201,168,76,.22)' }}>
          {slashCount} CUT{slashCount !== 1 ? 'S' : ''}
        </div>
      </div>

      {/* Blade */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', overflow: 'hidden', minHeight: 0 }}>
        <NichirinBlade slashing={slashing} size="full"/>
      </div>

      {/* Motion bar */}
      <div style={{ width: 'calc(100% - 48px)', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '.45rem', letterSpacing: '.18em', textTransform: 'uppercase', color: motionLevel > 2.2 ? '#e74c3c' : 'rgba(180,0,0,.4)', transition: 'color .15s', minWidth: '56px' }}>
            {motionLevel > 2.2 ? '⚔ STRIKE' : 'IDLE'}
          </span>
          <div style={{ flex: 1, height: '2px', background: 'rgba(139,0,0,.15)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${barPct}%`, height: '100%', background: barPct > 75 ? '#ff8866' : '#e74c3c', boxShadow: motionLevel > 2.2 ? '0 0 10px rgba(231,76,60,.9)' : 'none', transition: 'width .05s linear' }}/>
          </div>
          <span style={{ fontSize: '.4rem', color: 'rgba(180,0,0,.4)', minWidth: '30px', textAlign: 'right' }}>{motionLevel.toFixed(1)}</span>
        </div>
      </div>

      <div style={{ fontSize: '.45rem', letterSpacing: '.22em', color: 'rgba(180,0,0,.3)' }}>
        全集中 · TOTAL CONCENTRATION
      </div>

      <div style={{ ...accentBar, bottom: 0 }}/>
    </div>
  )
}