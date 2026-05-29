import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ExternalLink } from 'lucide-react';

const SiteFooter = () => {
  const [footer, setFooter] = useState(null);

  useEffect(() => {
    axios.get('/api/footer').then(({ data }) => setFooter(data)).catch(() => {});
  }, []);

  const hasCols    = (footer?.columns || []).length > 0;
  const hasSocials = (footer?.socials || []).length > 0;
  const copyright  = footer?.copyright || `© ${new Date().getFullYear()} — All rights reserved`;

  return (
    <footer style={s.footer}>
      <div style={s.inner}>

        {/* Columns */}
        {hasCols && (
          <div style={s.cols}>
            {footer.columns.map((col, i) => (
              <div key={i} style={s.col}>
                <div style={s.colTitle}>{col.title}</div>
                {(col.links || []).map((link, j) => (
                  link.url?.startsWith('/')
                    ? <Link key={j} to={link.url} style={s.colLink}>{link.label}</Link>
                    : <a key={j} href={link.url} target="_blank" rel="noreferrer" style={s.colLink}>{link.label}</a>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Bottom row */}
        <div style={{ ...s.bottom, borderTop: hasCols ? '1px solid rgba(255,255,255,0.08)' : 'none', paddingTop: hasCols ? '1.25rem' : '0' }}>
          <span style={s.copy}>{copyright}</span>

          {hasSocials && (
            <div style={s.socials}>
              {footer.socials.filter(item => item.url).map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noreferrer" style={s.socialLink} title={item.platform}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '600', marginRight: '2px' }}>{item.platform}</span>
                  <ExternalLink size={11} strokeWidth={2} />
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </footer>
  );
};

const s = {
  footer: {
    background: '#1e293b',
    color: '#94a3b8',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, sans-serif",
    marginTop: 'auto',
  },
  inner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2.5rem 2rem 1.75rem',
  },
  cols: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2.5rem',
    marginBottom: '1.75rem',
  },
  col: {
    minWidth: '140px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  colTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
    fontSize: '0.82rem',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  colLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.82rem',
    lineHeight: 1.6,
    transition: 'color 0.15s',
  },
  bottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  copy: {
    fontSize: '0.78rem',
    color: '#475569',
  },
  socials: {
    display: 'flex',
    gap: '10px',
  },
  socialLink: {
    color: '#475569',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
};

export default SiteFooter;
