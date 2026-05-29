import { useEffect, useState } from 'react';
import axios from 'axios';

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
  return <div dangerouslySetInnerHTML={{ __html: gjsHtml }} />;
};

export default SiteFooter;
