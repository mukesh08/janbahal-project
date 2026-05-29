import { useEffect, useState } from 'react';
import axios from 'axios';

const stripBodyWrapper = (html) => {
  if (!html) return '';
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1] : html;
};

const SiteFooter = () => {
  const [gjsHtml, setGjsHtml] = useState('');
  const [gjsCss,  setGjsCss]  = useState('');

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

  if (!gjsHtml) return null;
  return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: stripBodyWrapper(gjsHtml) }} />;
};

export default SiteFooter;
