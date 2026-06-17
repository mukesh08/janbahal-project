/*
 * Centered empty / not-found placeholder. Renders an optional emoji/icon and
 * whatever message + action the caller passes as children. `style` overrides the
 * container so each page keeps its own layout (simple padded block vs. full
 * flex-column centering).
 */
const EmptyState = ({ icon, style, children }) => (
  <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8', ...style }}>
    {icon && <span style={{ fontSize: '3rem' }}>{icon}</span>}
    {children}
  </div>
);

export default EmptyState;
