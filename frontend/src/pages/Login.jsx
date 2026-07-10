import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff, MdSchool, MdPeople, MdAdminPanelSettings } from 'react-icons/md';

const API = 'http://localhost:8000';

const roleInfo = {
  Student: { icon: MdSchool,              label: 'Student Portal', desc: 'Access your academics, attendance and performance insights.' },
  Staff:   { icon: MdPeople,              label: 'Staff Portal',   desc: 'Manage students, reports and academic monitoring.' },
  Admin:   { icon: MdAdminPanelSettings,  label: 'Admin Portal',   desc: 'Full control over data, users and system settings.' }
};

const roleRoutes = { Student: '/student-dashboard', Staff: '/staff-dashboard', Admin: '/dashboard' };

export default function Login() {
  const [role,     setRole]     = useState('Student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res  = await fetch(`${API}/auth/login`, {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.role !== role) {
        setError(`This account is registered as ${data.role}. Please select the correct role.`);
        setLoading(false);
        return;
      }

      localStorage.setItem('userRole',    data.role);
      localStorage.setItem('userName',    data.name);
      localStorage.setItem('userEmail',   data.email);
      if (data.student_id)  localStorage.setItem('studentId',  data.student_id);
      if (data.employee_id) localStorage.setItem('employeeId', data.employee_id);

      navigate(roleRoutes[data.role]);

    } catch {
      setError('Connection failed. Make sure the server is running.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa', fontFamily: 'Inter, sans-serif' }}>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-100px', left: '-100px' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', bottom: '-50px', right: '-50px' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', padding: '40px' }}>
          {['Student', 'Staff', 'Admin'].map(r => {
            const Icon = roleInfo[r].icon;
            return (
              <div key={r} style={{ opacity: role === r ? 1 : 0, position: role === r ? 'relative' : 'absolute', transition: 'opacity 0.5s ease', pointerEvents: role === r ? 'auto' : 'none' }}>
                <div style={{ fontSize: '100px', marginBottom: '24px', opacity: 0.9 }}><Icon /></div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>{roleInfo[r].label}</h2>
                <p style={{ fontSize: '15px', opacity: 0.8, maxWidth: '320px', lineHeight: 1.6 }}>{roleInfo[r].desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ background: 'white', width: '400px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', position: 'relative', zIndex: 2 }}>

            <div style={{ display: 'flex', background: 'white', borderRadius: '100px', border: '1px solid #e2e8f0', padding: '4px', position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 10 }}>
              {['Student', 'Staff', 'Admin'].map(r => (
                <button key={r} type="button" onClick={() => { setRole(r); setError(''); }}
                  style={{ padding: '8px 16px', borderRadius: '100px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: role === r ? '#4f46e5' : 'transparent', color: role === r ? 'white' : '#64748b', transition: 'all 0.2s ease' }}>
                  {r}
                </button>
              ))}
            </div>

            <div style={{ background: '#4f46e5', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '40px 0 20px 0', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '20px', letterSpacing: '1px' }}>
              LOG IN
            </div>

            <div style={{ padding: '32px' }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>Email Address</label>
                  <input type="email" placeholder="your.email@college.edu" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} required />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)}
                      style={{ width: '100%', padding: '12px 40px 12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} required />
                    <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#94a3b8' }}>
                      {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', fontSize: '12px', color: '#64748b', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                  {role === 'Admin'   && 'Admin: admin@college.edu / ADMIN@2024'}
                  {role === 'Staff'   && 'Staff: arjun.sharma@college.edu / TEACH@2024'}
                  {role === 'Student' && 'Student: use your registered email / your roll number'}
                </div>

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}