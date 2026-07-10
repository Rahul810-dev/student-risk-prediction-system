import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdComputer, MdTheaterComedy, MdSportsSoccer, MdSchool, MdGroups, MdCelebration,
  MdEventNote, MdCheckCircle, MdGroup, MdLocationOn, MdEventBusy
} from 'react-icons/md';

const API = "http://localhost:8000";
const TYPES = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Social'];
const STATUSES = ['All', 'Upcoming', 'Completed', 'Ongoing'];
const classMap = { Technical: 'badge-blue', Cultural: 'badge-purple', Sports: 'badge-green', Academic: 'badge-cyan', Social: 'badge-orange' };

const typeIcons = {
  Technical: <MdComputer />, Cultural: <MdTheaterComedy />, Sports: <MdSportsSoccer />,
  Academic: <MdSchool />, Social: <MdGroups />
};

function getTypeBadge(type) {
  return <span className={`badge ${classMap[type] || 'badge-gray'}`}>{type}</span>;
}

function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', event_type: 'Technical', venue: '',
    event_date: '', event_time: '', department: 'All', year: 'All',
    max_participants: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.venue || !form.event_date) {
      setError('Title, venue, and date are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await fetch(`${API}/admin/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        max_participants: form.max_participants ? Number(form.max_participants) : null
      })
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.error) {
      setError(data.error);
    } else {
      onCreated();
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-card" style={{ padding: 28, width: 480, maxHeight: '85vh', overflowY: 'auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Create Event</h3>
        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="input-field" placeholder="Event Title"
            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea className="input-field" placeholder="Description" rows={3}
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <select className="input-field" value={form.event_type}
            onChange={e => setForm({ ...form, event_type: e.target.value })}>
            {TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
          </select>

          <input className="input-field" placeholder="Venue"
            value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />

          <div style={{ display: 'flex', gap: 10 }}>
            <input className="input-field" type="date" style={{ flex: 1 }}
              value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
            <input className="input-field" placeholder="Time (e.g. 10:00 AM)" style={{ flex: 1 }}
              value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <select className="input-field" style={{ flex: 1 }} value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}>
              <option value="All">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ME">ME</option>
              <option value="ECE">ECE</option>
            </select>
            <select className="input-field" style={{ flex: 1 }} value={form.year}
              onChange={e => setForm({ ...form, year: e.target.value })}>
              <option value="All">All Years</option>
              <option value="1.0">Year 1</option>
              <option value="2.0">Year 2</option>
              <option value="3.0">Year 3</option>
              <option value="4.0">Year 4</option>
            </select>
          </div>

          <input className="input-field" type="number" placeholder="Max Participants (optional)"
            value={form.max_participants} onChange={e => setForm({ ...form, max_participants: e.target.value })} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const loadEvents = () => {
    setLoading(true);
    fetch(`${API}/admin/events`)
      .then(r => r.json())
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setEvents([]); setLoading(false); });
  };

  useEffect(() => { loadEvents(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this event? This also removes all its registrations.')) return;
    await fetch(`${API}/admin/events/${id}`, { method: 'DELETE' });
    loadEvents();
  };

  const filtered = events.filter(e =>
    (typeFilter === 'All' || e.event_type === typeFilter) &&
    (statusFilter === 'All' || e.status === statusFilter)
  );

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading events...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Events & Activities</h1>
          <p>Campus events, technical fests, and extracurricular activities. Click an event to view full details.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Event</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Events', value: events.length, icon: <MdCelebration />, color: '#6366f1' },
          { label: 'Upcoming', value: events.filter(e => e.status === 'Upcoming').length, icon: <MdEventNote />, color: '#3b82f6' },
          { label: 'Completed', value: events.filter(e => e.status === 'Completed').length, icon: <MdCheckCircle />, color: '#10b981' },
          { label: 'Total Registrations', value: events.reduce((a, e) => a + e.participant_count, 0), icon: <MdGroup />, color: '#8b5cf6' },
        ].map(c => (
          <div className="glass-card" key={c.label} style={{ padding: 20 }}>
            <div style={{ fontSize: 24, marginBottom: 8, color: c.color }}>{c.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '14px 16px', marginBottom: 16 }}>
        <div className="filter-row">
          <select className="input-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} events</span>
        </div>
      </div>

      <div className="grid-2">
        {filtered.map(e => (
          <div className="glass-card" key={e.id} onClick={() => navigate(`/events/${e.id}`)} style={{ padding: 20, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: '#eff6ff', color: '#2563eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>{typeIcons[e.event_type] || <MdCelebration />}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}><MdLocationOn style={{ verticalAlign: 'middle' }} /> {e.venue}</div>
                </div>
              </div>
              <span className={`badge ${e.status === 'Completed' ? 'badge-green' : e.status === 'Upcoming' ? 'badge-blue' : 'badge-orange'}`}>
                {e.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}><MdEventNote style={{ verticalAlign: 'middle' }} /> {e.event_date}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <MdGroup style={{ verticalAlign: 'middle' }} /> {e.participant_count}{e.max_participants ? ` / ${e.max_participants}` : ''} registered
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.department} · Year {e.year}</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                {getTypeBadge(e.event_type)}
                <button
                  onClick={(ev) => handleDelete(ev, e.id)}
                  style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card">
          <div className="empty-state">
            <MdEventBusy style={{ fontSize: 40, color: 'var(--text-muted)' }} />
            <p>No events found for selected filters.</p>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onCreated={loadEvents} />
      )}
    </div>
  );
}