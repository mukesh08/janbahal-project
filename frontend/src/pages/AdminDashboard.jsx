import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X, Home, FileText, Pencil, ExternalLink, MoreHorizontal, Copy, Trash2, Plus } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const AdminDashboard = () => {
  const navigate  = useNavigate();
  const [pages,      setPages]      = useState([]);
  const [homePageId, setHomePageId] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all');   // all | published | draft
  const [showModal,  setShowModal]  = useState(false);
  const [newTitle,   setNewTitle]   = useState('');
  const [creating,   setCreating]   = useState(false);
  const [actionRow,  setActionRow]  = useState(null); // page id with open action menu

  const fetchPages = async () => {
    try {
      // Ensure home page exists (seeds it if new) and set it as the site home
      const { data: home } = await axios.get('/api/pages/ensure-home');
      await axios.put('/api/settings', { homePage: home._id });
      setHomePageId(home._id);
    } catch (err) {
      console.error(err);
    }
    try {
      const { data } = await axios.get('/api/pages');
      setPages(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPages(); }, []);

  /* Close action menu on outside click */
  useEffect(() => {
    const close = () => setActionRow(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const totalPublished = pages.filter(p => p.published).length;
  const totalDraft     = pages.length - totalPublished;

  const filtered = useMemo(() => {
    let list = pages;
    if (filter === 'published') list = list.filter(p => p.published);
    if (filter === 'draft')     list = list.filter(p => !p.published);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    return list;
  }, [pages, filter, search]);

  const createPage = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const { data } = await axios.post('/api/pages', { title: newTitle });
      setNewTitle(''); setShowModal(false);
      navigate(`/admin/editor/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create page');
    } finally { setCreating(false); }
  };

  const togglePublish = async (page) => {
    try {
      await axios.put(`/api/pages/${page._id}`, { published: !page.published });
      setPages(prev => prev.map(p => p._id === page._id ? { ...p, published: !p.published } : p));
    } catch { alert('Failed to update status'); }
  };

  const duplicatePage = async (page) => {
    try {
      const { data } = await axios.post(`/api/pages/${page._id}/duplicate`);
      setPages(prev => [data, ...prev]);
    } catch { alert('Failed to duplicate page'); }
  };

  const deletePage = async (id) => {
    if (!confirm('Delete this page permanently?')) return;
    try {
      await axios.delete(`/api/pages/${id}`);
      setPages(prev => prev.filter(p => p._id !== id));
    } catch { alert('Failed to delete page'); }
  };

  const FILTERS = [
    { key: 'all',       label: 'All',       count: pages.length },
    { key: 'published', label: 'Published',  count: totalPublished },
    { key: 'draft',     label: 'Drafts',     count: totalDraft },
  ];

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* ── Header ── */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.title}>Pages</h1>
            <p style={s.sub}>Create and manage your website pages</p>
          </div>
          <button style={s.newBtn} onClick={() => { setNewTitle(''); setShowModal(true); }}>
            <Plus size={14} strokeWidth={2.5} /> New Page
          </button>
        </div>

        {/* ── Stats bar ── */}
        <div style={s.statsBar}>
          <div style={s.statItem}>
            <span style={s.statNum}>{pages.length}</span>
            <span style={s.statLbl}>Total Pages</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.statItem}>
            <span style={{ ...s.statNum, color: '#16a34a' }}>{totalPublished}</span>
            <span style={s.statLbl}>Published</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.statItem}>
            <span style={{ ...s.statNum, color: '#d97706' }}>{totalDraft}</span>
            <span style={s.statLbl}>Drafts</span>
          </div>
        </div>

        {/* ── Toolbar: filter tabs + search ── */}
        <div style={s.toolbar}>
          <div style={s.tabs}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                style={{ ...s.tab, ...(filter === f.key ? s.tabActive : {}) }}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span style={{ ...s.tabCount, ...(filter === f.key ? s.tabCountActive : {}) }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}><Search size={13} strokeWidth={2} /></span>
            <input
              style={s.searchInput}
              placeholder="Search pages…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button style={s.clearBtn} onClick={() => setSearch('')}><X size={12} strokeWidth={2.5} /></button>
            )}
          </div>
        </div>

        {/* ── Table ── */}
        <div style={s.tableWrap}>

          {/* Table head */}
          <div style={s.tableHead}>
            <div style={{ ...s.thCell, flex: 3 }}>Page</div>
            <div style={{ ...s.thCell, flex: 1.2 }}>Status</div>
            <div style={{ ...s.thCell, flex: 1.2 }}>Created</div>
            <div style={{ ...s.thCell, flex: 1.5, textAlign: 'right' }}>Actions</div>
          </div>

          {/* Rows */}
          {loading ? (
            <div style={s.placeholder}>Loading pages…</div>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>{search ? '🔍' : '📄'}</div>
              <div style={s.emptyTitle}>{search ? 'No pages match your search' : 'No pages yet'}</div>
              <div style={s.emptySub}>
                {search ? 'Try a different keyword' : 'Click "+ New Page" to create your first page'}
              </div>
              {!search && (
                <button style={s.emptyBtn} onClick={() => setShowModal(true)}>+ New Page</button>
              )}
            </div>
          ) : (
            filtered.map((page, i) => (
              <div
                key={page._id}
                style={{ ...s.tableRow, ...(i % 2 === 0 ? {} : s.tableRowAlt) }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8faff'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafbfc'}
              >
                {/* Page info */}
                <div style={{ ...s.tdCell, flex: 3, gap: '12px', cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/editor/${page._id}`)}>
                  <div style={{ ...s.pageThumb, background: page._id === homePageId ? '#eef2ff' : page.published ? '#f0fdf4' : '#fef3c7' }}>
                    {page._id === homePageId
                      ? <Home size={16} strokeWidth={1.8} color="#4f46e5" />
                      : <FileText size={16} strokeWidth={1.8} color={page.published ? '#16a34a' : '#d97706'} />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={s.pageTitle}>{page.title}</span>
                      {page._id === homePageId && (
                        <span style={s.homeBadge}>Home</span>
                      )}
                    </div>
                    <div style={s.pageSlug}>{page._id === homePageId ? '/' : `/${page.slug}`}</div>
                  </div>
                </div>

                {/* Status toggle */}
                <div style={{ ...s.tdCell, flex: 1.2 }}>
                  <button
                    style={{ ...s.statusBtn, ...(page.published ? s.statusPublished : s.statusDraft) }}
                    onClick={() => togglePublish(page)}
                    title={page.published ? 'Click to unpublish' : 'Click to publish'}
                  >
                    <span style={s.statusDot(page.published)} />
                    {page.published ? 'Published' : 'Draft'}
                  </button>
                </div>

                {/* Date */}
                <div style={{ ...s.tdCell, flex: 1.2 }}>
                  <span style={s.dateText}>{fmt(page.createdAt)}</span>
                </div>

                {/* Actions */}
                <div style={{ ...s.tdCell, flex: 1.5, justifyContent: 'flex-end', gap: '6px' }}>
                  <button style={s.actionEdit} onClick={() => navigate(`/admin/editor/${page._id}`)}>
                    <Pencil size={12} strokeWidth={2} /> Edit
                  </button>
                  {page.published && (
                    <button style={s.actionView}
                      onClick={() => window.open(page._id === homePageId ? '/' : `/page/${page.slug}`, '_blank')}>
                      <ExternalLink size={12} strokeWidth={2} />
                    </button>
                  )}
                  <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                    <button style={s.actionMore}
                      onClick={() => setActionRow(actionRow === page._id ? null : page._id)}>
                      <MoreHorizontal size={15} strokeWidth={2} />
                    </button>
                    {actionRow === page._id && (
                      <div style={s.dropdown}>
                        <button style={s.dropItem}
                          onClick={() => { duplicatePage(page); setActionRow(null); }}>
                          <Copy size={13} strokeWidth={2} /> Duplicate
                        </button>
                        <div style={s.dropDivider} />
                        <button style={{ ...s.dropItem, color: '#ef4444' }}
                          onClick={() => { deletePage(page._id); setActionRow(null); }}>
                          <Trash2 size={13} strokeWidth={2} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Result count ── */}
        {!loading && filtered.length > 0 && (
          <div style={s.resultCount}>
            Showing {filtered.length} of {pages.length} page{pages.length !== 1 ? 's' : ''}
          </div>
        )}

      </div>

      {/* ── New Page Modal ── */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>Create New Page</div>
                <div style={s.modalSub}>Give your page a title to get started</div>
              </div>
              <button style={s.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={createPage} style={s.modalBody}>
              <label style={s.modalLabel}>Page Title</label>
              <input
                style={s.modalInput}
                autoFocus
                placeholder="e.g. About Us, Contact, Services…"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                maxLength={100}
              />
              <div style={s.modalHint}>
                A URL slug will be auto-generated from the title
              </div>
              <div style={s.modalFooter}>
                <button type="button" style={s.modalCancel} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={s.modalCreate} disabled={creating || !newTitle.trim()}>
                  {creating ? 'Creating…' : '→ Create & Edit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif", maxWidth: '1200px' },

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.2rem' },
  sub:   { color: '#64748b', fontSize: '0.88rem', margin: 0 },
  newBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.4rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },

  /* Stats bar */
  statsBar: { display: 'flex', alignItems: 'center', gap: '0', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', width: 'fit-content' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1.5rem', gap: '2px' },
  statNum:  { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 },
  statLbl:  { fontSize: '0.7rem', fontWeight: '500', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statDivider: { width: '1px', height: '36px', background: '#f1f5f9' },

  /* Toolbar */
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0', gap: '1rem', flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: '4px' },
  tab: { padding: '0.45rem 0.9rem', background: 'transparent', border: '1px solid transparent', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', color: '#64748b', fontFamily: "'Poppins', sans-serif", display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.12s' },
  tabActive: { background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4f46e5' },
  tabCount: { background: '#f1f5f9', color: '#64748b', borderRadius: '20px', padding: '1px 7px', fontSize: '0.72rem', fontWeight: '700' },
  tabCountActive: { background: '#c7d2fe', color: '#4f46e5' },

  searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '10px', fontSize: '0.85rem', pointerEvents: 'none' },
  searchInput: { padding: '0.5rem 2.2rem 0.5rem 2rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.83rem', color: '#1e293b', background: '#fff', fontFamily: "'Poppins', sans-serif", outline: 'none', width: '220px' },
  clearBtn: { position: 'absolute', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.8rem', padding: '2px 4px' },

  /* Table */
  tableWrap: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginTop: '0.75rem' },
  tableHead: { display: 'flex', alignItems: 'center', padding: '0.75rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' },
  thCell: { fontSize: '0.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', flex: 1 },
  tableRow:    { display: 'flex', alignItems: 'center', padding: '0.85rem 1.25rem', borderBottom: '1px solid #f8fafc', transition: 'background 0.12s', background: '#fff' },
  tableRowAlt: { background: '#fafbfc' },
  tdCell: { display: 'flex', alignItems: 'center', flex: 1 },

  pageThumb: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pageTitle: { fontSize: '0.88rem', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  pageSlug:  { fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' },
  homeBadge: { fontSize: '0.6rem', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', background: '#eef2ff', color: '#4f46e5', whiteSpace: 'nowrap', flexShrink: 0 },

  statusBtn: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '700', fontFamily: "'Poppins', sans-serif", transition: 'opacity 0.15s' },
  statusPublished: { background: '#dcfce7', color: '#16a34a' },
  statusDraft:     { background: '#fef3c7', color: '#92400e' },
  statusDot: (pub) => ({ width: '6px', height: '6px', borderRadius: '50%', background: pub ? '#16a34a' : '#d97706', flexShrink: 0 }),

  dateText: { fontSize: '0.78rem', color: '#64748b' },

  actionEdit: { display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 12px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' },
  actionView: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },
  actionMore: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 10px', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" },

  dropdown: { position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '150px', zIndex: 100, overflow: 'hidden' },
  dropItem: { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '9px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', fontFamily: "'Poppins', sans-serif" },
  dropDivider: { height: '1px', background: '#f1f5f9', margin: '0' },

  placeholder: { padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' },
  emptyState: { padding: '4rem 2rem', textAlign: 'center' },
  emptyIcon:  { fontSize: '2.5rem', marginBottom: '0.75rem' },
  emptyTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.4rem' },
  emptySub:   { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' },
  emptyBtn:   { padding: '0.6rem 1.4rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif" },

  resultCount: { marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' },

  /* Modal */
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:   { background: '#fff', borderRadius: '16px', width: '480px', maxWidth: '95vw', boxShadow: '0 24px 60px rgba(0,0,0,0.18)', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid #f1f5f9' },
  modalTitle:  { fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '2px' },
  modalSub:    { fontSize: '0.78rem', color: '#94a3b8' },
  modalClose:  { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', fontFamily: "'Poppins', sans-serif", padding: '2px 6px', borderRadius: '6px' },
  modalBody:   { padding: '1.25rem 1.5rem' },
  modalLabel:  { display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#475569', marginBottom: '6px' },
  modalInput:  { width: '100%', padding: '0.7rem 1rem', fontSize: '0.95rem', border: '2px solid #e2e8f0', borderRadius: '10px', fontFamily: "'Poppins', sans-serif", outline: 'none', color: '#1e293b', boxSizing: 'border-box', transition: 'border-color 0.15s' },
  modalHint:   { fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px', marginBottom: '1.25rem' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  modalCancel: { padding: '0.6rem 1.1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: '#64748b', fontFamily: "'Poppins', sans-serif" },
  modalCreate: { padding: '0.6rem 1.4rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif" },
};

export default AdminDashboard;
