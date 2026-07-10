import React, { useState } from 'react';
import { MdSend, MdSmartToy, MdLightbulbOutline } from 'react-icons/md';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { sender: 'AI', text: "Hello! I'm your Academic Mentor AI. I noticed your DBMS midterms are in two weeks. Would you like me to generate a personalized study schedule?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages([...messages, { sender: 'User', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'AI', text: "I've updated your Smart Planner with a new syllabus breakdown focusing on normalization and concurrency control." }]);
    }, 1000);
  };

  return (
    <div style={{ padding: '0px 24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', margin: 0 }}>AI Study Assistant</h1>
        <p style={{ color: 'var(--text-muted)' }}>Your 24/7 personalized academic mentor.</p>
      </div>

      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Chat Area */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
             <div key={i} style={{ display: 'flex', gap: 12, alignSelf: m.sender === 'User' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
               {m.sender === 'AI' && <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-neon-blue), var(--accent-neon-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><MdSmartToy size={20} /></div>}
               <div style={{ background: m.sender === 'User' ? 'var(--accent-neon-purple)' : 'rgba(255,255,255,0.05)', padding: '12px 18px', borderRadius: 16, color: 'white', border: m.sender === 'AI' ? '1px solid rgba(255,255,255,0.1)' : 'none', lineHeight: 1.5, fontSize: 14 }}>
                 {m.text}
               </div>
             </div>
          ))}
        </div>

        {/* Suggestion Chips */}
         <div style={{ padding: '0 24px 12px', display: 'flex', gap: 10 }}>
           {['Suggest revision topics', 'Productivity tips', 'Analyze my weak subjects'].map(t => (
             <button key={t} style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', color: 'var(--accent-neon-blue)', padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><MdLightbulbOutline /> {t}</button>
           ))}
         </div>

        {/* Input */}
        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, background: 'rgba(0,0,0,0.2)' }}>
          <input 
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your studies..." 
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '14px 20px', borderRadius: 30, outline: 'none' }}
          />
          <button onClick={handleSend} style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-neon-blue)', border: 'none', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <MdSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
