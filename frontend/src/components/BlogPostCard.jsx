import { Link } from 'react-router-dom';
import CategoryBadge from './ui/CategoryBadge';

/*
 * Blog post preview card for the blog grid. `featured` renders the larger,
 * full-width variant (used for the first post on the unfiltered list).
 */
const BlogPostCard = ({ post, featured = false }) => (
  <Link to={`/blog/${post.slug}`} style={{ ...s.card, ...(featured ? s.cardFeatured : {}) }}>
    {post.featuredImage && (
      <img src={post.featuredImage} alt={post.title} style={{ ...s.cardImg, ...(featured ? s.cardImgFeatured : {}) }} />
    )}
    <div style={s.cardBody}>
      <div style={s.cardMeta}>
        <CategoryBadge>{post.category}</CategoryBadge>
        <span style={s.cardDate}>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>
      <h2 style={{ ...s.cardTitle, ...(featured ? s.cardTitleFeatured : {}) }}>{post.title}</h2>
      {post.excerpt && <p style={s.cardExcerpt}>{post.excerpt}</p>}
      <div style={s.cardFooter}>
        <span style={s.cardAuthor}>By {post.author?.name || 'Admin'}</span>
        <span style={s.readMore}>Read more →</span>
      </div>
    </div>
  </Link>
);

const s = {
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
  cardDate: { fontSize: '0.72rem', color: '#94a3b8' },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.3 },
  cardTitleFeatured: { fontSize: '1.6rem' },
  cardExcerpt: { fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, margin: 0, flex: 1 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #f8fafc' },
  cardAuthor: { fontSize: '0.75rem', color: '#94a3b8' },
  readMore: { fontSize: '0.78rem', fontWeight: '600', color: '#4f46e5' },
};

export default BlogPostCard;
