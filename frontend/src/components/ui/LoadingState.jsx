/*
 * Centered loading indicator: an animated spinner (uses the global `loaderSpin`
 * keyframes from index.css) plus a text label. `style` overrides the container,
 * so callers can drop it into a card body or a full-screen wrapper.
 */
const spinner = {
  width: '42px', height: '42px', borderRadius: '50%',
  border: '3.5px solid rgba(79,70,229,0.15)',
  borderTopColor: '#4f46e5',
  animation: 'loaderSpin 0.65s linear infinite',
  marginBottom: '1rem',
};

const LoadingState = ({ text = 'Loading…', style }) => (
  <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8', ...style }}>
    <div style={spinner} />
    <p style={{ color: '#94a3b8', margin: 0 }}>{text}</p>
  </div>
);

export default LoadingState;
