import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminBar = ({ editHref = '/admin', editLabel = 'Edit' }) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div style={s.bar}>
      <div style={s.left}>
        <div style={s.dot} />
        <span style={s.siteName}>NewaCore</span>
        <span style={s.sep}>·</span>
        <span style={s.userTxt}>Logged in as <strong>{user.name}</strong></span>
      </div>
      <div style={s.right}>
        <Link to="/admin" style={s.link}>Dashboard</Link>
        <span style={s.divider} />
        <Link to={editHref} style={s.editBtn}>
          ✏ {editLabel}
        </Link>
      </div>
    </div>
  );
};

const s = {
  bar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#0f172a', color: '#94a3b8',
    height: '36px', padding: '0 1.5rem',
    fontSize: '0.75rem', fontFamily: "'Poppins', sans-serif",
    position: 'sticky', top: 0, zIndex: 200,
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
    gap: '1rem',
  },
  left: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 },
  dot:  { width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5', flexShrink: 0 },
  siteName: { fontWeight: '700', color: '#e2e8f0', whiteSpace: 'nowrap' },
  sep:  { color: '#334155' },
  userTxt: { color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  right: { display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 },
  link: {
    color: '#94a3b8', textDecoration: 'none', fontWeight: '500',
    padding: '3px 8px', borderRadius: '5px',
    transition: 'color 0.15s',
  },
  divider: { width: '1px', height: '14px', background: '#1e293b' },
  editBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    padding: '4px 12px', background: '#4f46e5', color: '#fff',
    borderRadius: '6px', textDecoration: 'none',
    fontWeight: '600', fontSize: '0.72rem',
    whiteSpace: 'nowrap',
  },
};

export default AdminBar;
