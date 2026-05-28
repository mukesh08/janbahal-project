import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SiteHeader from '../components/SiteHeader';

const BlogPost = () => {
  const { slug }    = useParams();
  const navigate    = useNavigate();
  const [post,      setPost]    = useState(null);
  const [loading,   setLoading] = useState(true);
  const [notFound,  setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/posts/slug/${slug}`)
      .then(({ data }) => setPost(data))
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
        else navigate('/blog');
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return (
    <div style={s.shell}>
      <SiteHeader />
      <div style={s.center}><p style={{ color: '#94a3b8' }}>Loading…</p></div>
    </div>
  );

  if (notFound) return (
    <div style={s.shell}>
      <SiteHeader editHref="/admin/posts" editLabel="Manage Posts" />
      <div style={s.center}>
        <span style={{ fontSize: '3rem' }}>📭</span>
        <h2 style={{ color: '#0f172a', marginTop: '1rem' }}>Post not found</h2>
        <Link to="/blog" style={s.backLink}>← Back to Blog</Link>
      </div>
    </div>
  );

  return (
    <div style={s.shell}>
      <SiteHeader editHref={`/admin/posts/${post._id}/edit`} editLabel="Edit Post" />

      {/* Hero with featured image or gradient */}
      {post.featuredImage ? (
        <div style={{ ...s.hero, backgroundImage: `url(${post.featuredImage})` }}>
          <div style={s.heroOverlay} />
          <div style={s.heroContent}>
            <HeroBadge post={post} />
          </div>
        </div>
      ) : (
        <div style={s.heroPlain}>
          <HeroBadge post={post} />
        </div>
      )}

      {/* Article */}
      <div style={s.wrapper}>
        <article style={s.article}>
          <h1 style={s.title}>{post.title}</h1>
          {post.excerpt && <p style={s.excerpt}>{post.excerpt}</p>}

          <div style={s.meta}>
            <span style={s.author}>By {post.author?.name || 'Admin'}</span>
            <span style={s.dot}>·</span>
            <span style={s.date}>
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
            <span style={s.dot}>·</span>
            <span style={s.catPill}>{post.category}</span>
          </div>

          {post.tags?.length > 0 && (
            <div style={s.tags}>
              {post.tags.map(tag => (
                <span key={tag} style={s.tag}>{tag}</span>
              ))}
            </div>
          )}

          <hr style={s.divider} />

          <div
            className="blog-content"
            style={s.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <div style={s.footer}>
          <Link to="/blog" style={s.backLink}>← Back to Blog</Link>
        </div>
      </div>

      <footer style={s.pageFooter}>
        <p>© {new Date().getFullYear()} NewaCore. <Link to="/" style={{ color: '#4f46e5' }}>Back to home</Link></p>
      </footer>
    </div>
  );
};

const HeroBadge = ({ post }) => (
  <div style={s.heroBadge}>
    <span style={s.heroCategory}>{post.category}</span>
  </div>
);

const s = {
  shell: { minHeight: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column' },

  hero: {
    position: 'relative', height: '380px',
    backgroundSize: 'cover', backgroundPosition: 'center',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
  },
  heroContent: { position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '780px', padding: '0 1.5rem' },
  heroPlain: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    padding: '3rem 2rem', textAlign: 'center',
  },
  heroBadge: {},
  heroCategory: {
    fontSize: '0.7rem', fontWeight: '700', color: '#fff',
    background: 'rgba(255,255,255,0.2)', padding: '4px 12px',
    borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.8px',
    backdropFilter: 'blur(4px)',
  },

  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem' },

  wrapper: { flex: 1, maxWidth: '780px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' },

  article: { background: '#fff', borderRadius: '16px', padding: '2.5rem', border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' },

  title:   { fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem', lineHeight: 1.25, letterSpacing: '-0.02em' },
  excerpt: { fontSize: '1.05rem', color: '#475569', lineHeight: 1.7, margin: '0 0 1.25rem', fontStyle: 'italic' },

  meta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '0.75rem' },
  author: { fontSize: '0.82rem', fontWeight: '600', color: '#334155' },
  dot:    { color: '#cbd5e1', fontSize: '0.8rem' },
  date:   { fontSize: '0.8rem', color: '#94a3b8' },
  catPill: { fontSize: '0.68rem', fontWeight: '700', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase' },

  tags: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.5rem' },
  tag:  { fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '20px' },

  divider: { border: 'none', borderTop: '1px solid #f1f5f9', margin: '1.5rem 0' },

  content: {
    fontSize: '1rem', color: '#1e293b', lineHeight: 1.85,
    /* prose styles for rendered HTML */
  },

  footer: { marginTop: '1rem' },
  backLink: { fontSize: '0.85rem', color: '#4f46e5', fontWeight: '600', textDecoration: 'none' },

  pageFooter: { textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.82rem', borderTop: '1px solid #f1f5f9', marginTop: 'auto' },
};

export default BlogPost;
