import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const stripBodyWrapper = (html) => {
  if (!html) return '';
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
};

const SiteFooter = () => {
  const [gjsHtml, setGjsHtml] = useState('');
  const [gjsCss,  setGjsCss]  = useState('');
  const footerRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    axios.get('/api/pages/footer-content')
      .then(({ data }) => { setGjsHtml(data.gjsHtml || ''); setGjsCss(data.gjsCss || ''); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!gjsCss) return;
    let tag = document.getElementById('gjs-footer-styles');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'gjs-footer-styles';
      document.head.appendChild(tag);
    }
    tag.innerHTML = gjsCss;
    return () => { document.getElementById('gjs-footer-styles')?.remove(); };
  }, [gjsCss]);

  // Intercept <a> clicks — use React Router instead of full reload
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const handler = (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto')) return;
      e.preventDefault();
      navigate(href);
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [gjsHtml, navigate]);

  if (!gjsHtml) return null;
  return (
    <div ref={footerRef} style={{ display: 'contents' }}
         dangerouslySetInnerHTML={{ __html: stripBodyWrapper(gjsHtml) }} />
  );
};

export default SiteFooter;
