// src/pages/LaptopPage.jsx — Demon Slayer theme
import { useState, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { usePartySocket } from '../hooks/usePartySocket'

function spawnSlash(container, x, y, angle, intensity) {
  const len = Math.min(120 + intensity * 7, 450)
  const thick = Math.max(3, Math.min(intensity * 0.55, 16))
  const el = document.createElement('div')
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;
    width:${len}px;height:${thick}px;
    transform:translate(-50%,-50%) rotate(${angle}deg);
    border-radius:999px;pointer-events:none;
    background:linear-gradient(90deg,transparent 0%,rgba(180,0,0,.45) 15%,rgba(231,76,60,.95) 38%,#fff 50%,rgba(231,76,60,.95) 62%,rgba(180,0,0,.45) 85%,transparent 100%);
    box-shadow:0 0 ${thick*2}px rgba(231,76,60,1),0 0 ${thick*6}px rgba(180,0,0,.8),0 0 ${thick*14}px rgba(100,0,0,.4);
    z-index:50;`
  el.classList.add('slash-el')
  container.appendChild(el)

  const rip = document.createElement('div')
  const rs = 55 + intensity * 2.5
  rip.style.cssText = `
    position:absolute;left:${x-rs/2}px;top:${y-rs/2}px;
    width:${rs}px;height:${rs}px;border-radius:50%;
    border:2px solid rgba(231,76,60,.85);pointer-events:none;
    box-shadow:0 0 20px rgba(180,0,0,.6);z-index:49;`
  rip.classList.add('ripple-el')
  container.appendChild(rip)

  for (let i = 0; i < Math.floor(5 + intensity * 0.5); i++) {
    const p = document.createElement('div')
    const spread = (Math.random()-.5)*120
    const dist = 35 + Math.random()*90
    const rad = ((angle+spread)*Math.PI)/180
    const size = 2 + Math.random()*6
    p.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:${size}px;height:${size}px;border-radius:50%;
      background:rgba(${Math.random()>.5?'231,76,60':'255,200,80'},${.5+Math.random()*.5});
      box-shadow:0 0 8px rgba(180,0,0,.9);pointer-events:none;z-index:48;
      --tx:${Math.cos(rad)*dist}px;--ty:${Math.sin(rad)*dist}px;`
    p.classList.add('particle-el')
    container.appendChild(p)
    setTimeout(()=>p.remove(), 560)
  }
  setTimeout(()=>{ el.remove(); rip.remove() }, 780)
}

function spawnDamage(container, x, y, damage) {
  const el = document.createElement('div')
  el.style.cssText = `
    position:absolute;left:${x}px;top:${y-40}px;
    transform:translateX(-50%);pointer-events:none;z-index:80;
    font-family:'Cinzel',serif;font-weight:900;
    font-size:${26+damage*.45}px;color:#fff;
    text-shadow:0 0 14px rgba(231,76,60,.95),0 0 32px rgba(180,0,0,.8),0 0 2px #000;
    letter-spacing:.05em;`
  el.textContent = `-${Math.floor(damage)}`
  el.classList.add('dmg-el')
  container.appendChild(el)
  setTimeout(()=>el.remove(), 980)
}

// ── Demon SVG ──────────────────────────────────────────────────────────────────
function Demon({ hit }) {
  return (
    <svg viewBox="0 0 220 340" width="220" height="340" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dg" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#3a0010"/>
          <stop offset="65%" stopColor="#1a0008"/>
          <stop offset="100%" stopColor="#090003"/>
        </radialGradient>
        <radialGradient id="eyeg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffdd00"/>
          <stop offset="35%" stopColor="#ff3300"/>
          <stop offset="100%" stopColor="#8b0000"/>
        </radialGradient>
        <filter id="dglow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="eglow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="110" cy="322" rx="75" ry="13" fill="rgba(100,0,0,.15)"/>

      {/* Body */}
      <ellipse cx="110" cy="242" rx="58" ry="75" fill="url(#dg)" filter="url(#dglow)"/>
      {/* Head */}
      <ellipse cx="110" cy="116" rx="52" ry="57" fill="url(#dg)" filter="url(#dglow)"/>

      {/* Face lines like Muzan */}
      <line x1="110" y1="76" x2="110" y2="156" stroke="rgba(180,0,0,.28)" strokeWidth="1.5"/>
      <line x1="94"  y1="80" x2="91"  y2="152" stroke="rgba(180,0,0,.14)" strokeWidth="1"/>
      <line x1="126" y1="80" x2="129" y2="152" stroke="rgba(180,0,0,.14)" strokeWidth="1"/>

      {/* Horns — swept back aggressive */}
      <path d="M76 86 Q55 52 47 26 Q64 50 79 78" fill="#180006" stroke="#8b0000" strokeWidth="2.5"/>
      <path d="M144 86 Q165 52 173 26 Q156 50 141 78" fill="#180006" stroke="#8b0000" strokeWidth="2.5"/>
      <circle cx="48"  cy="27" r="4" fill="rgba(231,76,60,.65)" style={{filter:'blur(2px)'}}/>
      <circle cx="172" cy="27" r="4" fill="rgba(231,76,60,.65)" style={{filter:'blur(2px)'}}/>

      {/* Muzan forehead mark */}
      <path d="M96 84 Q110 76 124 84 Q110 89 96 84" fill="rgba(160,0,0,.7)" stroke="#8b0000" strokeWidth="1"/>

      {/* Eyes — yellow/red like demon eyes */}
      <ellipse cx="87"  cy="112" rx="14" ry="10" fill="url(#eyeg)" filter="url(#eglow)"/>
      <ellipse cx="133" cy="112" rx="14" ry="10" fill="url(#eyeg)" filter="url(#eglow)"/>
      <ellipse cx="87"  cy="112" rx="4.5" ry="7" fill="#050000"/>
      <ellipse cx="133" cy="112" rx="4.5" ry="7" fill="#050000"/>
      <ellipse cx="84"  cy="109" rx="2"   ry="2" fill="rgba(255,255,200,.85)"/>
      <ellipse cx="130" cy="109" rx="2"   ry="2" fill="rgba(255,255,200,.85)"/>

      {/* Sinister mouth + fangs */}
      <path d="M87 140 Q110 160 133 140" stroke="#8b0000" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <polygon points="99,141 95,160 103,141" fill="#ddd0b0" opacity=".92"/>
      <polygon points="113,143 109,163 117,143" fill="#ddd0b0" opacity=".92"/>
      <polygon points="121,141 117,157 125,141" fill="#ddd0b0" opacity=".88"/>

      {/* Arms */}
      <path d="M54 198 Q18 240 10 287" stroke="#180006" strokeWidth="22" fill="none" strokeLinecap="round"/>
      <path d="M166 198 Q202 240 210 287" stroke="#180006" strokeWidth="22" fill="none" strokeLinecap="round"/>
      {/* Claws */}
      <path d="M8 285 Q1 298-3 304 M11 289 Q5 302 3 309 M15 291 Q11 304 10 310" stroke="#8b0000" strokeWidth="2.5" fill="none"/>
      <path d="M212 285 Q219 298 223 304 M209 289 Q215 302 217 309 M205 291 Q209 304 210 310" stroke="#8b0000" strokeWidth="2.5" fill="none"/>

      {/* Hit flash */}
      {hit && <ellipse cx="110" cy="162" rx="70" ry="92" fill="rgba(231,76,60,.2)"/>}
      {/* Blood drips on hit */}
      {hit && <>
        <rect x="106" y="156" width="3"   height="30" rx="1.5" fill="rgba(180,0,0,.65)"/>
        <rect x="119" y="153" width="2.5" height="22" rx="1.2" fill="rgba(180,0,0,.55)"/>
        <rect x="96"  y="158" width="2"   height="18" rx="1"   fill="rgba(180,0,0,.4)"/>
      </>}
    </svg>
  )
}

// ── Enemy names ────────────────────────────────────────────────────────────────
const ENEMIES = [
  { en:'Muzan Kibutsuji',  jp:'鬼舞辻無惨' },
  { en:'Lower Moon Three', jp:'下弦の参' },
  { en:'Hand Demon',       jp:'手鬼' },
  { en:'Swamp Demon',      jp:'沼の鬼' },
  { en:'Temple Demon',     jp:'寺の鬼' },
  { en:'Drum Demon',       jp:'響凱' },
]
const MAX_HP = 300

function EnemyUI({ hp, maxHp, hit, dead, idx, connected }) {
  const pct = Math.max(0,(hp/maxHp)*100)
  const col = pct>60 ? '#8b0000' : pct>30 ? '#c0392b' : '#e74c3c'
  const e = ENEMIES[idx]
  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'14px' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:"'Shippori Mincho',serif", fontSize:'.95rem', color:'rgba(201,168,76,.5)', letterSpacing:'.3em', marginBottom:'2px' }}>{e.jp}</div>
        <div style={{ fontFamily:"'Cinzel',serif", fontSize:'.62rem', letterSpacing:'.4em', color:'rgba(231,76,60,.65)', textTransform:'uppercase' }}>{e.en}</div>
      </div>
      <div style={{ width:'320px', maxWidth:'65vw' }}>
        <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'5px' }}>
          <span style={{ fontSize:'.46rem',letterSpacing:'.35em',color:'rgba(180,0,0,.6)' }}>生命力</span>
          <span style={{ fontSize:'.46rem',letterSpacing:'.2em', color:'rgba(180,0,0,.6)' }}>{Math.max(0,hp)} / {maxHp}</span>
        </div>
        <div style={{ width:'100%',height:'7px',background:'rgba(80,0,0,.3)',borderRadius:'1px',overflow:'hidden',border:'1px solid rgba(139,0,0,.22)' }}>
          <div style={{ width:`${pct}%`,height:'100%',background:`linear-gradient(90deg,#6b0000,${col})`,boxShadow:`0 0 10px ${col}`,transition:'width .3s ease-out' }}/>
        </div>
      </div>
      <div
        className={hit?'enemy-hit':dead?'enemy-death':'enemy-float'}
        style={{ position:'relative',opacity:connected?1:.28,transition:'opacity .6s',filter:connected?'none':'saturate(0)' }}
      >
        <Demon hit={hit}/>
        {!connected && !dead && (
          <div className="breathe" style={{ position:'absolute',bottom:'-32px',left:'50%',transform:'translateX(-50%)',fontSize:'.48rem',letterSpacing:'.35em',color:'rgba(180,0,0,.5)',whiteSpace:'nowrap',fontFamily:"'Cinzel',serif" }}>
            ── AWAITING SLAYER ──
          </div>
        )}
        {dead && (
          <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontFamily:"'Shippori Mincho',serif",fontSize:'2.2rem',fontWeight:800,color:'#e74c3c',letterSpacing:'.22em',whiteSpace:'nowrap',textShadow:'0 0 28px rgba(231,76,60,.95),0 0 60px rgba(180,0,0,.5)' }}>
            滅 · SLAIN
          </div>
        )}
      </div>
    </div>
  )
}

export default function LaptopPage() {
  const { roomId } = useParams()
  const canvasRef = useRef(null)
  const hpRef = useRef(MAX_HP)
  const [connected, setConnected] = useState(false)
  const [slashCount, setSlashCount] = useState(0)
  const [hp, setHp] = useState(MAX_HP)
  const [hit, setHit] = useState(false)
  const [dead, setDead] = useState(false)
  const deadRef = useRef(false)
  const [idx] = useState(()=>Math.floor(Math.random()*ENEMIES.length))
  const [shaking, setShaking] = useState(false)

  const shake = useCallback(()=>{ setShaking(true); setTimeout(()=>setShaking(false),430) },[])
  const trigHit = useCallback(()=>{ setHit(true); setTimeout(()=>setHit(false),430) },[])
  const respawn = useCallback(()=>{
    setTimeout(()=>{ hpRef.current=MAX_HP; deadRef.current=false; setHp(MAX_HP); setDead(false) },2200)
  },[])

  const slashRef = useRef(null)
  slashRef.current = (data) => {
    if (deadRef.current) return
    setConnected(true)
    setSlashCount(c=>c+1)
    const w = canvasRef.current?.offsetWidth||window.innerWidth
    const h = canvasRef.current?.offsetHeight||window.innerHeight
    const x = data.x*w, y = data.y*h
    if (canvasRef.current) spawnSlash(canvasRef.current,x,y,data.angle,data.intensity)
    const dmg = Math.floor(9+data.intensity*1.6)
    const newHp = Math.max(0,hpRef.current-dmg)
    hpRef.current = newHp; setHp(newHp)
    if (canvasRef.current) spawnDamage(canvasRef.current,x,y,dmg)
    shake(); trigHit()
    if (newHp<=0 && !deadRef.current) { deadRef.current=true; setDead(true); respawn() }
  }

  const { connState, publish } = usePartySocket(roomId,(event,data)=>{
    if (event==='slash') slashRef.current?.(data)
    if (event==='join') { setConnected(true); publish('ready',{t:Date.now()}) }
  })

  return (
    <div className={shaking?'screen-shake':''} style={{ position:'fixed',inset:0,overflow:'hidden',background:'radial-gradient(ellipse at 50% 20%,#200008,#110005 50%,#080002 100%)' }}>

      {/* Diagonal lines */}
      <svg style={{ position:'fixed',inset:0,width:'100%',height:'100%',opacity:.035,pointerEvents:'none' }}>
        {Array.from({length:10},(_,i)=>(
          <line key={i} x1={i*160-200} y1="0" x2={i*160+400} y2={window.innerHeight} stroke="#8b0000" strokeWidth="1"/>
        ))}
      </svg>

      <div ref={canvasRef} style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:40 }}/>

      {/* ── HUD ── */}
      <div style={{ position:'fixed',top:0,left:0,right:0,zIndex:90,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 28px',background:'linear-gradient(180deg,rgba(8,0,2,.95),transparent)',borderBottom:`1px solid ${connected?'rgba(139,0,0,.3)':'rgba(80,0,0,.12)'}` }}>
        <div style={{ display:'flex',alignItems:'center',gap:'9px' }}>
          <div style={{ width:'7px',height:'7px',borderRadius:'50%',background:connected?'#e74c3c':'#6b0000',boxShadow:connected?'0 0 14px rgba(231,76,60,1)':'none' }}/>
          <span style={{ fontSize:'.48rem',letterSpacing:'.35em',color:'rgba(231,76,60,.55)',textTransform:'uppercase',fontFamily:"'Cinzel',serif" }}>
            {connected?'刀 · BLADE CONNECTED':`待機中 · WAITING · ${connState}`}
          </span>
        </div>
        <div style={{ fontFamily:"'Shippori Mincho',serif",fontSize:'1.1rem',fontWeight:700,color:'rgba(201,168,76,.32)',letterSpacing:'.3em' }}>鬼滅の刃</div>
        <div style={{ fontSize:'.48rem',letterSpacing:'.3em',color:'rgba(180,0,0,.5)',fontFamily:"'Cinzel',serif" }}>{slashCount} 斬 CUTS</div>
      </div>

      {/* Room card */}
      {!connected && (
        <div style={{ position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',zIndex:30,textAlign:'center' }}>
          <div style={{ padding:'14px 32px',border:'1px solid rgba(139,0,0,.28)',borderRadius:'2px',background:'rgba(139,0,0,.04)',boxShadow:'0 0 40px rgba(139,0,0,.1)' }}>
            <div style={{ fontSize:'.42rem',letterSpacing:'.45em',color:'rgba(180,0,0,.4)',marginBottom:'7px',fontFamily:"'Cinzel',serif" }}>部屋番号 · ENTER ON PHONE</div>
            <div style={{ fontFamily:"'Cinzel',serif",fontSize:'1.6rem',fontWeight:700,color:'rgba(231,76,60,.68)',letterSpacing:'.25em',textShadow:'0 0 22px rgba(139,0,0,.5)' }}>{roomId}</div>
          </div>
        </div>
      )}

      {/* Demon */}
      <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:20,textAlign:'center' }}>
        <EnemyUI hp={hp} maxHp={MAX_HP} hit={hit} dead={dead} idx={idx} connected={connected}/>
        {dead && <div style={{ marginTop:'14px',fontSize:'.52rem',letterSpacing:'.4em',color:'rgba(180,0,0,.42)',fontFamily:"'Cinzel',serif" }}>灰になった · Turning to ash...</div>}
      </div>

      {/* Bottom line */}
      <div style={{ position:'fixed',bottom:0,left:0,right:0,height:'2px',background:'linear-gradient(90deg,transparent,#8b0000,#e74c3c,#8b0000,transparent)',boxShadow:'0 0 16px rgba(139,0,0,.6)' }}/>
    </div>
  )
}