/*
 * Dashboard statistic card: colored icon tile + value + label + optional subtext.
 * Pass `onClick` to make it navigable. `color`/`bg` tint the icon tile and value.
 */
const StatCard = ({ icon, value, label, sub, color = '#4f46e5', bg = '#eef2ff', onClick, style }) => (
  <div onClick={onClick} style={{ ...s.card, cursor: onClick ? 'pointer' : 'default', ...style }}>
    <div style={{ ...s.icon, background: bg, color }}>{icon}</div>
    <div style={s.body}>
      <div style={{ ...s.value, color }}>{value}</div>
      <div style={s.label}>{label}</div>
      {sub != null && sub !== '' && <div style={s.sub}>{sub}</div>}
    </div>
  </div>
);

const s = {
  card: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s' },
  icon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body: { minWidth: 0 },
  value: { fontSize: '1.8rem', fontWeight: '800', lineHeight: 1, marginBottom: '2px' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '2px' },
  sub: { fontSize: '0.7rem', color: '#94a3b8' },
};

export default StatCard;
