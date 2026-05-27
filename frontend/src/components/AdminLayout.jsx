import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin/pages',  icon: '📄', label: 'Pages'  },
  { to: '/admin/menu',   icon: '☰',  label: 'Menu'   },
  { to: '/admin/footer', icon: '🔲', label: 'Footer' },
  { to: '/admin/blog',   icon: '📝', label: 'Blog'   },
  { to: '/admin/posts',  icon: '✏️', label: 'Posts'  },
  { to: '/admin/upload', icon: '⬆️', label: 'Upload' },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={s.shell}>

      {/* ── SIDEBAR ── */}
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={s.logoWrap} onClick={() => navigate('/')}>
          <span style={s.logo}>Janbahal</span>
          <span style={s.logoBadge}>Admin</span>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                ...s.navItem,
                ...(isActive ? s.navItemActive : {}),
              })}
            >
              <span style={s.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div style={s.userSection}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={s.userInfo}>
            <span style={s.userName}>{user?.name}</span>
            <span style={s.userRole}>Administrator</span>
          </div>
          <button style={s.logoutBtn} title="Logout" onClick={logout}>
            ⏏
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={s.main}>
        {children}
      </main>

    </div>
  );
};

const s = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  /* sidebar */
  sidebar: {
    width: '220px',
    minHeight: '100vh',
    background: '#1e1b4b',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },

  logoWrap: {
    padding: '1.5rem 1.25rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '0.5rem',
  },
  logo: {
    color: '#fff',
    fontWeight: '800',
    fontSize: '1.2rem',
    letterSpacing: '-0.3px',
  },
  logoBadge: {
    fontSize: '0.65rem',
    background: '#4f46e5',
    color: '#fff',
    padding: '0.15rem 0.45rem',
    borderRadius: '999px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },

  nav: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.65rem 0.85rem',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    fontSize: '0.92rem',
    fontWeight: '500',
    transition: 'all 0.15s',
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
  },
  navIcon: {
    fontSize: '1rem',
    width: '20px',
    textAlign: 'center',
  },

  /* user */
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '1rem 1rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#4f46e5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
  },
  userName: {
    color: '#fff',
    fontSize: '0.82rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.72rem',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
    flexShrink: 0,
  },

  /* main */
  main: {
    flex: 1,
    background: '#f8fafc',
    overflow: 'auto',
  },
};

export default AdminLayout;
