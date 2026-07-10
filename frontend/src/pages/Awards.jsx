import { useState, useMemo } from 'react';
import { awards } from '../data/students';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const CATEGORIES = ['All Categories', 'Academic', 'Technical', 'Research', 'Overall'];

const catIcons = { Academic: '🎓', Technical: '💻', Research: '🔬', Overall: '🌟' };
const catColors = { Academic: 'badge-blue', Technical: 'badge-purple', Research: 'badge-cyan', Overall: 'badge-orange' };

export default function Awards() {
  const [catFilter, setCatFilter] = useState('All Categories');
  const [selectedAward, setSelectedAward] = useState(null); // specific award name filter
  const navigate = useNavigate();

  // Distinct award names
  const uniqueAwards = useMemo(() => {
    return Array.from(new Set(awards.map(a => a.award)));
  }, []);

  const filtered = awards.filter(a =>
    (catFilter === 'All Categories' || a.category === catFilter) &&
    (!selectedAward || a.award === selectedAward)
  );

  const chartData = CATEGORIES.slice(1).map(cat => ({
    name: cat,
    count: awards.filter(a => a.category === cat).length
  }));

  return (
    <div>
      <div className="page-header">
        <h1>Awards & Recognition</h1>
        <p>Celebrating outstanding student achievements · Grouped by Award / Student</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Analytics Card */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="chart-title">🏆 Awards by Category</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{ background: '#1a2035', color: 'white', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
                        {payload[0].payload.name}: <b>{payload[0].value}</b> awards
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#06b6d4', '#f59e0b'][index % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Card */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎖️</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent-blue)' }}>{awards.length}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Recognitions</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              Acknowledging excellence across {uniqueAwards.length} unique award categories.
            </div>
          </div>
        </div>
      </div>

      {/* Specific Award Name Filter pills */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Filter by Award</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button 
            onClick={() => setSelectedAward(null)}
            style={{ 
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 600,
              background: !selectedAward ? '#2563eb' : '#f1f5f9', 
              color: !selectedAward ? 'white' : '#475569', border: '1px solid #e2e8f0', transition: 'all 0.2s'
            }}
          >All Awards</button>
          {uniqueAwards.map(aw => (
            <button 
              key={aw} 
              onClick={() => setSelectedAward(aw)}
              style={{ 
                padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 600,
                background: selectedAward === aw ? '#2563eb' : '#f1f5f9', 
                color: selectedAward === aw ? 'white' : '#475569', border: '1px solid #e2e8f0', transition: 'all 0.2s'
              }}
            >{aw}</button>
          ))}
        </div>
      </div>

      {/* Header + Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {CATEGORIES.map(c => (
             <button 
               key={c}
               onClick={() => setCatFilter(c)}
               style={{ 
                 padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600,
                 background: catFilter === c ? 'var(--text-primary)' : 'white', 
                 color: catFilter === c ? 'white' : 'var(--text-secondary)', 
                 border: '1px solid var(--border)', transition: 'all 0.2s'
               }}
             >{c}</button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Showing <b>{filtered.length}</b> recipients
        </div>
      </div>

      {/* Awards List - Detail View */}
      <div className="table-container glass-card" style={{ border: 'none' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Award</th>
              <th>Category</th>
              <th>Student Name</th>
              <th>Roll No & Dept</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No awards found.</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} onClick={() => navigate(`/students/${a.studentId}`)}>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{a.award}</td>
                <td><span className={`badge ${catColors[a.category] || 'badge-gray'}`}>{a.category}</span></td>
                <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{a.student}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{a.rollNo} • {a.department}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{a.year}</td>
                <td><button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}>View Profile</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
