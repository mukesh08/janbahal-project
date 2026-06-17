import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PublicPageShell from '../components/PublicPageShell';
import RenderedPage from '../components/RenderedPage';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import { useInjectCSS } from '../hooks/useInjectCSS';

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

  useInjectCSS(page?.gjsCss, 'gjs-page-styles');

  if (loading) {
    return (
      <PublicPageShell showFooter={false}>
        <LoadingState text="Loading..." style={styles.center} />
      </PublicPageShell>
    );
  }

  if (error) {
    return (
      <PublicPageShell showFooter={false} editHref="/admin/pages" editLabel="Edit Pages">
        <EmptyState style={styles.center}>
          <h2>404</h2>
          <p>{error}</p>
          <a href="/" style={styles.homeLink}>← Go Home</a>
        </EmptyState>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell className="public-site" editHref={`/admin/editor/${page._id}`} editLabel="Edit Page">
      <RenderedPage html={page.gjsHtml} style={{ flex: 1 }} />
    </PublicPageShell>
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
