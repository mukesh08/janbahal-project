/*
 * Standard admin page header: optional icon tile + title + subtitle on the left,
 * and an optional `actions` slot (buttons, status text) on the right.
 *
 * Props:
 *   icon     — an icon element; when present it's wrapped in a tinted tile
 *   title    — page title (required)
 *   subtitle — supporting line under the title
 *   actions  — JSX rendered on the right (the page supplies its own buttons)
 *   style    — merged onto the header container
 */
const PageHeader = ({ icon, title, subtitle, actions, style }) => (
  <div style={{ ...s.header, ...style }}>
    <div style={s.left}>
      {icon && <div style={s.iconTile}>{icon}</div>}
      <div>
        <h1 style={s.title}>{title}</h1>
        {subtitle && <p style={s.sub}>{subtitle}</p>}
      </div>
    </div>
    {actions && <div style={s.actions}>{actions}</div>}
  </div>
);

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '12px' },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  iconTile: { width: '44px', height: '44px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px' },
  sub: { color: '#64748b', fontSize: '0.88rem', margin: 0 },
  actions: { display: 'flex', alignItems: 'center', gap: '12px' },
};

export default PageHeader;
