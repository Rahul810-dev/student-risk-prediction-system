import { useState } from 'react';
import { notifications } from '../data/students';
import { MdInfo, MdWarning, MdError, MdCheckCircle } from 'react-icons/md';

const typeConfig = {
  alert: { icon: <MdError />, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'Alert' },
  warning: { icon: <MdWarning />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Warning' },
  info: { icon: <MdInfo />, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Info' },
  success: { icon: <MdCheckCircle />, color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Success' },
};

const FILTERS = ['All', 'Alert', 'Warning', 'Info', 'Unread'];

export default function Notifications() {
  const [filter, setFilter] = useState('All');
  const [notifs, setNotifs] = useState(notifications);

  const filtered = notifs.filter(n => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.read;
    return n.type === filter.toLowerCase();
  });

  const markAllRead = () => setNotifs(notifs.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>System alerts, warnings, and important updates</p>
      </div>

      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total', value: notifs.length, color: '#6366f1', icon: '🔔' },
          { label: 'Unread', value: unreadCount, color: '#ef4444', icon: '📬' },
          { label: 'Alerts', value: notifs.filter(n => n.type === 'alert').length, color: '#ef4444', icon: '🚨' },
          { label: 'Warnings', value: notifs.filter(n => n.type === 'warning').length, color: '#f59e0b', icon: '⚠️' },
        ].map(c => (
          <div className="glass-card" key={c.label} style={{ padding: 20 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Header + filters */}
      <div className="glass-card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {FILTERS.map(f => (
              <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f}{f === 'Unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={markAllRead}>
              Mark All Read
            </button>
          )}
        </div>

        <div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <p>No notifications in this category.</p>
            </div>
          ) : filtered.map(n => {
            const cfg = typeConfig[n.type];
            return (
              <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}
                onClick={() => markRead(n.id)} style={{ cursor: 'pointer' }}>
                <div className="notif-icon" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>
                    {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1' }} />}
                    <span className={`badge ${n.type === 'alert' ? 'badge-red' : n.type === 'warning' ? 'badge-orange' : n.type === 'success' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: 10 }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
