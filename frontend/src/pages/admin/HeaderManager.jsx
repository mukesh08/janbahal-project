import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { Monitor, Pencil, RefreshCw } from 'lucide-react';

const HeaderManager = () => {
  const navigate = useNavigate();
  const [page,    setPage]    = useState(null);
  const [gjsHtml, setGjsHtml] = useState('');
  const [gjsCss,  setGjsCss]  = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/pages/ensure-header')
      .then(({ data }) => {
        setPage(data);
        setGjsHtml(data.gjsHtml || '');
        setGjsCss(data.gjsCss   || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Inject header CSS into this page so preview looks correct
  useEffect(() => {
    if (!gjsCss) return;
    let tag = document.getElementById('header-mgr-styles');
    if (!tag) { tag = document.createElement('style'); tag.id = 'header-mgr-styles'; document.head.appendChild(tag); }
    tag.innerHTML = gjsCss;
    return () => document.getElementById('header-mgr-styles')?.remove();
  }, [gjsCss]);

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Page header */}
        <div style={s.pageHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={s.icon}><Monitor size={20} strokeWidth={1.8} color="#4f46e5" /></div>
            <div>
              <h1 style={s.title}>Header</h1>
              <p style={s.sub}>Design your site-wide navigation header</p>
            </div>
          </div>
          <button
            style={s.editBtn}
            onClick={() => page && navigate(`/admin/editor/${page._id}`)}
            disabled={!page}
          >
            <Pencil size={14} strokeWidth={2} /> Open Visual Editor
          </button>
        </div>

        {/* Preview card */}
        <div style={s.previewCard}>
          <div style={s.previewLabel}>
            <span>Live Preview</span>
            <button style={s.refreshBtn} onClick={() => window.location.reload()} title="Refresh">
              <RefreshCw size={12} strokeWidth={2} />
            </button>
          </div>

          <div style={s.previewFrame}>
            {loading ? (
              <div style={s.placeholder}>Loading preview…</div>
            ) : gjsHtml ? (
              <div dangerouslySetInnerHTML={{ __html: gjsHtml }} style={{ pointerEvents: 'none' }} />
            ) : (
              <div style={s.placeholder}>No header content yet — click Open Visual Editor to get started.</div>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={s.info}>
          <div style={s.infoItem}>
            <span style={s.infoLabel}>Status</span>
            <span style={{ ...s.infoBadge, background: '#dcfce7', color: '#16a34a' }}>Always Live</span>
          </div>
          {page?.updatedAt && (
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Last updated</span>
              <span style={s.infoValue}>{new Date(page.updatedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif", maxWidth: '1100px' },

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' },
  icon: { width: '44px', height: '44px', background: '#eef2ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px' },
  sub:   { color: '#64748b', fontSize: '0.85rem', margin: 0 },

  editBtn: { display: 'flex', alignItems: 'center', gap: '7px', padding: '0.65rem 1.4rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },

  previewCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', marginBottom: '1.25rem' },
  previewLabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  refreshBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '2px' },
  previewFrame: { background: '#f1f5f9', minHeight: '80px', overflow: 'hidden' },
  placeholder: { padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' },

  info: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  infoLabel: { fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' },
  infoBadge: { fontSize: '0.7rem', fontWeight: '700', padding: '3px 9px', borderRadius: '20px' },
  infoValue: { fontSize: '0.78rem', color: '#475569' },
};

export default HeaderManager;
