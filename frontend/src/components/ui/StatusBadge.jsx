/*
 * Published / Draft status pill with a colored dot. Pass `published` as a boolean
 * (e.g. `page.published` or `post.status === 'published'`). `style` is merged last.
 */
const StatusBadge = ({ published, style }) => {
  const c = published ? { bg: '#dcfce7', color: '#16a34a' } : { bg: '#fef3c7', color: '#d97706' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
      fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
      background: c.bg, color: c.color, ...style,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, display: 'inline-block', marginRight: 5 }} />
      {published ? 'Published' : 'Draft'}
    </span>
  );
};

export default StatusBadge;
