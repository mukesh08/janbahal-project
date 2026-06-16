import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import RenderedPage from '../components/RenderedPage';

const Landing = () => {
  const navigate = useNavigate();
  const [pages,    setPages]    = useState([]);
  const [homePage, setHomePage] = useState(null);
  const [homeCSS,  setHomeCSS]  = useState('');
  const [tagline,  setTagline]  = useState('');

  useEffect(() => {
    axios.get('/api/pages').then(({ data }) => setPages(data)).catch(() => {});

    // Use site settings to determine the home page
    axios.get('/api/settings').then(({ data }) => {
      setTagline(data.siteTagline || '');
      if (data.homePage?.gjsHtml) {
        setHomePage(data.homePage);
        setHomeCSS(data.homePage.gjsCss || '');
      }
    }).catch(() => {});
  }, []);

  // Inject GrapesJS CSS for home page
  useEffect(() => {
    if (!homeCSS) return;
    const tag = document.createElement('style');
    tag.id = 'home-page-css';
    tag.innerHTML = homeCSS;
    document.head.appendChild(tag);
    return () => { document.getElementById('home-page-css')?.remove(); };
  }, [homeCSS]);

  // Inject tagline into document title
  useEffect(() => {
    if (tagline) document.title = `NewaCore — ${tagline}`;
  }, [tagline]);

  // If a custom home page is set, render it
  if (homePage?.gjsHtml) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <SiteHeader editHref={`/admin/editor/${homePage._id}`} editLabel="Edit Page" />
        <RenderedPage html={homePage.gjsHtml} style={{ flex: 1 }} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div style={s.root}>

      <SiteHeader editHref="/admin/pages" editLabel="Edit Pages" />

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <span style={s.pill}>AI-Powered Website Builder</span>
          <h1 style={s.heroTitle}>
            Build stunning pages<br />
            <span style={s.heroAccent}>without writing code</span>
          </h1>
          <p style={s.heroSub}>
            {tagline || 'Drag, drop and design beautiful web pages. Let AI generate content, layouts and copy — publish in minutes.'}
          </p>
          {pages.length > 0 && (
            <div style={s.heroBtns}>
              <button style={s.btnGhost} onClick={() => {
                document.getElementById('pages-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                View Published Pages ↓
              </button>
            </div>
          )}
        </div>

        {/* decorative blobs */}
        <div style={{ ...s.blob, top: '-80px', right: '-100px', background: 'rgba(99,102,241,0.15)' }} />
        <div style={{ ...s.blob, bottom: '-60px', left: '-80px', background: 'rgba(139,92,246,0.12)', width: '300px', height: '300px' }} />
      </section>

      {/* ── FEATURES ── */}
      <section style={s.features}>
        {[
          { icon: '🧩', title: 'Drag & Drop Editor', desc: 'Visually build any layout with blocks — no code needed.' },
          { icon: '🤖', title: 'AI Content Generation', desc: 'Use AI to write headlines, copy and generate full sections instantly.' },
          { icon: '🚀', title: 'One-Click Publish', desc: 'Publish pages live with a single click and share via a clean URL.' },
          { icon: '📱', title: 'Responsive Ready', desc: 'Every page looks great on desktop, tablet and mobile.' },
        ].map((f) => (
          <div key={f.title} style={s.featureCard}>
            <span style={s.featureIcon}>{f.icon}</span>
            <h3 style={s.featureTitle}>{f.title}</h3>
            <p style={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ── PUBLISHED PAGES ── */}
      {pages.length > 0 && (
        <section id="pages-section" style={s.pagesSection}>
          <h2 style={s.sectionTitle}>Published Pages</h2>
          <p style={s.sectionSub}>Explore pages built with NewaCore</p>
          <div style={s.pagesGrid}>
            {pages.map((page) => (
              <div
                key={page._id}
                style={s.pageCard}
                onClick={() => navigate(`/page/${page.slug}`)}
              >
                <div style={s.pageCardThumb}>
                  <span style={s.pageCardIcon}>📄</span>
                </div>
                <div style={s.pageCardBody}>
                  <h4 style={s.pageCardTitle}>{page.title}</h4>
                  <span style={s.pageCardSlug}>/{page.slug}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section style={s.cta}>
        <h2 style={s.ctaTitle}>Ready to build something beautiful?</h2>
        <p style={s.ctaSub}>Drag, drop and publish stunning pages — no code needed.</p>
      </section>

      <SiteFooter />

    </div>
  );
};

/* ── Styles ── */
const s = {
  root: { minHeight: '100vh', background: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflowX: 'clip' },

  /* hero */
  hero: { position: 'relative', padding: '6rem 2rem 5rem', textAlign: 'center', overflow: 'clip', background: 'linear-gradient(160deg, #f8f7ff 0%, #eef2ff 100%)' },
  heroInner: { position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto' },
  pill: { display: 'inline-block', padding: '0.35rem 1rem', background: '#ede9fe', color: '#5b21b6', borderRadius: '999px', fontSize: '0.82rem', fontWeight: '600', marginBottom: '1.5rem' },
  heroTitle: { fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: '800', lineHeight: 1.15, color: '#0f172a', marginBottom: '1.25rem' },
  heroAccent: { color: '#4f46e5' },
  heroSub: { fontSize: '1.15rem', color: '#64748b', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 2rem' },
  heroBtns: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { padding: '0.85rem 2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 4px 14px rgba(79,70,229,0.35)' },
  btnGhost: { padding: '0.85rem 1.8rem', background: 'transparent', color: '#4f46e5', border: '2px solid #c7d2fe', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
  blob: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' },

  /* features */
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto', padding: '5rem 2rem' },
  featureCard: { padding: '2rem 1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center' },
  featureIcon: { fontSize: '2rem', display: 'block', marginBottom: '1rem' },
  featureTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' },
  featureDesc: { fontSize: '0.9rem', color: '#64748b', lineHeight: 1.65 },

  /* published pages */
  pagesSection: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 5rem' },
  sectionTitle: { fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: '0.5rem' },
  sectionSub: { textAlign: 'center', color: '#64748b', marginBottom: '2.5rem' },
  pagesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' },
  pageCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  pageCardThumb: { height: '120px', background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  pageCardIcon: { fontSize: '2.5rem' },
  pageCardBody: { padding: '1rem' },
  pageCardTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' },
  pageCardSlug: { fontSize: '0.8rem', color: '#94a3b8' },

  /* cta */
  cta: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '5rem 2rem', textAlign: 'center', color: '#fff' },
  ctaTitle: { fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '800', marginBottom: '0.75rem' },
  ctaSub: { fontSize: '1.05rem', opacity: 0.85, marginBottom: '2rem' },
  btnWhite: { padding: '0.85rem 2rem', background: '#fff', color: '#4f46e5', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' },

  /* footer */
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2.5rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.5rem' },
  footerLogo: { fontWeight: '800', color: '#4f46e5', fontSize: '1.1rem' },
  footerText: { color: '#94a3b8', fontSize: '0.85rem' },
};

export default Landing;
