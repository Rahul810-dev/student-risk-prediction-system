import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdMenuBook, MdCalendarMonth, MdInsights, MdArrowForward } from 'react-icons/md';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #11142a 0%, #0a0b16 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.1, fontSize: '100px', animation: 'float 6s ease-in-out infinite' }}><MdMenuBook /></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', opacity: 0.1, fontSize: '120px', animation: 'float 8s ease-in-out infinite reverse' }}><MdCalendarMonth /></div>
      <div style={{ position: 'absolute', top: '40%', right: '20%', opacity: 0.05, fontSize: '80px', animation: 'float 7s ease-in-out infinite' }}><MdInsights /></div>

      <style>
        {`
          @keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } 100% { transform: translateY(0px) rotate(0deg); } }
          @keyframes glowText { 0% { text-shadow: 0 0 10px rgba(0,240,255,0.5); } 50% { text-shadow: 0 0 20px rgba(0,240,255,0.8), 0 0 30px rgba(138,43,226,0.5); } 100% { text-shadow: 0 0 10px rgba(0,240,255,0.5); } }
        `}
      </style>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '30px 50px', zIndex: 10 }}>
        <div style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(90deg, var(--accent-neon-blue), var(--accent-neon-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          EduNexus AI
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid var(--accent-neon-purple)', color: 'white', padding: '10px 24px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s', boxShadow: 'var(--shadow-neon)' }}>
          Staff Login
        </button>
      </nav>

      {/* Hero Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px', zIndex: 10 }}>
        <h1 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '20px', lineHeight: '1.1', animation: 'glowText 3s infinite', maxWidth: '800px' }}>
          Plan Smarter.<br/>Study Better.<br/><span style={{ color: 'var(--accent-neon-blue)' }}>Achieve More.</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
          An intelligent platform that helps university students organize their semester, track learning progress, and stay ahead academically.
        </p>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => navigate('/student-dashboard')} style={{ background: 'linear-gradient(135deg, var(--accent-neon-purple), var(--accent-neon-blue))', border: 'none', color: 'white', padding: '16px 32px', borderRadius: '30px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(138,43,226,0.6)', transition: 'transform 0.2s' }}>
            Student Login <MdArrowForward />
          </button>
          <button style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '16px 32px', borderRadius: '30px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
            Explore Features
          </button>
        </div>
      </main>

      {/* Bottom fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(0deg, #0a0b16 0%, transparent 100%)', zIndex: 5 }}></div>
    </div>
  );
}
