import React, { useState, useEffect } from 'react';
import { MdPlayArrow, MdPause, MdStop, MdHeadset } from 'react-icons/md';

export default function FocusMode() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (!isActive && timeLeft !== 0) clearInterval(interval);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setTimeLeft(25 * 60); };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '0px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
       <div style={{ textAlign: 'center', marginBottom: 40 }}>
         <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', margin: 0, textShadow: '0 0 10px rgba(138,43,226,0.6)' }}>Focus Mode</h1>
         <p style={{ color: 'var(--text-muted)' }}>Deep study. Zero distractions.</p>
       </div>

       <div className="glass-card" style={{ width: 400, height: 400, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-neon-purple)', boxShadow: '0 0 40px rgba(138,43,226,0.2), inset 0 0 50px rgba(0,0,0,0.5)', position: 'relative' }}>
         {isActive && (
           <svg width="400" height="400" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
             <circle cx="200" cy="200" r="190" fill="none" stroke="var(--accent-neon-blue)" strokeWidth="4" strokeDasharray="1194" strokeDashoffset={1194 - (1194 * (timeLeft / (25 * 60)))} style={{ transition: 'stroke-dashoffset 1s linear' }} />
           </svg>
         )}
         
         <div style={{ fontSize: 80, fontWeight: 900, color: 'white', textShadow: '0 0 20px rgba(0,240,255,0.4)', fontFamily: 'monospace' }}>
           {formatTime(timeLeft)}
         </div>
         <div style={{ color: 'var(--accent-neon-blue)', fontSize: 14, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginTop: 10 }}>Session 1 / 4</div>
         
         <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
           <button onClick={toggle} style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-neon-blue), var(--accent-neon-purple))', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0 15px rgba(138,43,226,0.5)' }}>
             {isActive ? <MdPause size={30} /> : <MdPlayArrow size={30} />}
           </button>
           <button onClick={reset} style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
             <MdStop size={26} />
           </button>
         </div>
       </div>

       <div style={{ display: 'flex', gap: 16, marginTop: 50 }}>
          <div className="glass-card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
             <MdHeadset size={20} color="var(--accent-neon-pink)" />
             <span style={{ fontSize: 14 }}>Lo-fi Beats</span>
          </div>
          <div className="glass-card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
             <span style={{ fontSize: 20 }}>🌧️</span>
             <span style={{ fontSize: 14 }}>Rain Sounds</span>
          </div>
       </div>
    </div>
  );
}
