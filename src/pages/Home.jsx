// src/pages/Home.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function generateRoomId() {
  const words = ['WATER', 'FLAME', 'THUNDER', 'WIND', 'STONE', 'MOON', 'SUN', 'MIST']
  const nums = Math.floor(Math.random() * 900 + 100)
  return words[Math.floor(Math.random() * words.length)] + nums
}

export default function Home() {
  const [roomInput, setRoomInput] = useState('')
  const [mode, setMode] = useState(null) // 'phone' | 'laptop'
  const [showInstructions, setShowInstructions] = useState(false)
  const navigate = useNavigate()

  const handleJoin = () => {
    const room = roomInput.trim().toUpperCase() || generateRoomId()
    navigate(`/${mode}/${room}`)
  }

  const handleCreate = (selectedMode) => {
    const room = generateRoomId()
    setMode(selectedMode)
    setRoomInput(room)
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center py-12 px-4 overflow-x-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 60%, #041e3a 0%, #020b18 70%)',
        fontFamily: "'Cinzel', serif",
      }}
    >
      {/* Animated water lines - kept fixed so they stay in the background */}
      <svg className="fixed inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i}
            d={`M -200 ${60 + i * 90} Q 400 ${40 + i * 90} 800 ${70 + i * 90} T 1800 ${55 + i * 90}`}
            stroke="#7DF9FF" strokeWidth="1" fill="none"
            style={{ animation: `wave ${7 + i}s linear infinite` }}
          />
        ))}
      </svg>

      {/* Main Content Wrapper for spacing */}
      <div className="z-10 flex flex-col items-center w-full max-w-md gap-8">
        
        {/* Title */}
        <div className="fade-in text-center" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          <div style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: 'clamp(2.5rem, 10vw, 4rem)',
            fontWeight: 800,
            background: 'linear-gradient(180deg, #7DF9FF 0%, #00c8ff 60%, #004e99 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(0,200,255,0.5))',
            letterSpacing: '0.08em',
          }}>
            水の呼吸
          </div>
          <div style={{
            fontSize: 'clamp(0.6rem, 2vw, 0.8rem)',
            letterSpacing: '0.5em',
            color: 'rgba(125,249,255,0.5)',
            marginTop: '8px',
            textTransform: 'uppercase',
          }}>
            Water Breathing · Connected
          </div>
        </div>

        {/* Mode selector - Updated to stack on mobile (flex-col) and row on larger screens (sm:flex-row) */}
        <div className="fade-in w-full flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
          {[
            { id: 'phone', label: '📱 Sword', sub: 'You swing this' },
            { id: 'laptop', label: '🖥️ Battlefield', sub: 'Slash appears here' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); handleCreate(m.id) }}
              className="flex-1"
              style={{
                padding: '16px 12px',
                background: mode === m.id ? 'rgba(125,249,255,0.15)' : 'rgba(125,249,255,0.04)',
                border: `1px solid ${mode === m.id ? 'rgba(125,249,255,0.7)' : 'rgba(125,249,255,0.2)'}`,
                borderRadius: '4px',
                color: mode === m.id ? '#7DF9FF' : 'rgba(125,249,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
                boxShadow: mode === m.id ? '0 0 20px rgba(0,200,255,0.2)' : 'none',
              }}
            >
              <div style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', opacity: 0.6, textTransform: 'uppercase' }}>{m.sub}</div>
            </button>
          ))}
        </div>

        {/* Room ID input */}
        <div className="fade-in flex flex-col items-center w-full gap-4" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
          <div className="text-center">
            <div style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: 'rgba(125,249,255,0.4)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Room ID
            </div>
            <input
              value={roomInput}
              onChange={e => setRoomInput(e.target.value.toUpperCase())}
              placeholder="e.g. WATER420"
              style={{
                background: 'rgba(125,249,255,0.05)',
                border: '1px solid rgba(125,249,255,0.3)',
                borderRadius: '3px',
                padding: '12px 20px',
                color: '#7DF9FF',
                fontFamily: "'Cinzel', serif",
                fontSize: '1.1rem',
                letterSpacing: '0.3em',
                textAlign: 'center',
                outline: 'none',
                width: '100%',
                maxWidth: '260px',
              }}
            />
            <div style={{ fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(125,249,255,0.3)', marginTop: '8px' }}>
              Share this ID with the other device
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={!mode || !roomInput}
            style={{
              padding: '14px 48px',
              width: '100%',
              maxWidth: '260px',
              background: mode && roomInput ? 'rgba(125,249,255,0.12)' : 'rgba(125,249,255,0.03)',
              border: `1px solid ${mode && roomInput ? 'rgba(125,249,255,0.6)' : 'rgba(125,249,255,0.15)'}`,
              borderRadius: '3px',
              color: mode && roomInput ? '#7DF9FF' : 'rgba(125,249,255,0.25)',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.75rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              cursor: mode && roomInput ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: mode && roomInput ? '0 0 20px rgba(0,200,255,0.15)' : 'none',
            }}
          >
            Enter · 入場
          </button>
        </div>

        {/* Open Instructions Button */}
        <div className="fade-in mt-4" style={{ animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
          <button 
            onClick={() => setShowInstructions(true)}
            style={{
              fontSize: '0.6rem', 
              letterSpacing: '0.2em', 
              color: 'rgba(125,249,255,0.5)', 
              textTransform: 'uppercase',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(125,249,255,0.3)',
              paddingBottom: '2px',
              cursor: 'pointer'
            }}
          >
            How to Connect
          </button>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020b18]/80 backdrop-blur-md">
          <div 
            className="relative w-full max-w-sm p-8 text-center"
            style={{
              background: 'linear-gradient(180deg, #041e3a 0%, #020b18 100%)',
              border: '1px solid rgba(125,249,255,0.4)',
              borderRadius: '8px',
              boxShadow: '0 0 40px rgba(0,200,255,0.15)',
            }}
          >
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-2xl"
              style={{
                color: 'rgba(125,249,255,0.5)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              ✕
            </button>
            
            <h3 style={{ 
              color: '#7DF9FF', 
              fontSize: '1rem', 
              letterSpacing: '0.2em', 
              textTransform: 'uppercase',
              marginBottom: '24px',
              borderBottom: '1px solid rgba(125,249,255,0.2)',
              paddingBottom: '12px'
            }}>
              Instructions
            </h3>
            
            <div style={{ 
              fontSize: '0.7rem', 
              letterSpacing: '0.15em', 
              color: 'rgba(125,249,255,0.7)', 
              lineHeight: 2.5,
              textAlign: 'left'
            }}>
              <p>1. Open on <strong style={{color: '#7DF9FF'}}>LAPTOP</strong> → choose Battlefield → note the Room ID</p>
              <p>2. Open on <strong style={{color: '#7DF9FF'}}>PHONE</strong> → choose Sword → enter same Room ID</p>
              <p>3. <strong style={{color: '#7DF9FF'}}>SLASH</strong> your phone — watch the laptop screen react</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}