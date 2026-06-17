/*
 * Inline error / success / info banner. `type` selects the color scheme; `style`
 * is merged last for spacing tweaks (e.g. an extra marginBottom inside a form).
 */
const VARIANTS = {
  error:   { color: '#dc2626', background: '#fef2f2', border: '#fecaca' },
  success: { color: '#16a34a', background: '#f0fdf4', border: '#bbf7d0' },
  info:    { color: '#4f46e5', background: '#eef2ff', border: '#c7d2fe' },
};

const Alert = ({ type = 'error', children, style }) => {
  const v = VARIANTS[type] || VARIANTS.error;
  return (
    <p style={{
      color: v.color, background: v.background, border: `1px solid ${v.border}`,
      padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', margin: 0, ...style,
    }}>
      {children}
    </p>
  );
};

export default Alert;
