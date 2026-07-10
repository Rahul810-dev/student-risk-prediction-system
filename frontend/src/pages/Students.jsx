import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { students } from '../data/students';
import { MdSearch, MdFilterList, MdChevronRight } from 'react-icons/md';

const DEPT_OPTIONS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology'];
const RISK_OPTIONS = ['All', 'Low', 'Medium', 'High'];
const PER_PAGE = 8;

function getRiskBadge(risk) {
  if (risk === 'High') return <span className="badge badge-red">High</span>;
  if (risk === 'Medium') return <span className="badge badge-orange">Medium</span>;
  return <span className="badge badge-green">Low</span>;
}

export default function Students() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [risk, setRisk] = useState('All');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === 'All' || s.department === dept;
    const matchRisk = risk === 'All' || s.riskLevel === risk;
    return matchSearch && matchDept && matchRisk;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <div>
      <div className="page-header">
        <h1>Student List</h1>
        <p>Manage and monitor all enrolled students · {filtered.length} students found</p>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="filter-row">
          <div className="search-bar" style={{ width: 280 }}>
            <MdSearch style={{ color: 'var(--text-muted)', fontSize: 16 }} />
            <input
              placeholder="Search by name or roll number..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="input-field" value={dept} onChange={handleFilter(setDept)}>
            {DEPT_OPTIONS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select className="input-field" value={risk} onChange={handleFilter(setRisk)}>
            {RISK_OPTIONS.map(r => <option key={r}>{r}</option>)}
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Showing {paginated.length} of {filtered.length}
          </span>
        </div>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No.</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>CGPA</th>
                <th>Attendance %</th>
                <th>Backlogs</th>
                <th>Risk Level</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No students found matching your filters.
                  </td>
                </tr>
              ) : paginated.map(s => (
                <tr key={s.id} onClick={() => navigate(`/students/${s.id}`)}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--accent-indigo)', fontWeight: 600, fontSize: 12 }}>{s.rollNo}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: `linear-gradient(135deg, ${s.riskLevel === 'High' ? '#ef4444' : s.riskLevel === 'Medium' ? '#f59e0b' : '#10b981'}30, ${s.riskLevel === 'High' ? '#ef4444' : s.riskLevel === 'Medium' ? '#f59e0b' : '#10b981'}15)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 800, color: 'var(--text-primary)'
                      }}>
                        {s.name.charAt(0)}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</span>
                    </div>
                  </td>
                  <td>{s.department}</td>
                  <td>Year {s.year}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: s.cgpa >= 8 ? '#10b981' : s.cgpa >= 6.5 ? '#f59e0b' : '#ef4444'
                    }}>{s.cgpa.toFixed(1)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar-wrap" style={{ width: 60 }}>
                        <div className="progress-bar-fill" style={{
                          width: `${s.attendance}%`,
                          background: s.attendance >= 75 ? '#10b981' : s.attendance >= 65 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                      <span style={{ color: s.attendance < 75 ? '#ef4444' : 'var(--text-secondary)' }}>
                        {s.attendance}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: s.backlogs > 0 ? '#ef4444' : 'var(--text-muted)', fontWeight: s.backlogs > 0 ? 700 : 400 }}>
                      {s.backlogs}
                    </span>
                  </td>
                  <td>{getRiskBadge(s.riskLevel)}</td>
                  <td><MdChevronRight style={{ color: 'var(--text-muted)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: 16, display: 'flex', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
            <div className="pagination">
              <div className={`page-btn ${page === 1 ? 'disabled' : ''}`} onClick={() => page > 1 && setPage(page - 1)}>‹</div>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <div key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</div>
              ))}
              <div className={`page-btn ${page === totalPages ? 'disabled' : ''}`} onClick={() => page < totalPages && setPage(page + 1)}>›</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
