import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminBar from './AdminBar';

const DEFAULT_HEADER = {
  logoText: 'Janbahal', logoImage: '', tagline: '',
  bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#4f46e5',
  isSticky: true, showCta: false, ctaLabel: 'Get Started', ctaUrl: '/contact',
  navItems: [],
};

const SiteHeader = ({ editHref, editLabel }) => {
  const [header, setHeader] = useState(DEFAULT_HEADER);

  useEffect(() => {
    axios.get('/api/header')
      .then(({ data }) => setHeader({ ...DEFAULT_HEADER, ...data }))
      .catch(() => {});
  }, []);

  const navStyle = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '0 2rem', height: '56px',
    background: header.bgColor, color: header.textColor,
    borderBottom: '1px solid rgba(0,0,0,0.07)',
    position: header.isSticky ? 'sticky' : 'relative',
    top: 0, zIndex: 100,
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
    fontFamily: "'Poppins', sans-serif",
  };

  return (
    <>
    <AdminBar editHref={editHref} editLabel={editLabel} />
    <nav style={navStyle}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
        {header.logoImage
          ? <img src={header.logoImage} alt={header.logoText} style={{ height: '32px', width: '32px', objectFit: 'cover', borderRadius: '8px' }} />
          : <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: `linear-gradient(135deg, ${header.accentColor}, ${header.accentColor}cc)`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '0.9rem',
            }}>
              {(header.logoText || 'J')[0]}
            </div>
        }
        <div>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: header.textColor, lineHeight: 1.1 }}>
            {header.logoText}
          </div>
          {header.tagline && (
            <div style={{ fontSize: '0.58rem', color: header.textColor, opacity: 0.55, lineHeight: 1 }}>
              {header.tagline}
            </div>
          )}
        </div>
      </Link>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Nav links from selected menu */}
      {(header.navItems || []).map((link, i) => (
        link.target === '_blank'
          ? <a key={i} href={link.url} target="_blank" rel="noreferrer"
              style={{ fontSize: '0.85rem', fontWeight: '500', color: header.textColor, opacity: 0.8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {link.label}
            </a>
          : <Link key={i} to={link.url}
              style={{ fontSize: '0.85rem', fontWeight: '500', color: header.textColor, opacity: 0.8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {link.label}
            </Link>
      ))}

      {/* CTA button */}
      {header.showCta && (
        <Link to={header.ctaUrl} style={{
          padding: '6px 16px', background: header.accentColor,
          color: '#fff', borderRadius: '8px', fontSize: '0.82rem',
          fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {header.ctaLabel}
        </Link>
      )}
    </nav>
    </>
  );
};

export default SiteHeader;
