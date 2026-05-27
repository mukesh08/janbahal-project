import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PublicViewer = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const { data } = await axios.get(`/api/pages/slug/${slug}`);
        setPage(data);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Page not found.' : 'Failed to load page.');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  useEffect(() => {
    if (page?.gjsCss) {
      const styleTag = document.createElement('style');
      styleTag.id = 'gjs-page-styles';
      styleTag.innerHTML = page.gjsCss;
      document.head.appendChild(styleTag);
      return () => {
        const existing = document.getElementById('gjs-page-styles');
        if (existing) document.head.removeChild(existing);
      };
    }
  }, [page]);

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <h2>404</h2>
        <p>{error}</p>
        <a href="/" style={styles.homeLink}>← Go Home</a>
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: page.gjsHtml }}
      style={{ minHeight: '100vh' }}
    />
  );
};

const styles = {
  center: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#555',
  },
  homeLink: { color: '#4f46e5', textDecoration: 'none', marginTop: '1rem' },
};

export default PublicViewer;
