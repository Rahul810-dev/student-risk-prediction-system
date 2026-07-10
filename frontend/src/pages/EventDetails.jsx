import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MdEvent, MdLocationOn, MdGroup, MdArrowBack, MdDownload } from 'react-icons/md';

const API = "http://localhost:8000";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/admin/events/${id}`)
      .then(r => r.json())
      .then(data => { setEvent(data.error ? null : data); setLoading(false); })
      .catch(() => { setEvent(null); setLoading(false); });
  }, [id]);

  const downloadRegistrations = () => {
    if (!event) return;
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headers = ['Roll No', 'Name', 'Department', 'Year', 'Email', 'Registration Date', 'Status'];
    const rows = event.registered_students.map(s => [
      s.student_id, s.student_name, s.department, s.year, s.email, s.registration_date, s.status
    ]);
    const csv = [headers.map(escape).join(','), ...rows.map(row => row.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_').toLowerCase()}_registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!event) return <div style={{ padding: 40, textAlign: 'center' }}>Event not found</div>;

  const capacityPct = event.max_participants
    ? Math.min(100, Math.round((event.registered_students.length / event.max_participants) * 100))
    : null;

  return (
    <div style={{ padding: '0 12px' }}>
      <button className="back-btn" onClick={() => navigate('/events')}>
        <MdArrowBack /> Back to Events
      </button>

      <div className="glass-card" style={{ padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#2563eb'
          }}>
            {event.event_type === 'Technical' ? '💻' : event.event_type === 'Cultural' ? '🎭' : event.event_type === 'Sports' ? '⚽' : '🎪'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <span className={`badge ${event.status === 'Completed' ? 'badge-green' : event.status === 'Upcoming' ? 'badge-blue' : 'badge-orange'}`}>
                {event.status}
              </span>
              <span className="badge badge-gray">{event.event_type}</span>
              <span className="badge badge-gray">{event.department} · Year {event.year}</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{event.title}</h1>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14, color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MdEvent color="#2563eb" /> {event.event_date} {event.event_time}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MdLocationOn color="#2563eb" /> {event.venue}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MdGroup color="#2563eb" /> {event.registered_students.length} Registered</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={downloadRegistrations} style={{ padding: '12px 20px', fontSize: 14 }}>
            <MdDownload size={18} /> Download Registration List (CSV)
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ gap: 24 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Event Description</h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {event.description || 'No description provided.'}
            </p>
          </div>

          <div className="glass-card">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Registered Students ({event.registered_students.length})</h3>
              <button className="btn btn-secondary" onClick={downloadRegistrations} style={{ fontSize: 12, padding: '4px 10px' }}>Export CSV</button>
            </div>
            <div className="table-container" style={{ border: 'none', maxHeight: 400, overflowY: 'auto' }}>
              <table className="data-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Department</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {event.registered_students.slice(0, 10).map(s => (
                    <tr key={s.student_id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.student_name}</td>
                      <td>{s.student_id}</td>
                      <td>{s.department}</td>
                      <td><span className="badge badge-green">{s.status}</span></td>
                    </tr>
                  ))}
                  {event.registered_students.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#64748b' }}>No registrations yet.</td></tr>
                  )}
                  {event.registered_students.length > 10 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 16, color: '#64748b', fontSize: 12, background: '#f8faff', fontStyle: 'italic' }}>
                        Showing 10 of {event.registered_students.length} entries. Download CSV for full list.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {event.max_participants && (
            <div className="glass-card" style={{ padding: 20, background: '#f8faff' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Registration Status</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Capacity Filled</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{capacityPct}%</span>
              </div>
              <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${capacityPct}%`, height: '100%', background: '#2563eb' }} />
              </div>
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 12, textAlign: 'center' }}>
                {event.registered_students.length} / {event.max_participants} spots filled
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}