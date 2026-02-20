// src/pages/PhonePage.jsx — Demon Slayer theme
import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { usePartySocket } from '../hooks/usePartySocket'

function NichirinBlade({ slashing, size='full' }) {
  const h = size==='preview' ? '200px' : 'min(58vh,400px)'
  return (
    <svg viewBox="0 0 130 620" style={{
      height:h, width:'auto',
      filter: slashing
        ? 'drop-shadow(0 0 22px rgba(220,30,30,1)) drop-shadow(0 0 55px rgba(180,0,0,.88))'
        : 'drop-shadow(0 0 8px rgba(180,0,0,.5)) drop-shadow(0 0 22px rgba(100,0,0,.3))',
      transition:'filter .12s',
      animation: slashing ? 'swordSlash .32s ease-out' : 'swordGlow 2.5s ease-in-out infinite',
    }}>
      <defs>
        <linearGradient id="blade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#1a1a1a"/>
          <stop offset="30%"  stopColor="#3a3a3a"/>
          <stop offset="50%"  stopColor="#555"/>
          <stop offset="75%"  stopColor="#2a2a2a"/>
          <stop offset="100%" stopColor="#111"/>
        </linearGradient>
        <linearGradient id="bladeHot" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3a0000"/>
          <stop offset="30%"  stopColor="#8b0000"/>
          <stop offset="50%"  stopColor="#e74c3c"/>
          <stop offset="70%"  stopColor="#8b0000"/>
          <stop offset="100%" stopColor="#3a0000"/>
        </linearGradient>
        <linearGradient id="grd" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#d4a843"/>
          <stop offset="40%"  stopColor="#f0c850"/>
          <stop offset="100%" stopColor="#8a6020"/>
        </linearGradient>
        <filter id="bglow">
          <feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Blade */}
      <polygon points="65,8 55,415 75,415" fill={slashing?'url(#bladeHot)':'url(#blade)'} filter="url(#bglow)"/>
      <line x1="65" y1="8"  x2="63" y2="415" stroke={slashing?'rgba(231,76,60,.9)':'rgba(180,180,180,.45)'} strokeWidth="1"/>
      <line x1="61" y1="30" x2="58" y2="405" stroke={slashing?'rgba(231,76,60,.6)':'rgba(80,80,80,.5)'} strokeWidth="1.2"/>
      <line x1="65" y1="8"  x2="65" y2="80"  stroke={slashing?'rgba(255,100,100,.8)':'rgba(200,200,200,.35)'} strokeWidth="0.8"/>
      {slashing && <>
        <line x1="62" y1="30" x2="70" y2="380" stroke="rgba(255,80,80,.7)" strokeWidth="1.5" opacity=".8"/>
        <ellipse cx="65" cy="200" rx="9" ry="90" fill="rgba(231,76,60,.1)"/>
      </>}

      {/* Habaki */}
      <rect x="52" y="410" width="26" height="20" rx="1" fill="#b8902a"/>
      <rect x="54" y="412" width="22" height="16" rx="1" fill="#d4a843" opacity=".7"/>

      {/* Tsuba */}
      <ellipse cx="65" cy="442" rx="38" ry="14" fill="url(#grd)"/>
      <ellipse cx="65" cy="442" rx="34" ry="10" fill="none" stroke="#f0c850" strokeWidth="1.5"/>
      <polygon points="65,432 70,442 65,452 60,442" fill="rgba(0,0,0,.35)" stroke="#c9a030" strokeWidth="1"/>
      <polygon points="48,438 52,442 48,446 44,442" fill="rgba(0,0,0,.3)"  stroke="#c9a030" strokeWidth=".8"/>
      <polygon points="82,438 86,442 82,446 78,442" fill="rgba(0,0,0,.3)"  stroke="#c9a030" strokeWidth=".8"/>
      <path d="M34 442 Q42 436 50 442 Q58 448 66 442 Q74 436 82 442" stroke="rgba(231,76,60,.5)" strokeWidth="1.2" fill="none"/>

      {/* Handle — black with red diamond wrap */}
      <rect x="57" y="456" width="16" height="130" rx="8" fill="#0f0f0f"/>
      {Array.from({length:9},(_,i)=>(
        <polygon key={i}
          points={`57,${464+i*13} 65,${460+i*13} 73,${464+i*13} 65,${468+i*13}`}
          fill="rgba(180,0,0,.55)" stroke="rgba(231,76,60,.3)" strokeWidth=".5"
        />
      ))}
      <rect x="57" y="456" width="16" height="130" rx="8" fill="none" stroke="#111" strokeWidth="1.5"/>

      {/* Kashira */}
      <ellipse cx="65" cy="590" rx="11" ry="9" fill="#b8902a"/>
      <ellipse cx="65" cy="588" rx="8"  ry="5" fill="#d4a843"/>
    </svg>
  )
}

function makeWhoosh(intensity) {
  try {
    const ctx=new(window.AudioContext||window.webkitAudioContext)()
    const now=ctx.currentTime, vol=Math.min(.18+intensity*.013,.72)
    const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.22),ctx.sampleRate)
    const d=buf.getChannelData(0)
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length)
    const src=ctx.createBufferSource(); src.buffer=buf
    const bp=ctx.createBiquadFilter(); bp.type='bandpass'
    bp.frequency.setValueAtTime(800,now); bp.frequency.exponentialRampToValueAtTime(150,now+.22); bp.Q.value=.9
    const g=ctx.createGain(); g.gain.setValueAtTime(vol,now); g.gain.exponentialRampToValueAtTime(.001,now+.22)
    src.connect(bp);bp.connect(g);g.connect(ctx.destination)
    src.start(now);src.stop(now+.22)
    setTimeout(()=>ctx.close(),500)
  } catch(_){}
}

export default function PhonePage() {
  const { roomId } = useParams()
  const [screen, setScreen] = useState('intro')
  const [slashing, setSlashing] = useState(false)
  const [slashCount, setSlashCount] = useState(0)
  const [motionLevel, setMotionLevel] = useState(0)
  const [permError, setPermError] = useState('')

  const lastAccel=useRef({x:0,y:0,z:0})
  const lastSlashTime=useRef(0)
  const decayTimer=useRef(null)
  const joinInterval=useRef(null)
  const motionActive=useRef(false)

  const socketActive=screen==='connecting'||screen==='active'
  const {publish,connState}=usePartySocket(
    socketActive?roomId:null,
    (event)=>{ if(event==='ready') clearInterval(joinInterval.current) }
  )

  useEffect(()=>{
    if(screen!=='connecting') return
    const boot=setTimeout(()=>{
      publish('join',{roomId,t:Date.now()})
      setScreen('active')
      joinInterval.current=setInterval(()=>publish('join',{roomId,t:Date.now()}),1200)
    },600)
    return()=>{ clearTimeout(boot); clearInterval(joinInterval.current) }
  },[screen,publish,roomId])

  const handleMotion=useCallback((e)=>{
    const a=e.accelerationIncludingGravity; if(!a) return
    const ax=a.x??0,ay=a.y??0,az=a.z??0
    const dx=ax-lastAccel.current.x,dy=ay-lastAccel.current.y,dz=az-lastAccel.current.z
    lastAccel.current={x:ax,y:ay,z:az}
    const intensity=Math.sqrt(dx*dx+dy*dy+dz*dz)
    setMotionLevel(intensity)
    clearTimeout(decayTimer.current)
    decayTimer.current=setTimeout(()=>setMotionLevel(0),180)
    const now=Date.now()
    if(intensity>2.2&&now-lastSlashTime.current>160){
      lastSlashTime.current=now
      const angle=Math.atan2(dy,dx)*(180/Math.PI)
      publish('slash',{angle,intensity,x:.25+Math.random()*.5,y:.15+Math.random()*.55,t:now})
      setSlashing(true); setSlashCount(c=>c+1); makeWhoosh(intensity)
      setTimeout(()=>setSlashing(false),280)
    }
  },[publish])

  const handleUnsheathe=async()=>{
    setPermError('')
    if(typeof DeviceMotionEvent?.requestPermission==='function'){
      try{
        const res=await DeviceMotionEvent.requestPermission()
        if(res!=='granted'){setPermError('Motion permission denied. Allow in Settings → Safari.');return}
      }catch{setPermError('Could not request permission. Try reloading.');return}
    }
    if(!motionActive.current){ window.addEventListener('devicemotion',handleMotion,true); motionActive.current=true }
    setScreen('connecting')
  }

  useEffect(()=>()=>{
    window.removeEventListener('devicemotion',handleMotion,true)
    clearInterval(joinInterval.current); clearTimeout(decayTimer.current)
  },[handleMotion])

  const barPct=Math.min(motionLevel*4.5,100)
  const accent={position:'fixed',left:0,right:0,height:'3px',background:'linear-gradient(90deg,transparent,#8b0000,#e74c3c,#8b0000,transparent)',boxShadow:'0 0 20px rgba(231,76,60,.8)'}

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if(screen==='intro') return(
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at 50% 30%,#200008,#110005 55%,#080002 100%)',padding:'28px',fontFamily:"'Cinzel',serif"}}>
      <div style={{...accent,top:0}}/>

      <div style={{fontFamily:"'Shippori Mincho',serif",fontSize:'clamp(1.8rem,10vw,2.8rem)',fontWeight:800,background:'linear-gradient(180deg,#c9a84c,#f0c850,#8a6020)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',filter:'drop-shadow(0 0 20px rgba(201,168,76,.5))',letterSpacing:'.08em',marginBottom:'4px',textAlign:'center'}}>
        鬼滅の刃
      </div>
      <div style={{fontSize:'.56rem',letterSpacing:'.45em',color:'rgba(231,76,60,.5)',marginBottom:'6px'}}>KIMETSU NO YAIBA</div>

      <div style={{padding:'8px 22px',marginBottom:'26px',border:'1px solid rgba(139,0,0,.3)',borderRadius:'2px',background:'rgba(139,0,0,.06)',textAlign:'center'}}>
        <div style={{fontSize:'.4rem',letterSpacing:'.4em',color:'rgba(201,168,76,.3)',marginBottom:'3px'}}>部屋番号 · ROOM</div>
        <div style={{fontSize:'1.05rem',letterSpacing:'.28em',fontWeight:700,color:'rgba(231,76,60,.7)'}}>{roomId}</div>
      </div>

      <div style={{marginBottom:'26px',opacity:.9}}><NichirinBlade slashing={false} size="preview"/></div>

      {permError&&<div style={{fontSize:'.56rem',color:'#e74c3c',letterSpacing:'.1em',textAlign:'center',maxWidth:'260px',marginBottom:'12px',padding:'8px',border:'1px solid rgba(231,76,60,.3)',borderRadius:'3px',background:'rgba(180,0,0,.06)'}}>{permError}</div>}

      <button onClick={handleUnsheathe} style={{
        padding:'18px 52px',
        background:'linear-gradient(135deg,rgba(139,0,0,.25),rgba(80,0,0,.12))',
        border:'1px solid rgba(231,76,60,.65)',borderRadius:'2px',
        color:'#e74c3c',fontFamily:"'Cinzel',serif",fontSize:'.85rem',
        letterSpacing:'.38em',textTransform:'uppercase',cursor:'pointer',
        boxShadow:'0 0 32px rgba(139,0,0,.35),inset 0 0 20px rgba(139,0,0,.1)',
        WebkitTapHighlightColor:'transparent',
      }}>
        抜 刀 · UNSHEATHE
      </button>

      <div style={{marginTop:'14px',fontSize:'.46rem',letterSpacing:'.2em',color:'rgba(255,255,255,.18)',textAlign:'center'}}>
        Open Battlefield on your laptop first
      </div>
      <div style={{...accent,bottom:0}}/>
    </div>
  )

  // ── ACTIVE ─────────────────────────────────────────────────────────────────
  return(
    <div style={{position:'fixed',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',background:'radial-gradient(ellipse at 50% 30%,#200008,#110005 55%,#080002 100%)',paddingTop:'28px',paddingBottom:'18px',fontFamily:"'Cinzel',serif"}}>
      <div style={{...accent,top:0}}/>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'5px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'7px',height:'7px',borderRadius:'50%',background:connState==='connected'?'#e74c3c':'#8b0000',boxShadow:connState==='connected'?'0 0 12px rgba(231,76,60,.9)':'none'}}/>
          <span style={{fontSize:'.48rem',letterSpacing:'.3em',color:'rgba(231,76,60,.5)',textTransform:'uppercase'}}>
            {connState==='connected'?`ROOM ${roomId} · LIVE`:`ROOM ${roomId} · ${connState.toUpperCase()}`}
          </span>
        </div>
        <div style={{fontSize:'.42rem',letterSpacing:'.25em',color:'rgba(201,168,76,.22)'}}>{slashCount} CUT{slashCount!==1?'S':''}</div>
      </div>

      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'8px',overflow:'hidden',minHeight:0}}>
        <NichirinBlade slashing={slashing} size="full"/>
      </div>

      <div style={{width:'calc(100% - 48px)',marginBottom:'10px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{fontSize:'.46rem',letterSpacing:'.18em',textTransform:'uppercase',color:motionLevel>2.2?'#e74c3c':'rgba(180,0,0,.4)',transition:'color .15s',minWidth:'56px'}}>
            {motionLevel>2.2?'⚔ STRIKE':'IDLE'}
          </span>
          <div style={{flex:1,height:'2px',background:'rgba(139,0,0,.15)',borderRadius:'2px',overflow:'hidden'}}>
            <div style={{width:`${barPct}%`,height:'100%',background:barPct>75?'#ff8866':'#e74c3c',boxShadow:motionLevel>2.2?'0 0 10px rgba(231,76,60,.9)':'none',transition:'width .05s linear'}}/>
          </div>
          <span style={{fontSize:'.4rem',color:'rgba(180,0,0,.4)',minWidth:'30px',textAlign:'right'}}>{motionLevel.toFixed(1)}</span>
        </div>
      </div>

      <div style={{fontSize:'.46rem',letterSpacing:'.22em',color:'rgba(180,0,0,.3)'}}>全集中 · TOTAL CONCENTRATION</div>
      <div style={{...accent,bottom:0}}/>
    </div>
  )
}