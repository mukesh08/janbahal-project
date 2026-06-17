/*
 * Small uppercase pill used to label a post's category. `style` is merged last so
 * a caller can tweak colors (e.g. the translucent variant over a hero image).
 */
const CategoryBadge = ({ children, style }) => (
  <span style={{
    fontSize: '0.68rem', fontWeight: 700, color: '#4f46e5',
    background: '#eef2ff', padding: '2px 8px', borderRadius: '20px',
    textTransform: 'uppercase', ...style,
  }}>
    {children}
  </span>
);

export default CategoryBadge;
