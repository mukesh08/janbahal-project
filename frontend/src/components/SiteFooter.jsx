import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { stripBody } from '../lib/stripBody';
import { useInjectCSS } from '../hooks/useInjectCSS';
import { useInterceptLinks } from '../hooks/useInterceptLinks';

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

  useInjectCSS(gjsCss, 'gjs-footer-styles');

  // Intercept <a> clicks — use React Router instead of full reload
  useInterceptLinks(footerRef, navigate, [gjsHtml, navigate]);

  if (!gjsHtml) return null;
  return (
    <div ref={footerRef} style={{ display: 'contents' }}
         dangerouslySetInnerHTML={{ __html: stripBody(gjsHtml) }} />
  );
};

export default SiteFooter;
