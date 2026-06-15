import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCat = searchParams.get('category') || '';

  const [posts,      setPosts]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(true);
  const LIMIT = 9;

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: LIMIT };
    if (currentCat) params.category = currentCat;
    axios.get('/api/posts', { params })
      .then(({ data }) => { setPosts(data.posts); setTotal(data.total); setPages(data.pages); })
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
    <div style={s.shell}>

      <SiteHeader editHref="/admin/posts" editLabel="Manage Posts" />

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
          <div style={s.center}>
            <div style={s.spinner} />
            <p style={s.loadingTxt}>Loading posts…</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={s.center}>
            <span style={{ fontSize: '3rem' }}>📭</span>
            <p style={{ color: '#64748b', marginTop: '1rem' }}>
              {currentCat ? `No posts in "${currentCat}" yet.` : 'No published posts yet.'}
            </p>
          </div>
        ) : (
          <>
            <div style={s.grid}>
              {posts.map((post, i) => (
                <Link key={post._id} to={`/blog/${post.slug}`} style={{ ...s.card, ...(i === 0 && !currentCat ? s.cardFeatured : {}) }}>
                  {post.featuredImage && (
                    <img src={post.featuredImage} alt={post.title} style={{ ...s.cardImg, ...(i === 0 && !currentCat ? s.cardImgFeatured : {}) }} />
                  )}
                  <div style={s.cardBody}>
                    <div style={s.cardMeta}>
                      <span style={s.cardCat}>{post.category}</span>
                      <span style={s.cardDate}>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { day:'numeric', month:'short', year:'numeric' })}</span>
                    </div>
                    <h2 style={{ ...s.cardTitle, ...(i === 0 && !currentCat ? s.cardTitleFeatured : {}) }}>{post.title}</h2>
                    {post.excerpt && <p style={s.cardExcerpt}>{post.excerpt}</p>}
                    <div style={s.cardFooter}>
                      <span style={s.cardAuthor}>By {post.author?.name || 'Admin'}</span>
                      <span style={s.readMore}>Read more →</span>
                    </div>
                  </div>
                </Link>
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

      <SiteFooter />
    </div>
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

  center: { textAlign: 'center', padding: '5rem 0', color: '#94a3b8' },
  spinner: {
    width: '42px', height: '42px', borderRadius: '50%',
    border: '3.5px solid rgba(79,70,229,0.15)',
    borderTopColor: '#4f46e5',
    animation: 'loaderSpin 0.65s linear infinite',
    marginBottom: '1rem',
  },
  loadingTxt: { color: '#94a3b8' },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.25rem',
  },
  card: {
    background: '#fff', borderRadius: '14px', overflow: 'hidden',
    border: '1px solid #f1f5f9', textDecoration: 'none', color: 'inherit',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s, transform 0.2s',
  },
  cardFeatured: { gridColumn: '1 / -1' },
  cardImg: { width: '100%', height: '200px', objectFit: 'cover', display: 'block' },
  cardImgFeatured: { height: '320px' },
  cardBody: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 },
  cardMeta: { display: 'flex', gap: '10px', alignItems: 'center' },
  cardCat:  {
    fontSize: '0.68rem', fontWeight: '700', color: '#4f46e5',
    background: '#eef2ff', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase',
  },
  cardDate: { fontSize: '0.72rem', color: '#94a3b8' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.3 },
  cardTitleFeatured: { fontSize: '1.6rem' },
  cardExcerpt: { fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, margin: 0, flex: 1 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f8fafc' },
  cardAuthor: { fontSize: '0.75rem', color: '#94a3b8' },
  readMore:   { fontSize: '0.78rem', fontWeight: '600', color: '#4f46e5' },

  pagination: { display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' },
  pageBtn: {
    padding: '7px 14px', background: '#fff', color: '#64748b',
    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: '500', fontFamily: "'Poppins', sans-serif",
  },
  pageBtnActive: { background: '#4f46e5', color: '#fff', border: '1px solid #4f46e5' },

  footer: { textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.82rem', borderTop: '1px solid #f1f5f9', marginTop: 'auto' },
};

export default BlogList;
