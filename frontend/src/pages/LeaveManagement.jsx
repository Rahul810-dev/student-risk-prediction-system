import { useState } from 'react';
import { students } from '../data/students';
import { MdCheckCircle, MdPendingActions, MdCancel, MdDocumentScanner } from 'react-icons/md';

const allLeaves = students.flatMap(s => 
  s.leaveHistory.map(l => ({ ...l, student: s.name, rollNo: s.rollNo, dept: s.department }))
);

const TYPES = [
  { label: 'Sick Leave', color: 'badge-red' },
  { label: 'On Duty', color: 'badge-blue' },
  { label: 'Personal Leave', color: 'badge-purple' },
  { label: 'Emergency Leave', color: 'badge-orange' }
];
const STATUSES = ['All Requests', 'Pending', 'Approved', 'Rejected'];

export default function LeaveManagement() {
  const [statusFilter, setStatusFilter] = useState('All Requests');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All' or specific type
  
  const pending = allLeaves.filter(l => l.status === 'Pending').length;
  const approved = allLeaves.filter(l => l.status === 'Approved').length;
  const rejected = allLeaves.filter(l => l.status === 'Rejected').length;

  const filtered = allLeaves.filter(l => {
    if (statusFilter !== 'All Requests' && l.status !== statusFilter) return false;
    if (typeFilter !== 'All' && l.type !== typeFilter) return false;
    return true;
  });

  return (
    <div style={{ padding: '0 12px' }}>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24 }}>Leave Management</h1>
        <p>Review and manage student leave requests</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid-4" style={{ gap: 20, marginBottom: 24 }}>
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Total Requests
            <MdDocumentScanner size={18} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>{allLeaves.length}</div>
        </div>
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Pending
            <MdPendingActions size={18} color="#d97706" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#d97706' }}>{pending}</div>
        </div>
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Approved
            <MdCheckCircle size={18} color="#059669" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#059669' }}>{approved}</div>
        </div>
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Rejected
            <MdCancel size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#dc2626' }}>{rejected}</div>
        </div>
      </div>

      {/* Leave Types Section (Clickable) */}
      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Leave Types Filters</h3>
          {typeFilter !== 'All' && (
            <button onClick={() => setTypeFilter('All')} className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }}>
              Clear Filter
            </button>
          )}
        </div>
        <div className="grid-4" style={{ gap: 16 }}>
          {TYPES.map(t => {
            const isSelected = typeFilter === t.label;
            return (
              <div 
                key={t.label} 
                onClick={() => setTypeFilter(t.label === typeFilter ? 'All' : t.label)}
                style={{ 
                  padding: '16px 20px', 
                  border: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--border)', 
                  borderRadius: 12, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: isSelected ? '#eff6ff' : 'white',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.1)' : 'none'
                }}>
                <span className={`badge ${t.color}`} style={{ padding: '6px 12px', fontSize: 12 }}>{t.label}</span>
                {isSelected && <MdCheckCircle style={{ marginLeft: 'auto', color: 'var(--accent-blue)', fontSize: 18 }}/>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {STATUSES.map(s => (
          <button 
            key={s} 
            onClick={() => setStatusFilter(s)}
            style={{ 
              padding: '8px 20px', 
              borderRadius: 8, 
              fontSize: 14, 
              fontWeight: 600,
              cursor: 'pointer',
              border: s === statusFilter ? 'none' : '1px solid var(--border)',
              background: s === statusFilter ? '#2563eb' : 'white',
              color: s === statusFilter ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            {s}
          </button>
        ))}
        {typeFilter !== 'All' && (
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center' }}>
            Showing <b>{filtered.length}</b> result(s) for {typeFilter}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="glass-card">
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: 'white' }}>
                <th style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, fontWeight: 700 }}>STUDENT</th>
                <th style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, fontWeight: 700 }}>LEAVE TYPE</th>
                <th style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, fontWeight: 700 }}>DURATION</th>
                <th style={{ padding: '16px 24px', background: 'white', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 12, fontWeight: 700 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found.</td></tr>
              ) : filtered.map((l, i) => (
                <tr key={i} style={{ background: 'white' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{l.student}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{l.rollNo} • {l.dept}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`badge ${
                      l.type === 'Sick Leave' ? 'badge-red' : 
                      l.type === 'On Duty' ? 'badge-blue' : 
                      l.type === 'Personal Leave' ? 'badge-purple' : 'badge-orange'
                    }`} style={{ padding: '6px 14px', fontSize: 12 }}>
                      {l.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: 13, color: '#334155' }}>{l.from}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>to {l.to}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <span className={`badge ${
                        l.status === 'Approved' ? 'badge-green' : 
                        l.status === 'Pending' ? 'badge-orange' : 'badge-red'
                      }`} style={{ padding: '6px 14px', fontSize: 12 }}>
                        {l.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
