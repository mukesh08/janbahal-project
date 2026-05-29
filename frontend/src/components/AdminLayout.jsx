import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Palette, Monitor,
  Menu, PanelBottom, BookOpen, PenLine, Upload,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin',           Icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/pages',     Icon: FileText,        label: 'Pages'     },
  { to: '/admin/customize', Icon: Palette,         label: 'Customize' },
  { to: '/admin/header',    Icon: Monitor,         label: 'Header'    },
  { to: '/admin/menu',      Icon: Menu,            label: 'Menu'      },
  { to: '/admin/footer',    Icon: PanelBottom,     label: 'Footer'    },
  { to: '/admin/blog',      Icon: BookOpen,        label: 'Blog'      },
  { to: '/admin/posts',     Icon: PenLine,         label: 'Posts'     },
  { to: '/admin/upload',    Icon: Upload,          label: 'Upload'    },
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
          <div style={s.logoMark}>J</div>
          <div>
            <div style={s.logoText}>NewaCore</div>
            <div style={s.logoSub}>Admin Panel</div>
          </div>
        </div>

        {/* Nav label */}
        <div style={s.navLabel}>NAVIGATION</div>

        {/* Nav items */}
        <nav style={s.nav}>
          {NAV_ITEMS.map(({ to, Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                ...s.navItem,
                ...(isActive ? s.navItemActive : {}),
              })}
            >
              <span style={s.navIcon}><Icon size={16} strokeWidth={1.8} /></span>
              <span style={s.navLabel2}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom: user */}
        <div style={s.userSection}>
          <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div style={s.userInfo}>
            <span style={s.userName}>{user?.name}</span>
            <span style={s.userRole}>Administrator</span>
          </div>
          <button style={s.logoutBtn} title="Logout" onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
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
    fontFamily: "'Poppins', sans-serif",
    background: '#f8fafc',
  },

  /* ── Sidebar ── */
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: '#ffffff',
    borderRight: '1px solid #e8ecf0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
  },

  /* Logo */
  logoWrap: {
    padding: '1.5rem 1.25rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f4f8',
    marginBottom: '0.75rem',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '1.1rem',
    flexShrink: 0,
    fontFamily: "'Poppins', sans-serif",
  },
  logoText: {
    fontWeight: '700',
    fontSize: '1rem',
    color: '#0f172a',
    lineHeight: 1.2,
    fontFamily: "'Poppins', sans-serif",
  },
  logoSub: {
    fontSize: '0.68rem',
    color: '#94a3b8',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif",
  },

  /* Nav */
  navLabel: {
    padding: '0 1.25rem 0.4rem',
    fontSize: '0.65rem',
    fontWeight: '600',
    color: '#b0bcc8',
    letterSpacing: '1px',
    fontFamily: "'Poppins', sans-serif",
  },
  nav: {
    flex: 1,
    padding: '0 0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.85rem',
    borderRadius: '10px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: '500',
    transition: 'all 0.15s ease',
    fontFamily: "'Poppins', sans-serif",
  },
  navItemActive: {
    background: '#eef2ff',
    color: '#4f46e5',
    fontWeight: '600',
  },
  navIcon: {
    fontSize: '1rem',
    width: '22px',
    textAlign: 'center',
    flexShrink: 0,
  },
  navLabel2: {
    flex: 1,
  },

  /* User section */
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.85rem 1rem',
    margin: '0.5rem 0.75rem 0.75rem',
    borderRadius: '12px',
    background: '#f8fafc',
    border: '1px solid #f1f4f8',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.85rem',
    flexShrink: 0,
    fontFamily: "'Poppins', sans-serif",
  },
  userInfo: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  userName: {
    color: '#1e293b',
    fontSize: '0.8rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontFamily: "'Poppins', sans-serif",
  },
  userRole: {
    color: '#94a3b8',
    fontSize: '0.7rem',
    fontFamily: "'Poppins', sans-serif",
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '6px',
    flexShrink: 0,
    transition: 'color 0.15s',
  },

  /* Main content */
  main: {
    flex: 1,
    background: '#f8fafc',
    overflow: 'auto',
    fontFamily: "'Poppins', sans-serif",
  },
};

export default AdminLayout;
