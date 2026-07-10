import { useState, useEffect } from 'react';
import { MdSchedule, MdEvent, MdAccessTime, MdLocationOn, MdDownload, MdClose } from 'react-icons/md';

const API = 'http://localhost:8000';

export default function ExamScheduleBanner({ role, id }) {
  const [schedules, setSchedules] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    if (!id) return;
    const endpoint = role === 'student'
      ? `${API}/exam-schedule/student/${id}`
      : `${API}/exam-schedule/teacher/${id}`;

    fetch(endpoint)
      .then(r => r.json())
      .then(d => setSchedules(Array.isArray(d) ? d : []))
      .catch(() => setSchedules([]));
  }, [role, id]);

  const visible = schedules.filter(s => !dismissed.includes(s.id));
  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      {visible.map(s => (
        <div key={s.id} style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          borderRadius: 16, padding: 20, color: 'white', marginBottom: 12,
          position: 'relative', overflow: 'hidden'
        }}>
          <button onClick={() => setDismissed(prev => [...prev, s.id])} style={{
            position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.15)',
            border: 'none', borderRadius: 6, color: 'white', cursor: 'pointer', padding: 4, display: 'flex'
          }}>
            <MdClose size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <MdSchedule size={22} />
            <div style={{ fontSize: 16, fontWeight: 800 }}>Upcoming Examination: {s.exam_type}</div>
          </div>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 16 }}>
            Available from {s.visible_from} to {s.visible_until}
          </div>

          {s.items.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
              {s.items.map((item, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{item.subject}</div>
                  <div style={{ fontSize: 11, opacity: 0.85, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdEvent size={12} /> {item.exam_date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdAccessTime size={12} /> {item.exam_time}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MdLocationOn size={12} /> {item.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <a href={`${API}/admin/exam-schedule/${s.id}/download`} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, background: 'white', color: '#4f46e5',
            borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, textDecoration: 'none'
          }}>
            <MdDownload size={16} /> Download Timetable
          </a>
        </div>
      ))}
    </div>
  );
}