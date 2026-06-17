/*
 * Underline-style filter tab group with optional count badges.
 *
 * Props:
 *   tabs     — array of { key, label, count? }
 *   active   — currently selected key
 *   onChange — called with the chosen key
 *   style    — merged onto the tab container
 */
const FilterTabs = ({ tabs = [], active, onChange, style }) => (
  <div style={{ ...s.tabs, ...style }}>
    {tabs.map(t => (
      <button key={t.key} style={{ ...s.tab, ...(active === t.key ? s.tabActive : {}) }} onClick={() => onChange(t.key)}>
        {t.label}
        {t.count != null && (
          <span style={{ ...s.badge, ...(active === t.key ? s.badgeActive : {}) }}>{t.count}</span>
        )}
      </button>
    ))}
  </div>
);

const s = {
  tabs: { display: 'flex', gap: '4px', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' },
  tab: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', color: '#64748b', fontFamily: "'Poppins', sans-serif", marginBottom: '-1px', transition: 'all 0.15s' },
  tabActive: { color: '#4f46e5', borderBottomColor: '#4f46e5', fontWeight: '700' },
  badge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', height: '20px', padding: '0 6px', background: '#f1f5f9', color: '#64748b', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600' },
  badgeActive: { background: '#eef2ff', color: '#4f46e5' },
};

export default FilterTabs;
