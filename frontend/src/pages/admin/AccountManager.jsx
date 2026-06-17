import { useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/ui/PasswordInput';
import Alert from '../../components/ui/Alert';
import PageHeader from '../../components/ui/PageHeader';
import { UserCircle } from 'lucide-react';

const AccountManager = () => {
  const { user } = useAuth();

  const [profile, setProfile]     = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const [profileMsg, setProfileMsg]   = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [saving, setSaving]           = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setSaving(true);
    try {
      const { data } = await axios.put('/api/auth/account', { name: profile.name, email: profile.email });
      localStorage.setItem('newacore_user', JSON.stringify({ ...user, ...data }));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
    }
    setSaving(true);
    try {
      await axios.put('/api/auth/account', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Page header */}
        <PageHeader
          icon={<UserCircle size={20} strokeWidth={1.8} color="#4f46e5" />}
          title="My Account"
          subtitle="Manage your profile and password"
        />

        <div style={s.grid}>

          {/* Profile card */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Profile Information</h2>

            {profileMsg.text && (
              <Alert type={profileMsg.type === 'success' ? 'success' : 'error'}>{profileMsg.text}</Alert>
            )}

            <form onSubmit={handleProfileSave} style={s.form}>
              <div style={s.avatarSection}>
                <div style={s.bigAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user?.role}</div>
                </div>
              </div>

              <label style={s.label}>Full Name</label>
              <input
                style={s.input}
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                required
              />

              <label style={s.label}>Email Address</label>
              <input
                style={s.input}
                type="email"
                value={profile.email}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                required
              />

              <button style={s.saveBtn} type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Password card */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Change Password</h2>

            {passwordMsg.text && (
              <Alert type={passwordMsg.type === 'success' ? 'success' : 'error'}>{passwordMsg.text}</Alert>
            )}

            <form onSubmit={handlePasswordSave} style={s.form}>
              <label style={s.label}>Current Password</label>
              <PasswordInput
                placeholder="Current password"
                value={passwords.currentPassword}
                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />

              <label style={s.label}>New Password</label>
              <PasswordInput
                placeholder="New password"
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
              />

              <label style={s.label}>Confirm New Password</label>
              <PasswordInput
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
              />

              <button style={s.saveBtn} type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif", maxWidth: '1100px' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.25rem' },

  avatarSection: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px' },
  bigAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', flexShrink: 0 },

  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginTop: '0.5rem' },
  input: { padding: '0.65rem 0.9rem', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontFamily: "'Poppins', sans-serif", width: '100%', boxSizing: 'border-box' },

  saveBtn: { marginTop: '1rem', padding: '0.7rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem', fontFamily: "'Poppins', sans-serif" },
};

export default AccountManager;
