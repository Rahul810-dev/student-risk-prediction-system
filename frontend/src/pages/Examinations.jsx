import { useState, useEffect, useRef } from 'react';
import { MdCloudUpload, MdDelete, MdDownload, MdSchedule, MdEvent, MdLocationOn, MdAccessTime } from 'react-icons/md';

const API = 'http://localhost:8000';

const DEPT_OPTIONS = ['All', 'CSE', 'ECE', 'ME', 'CE', 'IT'];
const YEAR_OPTIONS = ['All', '1', '2', '3', '4'];

export default function Examinations() {
  const [schedules, setSchedules] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message,   setMessage]   = useState('');

  const [department,   setDepartment]   = useState('CSE');
  const [year,         setYear]         = useState('All');
  const [examType,     setExamType]     = useState('');
  const [visibleFrom,  setVisibleFrom]  = useState('');
  const [visibleUntil, setVisibleUntil] = useState('');
  const [file,         setFile]         = useState(null);
  const fileInputRef = useRef(null);

  const loadSchedules = () => {
    fetch(`${API}/admin/exam-schedules`)
      .then(r => r.json())
      .then(d => { setSchedules(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadSchedules(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setMessage('Please select an Excel file.'); return; }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('department', department);
    formData.append('year', year);
    formData.append('exam_type', examType);
    formData.append('visible_from', visibleFrom);
    formData.append('visible_until', visibleUntil);
    formData.append('file', file);

    try {
      const res  = await fetch(`${API}/admin/exam-schedule/upload`, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.error) {
        setMessage(`Error: ${data.error}`);
      } else {
        setMessage('Exam schedule uploaded and published successfully.');
        setExamType(''); setVisibleFrom(''); setVisibleUntil(''); setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadSchedules();
      }
    } catch {
      setMessage('Upload failed. Check connection.');
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam schedule? Students and staff will stop seeing it immediately.')) return;
    await fetch(`${API}/admin/exam-schedule/${id}`, { method: 'DELETE' });
    loadSchedules();
  };

  const handleDownload = (id) => {
    window.open(`${API}/admin/exam-schedule/${id}/download`, '_blank');
  };

  const isActive = (s) => {
    const today = new Date().toISOString().split('T')[0];
    return today >= s.visible_from && today <= s.visible_until;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Examination Monitoring</h1>
        <p>Upload and manage examination schedules for departments and years</p>
      </div>

      {/* Upload form */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MdCloudUpload /> Upload New Examination Schedule
        </div>

        {message && (
          <div style={{
            background: message.startsWith('Error') ? '#fef2f2' : '#ecfdf5',
            border: `1px solid ${message.startsWith('Error') ? '#fca5a5' : '#a7f3d0'}`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: message.startsWith('Error') ? '#dc2626' : '#065f46', fontWeight: 600
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Department</label>
              <select className="input-field" value={department} onChange={e => setDepartment(e.target.value)} style={{ width: '100%' }}>
                {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Year</label>
              <select className="input-field" value={year} onChange={e => setYear(e.target.value)} style={{ width: '100%' }}>
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Exam Type</label>
              <input className="input-field" type="text" placeholder="e.g. Assessment 1, Semester Exam"
                value={examType} onChange={e => setExamType(e.target.value)} style={{ width: '100%' }} required />
            </div>
            <div />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Visible From</label>
              <input className="input-field" type="date" value={visibleFrom} onChange={e => setVisibleFrom(e.target.value)} style={{ width: '100%' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Visible Until</label>
              <input className="input-field" type="date" value={visibleUntil} onChange={e => setVisibleUntil(e.target.value)} style={{ width: '100%' }} required />
            </div>
          </div>

          <div style={{
            border: '2px dashed var(--border)', borderRadius: 12, padding: 32,
            textAlign: 'center', marginBottom: 16, background: 'var(--bg-card, #f8fafc)'
          }}>
            <MdCloudUpload size={36} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              {file ? file.name : 'Click to select Excel file'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Supports .xlsx and .xls</div>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])}
              style={{ display: 'none' }} id="examFileInput" />
            <label htmlFor="examFileInput" className="drill-export-btn" style={{ cursor: 'pointer', display: 'inline-block', padding: '8px 20px' }}>
              Choose File
            </label>
          </div>

          <button type="submit" disabled={uploading} className="drill-export-btn" style={{ width: '100%', padding: '12px', fontSize: 14, opacity: uploading ? 0.6 : 1 }}>
            {uploading ? 'Uploading and Publishing...' : 'Upload and Publish Schedule'}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          Expected Excel columns: Subject, Subject Code, Date, Time, Venue, Duration. The schedule will be visible to students and staff in the selected department and year between the dates above.
        </div>
      </div>

      {/* List of schedules */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="chart-title" style={{ marginBottom: 0 }}>Published Schedules ({schedules.length})</div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : schedules.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No exam schedules uploaded yet.</div>
        ) : (
          schedules.map(s => (
            <div key={s.id} style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{s.exam_type}</span>
                    <span className="badge badge-blue">{s.department}</span>
                    <span className="badge badge-blue">{s.year === 'All' ? 'All Years' : `Year ${s.year}`}</span>
                    {isActive(s) ? (
                      <span className="badge badge-green">Live Now</span>
                    ) : (
                      <span className="badge badge-gray">Scheduled / Expired</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Visible {s.visible_from} to {s.visible_until} · {s.items.length} subjects · {s.file_name}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleDownload(s.id)} className="drill-export-btn" style={{ padding: '6px 12px', fontSize: 12 }}>
                    <MdDownload /> Download
                  </button>
                  <button onClick={() => handleDelete(s.id)} style={{
                    padding: '6px 12px', fontSize: 12, borderRadius: 8, border: '1px solid #fca5a5',
                    background: '#fef2f2', color: '#dc2626', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <MdDelete /> Delete
                  </button>
                </div>
              </div>

              {s.items.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                  {s.items.map((item, i) => (
                    <div key={i} style={{ background: 'var(--bg-card, #f8fafc)', borderRadius: 8, padding: 12, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{item.subject}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdEvent size={12} /> {item.exam_date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdAccessTime size={12} /> {item.exam_time}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdLocationOn size={12} /> {item.venue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}