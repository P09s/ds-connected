// src/pages/PhonePage.jsx — Demon Slayer theme with authentic katana slash audio
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePartySocket } from '../hooks/usePartySocket'

// ─── BLACK NICHIRIN BLADE ─────────────────────────────────────────────────────
function NichirinBlade({ slashing, size = 'full' }) {
  const h = size === 'preview' ? '185px' : 'min(56vh,390px)'
  return (
    <svg viewBox="0 0 130 620" style={{
      height: h, width: 'auto',
      filter: slashing
        ? 'drop-shadow(0 0 26px rgba(220,30,30,1)) drop-shadow(0 0 65px rgba(180,0,0,.92))'
        : 'drop-shadow(0 0 8px rgba(180,0,0,.55)) drop-shadow(0 0 26px rgba(100,0,0,.32))',
      transition: 'filter .1s',
      animation: slashing ? 'swordSlash .28s ease-out' : 'swordGlow 2.5s ease-in-out infinite',
    }}>
      <defs>
        <linearGradient id="bl" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#181818"/>
          <stop offset="28%"  stopColor="#353535"/>
          <stop offset="50%"  stopColor="#4e4e4e"/>
          <stop offset="72%"  stopColor="#262626"/>
          <stop offset="100%" stopColor="#0f0f0f"/>
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

      {/* Blade body */}
      <polygon points="65,8 55,415 75,415" fill={slashing ? 'url(#blh)' : 'url(#bl)'} filter="url(#bg)"/>
      {/* Edge */}
      <line x1="65" y1="8"  x2="63" y2="415" stroke={slashing ? 'rgba(231,76,60,.88)' : 'rgba(150,150,150,.38)'} strokeWidth="1"/>
      {/* Fuller groove */}
      <line x1="61" y1="30" x2="58" y2="405" stroke={slashing ? 'rgba(231,76,60,.52)' : 'rgba(65,65,65,.48)'} strokeWidth="1.2"/>
      {/* Tip glint */}
      <line x1="65" y1="8"  x2="65" y2="75"  stroke={slashing ? 'rgba(255,100,100,.78)' : 'rgba(190,190,190,.32)'} strokeWidth="0.8"/>
      {slashing && <>
        <line x1="62" y1="28" x2="70" y2="378" stroke="rgba(255,75,75,.62)" strokeWidth="1.5" opacity=".78"/>
        <ellipse cx="65" cy="200" rx="9" ry="95" fill="rgba(231,76,60,.08)"/>
      </>}

      {/* Habaki — blade collar */}
      <rect x="52" y="410" width="26" height="20" rx="1" fill="#b8902a"/>
      <rect x="54" y="412" width="22" height="16" rx="1" fill="#d4a843" opacity=".7"/>

      {/* Tsuba — guard with Tanjiro rhombus details */}
      <ellipse cx="65" cy="442" rx="38" ry="14" fill="url(#gd)"/>
      <ellipse cx="65" cy="442" rx="34" ry="10" fill="none" stroke="#f0c850" strokeWidth="1.5"/>
      <polygon points="65,432 70,442 65,452 60,442" fill="rgba(0,0,0,.38)" stroke="#c9a030" strokeWidth="1"/>
      <polygon points="48,438 52,442 48,446 44,442" fill="rgba(0,0,0,.3)"  stroke="#c9a030" strokeWidth=".8"/>
      <polygon points="82,438 86,442 82,446 78,442" fill="rgba(0,0,0,.3)"  stroke="#c9a030" strokeWidth=".8"/>
      <path d="M34 442 Q42 436 50 442 Q58 448 66 442 Q74 436 82 442" stroke="rgba(231,76,60,.42)" strokeWidth="1.2" fill="none"/>

      {/* Tsuka — handle with red diamond wrap */}
      <rect x="57" y="456" width="16" height="130" rx="8" fill="#0d0d0d"/>
      {Array.from({ length: 9 }, (_, i) => (
        <polygon key={i}
          points={`57,${464+i*13} 65,${460+i*13} 73,${464+i*13} 65,${468+i*13}`}
          fill="rgba(180,0,0,.55)" stroke="rgba(231,76,60,.26)" strokeWidth=".5"
        />
      ))}
      <rect x="57" y="456" width="16" height="130" rx="8" fill="none" stroke="#0a0a0a" strokeWidth="1.5"/>

      {/* Kashira — pommel */}
      <ellipse cx="65" cy="590" rx="11" ry="9" fill="#b8902a"/>
      <ellipse cx="65" cy="588" rx="8"  ry="5" fill="#d4a843"/>
    </svg>
  )
}

// ─── AUTHENTIC DEMON SLAYER KATANA SLASH SOUND ────────────────────────────────
// Modelled on the actual anime sound design:
//  1. Sharp initial metallic "schhing" transient
//  2. High-velocity air displacement whoosh
//  3. Trailing resonance / harmonic ring
//  4. Subtle low thump on impact
function makeKatanaSlash(intensity) {
  try {
    const AC  = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    const ctx = new AC()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime
    const vol = Math.min(0.12 + intensity * 0.011, 0.75)

    // ── 1. SCHHING metallic transient (the initial ring as blade clears scabbard / cuts) ──
    const schhing = ctx.createOscillator()
    const sGain   = ctx.createGain()
    const sFilter = ctx.createBiquadFilter()
    schhing.type = 'sawtooth'
    // Rapidly descending frequency — bright steel zing
    schhing.frequency.setValueAtTime(6500, now)
    schhing.frequency.exponentialRampToValueAtTime(1800, now + 0.025)
    schhing.frequency.exponentialRampToValueAtTime(350,  now + 0.12)
    sFilter.type = 'bandpass'
    sFilter.frequency.setValueAtTime(4000, now)
    sFilter.frequency.exponentialRampToValueAtTime(900,  now + 0.1)
    sFilter.Q.value = 1.2
    sGain.gain.setValueAtTime(vol * 0.55, now)
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
    schhing.connect(sFilter); sFilter.connect(sGain); sGain.connect(ctx.destination)
    schhing.start(now); schhing.stop(now + 0.14)

    // ── 2. AIR DISPLACEMENT whoosh — fast noise shaped with sharp attack ──
    const RATE   = ctx.sampleRate
    const wLen   = Math.floor(RATE * 0.22)
    const wBuf   = ctx.createBuffer(2, wLen, RATE) // stereo for width
    for (let ch = 0; ch < 2; ch++) {
      const d = wBuf.getChannelData(ch)
      for (let i = 0; i < wLen; i++) {
        // Envelope: instant attack, exponential decay
        const env = Math.pow(Math.max(1 - i / wLen, 0), 0.35)
        // Slightly different noise per channel for stereo
        d[i] = (Math.random() * 2 - 1) * env * (ch === 0 ? 1 : 0.92)
      }
    }
    const wSrc    = ctx.createBufferSource(); wSrc.buffer = wBuf
    const wFilter = ctx.createBiquadFilter()
    wFilter.type  = 'bandpass'
    // Sweep from high to low — air moving fast then trailing off
    wFilter.frequency.setValueAtTime(3800, now)
    wFilter.frequency.exponentialRampToValueAtTime(280,  now + 0.22)
    wFilter.Q.value = 0.5
    // High-shelf boost for extra crispness
    const wShelf = ctx.createBiquadFilter()
    wShelf.type  = 'highshelf'
    wShelf.frequency.value = 6000
    wShelf.gain.value      = 10
    const wGain = ctx.createGain()
    wGain.gain.setValueAtTime(vol * 0.9, now)
    wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
    wSrc.connect(wFilter); wFilter.connect(wShelf); wShelf.connect(wGain); wGain.connect(ctx.destination)
    wSrc.start(now); wSrc.stop(now + 0.22)

    // ── 3. STEEL RESONANCE — harmonic ring that fades slowly ──
    const ring     = ctx.createOscillator()
    const ringGain = ctx.createGain()
    const ringComp = ctx.createDynamicsCompressor()
    ring.type = 'sine'
    ring.frequency.setValueAtTime(880, now + 0.01) // A5 — steel ring
    ring.frequency.exponentialRampToValueAtTime(660, now + 0.3)
    ringGain.gain.setValueAtTime(0,            now)
    ringGain.gain.linearRampToValueAtTime(vol * 0.28, now + 0.015)
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
    ringComp.threshold.value = -18; ringComp.ratio.value = 6
    ring.connect(ringGain); ringGain.connect(ringComp); ringComp.connect(ctx.destination)
    ring.start(now + 0.01); ring.stop(now + 0.4)

    // ── 4. IMPACT thump — low-frequency punch on contact ──
    const impLen = Math.floor(RATE * 0.06)
    const impBuf = ctx.createBuffer(1, impLen, RATE)
    const impD   = impBuf.getChannelData(0)
    for (let i = 0; i < impLen; i++) {
      impD[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impLen, 5)
    }
    const impSrc    = ctx.createBufferSource(); impSrc.buffer = impBuf
    const impFilter = ctx.createBiquadFilter()
    impFilter.type  = 'lowpass'; impFilter.frequency.value = 180
    const impGain = ctx.createGain()
    impGain.gain.setValueAtTime(vol * 0.45, now)
    impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    impSrc.connect(impFilter); impFilter.connect(impGain); impGain.connect(ctx.destination)
    impSrc.start(now); impSrc.stop(now + 0.06)

    // Close context after sound finishes
    setTimeout(() => ctx.close(), 700)
  } catch (_) {}
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PhonePage() {
  const { roomId } = useParams()
  const [screen,      setScreen]      = useState('intro')
  const [slashing,    setSlashing]    = useState(false)
  const [slashCount,  setSlashCount]  = useState(0)
  const [motionLevel, setMotionLevel] = useState(0)
  const [permError,   setPermError]   = useState('')

  const lastAccel      = useRef({ x: 0, y: 0, z: 0 })
  const lastSlashTime  = useRef(0)
  const decayTimer     = useRef(null)
  const joinInterval   = useRef(null)
  const motionActive   = useRef(false)

  const socketActive = screen === 'connecting' || screen === 'active'
  const { publish, connState } = usePartySocket(
    socketActive ? roomId : null,
    (event) => { if (event === 'ready') clearInterval(joinInterval.current) }
  )

  // Start pinging join after socket opens
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
    if (intensity > 2.2 && now - lastSlashTime.current > 155) {
      lastSlashTime.current = now
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)
      publish('slash', { angle, intensity, x: 0.25 + Math.random() * 0.5, y: 0.15 + Math.random() * 0.55, t: now })
      setSlashing(true)
      setSlashCount(c => c + 1)
      makeKatanaSlash(intensity)
      setTimeout(() => setSlashing(false), 275)
    }
  }, [publish])

  const handleUnsheathe = async () => {
    setPermError('')
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
      try {
        const res = await DeviceMotionEvent.requestPermission()
        if (res !== 'granted') { setPermError('Motion permission denied. Allow in Settings → Safari.'); return }
      } catch { setPermError('Permission request failed. Try reloading.'); return }
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

  const accent = (pos) => ({
    position: 'fixed', [pos]: 0, left: 0, right: 0, height: '3px',
    background: 'linear-gradient(90deg,transparent,#8b0000,#e74c3c,#8b0000,transparent)',
    boxShadow: '0 0 20px rgba(231,76,60,.82)', zIndex: 10,
  })

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%,#200008,#110005 55%,#080002 100%)',
      padding: '28px', fontFamily: "'Cinzel',serif",
      backgroundImage: 'url(/backgrounds/infinity-castle.jpg)',
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      {/* Overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,0,2,0.80)', zIndex: 0 }}/>
      <div style={accent('top')}/>

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%',
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Shippori Mincho',serif",
            fontSize: 'clamp(1.8rem,10vw,2.8rem)', fontWeight: 800,
            background: 'linear-gradient(180deg,#c9a84c,#f0c850,#8a6020)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 22px rgba(201,168,76,.55))',
            letterSpacing: '.08em',
          }}>鬼滅の刃</div>
          <div style={{ fontSize: '.5rem', letterSpacing: '.45em', color: 'rgba(231,76,60,.5)', marginTop: '2px' }}>
            KIMETSU NO YAIBA
          </div>
        </div>

        {/* Room badge */}
        <div style={{
          padding: '7px 22px', border: '1px solid rgba(139,0,0,.38)',
          borderRadius: '2px', background: 'rgba(139,0,0,.08)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '.38rem', letterSpacing: '.4em', color: 'rgba(201,168,76,.28)', marginBottom: '3px' }}>
            部屋番号 · ROOM
          </div>
          <div style={{ fontSize: '1rem', letterSpacing: '.28em', fontWeight: 700, color: 'rgba(231,76,60,.72)' }}>
            {roomId}
          </div>
        </div>

        {/* Blade */}
        <NichirinBlade slashing={false} size="preview"/>

        {/* Error */}
        {permError && (
          <div style={{
            fontSize: '.54rem', color: '#e74c3c', letterSpacing: '.1em', textAlign: 'center',
            maxWidth: '270px', padding: '8px', border: '1px solid rgba(231,76,60,.32)',
            borderRadius: '3px', background: 'rgba(180,0,0,.07)',
          }}>{permError}</div>
        )}

        {/* UNSHEATHE button */}
        <button onClick={handleUnsheathe} style={{
          padding: '18px 52px',
          background: 'linear-gradient(135deg,rgba(139,0,0,.28),rgba(80,0,0,.14))',
          border: '1px solid rgba(231,76,60,.68)', borderRadius: '2px',
          color: '#e74c3c', fontFamily: "'Cinzel',serif", fontSize: '.85rem',
          letterSpacing: '.38em', textTransform: 'uppercase', cursor: 'pointer',
          boxShadow: '0 0 32px rgba(139,0,0,.4),inset 0 0 20px rgba(139,0,0,.12)',
          WebkitTapHighlightColor: 'transparent',
        }}>
          抜 刀 · UNSHEATHE
        </button>

        <div style={{ fontSize: '.44rem', letterSpacing: '.2em', color: 'rgba(255,255,255,.16)', textAlign: 'center' }}>
          Open Battlefield on your laptop first
        </div>
      </div>
      <div style={accent('bottom')}/>
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
      <div style={accent('top')}/>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: connState === 'connected' ? '#e74c3c' : '#8b0000',
            boxShadow: connState === 'connected' ? '0 0 12px rgba(231,76,60,.9)' : 'none',
          }}/>
          <span style={{ fontSize: '.46rem', letterSpacing: '.3em', color: 'rgba(231,76,60,.5)', textTransform: 'uppercase' }}>
            {connState === 'connected' ? `ROOM ${roomId} · LIVE` : `ROOM ${roomId} · ${connState.toUpperCase()}`}
          </span>
        </div>
        <div style={{ fontSize: '.4rem', letterSpacing: '.25em', color: 'rgba(201,168,76,.22)' }}>
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
          <span style={{
            fontSize: '.44rem', letterSpacing: '.18em', textTransform: 'uppercase',
            color: motionLevel > 2.2 ? '#e74c3c' : 'rgba(180,0,0,.4)',
            transition: 'color .15s', minWidth: '56px',
          }}>
            {motionLevel > 2.2 ? '⚔ STRIKE' : 'IDLE'}
          </span>
          <div style={{ flex: 1, height: '2px', background: 'rgba(139,0,0,.18)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${barPct}%`, height: '100%',
              background: barPct > 75 ? '#ff8866' : '#e74c3c',
              boxShadow: motionLevel > 2.2 ? '0 0 10px rgba(231,76,60,.9)' : 'none',
              transition: 'width .05s linear',
            }}/>
          </div>
          <span style={{ fontSize: '.38rem', color: 'rgba(180,0,0,.42)', minWidth: '30px', textAlign: 'right' }}>
            {motionLevel.toFixed(1)}
          </span>
        </div>
      </div>

      <div style={{ fontSize: '.44rem', letterSpacing: '.22em', color: 'rgba(180,0,0,.32)' }}>
        全集中 · TOTAL CONCENTRATION
      </div>

      <div style={accent('bottom')}/>
    </div>
  )
}