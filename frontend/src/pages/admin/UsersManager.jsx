import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Users, Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-react';

const ROLES = ['admin', 'viewer'];

const emptyForm = { name: '', email: '', password: '', role: 'admin' };

const UsersManager = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit'
  const [form, setForm]         = useState(emptyForm);
  const [editId, setEditId]     = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    try {
      const { data } = await axios.get('/api/auth/users');
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(emptyForm); setEditId(null); setError(''); setShowPass(false); setModal('add');
  };

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setEditId(u._id); setError(''); setShowPass(false); setModal('edit');
  };

  const closeModal = () => { setModal(null); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      if (modal === 'add') {
        await axios.post('/api/auth/users', form);
      } else {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await axios.put(`/api/auth/users/${editId}`, payload);
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/auth/users/${deleteId}`);
      setDeleteId(null);
      load();
    } catch {
      setError('Failed to delete user.');
    }
  };

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Header */}
        <div style={s.pageHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={s.icon}><Users size={20} strokeWidth={1.8} color="#4f46e5" /></div>
            <div>
              <h1 style={s.title}>Users</h1>
              <p style={s.sub}>Manage admin accounts and roles</p>
            </div>
          </div>
          <button style={s.addBtn} onClick={openAdd}>
            <Plus size={15} strokeWidth={2.5} /> Add User
          </button>
        </div>

        {/* Table */}
        <div style={s.card}>
          {loading ? (
            <p style={s.empty}>Loading…</p>
          ) : users.length === 0 ? (
            <p style={s.empty}>No users found.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={s.tr}>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={s.avatar}>{u.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={s.td}>{u.email}</td>
                    <td style={s.td}>
                      <span style={{ ...s.roleBadge, ...(u.role === 'admin' ? s.badgeAdmin : s.badgeViewer) }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={s.iconBtn} onClick={() => openEdit(u)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button style={{ ...s.iconBtn, ...s.deleteBtn }} onClick={() => setDeleteId(u._id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add / Edit Modal */}
        {modal && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <div style={s.modalHeader}>
                <h3 style={s.modalTitle}>{modal === 'add' ? 'Add User' : 'Edit User'}</h3>
                <button style={s.closeBtn} onClick={closeModal}><X size={18} /></button>
              </div>

              {error && <p style={s.error}>{error}</p>}

              <form onSubmit={handleSave} style={s.form}>
                <label style={s.label}>Full Name</label>
                <input style={s.input} placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />

                <label style={s.label}>Email</label>
                <input style={s.input} type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />

                <label style={s.label}>{modal === 'edit' ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <div style={s.pwWrap}>
                  <input
                    style={{ ...s.input, marginBottom: 0, paddingRight: '2.8rem', width: '100%', boxSizing: 'border-box' }}
                    type={showPass ? 'text' : 'password'}
                    placeholder={modal === 'edit' ? 'Leave blank to keep current' : 'Password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required={modal === 'add'}
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                    {showPass ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>

                <label style={s.label}>Role</label>
                <select style={s.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>

                <div style={s.modalActions}>
                  <button type="button" style={s.cancelBtn} onClick={closeModal}>Cancel</button>
                  <button type="submit" style={s.saveBtn} disabled={saving}>
                    {saving ? 'Saving…' : modal === 'add' ? 'Add User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteId && (
          <div style={s.overlay}>
            <div style={{ ...s.modal, maxWidth: '380px' }}>
              <h3 style={s.modalTitle}>Delete User?</h3>
              <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem', fontSize: '0.9rem' }}>
                This action cannot be undone.
              </p>
              <div style={s.modalActions}>
                <button style={s.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
                <button style={{ ...s.saveBtn, background: '#ef4444' }} onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif", maxWidth: '1100px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  icon: { width: '44px', height: '44px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px' },
  sub: { color: '#64748b', fontSize: '0.85rem', margin: 0 },
  addBtn: { display: 'flex', alignItems: 'center', gap: '7px', padding: '0.65rem 1.4rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif" },

  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.85rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '0.9rem 1.25rem', fontSize: '0.88rem', color: '#475569' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0 },
  roleBadge: { fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px', textTransform: 'capitalize' },
  badgeAdmin: { background: '#eef2ff', color: '#4f46e5' },
  badgeViewer: { background: '#f0fdf4', color: '#16a34a' },
  iconBtn: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' },
  deleteBtn: { color: '#ef4444', borderColor: '#fecaca', background: '#fff5f5' },
  empty: { padding: '2rem', textAlign: 'center', color: '#94a3b8' },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.78rem', fontWeight: '600', color: '#475569', marginTop: '0.5rem' },
  input: { padding: '0.65rem 0.9rem', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontFamily: "'Poppins', sans-serif", width: '100%', boxSizing: 'border-box' },
  pwWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.25rem' },
  cancelBtn: { padding: '0.6rem 1.2rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif", color: '#475569' },
  saveBtn: { padding: '0.6rem 1.4rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif" },
  error: { color: '#e53e3e', background: '#fff5f5', border: '1px solid #fecaca', padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '0.5rem' },
};

export default UsersManager;
