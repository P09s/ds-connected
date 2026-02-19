// src/pages/PhonePage.jsx
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAblyChannel } from '../hooks/useAbly'

// SVG Nichirin Sword (Tanjiro's water-style)
function NichirinSword({ slashing }) {
  return (
    <svg
      viewBox="0 0 120 600"
      style={{
        width: '100%',
        maxWidth: '160px',
        height: 'auto',
        filter: slashing
          ? 'drop-shadow(0 0 20px rgba(125,249,255,1)) drop-shadow(0 0 50px rgba(0,200,255,0.8))'
          : 'drop-shadow(0 0 8px rgba(125,249,255,0.3)) drop-shadow(0 0 20px rgba(0,200,255,0.15))',
        transition: 'filter 0.15s',
        animation: slashing ? 'sword-slash 0.3s ease-out' : 'sword-glow 2s ease-in-out infinite',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blade */}
      <defs>
        <linearGradient id="blade-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b0f0ff" />
          <stop offset="30%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#7DF9FF" />
          <stop offset="100%" stopColor="#004e99" />
        </linearGradient>
        <linearGradient id="guard-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c8a86b" />
          <stop offset="50%" stopColor="#f0d080" />
          <stop offset="100%" stopColor="#8a6a30" />
        </linearGradient>
        <filter id="blade-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Blade body */}
      <polygon
        points="60,10 52,400 68,400"
        fill="url(#blade-grad)"
        filter="url(#blade-glow)"
      />
      {/* Blade edge line */}
      <line x1="60" y1="10" x2="60" y2="400" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
      {/* Blade fuller (groove) */}
      <line x1="58" y1="40" x2="55" y2="390" stroke="rgba(125,249,255,0.4)" strokeWidth="0.8"/>

      {/* Habaki (blade collar) */}
      <rect x="48" y="395" width="24" height="18" rx="1" fill="#c8a070"/>
      <rect x="50" y="397" width="20" height="14" rx="1" fill="#e0b87a" opacity="0.7"/>

      {/* Tsuba (guard) - circular with water pattern */}
      <ellipse cx="60" cy="425" rx="36" ry="12" fill="url(#guard-grad)"/>
      <ellipse cx="60" cy="425" rx="32" ry="9" fill="none" stroke="#f0d080" strokeWidth="1.5"/>
      {/* Water wave on guard */}
      <path d="M 34 425 Q 42 420 50 425 Q 58 430 66 425 Q 74 420 82 425"
        stroke="#7DF9FF" strokeWidth="1.2" fill="none" opacity="0.7"/>

      {/* Tsuka (handle) - wrapped grip */}
      <rect x="53" y="437" width="14" height="120" rx="7" fill="#2a1a0a"/>
      {/* Handle wrapping - diagonal bands */}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i}
          x1="53" y1={443 + i * 11}
          x2="67" y2={438 + i * 11}
          stroke="#4a3020" strokeWidth="3" strokeLinecap="round"
        />
      ))}
      {/* Handle edge highlight */}
      <rect x="53" y="437" width="14" height="120" rx="7"
        fill="none" stroke="#3a2510" strokeWidth="1"/>

      {/* Kashira (pommel) */}
      <ellipse cx="60" cy="562" rx="10" ry="8" fill="#c8a070"/>
      <ellipse cx="60" cy="560" rx="8" ry="5" fill="#e0b87a"/>

      {/* Water shimmer on blade when active */}
      {slashing && (
        <>
          <line x1="55" y1="50" x2="65" y2="350" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" opacity="0.9"/>
          <ellipse cx="60" cy="200" rx="8" ry="80" fill="rgba(125,249,255,0.15)"/>
        </>
      )}
    </svg>
  )
}

function WaterParticles({ triggered }) {
  if (!triggered) return null
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 60 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 360
        const dist = 60 + Math.random() * 80
        const rad = (angle * Math.PI) / 180
        return (
          <div key={i} style={{
            position: 'absolute',
            left: '50%', top: '40%',
            width: '4px', height: '4px',
            borderRadius: '50%',
            background: '#7DF9FF',
            boxShadow: '0 0 8px rgba(0,200,255,0.9)',
            '--tx': `${Math.cos(rad) * dist}px`,
            '--ty': `${Math.sin(rad) * dist}px`,
          }} className="particle-el" />
        )
      })}
    </div>
  )
}

export default function PhonePage() {
  const { roomId } = useParams()
  const [started, setStarted] = useState(false)
  const [connected, setConnected] = useState(false)
  const [slashing, setSlashing] = useState(false)
  const [particles, setParticles] = useState(false)
  const [slashCount, setSlashCount] = useState(0)
  const [motionLevel, setMotionLevel] = useState(0)
  const lastAccel = useRef({ x: 0, y: 0, z: 0 })
  const lastSlashTime = useRef(0)
  const audioCtxRef = useRef(null)
  const decayRef = useRef(null)

  const intervalRef = useRef(null)
  const { publish } = useAblyChannel(started ? roomId : null, (event) => {
    // Laptop confirmed it received join — stop pinging
    if (event === 'ready') {
      clearInterval(intervalRef.current)
    }
  })

  useEffect(() => {
    if (!started) return
    setConnected(true)
    // Ping 'join' repeatedly so laptop catches it regardless of load timing
    const sendJoin = () => publish('join', { roomId, t: Date.now() })
    setTimeout(sendJoin, 300)
    intervalRef.current = setInterval(sendJoin, 1500)
    return () => clearInterval(intervalRef.current)
  }, [started, publish, roomId])

  const playWhoosh = useCallback((intensity) => {
    try {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const now = ctx.currentTime
      const vol = Math.min(0.25 + intensity * 0.01, 0.7)

      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.2), ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length)
      const src = ctx.createBufferSource()
      src.buffer = buf
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'; bp.frequency.setValueAtTime(1000, now); bp.frequency.exponentialRampToValueAtTime(200, now + 0.2); bp.Q.value = 0.8
      const g = ctx.createGain()
      g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
      src.connect(bp); bp.connect(g); g.connect(ctx.destination)
      src.start(now); src.stop(now + 0.22)

      const osc = ctx.createOscillator(); const og = ctx.createGain()
      osc.frequency.setValueAtTime(120, now); osc.frequency.exponentialRampToValueAtTime(30, now + 0.1)
      og.gain.setValueAtTime(vol * 0.4, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
      osc.connect(og); og.connect(ctx.destination)
      osc.start(now); osc.stop(now + 0.12)
    } catch (_) {}
  }, [])

  const handleMotion = useCallback((e) => {
    if (!connected) return
    const a = e.accelerationIncludingGravity
    if (!a) return
    const ax = a.x ?? 0, ay = a.y ?? 0, az = a.z ?? 0
    const dx = ax - lastAccel.current.x
    const dy = ay - lastAccel.current.y
    const dz = az - lastAccel.current.z
    lastAccel.current = { x: ax, y: ay, z: az }
    const intensity = Math.sqrt(dx * dx + dy * dy + dz * dz)

    setMotionLevel(intensity)
    clearTimeout(decayRef.current)
    decayRef.current = setTimeout(() => setMotionLevel(0), 200)

    const now = Date.now()
    if (intensity > 2.0 && now - lastSlashTime.current > 150) {
      lastSlashTime.current = now
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      // Send slash data to laptop via Ably
      publish('slash', {
        angle,
        intensity,
        x: 0.3 + Math.random() * 0.4, // normalized 0-1 position
        y: 0.2 + Math.random() * 0.5,
        t: now,
      })

      setSlashing(true)
      setParticles(true)
      setSlashCount(c => c + 1)
      playWhoosh(intensity)

      setTimeout(() => setSlashing(false), 300)
      setTimeout(() => setParticles(false), 500)
    }
  }, [connected, publish, playWhoosh])

  const handleStart = async () => {
    if (typeof DeviceMotionEvent?.requestPermission === 'function') {
      try {
        const res = await DeviceMotionEvent.requestPermission()
        if (res !== 'granted') { alert('Motion permission denied.'); return }
      } catch (_) {}
    }
    setStarted(true)
    window.addEventListener('devicemotion', handleMotion, true)
  }

  useEffect(() => {
    return () => window.removeEventListener('devicemotion', handleMotion, true)
  }, [handleMotion])

  const barPct = Math.min(motionLevel * 5, 100)

  // ── Intro screen ──
  if (!started) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at center, #041628 0%, #020b18 70%)' }}>
        <div style={{
          fontFamily: "'Shippori Mincho', serif", fontSize: '3rem', fontWeight: 800,
          background: 'linear-gradient(180deg,#7DF9FF,#00c8ff,#0066cc)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(0,200,255,0.4))',
          marginBottom: '8px', letterSpacing: '0.1em',
        }}>水の呼吸</div>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.4em', color: 'rgba(125,249,255,0.5)', marginBottom: '4px' }}>
          SWORD MODE
        </div>
        <div style={{
          fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(125,249,255,0.3)',
          marginBottom: '48px', padding: '6px 14px',
          border: '1px solid rgba(125,249,255,0.15)', borderRadius: '2px',
        }}>
          ROOM: {roomId}
        </div>

        <div style={{ width: '120px', marginBottom: '40px' }}>
          <NichirinSword slashing={false} />
        </div>

        <button
          onClick={handleStart}
          style={{
            padding: '18px 48px',
            background: 'rgba(125,249,255,0.08)',
            border: '1px solid rgba(125,249,255,0.5)',
            borderRadius: '3px', color: '#7DF9FF',
            fontFamily: "'Cinzel', serif", fontSize: '0.8rem',
            letterSpacing: '0.35em', textTransform: 'uppercase',
            cursor: 'pointer', boxShadow: '0 0 20px rgba(0,200,255,0.15)',
          }}
        >
          Unsheathe · 抜刀
        </button>
        <div style={{ marginTop: '12px', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(125,249,255,0.2)' }}>
          Make sure your laptop is open on the Battlefield screen
        </div>
      </div>
    )
  }

  // ── Active sword screen ──
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between"
      style={{
        background: 'radial-gradient(ellipse at center, #041628 0%, #020b18 80%)',
        paddingTop: '32px', paddingBottom: '24px',
      }}
    >
      {/* Status bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: connected ? '#7DF9FF' : '#ff4444',
            boxShadow: connected ? '0 0 8px rgba(125,249,255,0.8)' : 'none',
            animation: connected ? 'none' : 'pulse-ring 1s ease-out infinite',
          }}/>
          <span style={{ fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(125,249,255,0.5)' }}>
            {connected ? `ROOM ${roomId}` : 'CONNECTING...'}
          </span>
        </div>
        <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: 'rgba(125,249,255,0.25)' }}>
          {slashCount} slash{slashCount !== 1 ? 'es' : ''} delivered
        </div>
      </div>

      {/* Sword — constrained to available vertical space */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', overflow: 'hidden', minHeight: 0 }}>
        <WaterParticles triggered={particles} />
        <div style={{
          height: '100%',
          maxHeight: 'calc(100vh - 160px)',
          width: 'auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: slashing ? 'rotate(15deg) scale(1.04)' : 'rotate(0deg)',
          transition: 'transform 0.15s ease-out',
        }}>
          <svg
            viewBox="0 0 120 600"
            style={{
              height: '100%',
              maxHeight: 'calc(100vh - 160px)',
              width: 'auto',
              filter: slashing
                ? 'drop-shadow(0 0 20px rgba(125,249,255,1)) drop-shadow(0 0 50px rgba(0,200,255,0.8))'
                : 'drop-shadow(0 0 8px rgba(125,249,255,0.3)) drop-shadow(0 0 20px rgba(0,200,255,0.15))',
              transition: 'filter 0.15s',
              animation: slashing ? 'sword-slash 0.3s ease-out' : 'sword-glow 2s ease-in-out infinite',
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="blade-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#b0f0ff" />
                <stop offset="30%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#7DF9FF" />
                <stop offset="100%" stopColor="#004e99" />
              </linearGradient>
              <linearGradient id="guard-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#c8a86b" />
                <stop offset="50%" stopColor="#f0d080" />
                <stop offset="100%" stopColor="#8a6a30" />
              </linearGradient>
              <filter id="blade-glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <polygon points="60,10 52,400 68,400" fill="url(#blade-grad)" filter="url(#blade-glow)"/>
            <line x1="60" y1="10" x2="60" y2="400" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
            <line x1="58" y1="40" x2="55" y2="390" stroke="rgba(125,249,255,0.4)" strokeWidth="0.8"/>
            <rect x="48" y="395" width="24" height="18" rx="1" fill="#c8a070"/>
            <rect x="50" y="397" width="20" height="14" rx="1" fill="#e0b87a" opacity="0.7"/>
            <ellipse cx="60" cy="425" rx="36" ry="12" fill="url(#guard-grad)"/>
            <ellipse cx="60" cy="425" rx="32" ry="9" fill="none" stroke="#f0d080" strokeWidth="1.5"/>
            <path d="M 34 425 Q 42 420 50 425 Q 58 430 66 425 Q 74 420 82 425" stroke="#7DF9FF" strokeWidth="1.2" fill="none" opacity="0.7"/>
            <rect x="53" y="437" width="14" height="120" rx="7" fill="#2a1a0a"/>
            {Array.from({ length: 10 }, (_, i) => (
              <line key={i} x1="53" y1={443 + i * 11} x2="67" y2={438 + i * 11} stroke="#4a3020" strokeWidth="3" strokeLinecap="round"/>
            ))}
            <rect x="53" y="437" width="14" height="120" rx="7" fill="none" stroke="#3a2510" strokeWidth="1"/>
            <ellipse cx="60" cy="562" rx="10" ry="8" fill="#c8a070"/>
            <ellipse cx="60" cy="560" rx="8" ry="5" fill="#e0b87a"/>
            {slashing && (
              <>
                <line x1="55" y1="50" x2="65" y2="350" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" opacity="0.9"/>
                <ellipse cx="60" cy="200" rx="8" ry="80" fill="rgba(125,249,255,0.15)"/>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Motion bar */}
      <div style={{ width: 'calc(100% - 48px)', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase',
            color: motionLevel > 2 ? '#7DF9FF' : 'rgba(125,249,255,0.3)',
            transition: 'color 0.2s', whiteSpace: 'nowrap', minWidth: '48px',
          }}>
            {motionLevel > 2 ? '⚡ Strike' : 'Idle'}
          </span>
          <div style={{ flex: 1, height: '2px', background: 'rgba(125,249,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${barPct}%`, height: '100%',
              background: barPct > 70 ? '#ffffff' : '#7DF9FF',
              boxShadow: motionLevel > 2 ? '0 0 8px rgba(125,249,255,0.9)' : 'none',
              transition: 'width 0.06s linear', borderRadius: '2px',
            }}/>
          </div>
          <span style={{ fontSize: '0.45rem', color: 'rgba(125,249,255,0.3)', minWidth: '28px', textAlign: 'right' }}>
            {motionLevel.toFixed(1)}
          </span>
        </div>
      </div>

      <div style={{ fontSize: '0.5rem', letterSpacing: '0.25em', color: 'rgba(125,249,255,0.2)' }}>
        Slash your phone like a sword
      </div>
    </div>
  )
}