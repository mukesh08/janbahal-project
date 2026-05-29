import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminBar from './AdminBar';

const SiteHeader = ({ editHref, editLabel }) => {
  const [gjsHtml, setGjsHtml] = useState('');
  const [gjsCss,  setGjsCss]  = useState('');

  useEffect(() => {
    axios.get('/api/pages/header-content')
      .then(({ data }) => { setGjsHtml(data.gjsHtml || ''); setGjsCss(data.gjsCss || ''); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!gjsCss) return;
    let tag = document.getElementById('gjs-header-styles');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'gjs-header-styles';
      document.head.appendChild(tag);
    }
    tag.innerHTML = gjsCss;
    return () => { document.getElementById('gjs-header-styles')?.remove(); };
  }, [gjsCss]);

  return (
    <>
      <AdminBar editHref={editHref} editLabel={editLabel} />
      {gjsHtml
        ? <div dangerouslySetInnerHTML={{ __html: gjsHtml }} />
        : <DefaultHeader />
      }
    </>
  );
};

/* Shown only while header-content is loading or has no content yet */
const DefaultHeader = () => (
  <nav style={{ display:'flex', alignItems:'center', gap:'12px', padding:'0 2rem', height:'56px', background:'#fff', borderBottom:'1px solid rgba(0,0,0,0.07)', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 6px rgba(0,0,0,0.06)', fontFamily:"'Poppins',sans-serif" }}>
    <span style={{ fontWeight:'800', fontSize:'0.95rem', color:'#4f46e5' }}>NewaCore</span>
  </nav>
);

export default SiteHeader;
