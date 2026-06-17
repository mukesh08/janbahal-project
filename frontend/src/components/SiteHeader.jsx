import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminBar from './AdminBar';
import { stripBody } from '../lib/stripBody';
import { useInjectCSS } from '../hooks/useInjectCSS';
import { useInterceptLinks } from '../hooks/useInterceptLinks';

const NAV_STYLES = `
  #site-header-gjs a {
    position: relative;
    transition: opacity 0.2s ease;
    text-decoration: none;
  }
  #site-header-gjs a::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 0;
    height: 2px;
    background: currentColor;
    border-radius: 2px;
    transition: width 0.28s cubic-bezier(0.65, 0, 0.35, 1);
  }
  #site-header-gjs a:hover::after,
  #site-header-gjs a.nav-active::after {
    width: 100%;
  }
  #site-header-gjs a:hover { opacity: 0.85; }
  #site-header-gjs a.nav-active { font-weight: 700; opacity: 1; }
`;

const SiteHeader = ({ editHref, editLabel }) => {
  const [gjsHtml, setGjsHtml] = useState('');
  const [gjsCss,  setGjsCss]  = useState('');
  const headerRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    axios.get('/api/pages/header-content')
      .then(({ data }) => { setGjsHtml(data.gjsHtml || ''); setGjsCss(data.gjsCss || ''); })
      .catch(() => {});
  }, []);

  // Intercept <a> clicks inside GrapesJS header — use React Router instead of full reload
  useInterceptLinks(headerRef, navigate, [gjsHtml, navigate]);

  // Inject GrapesJS page-builder CSS + nav hover/active animation CSS
  useInjectCSS(gjsCss, 'gjs-header-styles');
  useInjectCSS(NAV_STYLES, 'gjs-header-nav-effects');

  // Highlight active nav link whenever route changes
  useEffect(() => {
    const el = headerRef.current;
    if (!el || !gjsHtml) return;
    el.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('nav-active', !!href && href === location.pathname);
    });
  }, [gjsHtml, location.pathname]);

  return (
    <>
      <AdminBar editHref={editHref} editLabel={editLabel} />
      {gjsHtml
        ? <div id="site-header-gjs" ref={headerRef} style={{ display: 'contents' }}
               dangerouslySetInnerHTML={{ __html: stripBody(gjsHtml) }} />
        : <DefaultHeader />
      }
    </>
  );
};

const DefaultHeader = () => (
  <nav style={{ display:'flex', alignItems:'center', gap:'12px', padding:'0 2rem', height:'56px', background:'#fff', borderBottom:'1px solid rgba(0,0,0,0.07)', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 6px rgba(0,0,0,0.06)', fontFamily:"'Poppins',sans-serif" }}>
    <span style={{ fontWeight:'800', fontSize:'0.95rem', color:'#4f46e5' }}>NewaCore</span>
  </nav>
);

export default SiteHeader;
