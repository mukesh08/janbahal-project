import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import PublicPageShell from '../components/PublicPageShell';
import BlogPostCard from '../components/BlogPostCard';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCat = searchParams.get('category') || '';

  const [posts,      setPosts]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(true);
  const LIMIT = 9;

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (currentCat) params.category = currentCat;
    axios.get('/api/posts', { params })
      .then(({ data }) => { setPosts(data.posts); setPages(data.pages); })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [page, currentCat]);

  useEffect(() => {
    axios.get('/api/posts/categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  const pickCategory = (cat) => {
    setPage(1);
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  return (
    <PublicPageShell style={s.shell} editHref="/admin/posts" editLabel="Manage Posts">

      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Blog</h1>
        <p style={s.heroSub}>Stories, tutorials and updates</p>
      </div>

      <div style={s.body}>

        {/* Category filter */}
        <div style={s.filters}>
          <button
            style={{ ...s.filterBtn, ...(currentCat === '' ? s.filterActive : {}) }}
            onClick={() => pickCategory('')}
          >All</button>
          {categories.map(c => (
            <button
              key={c._id}
              style={{ ...s.filterBtn, ...(currentCat === c._id ? s.filterActive : {}) }}
              onClick={() => pickCategory(c._id)}
            >
              {c._id} <span style={s.filterCount}>{c.count}</span>
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {loading ? (
          <LoadingState text="Loading posts…" />
        ) : posts.length === 0 ? (
          <EmptyState icon="📭">
            <p style={{ color: '#64748b', marginTop: '1rem' }}>
              {currentCat ? `No posts in "${currentCat}" yet.` : 'No published posts yet.'}
            </p>
          </EmptyState>
        ) : (
          <>
            <div style={s.grid}>
              {posts.map((post, i) => (
                <BlogPostCard key={post._id} post={post} featured={i === 0 && !currentCat} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={s.pagination}>
                <button style={{ ...s.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
                  disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button key={n} style={{ ...s.pageBtn, ...(n === page ? s.pageBtnActive : {}) }}
                    onClick={() => setPage(n)}>{n}</button>
                ))}
                <button style={{ ...s.pageBtn, opacity: page === pages ? 0.4 : 1 }}
                  disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

    </PublicPageShell>
  );
};

const s = {
  shell: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column' },

  hero: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#fff', textAlign: 'center', padding: '4rem 2rem 3.5rem',
  },
  heroTitle: { fontSize: '2.8rem', fontWeight: '800', margin: '0 0 0.5rem', letterSpacing: '-0.02em' },
  heroSub:   { fontSize: '1.1rem', opacity: 0.85, margin: 0 },

  body: { flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '2rem 1.5rem' },

  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem' },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', background: '#fff', color: '#64748b',
    border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: '500', fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.15s',
  },
  filterActive: { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },
  filterCount: {
    background: 'rgba(255,255,255,0.25)', color: 'inherit',
    borderRadius: '20px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: '700',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.25rem',
  },

  pagination: { display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' },
  pageBtn: {
    padding: '7px 14px', background: '#fff', color: '#64748b',
    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: '500', fontFamily: "'Poppins', sans-serif",
  },
  pageBtnActive: { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },

};

export default BlogList;
