// src/pages/Home.jsx — Demon Slayer theme
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function generateRoomId() {
  const words = ['TANJIRO','NEZUKO','MUZAN','INOSUKE','ZENITSU','RENGOKU','GIYU','SHINOBU']
  const nums = Math.floor(Math.random() * 900 + 100)
  return words[Math.floor(Math.random() * words.length)] + nums
}

function Ember({ style }) {
  return <div style={{
    position:'absolute', width:'3px', height:'3px', borderRadius:'50%',
    background:'#e74c3c', boxShadow:'0 0 6px rgba(231,76,60,.9)',
    animation:`ember-rise ${2+Math.random()*3}s ease-out infinite`,
    animationDelay:`${Math.random()*5}s`,
    '--ex':`${(Math.random()-.5)*60}px`,
    ...style,
  }}/>
}

export default function Home() {
  const [roomInput, setRoomInput] = useState('')
  const [mode, setMode] = useState(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const navigate = useNavigate()

  const handleJoin = () => {
    const room = roomInput.trim().toUpperCase() || generateRoomId()
    navigate(`/${mode}/${room}`)
  }

  const handleCreate = (m) => {
    setMode(m); setRoomInput(generateRoomId())
  }

  return (
    <div style={{
      position:'relative', minHeight:'100vh', width:'100%',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'40px 24px', overflowX:'hidden',
      background:'radial-gradient(ellipse at 50% 0%, #2a0008 0%, #110008 45%, #0a0005 100%)',
      fontFamily:"'Cinzel',serif",
    }}>
      {/* Embers */}
      {Array.from({length:12},(_,i)=>(
        <Ember key={i} style={{ bottom:`${Math.random()*35}%`, left:`${10+Math.random()*80}%` }}/>
      ))}

      {/* Top accent line */}
      <div style={{ position:'fixed',top:0,left:0,right:0,height:'3px',
        background:'linear-gradient(90deg,transparent,#8b0000,#e74c3c,#8b0000,transparent)',
        boxShadow:'0 0 20px rgba(231,76,60,.8)',zIndex:100 }}/>

      <div style={{ position:'relative',zIndex:10,display:'flex',flexDirection:'column',alignItems:'center',width:'100%',maxWidth:'400px',gap:'24px' }}>

        {/* ── Logo ── */}
        <div className="fade-in" style={{ animationDelay:'.05s',opacity:0,animationFillMode:'forwards',textAlign:'center' }}>
          {/* Enso circle */}
          <div style={{ position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:'10px' }}>
            <svg width="130" height="130" viewBox="0 0 130 130" style={{ position:'absolute' }}>
              <circle cx="65" cy="65" r="58" fill="none" stroke="#8b0000" strokeWidth="7"
                strokeDasharray="300 80" strokeLinecap="round"
                style={{ filter:'drop-shadow(0 0 10px rgba(139,0,0,.8))' }}/>
              <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(231,76,60,.25)" strokeWidth="2"
                strokeDasharray="340 20" strokeLinecap="round"/>
            </svg>
            <div style={{ padding:'18px', textAlign:'center' }}>
              <div style={{ fontFamily:"'Shippori Mincho',serif", fontSize:'1.05rem', fontWeight:800, color:'#c9a84c', letterSpacing:'.08em', textShadow:'0 0 14px rgba(201,168,76,.6)' }}>鬼滅の刃</div>
              <div style={{ fontSize:'.38rem', letterSpacing:'.5em', color:'rgba(201,168,76,.4)', marginTop:'2px' }}>KIMETSU NO YAIBA</div>
            </div>
          </div>

          <div style={{ fontFamily:"'Cinzel',serif", fontSize:'clamp(1.5rem,8vw,2.2rem)', fontWeight:900, color:'#fff', letterSpacing:'.1em', textShadow:'0 0 30px rgba(231,76,60,.35), 0 2px 0 rgba(0,0,0,.9)' }}>
            DEMON SLAYER
          </div>
          <div style={{ fontSize:'.5rem', letterSpacing:'.5em', color:'rgba(201,168,76,.4)', marginTop:'5px' }}>BLADE CONNECTED</div>
        </div>

        {/* Divider */}
        <div style={{ display:'flex',alignItems:'center',width:'100%',gap:'10px' }}>
          <div style={{ flex:1,height:'1px',background:'linear-gradient(90deg,transparent,rgba(139,0,0,.6))' }}/>
          <div style={{ width:'6px',height:'6px',background:'#8b0000',transform:'rotate(45deg)',boxShadow:'0 0 8px rgba(231,76,60,.6)' }}/>
          <div style={{ flex:1,height:'1px',background:'linear-gradient(90deg,rgba(139,0,0,.6),transparent)' }}/>
        </div>

        {/* ── Mode buttons ── */}
        <div className="fade-in" style={{ animationDelay:'.2s',opacity:0,animationFillMode:'forwards',width:'100%',display:'flex',flexDirection:'column',gap:'10px' }}>
          {[
            { id:'phone',  en:'⚔  NICHIRIN BLADE', sub:'You swing this', jp:'日輪刀' },
            { id:'laptop', en:'🔥  BATTLEFIELD',   sub:'Demon appears here', jp:'戦場' },
          ].map(m=>(
            <button key={m.id} onClick={()=>handleCreate(m.id)} style={{
              width:'100%', padding:'14px 20px',
              background: mode===m.id ? 'linear-gradient(135deg,rgba(139,0,0,.3),rgba(60,0,0,.2))' : 'rgba(139,0,0,.06)',
              border:`1px solid ${mode===m.id ? 'rgba(231,76,60,.7)' : 'rgba(139,0,0,.3)'}`,
              borderRadius:'2px', color: mode===m.id ? '#fff' : 'rgba(255,255,255,.4)',
              cursor:'pointer', transition:'all .2s',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              boxShadow: mode===m.id ? '0 0 28px rgba(139,0,0,.35), inset 0 0 20px rgba(139,0,0,.1)' : 'none',
            }}>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:'.72rem', letterSpacing:'.22em', fontWeight:700 }}>{m.en}</div>
                <div style={{ fontSize:'.48rem', letterSpacing:'.18em', color: mode===m.id ? 'rgba(201,168,76,.7)' : 'rgba(255,255,255,.2)', marginTop:'3px' }}>{m.sub}</div>
              </div>
              <div style={{ fontFamily:"'Shippori Mincho',serif", fontSize:'1.05rem', color: mode===m.id ? 'rgba(201,168,76,.7)' : 'rgba(139,0,0,.4)' }}>{m.jp}</div>
            </button>
          ))}
        </div>

        {/* ── Room code ── */}
        <div className="fade-in" style={{ animationDelay:'.35s',opacity:0,animationFillMode:'forwards',width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px' }}>
          <div style={{ fontSize:'.48rem', letterSpacing:'.45em', color:'rgba(201,168,76,.45)', textTransform:'uppercase' }}>部屋番号 · ROOM CODE</div>
          <input
            value={roomInput}
            onChange={e=>setRoomInput(e.target.value.toUpperCase())}
            placeholder="e.g. TANJIRO420"
            style={{
              width:'100%', padding:'13px 20px',
              background:'rgba(139,0,0,.08)',
              border:'1px solid rgba(139,0,0,.4)',
              borderRadius:'2px', color:'#f0d080',
              fontFamily:"'Cinzel',serif", fontSize:'.95rem',
              letterSpacing:'.3em', textAlign:'center', outline:'none',
            }}
          />
          <div style={{ fontSize:'.46rem', letterSpacing:'.2em', color:'rgba(255,255,255,.2)' }}>Share this code with the other device</div>

          <button onClick={handleJoin} disabled={!mode||!roomInput} style={{
            width:'100%', padding:'15px',
            background: mode&&roomInput ? 'linear-gradient(135deg,#8b0000,#6b0000)' : 'rgba(80,0,0,.12)',
            border:`1px solid ${mode&&roomInput ? 'rgba(231,76,60,.7)' : 'rgba(139,0,0,.2)'}`,
            borderRadius:'2px',
            color: mode&&roomInput ? '#fff' : 'rgba(255,255,255,.2)',
            fontFamily:"'Cinzel',serif", fontSize:'.78rem',
            letterSpacing:'.38em', textTransform:'uppercase',
            cursor: mode&&roomInput ? 'pointer' : 'not-allowed', transition:'all .2s',
            boxShadow: mode&&roomInput ? '0 0 32px rgba(139,0,0,.5)' : 'none',
          }}>
            参 入 · ENTER BATTLE
          </button>
        </div>

        <button onClick={()=>setShowInstructions(true)} style={{
          fontSize:'.48rem', letterSpacing:'.22em', color:'rgba(201,168,76,.38)',
          textTransform:'uppercase', background:'none', border:'none',
          borderBottom:'1px solid rgba(201,168,76,.18)', paddingBottom:'2px', cursor:'pointer',
        }}>
          How to Connect · 接続方法
        </button>
      </div>

      {/* Bottom line */}
      <div style={{ position:'fixed',bottom:0,left:0,right:0,height:'2px',
        background:'linear-gradient(90deg,transparent,#8b0000,#e74c3c,#8b0000,transparent)',
        boxShadow:'0 0 16px rgba(139,0,0,.6)' }}/>

      {/* Instructions modal */}
      {showInstructions && (
        <div style={{ position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',background:'rgba(10,0,5,.9)',backdropFilter:'blur(8px)' }}>
          <div style={{ position:'relative',width:'100%',maxWidth:'340px',padding:'32px 26px',
            background:'linear-gradient(180deg,#1a000d,#0a0005)',
            border:'1px solid rgba(139,0,0,.5)', borderRadius:'3px',
            boxShadow:'0 0 50px rgba(139,0,0,.2)' }}>
            <button onClick={()=>setShowInstructions(false)} style={{ position:'absolute',top:'14px',right:'16px',color:'rgba(201,168,76,.5)',background:'none',border:'none',fontSize:'1.2rem',cursor:'pointer' }}>✕</button>
            <div style={{ fontFamily:"'Shippori Mincho',serif", fontSize:'.9rem', color:'#c9a84c', letterSpacing:'.15em', marginBottom:'18px', borderBottom:'1px solid rgba(139,0,0,.3)', paddingBottom:'12px' }}>
              作戦 · Battle Instructions
            </div>
            <div style={{ fontSize:'.66rem', letterSpacing:'.1em', color:'rgba(255,255,255,.6)', lineHeight:2.8 }}>
              <p>① Open <strong style={{color:'#e74c3c'}}>BATTLEFIELD</strong> on your laptop</p>
              <p>② Open <strong style={{color:'#e74c3c'}}>NICHIRIN BLADE</strong> on your phone</p>
              <p>③ Enter the same Room Code on both</p>
              <p>④ <strong style={{color:'#c9a84c'}}>SLASH</strong> your phone to strike the demon!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}