// src/pages/PhonePage.jsx — CLEAN REWRITE
// State machine: 'intro' → 'connecting' → 'active'
// No ambiguous booleans. No race conditions. Works on Android + iOS.

import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePartySocket } from '../hooks/usePartySocket'

// ─── Sword SVG ───────────────────────────────────────────────────────────────
function Sword({ slashing, size = 'full' }) {
  const h = size === 'preview' ? '180px' : 'min(60vh, 420px)'
  return (
    <svg viewBox="0 0 120 600" style={{
      height: h, width: 'auto',
      filter: slashing
        ? 'drop-shadow(0 0 24px rgba(125,249,255,1)) drop-shadow(0 0 60px rgba(0,200,255,0.9))'
        : 'drop-shadow(0 0 10px rgba(125,249,255,0.4)) drop-shadow(0 0 28px rgba(0,200,255,0.2))',
      transition: 'filter 0.12s',
      animation: slashing ? 'swordSlash 0.3s ease-out' : 'swordGlow 2.4s ease-in-out infinite',
      transform: slashing ? 'rotate(12deg) scale(1.05)' : 'none',
    }}>
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b0f0ff"/>
          <stop offset="30%" stopColor="#ffffff"/>
          <stop offset="60%" stopColor="#7DF9FF"/>
          <stop offset="100%" stopColor="#004e99"/>
        </linearGradient>
        <linearGradient id="gg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8a86b"/>
          <stop offset="50%" stopColor="#f0d080"/>
          <stop offset="100%" stopColor="#8a6a30"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Blade */}
      <polygon points="60,10 52,400 68,400" fill="url(#bg)" filter="url(#glow)"/>
      <line x1="60" y1="10" x2="60" y2="400" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
      <line x1="57" y1="40" x2="54" y2="390" stroke="rgba(125,249,255,0.4)" strokeWidth="0.8"/>
      {slashing && <>
        <line x1="55" y1="50" x2="65" y2="350" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" opacity="0.9"/>
        <ellipse cx="60" cy="200" rx="8" ry="80" fill="rgba(125,249,255,0.12)"/>
      </>}
      {/* Collar */}
      <rect x="48" y="395" width="24" height="18" rx="1" fill="#c8a070"/>
      <rect x="50" y="397" width="20" height="14" rx="1" fill="#e0b87a" opacity="0.7"/>
      {/* Guard */}
      <ellipse cx="60" cy="425" rx="36" ry="12" fill="url(#gg)"/>
      <ellipse cx="60" cy="425" rx="32" ry="9" fill="none" stroke="#f0d080" strokeWidth="1.5"/>
      <path d="M34 425 Q42 420 50 425 Q58 430 66 425 Q74 420 82 425" stroke="#7DF9FF" strokeWidth="1.2" fill="none" opacity="0.7"/>
      {/* Handle */}
      <rect x="53" y="437" width="14" height="120" rx="7" fill="#2a1a0a"/>
      {Array.from({length:10},(_,i)=>(
        <line key={i} x1="53" y1={443+i*11} x2="67" y2={438+i*11} stroke="#4a3020" strokeWidth="3" strokeLinecap="round"/>
      ))}
      <rect x="53" y="437" width="14" height="120" rx="7" fill="none" stroke="#3a2510" strokeWidth="1"/>
      {/* Pommel */}
      <ellipse cx="60" cy="562" rx="10" ry="8" fill="#c8a070"/>
      <ellipse cx="60" cy="560" rx="8" ry="5" fill="#e0b87a"/>
    </svg>
  )
}

// ─── Audio ────────────────────────────────────────────────────────────────────
function makeWhoosh(intensity) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    const vol = Math.min(0.2 + intensity * 0.012, 0.75)
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1)*(1-i/d.length)
    const src = ctx.createBufferSource(); src.buffer = buf
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.setValueAtTime(900, now)
    bp.frequency.exponentialRampToValueAtTime(180, now+0.2)
    bp.Q.value = 0.9
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, now)
    g.gain.exponentialRampToValueAtTime(0.001, now+0.22)
    src.connect(bp); bp.connect(g); g.connect(ctx.destination)
    src.start(now); src.stop(now+0.22)
    setTimeout(() => ctx.close(), 500)
  } catch(_) {}
}

// ─── Main Component ───────────────────────────────────────────────────────────
// SCREEN STATE MACHINE:
//   'intro'      → show Room ID + Unsheathe button
//   'connecting' → socket opened, pinging join, waiting for laptop
//   'active'     → laptop confirmed, show sword + motion tracking

export default function PhonePage() {
  const { roomId } = useParams()

  // ── State machine ──
  const [screen, setScreen] = useState('intro') // 'intro' | 'connecting' | 'active'
  const [slashing, setSlashing] = useState(false)
  const [slashCount, setSlashCount] = useState(0)
  const [motionLevel, setMotionLevel] = useState(0)
  const [permError, setPermError] = useState('')

  // ── Refs ──
  const lastAccel = useRef({ x: 0, y: 0, z: 0 })
  const lastSlashTime = useRef(0)
  const decayTimer = useRef(null)
  const joinInterval = useRef(null)
  const motionListening = useRef(false)

  // ── Socket — only connect after user taps Unsheathe ──
  const socketActive = screen === 'connecting' || screen === 'active'
  const { publish, connState } = usePartySocket(
    socketActive ? roomId : null,
    (event) => {
      if (event === 'ready') {
        // Laptop acknowledged — stop pinging
        clearInterval(joinInterval.current)
      }
    }
  )

  // ── When connecting: ping 'join' until laptop responds ──
  useEffect(() => {
    if (screen !== 'connecting') return
    // Wait 600ms for socket to open, then start pinging
    const boot = setTimeout(() => {
      const ping = () => {
        publish('join', { roomId, t: Date.now() })
        setScreen('active') // optimistically show sword immediately
      }
      ping()
      joinInterval.current = setInterval(() => {
        publish('join', { roomId, t: Date.now() })
      }, 1200)
    }, 600)
    return () => {
      clearTimeout(boot)
      clearInterval(joinInterval.current)
    }
  }, [screen, publish, roomId])

  // ── Motion handler ──
  const handleMotion = useCallback((e) => {
    const a = e.accelerationIncludingGravity
    if (!a) return
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
      publish('slash', {
        angle, intensity,
        x: 0.25 + Math.random() * 0.5,
        y: 0.15 + Math.random() * 0.55,
        t: now,
      })
      setSlashing(true)
      setSlashCount(c => c + 1)
      makeWhoosh(intensity)
      setTimeout(() => setSlashing(false), 280)
    }
  }, [publish])

  // ── Unsheathe button handler ──
  const handleUnsheathe = async () => {
    setPermError('')

    // iOS requires explicit permission prompt
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
      try {
        const res = await DeviceMotionEvent.requestPermission()
        if (res !== 'granted') {
          setPermError('Motion permission denied. Please allow it in Settings → Safari.')
          return
        }
      } catch (err) {
        setPermError('Could not request motion permission. Try reloading.')
        return
      }
    }

    // Start listening to motion
    if (!motionListening.current) {
      window.addEventListener('devicemotion', handleMotion, true)
      motionListening.current = true
    }

    // Advance state — this triggers the socket + join ping useEffect
    setScreen('connecting')
  }

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleMotion, true)
      clearInterval(joinInterval.current)
      clearTimeout(decayTimer.current)
    }
  }, [handleMotion])

  const barPct = Math.min(motionLevel * 4.5, 100)

  // ════════════════════════════════════════════════════════════
  // SCREEN: INTRO
  // ════════════════════════════════════════════════════════════
  if (screen === 'intro') {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 40%, #041e3a 0%, #020b18 100%)',
        padding: '24px',
        fontFamily: "'Cinzel', serif",
      }}>
        {/* Title */}
        <div style={{
          fontFamily: "'Shippori Mincho', serif",
          fontSize: 'clamp(2.2rem, 12vw, 3.2rem)',
          fontWeight: 800,
          background: 'linear-gradient(180deg, #7DF9FF 0%, #00c8ff 55%, #004e99 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 24px rgba(0,200,255,0.5))',
          letterSpacing: '0.08em', marginBottom: '6px', textAlign: 'center',
        }}>水の呼吸</div>

        <div style={{
          fontSize: '0.6rem', letterSpacing: '0.45em',
          color: 'rgba(125,249,255,0.45)', marginBottom: '32px',
          textTransform: 'uppercase',
        }}>SWORD MODE</div>

        {/* Room badge */}
        <div style={{
          padding: '8px 20px', marginBottom: '36px',
          border: '1px solid rgba(125,249,255,0.2)',
          borderRadius: '3px',
          background: 'rgba(125,249,255,0.04)',
        }}>
          <div style={{ fontSize: '0.45rem', letterSpacing: '0.4em', color: 'rgba(125,249,255,0.3)', marginBottom: '3px' }}>
            ROOM
          </div>
          <div style={{
            fontSize: '1.1rem', letterSpacing: '0.3em',
            fontWeight: 700, color: 'rgba(125,249,255,0.75)',
          }}>{roomId}</div>
        </div>

        {/* Sword preview */}
        <div style={{ marginBottom: '36px', opacity: 0.85 }}>
          <Sword slashing={false} size="preview"/>
        </div>

        {/* Error message */}
        {permError && (
          <div style={{
            fontSize: '0.6rem', color: '#ff6666', letterSpacing: '0.1em',
            textAlign: 'center', maxWidth: '260px', marginBottom: '12px',
            padding: '8px', border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: '4px', background: 'rgba(255,0,0,0.05)',
          }}>{permError}</div>
        )}

        {/* THE button */}
        <button
          onClick={handleUnsheathe}
          style={{
            padding: '18px 52px',
            background: 'rgba(125,249,255,0.08)',
            border: '1px solid rgba(125,249,255,0.55)',
            borderRadius: '3px',
            color: '#7DF9FF',
            fontFamily: "'Cinzel', serif",
            fontSize: '0.85rem',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 0 24px rgba(0,200,255,0.15), inset 0 0 20px rgba(125,249,255,0.04)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Unsheathe · 抜刀
        </button>

        <div style={{
          marginTop: '14px', fontSize: '0.5rem',
          letterSpacing: '0.2em', color: 'rgba(125,249,255,0.2)',
          textAlign: 'center',
        }}>
          Open Battlefield on your laptop first
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // SCREEN: CONNECTING + ACTIVE (same sword UI, different status)
  // ════════════════════════════════════════════════════════════
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      background: 'radial-gradient(ellipse at 50% 35%, #041e3a 0%, #020b18 100%)',
      paddingTop: '28px', paddingBottom: '20px',
      fontFamily: "'Cinzel', serif",
    }}>

      {/* ── Status bar ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: connState === 'connected' ? '#7DF9FF' : '#ffaa00',
            boxShadow: connState === 'connected' ? '0 0 10px rgba(125,249,255,0.9)' : '0 0 8px rgba(255,170,0,0.6)',
          }}/>
          <span style={{ fontSize: '0.5rem', letterSpacing: '0.3em', color: 'rgba(125,249,255,0.5)', textTransform: 'uppercase' }}>
            {connState === 'connected' ? `ROOM ${roomId} · LIVE` : `ROOM ${roomId} · ${connState.toUpperCase()}`}
          </span>
        </div>
        <div style={{ fontSize: '0.45rem', letterSpacing: '0.25em', color: 'rgba(125,249,255,0.22)' }}>
          {slashCount} slash{slashCount !== 1 ? 'es' : ''} delivered
        </div>
      </div>

      {/* ── Sword ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px', overflow: 'hidden', minHeight: 0,
        transition: 'transform 0.12s ease-out',
      }}>
        <Sword slashing={slashing} size="full"/>
      </div>

      {/* ── Motion bar ── */}
      <div style={{ width: 'calc(100% - 48px)', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: motionLevel > 2.2 ? '#7DF9FF' : 'rgba(125,249,255,0.28)',
            transition: 'color 0.15s', minWidth: '52px',
          }}>
            {motionLevel > 2.2 ? '⚡ STRIKE' : 'IDLE'}
          </span>
          <div style={{
            flex: 1, height: '2px',
            background: 'rgba(125,249,255,0.08)', borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              width: `${barPct}%`, height: '100%',
              background: barPct > 75 ? '#ffffff' : '#7DF9FF',
              boxShadow: motionLevel > 2.2 ? '0 0 10px rgba(125,249,255,1)' : 'none',
              transition: 'width 0.05s linear',
            }}/>
          </div>
          <span style={{ fontSize: '0.42rem', color: 'rgba(125,249,255,0.28)', minWidth: '30px', textAlign: 'right' }}>
            {motionLevel.toFixed(1)}
          </span>
        </div>
      </div>

      <div style={{ fontSize: '0.48rem', letterSpacing: '0.22em', color: 'rgba(125,249,255,0.18)' }}>
        SLASH YOUR PHONE LIKE A SWORD
      </div>

    </div>
  )
}