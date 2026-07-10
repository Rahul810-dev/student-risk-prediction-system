import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { students } from '../data/students';
import { MdSearch, MdChevronRight } from 'react-icons/md';

function getRiskBadge(r) {
  return <span className={`badge ${r === 'High' ? 'badge-red' : r === 'Medium' ? 'badge-orange' : 'badge-green'}`}>{r}</span>;
}

export default function StudentSearch() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const doSearch = (q) => {
    const term = q.trim().toLowerCase();
    if (!term) { setResults([]); setSearched(false); return; }
    const found = students.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.rollNo.toLowerCase().includes(term) ||
      s.department.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
    setResults(found);
    setSearched(true);
  };

  useEffect(() => {
    if (searchParams.get('q')) doSearch(searchParams.get('q'));
  }, []);

  const handleKey = (e) => { if (e.key === 'Enter') doSearch(query); };

  return (
    <div>
      <div className="page-header">
        <h1>Student Search</h1>
        <p>Search by name, roll number, department, or email</p>
      </div>

      {/* Big search */}
      <div className="glass-card" style={{ padding: 32, marginBottom: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Find a Student
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Enter a student's name, roll number, department or email address
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="search-bar" style={{ flex: 1, padding: '12px 16px' }}>
              <MdSearch style={{ color: 'var(--text-muted)', fontSize: 20 }} />
              <input
                placeholder="e.g., Aarav Sharma or CS2021001..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                style={{ fontSize: 14 }}
                autoFocus
              />
            </div>
            <button className="btn btn-primary" onClick={() => doSearch(query)} style={{ padding: '12px 24px' }}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Quick filters */}
      {!searched && (
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="section-title">Quick Search by Department</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology'].map(d => (
              <button key={d} className="btn btn-secondary" onClick={() => { setQuery(d); doSearch(d); }}>
                {d}
              </button>
            ))}
          </div>
          <div className="divider" />
          <div className="section-title">Search by Risk Level</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['High', 'Medium', 'Low'].map(r => (
              <button key={r} className="btn btn-secondary" onClick={() => { setQuery(r); doSearch(r); }}>
                <span className={`badge ${r === 'High' ? 'badge-red' : r === 'Medium' ? 'badge-orange' : 'badge-green'}`}>{r} Risk</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong>
          </div>
          {results.length === 0 ? (
            <div className="glass-card">
              <div className="empty-state">
                <div className="empty-state-icon">😕</div>
                <p>No students found matching "{query}"</p>
              </div>
            </div>
          ) : (
            <div className="glass-card">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Year</th>
                      <th>CGPA</th>
                      <th>Attendance</th>
                      <th>Risk</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(s => (
                      <tr key={s.id} onClick={() => navigate(`/students/${s.id}`)}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--accent-indigo)', fontWeight: 600, fontSize: 12 }}>{s.rollNo}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                        <td>{s.department}</td>
                        <td>Year {s.year}</td>
                        <td style={{ color: s.cgpa >= 8 ? '#10b981' : s.cgpa >= 6.5 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>{s.cgpa.toFixed(1)}</td>
                        <td style={{ color: s.attendance < 75 ? '#ef4444' : 'var(--text-secondary)' }}>{s.attendance}%</td>
                        <td>{getRiskBadge(s.riskLevel)}</td>
                        <td><MdChevronRight style={{ color: 'var(--text-muted)' }} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
