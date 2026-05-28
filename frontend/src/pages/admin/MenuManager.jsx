import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const EMPTY_ITEM = { label: '', url: '', target: '_self' };

const MenuManager = () => {
  const [menus,       setMenus]       = useState([]);
  const [activeMenu,  setActiveMenu]  = useState(null);
  const [items,       setItems]       = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  /* Create-menu form */
  const [newMenuName, setNewMenuName] = useState('');
  const [menuSaving,  setMenuSaving]  = useState(false);
  const [menuError,   setMenuError]   = useState('');

  /* Rename menu inline */
  const [renamingId,  setRenamingId]  = useState(null);
  const [renameVal,   setRenameVal]   = useState('');

  /* Item form */
  const [itemForm,   setItemForm]   = useState(EMPTY_ITEM);
  const [editItemId, setEditItemId] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [itemError,  setItemError]  = useState('');

  /* Content picker */
  const [showPicker,   setShowPicker]   = useState(false);
  const [pickerTab,    setPickerTab]    = useState('pages');   // 'pages' | 'posts'
  const [pages,        setPages]        = useState([]);
  const [posts,        setPosts]        = useState([]);
  const [pickerSearch, setPickerSearch] = useState('');

  /* ── load all menus ── */
  useEffect(() => {
    axios.get('/api/menu')
      .then(({ data }) => { setMenus(data); if (data.length > 0) setActiveMenu(data[0]); })
      .catch(() => {})
      .finally(() => setLoadingMenus(false));
    /* load pages + posts for the picker */
    axios.get('/api/pages').then(({ data }) => setPages(data)).catch(() => {});
    axios.get('/api/posts/all').then(({ data }) => setPosts(data)).catch(() => {});
  }, []);

  /* ── load items whenever active menu changes ── */
  useEffect(() => {
    if (!activeMenu) { setItems([]); return; }
    setLoadingItems(true);
    axios.get(`/api/menu/${activeMenu._id}/items`)
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoadingItems(false));
    setItemForm(EMPTY_ITEM); setEditItemId(null); setItemError('');
  }, [activeMenu]);

  /* ── create menu ── */
  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (!newMenuName.trim()) return;
    setMenuSaving(true); setMenuError('');
    try {
      const { data } = await axios.post('/api/menu', { name: newMenuName.trim() });
      setMenus(m => [...m, data]);
      setActiveMenu(data);
      setNewMenuName('');
    } catch (err) {
      setMenuError(err.response?.data?.message || 'Failed to create menu');
    } finally { setMenuSaving(false); }
  };

  /* ── rename menu ── */
  const handleRename = async (menu) => {
    if (!renameVal.trim() || renameVal === menu.name) { setRenamingId(null); return; }
    try {
      const { data } = await axios.put(`/api/menu/${menu._id}`, { name: renameVal.trim() });
      setMenus(m => m.map(x => x._id === menu._id ? data : x));
      if (activeMenu?._id === menu._id) setActiveMenu(data);
    } catch {}
    setRenamingId(null);
  };

  /* ── delete menu ── */
  const handleDeleteMenu = async (menu) => {
    if (!confirm(`Delete "${menu.name}" and all its links? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/menu/${menu._id}`);
      const next = menus.filter(m => m._id !== menu._id);
      setMenus(next);
      setActiveMenu(next[0] || null);
    } catch { alert('Delete failed'); }
  };

  /* ── save item (add / edit) ── */
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.label.trim() || !itemForm.url.trim()) return setItemError('Label and URL are required');
    setItemSaving(true); setItemError('');
    try {
      if (editItemId) {
        const { data } = await axios.put(`/api/menu/item/${editItemId}`, itemForm);
        setItems(it => it.map(x => x._id === editItemId ? data : x));
      } else {
        const { data } = await axios.post(`/api/menu/${activeMenu._id}/items`, itemForm);
        setItems(it => [...it, data]);
      }
      setItemForm(EMPTY_ITEM); setEditItemId(null);
    } catch (err) {
      setItemError(err.response?.data?.message || 'Save failed');
    } finally { setItemSaving(false); }
  };

  /* ── delete item ── */
  const handleDeleteItem = async (id) => {
    if (!confirm('Delete this link?')) return;
    try {
      await axios.delete(`/api/menu/item/${id}`);
      setItems(it => it.filter(x => x._id !== id));
    } catch { alert('Delete failed'); }
  };

  /* ── pick content (page or post) → auto-fill form ── */
  const pickContent = (item, type) => {
    const url   = type === 'page' ? `/page/${item.slug}` : `/blog/${item.slug}`;
    const label = item.title;
    setItemForm(f => ({ ...f, label, url }));
    setShowPicker(false);
    setPickerSearch('');
  };

  /* ── reorder ── */
  const moveItem = async (index, dir) => {
    const next = [...items];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    const updated = next.map((item, i) => ({ ...item, order: i }));
    setItems(updated);
    await axios.put(`/api/menu/${activeMenu._id}/items/reorder`, {
      items: updated.map(({ _id, order }) => ({ _id, order })),
    });
  };

  return (
    <AdminLayout>
      <div style={s.container}>

        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.title}>Menus</h1>
            <p style={s.sub}>Create named menus and add navigation links to them</p>
          </div>
        </div>

        <div style={s.layout}>

          {/* ── LEFT: menu list ── */}
          <div style={s.sidebar}>
            <div style={s.sideTitle}>Your Menus</div>

            {loadingMenus ? (
              <p style={s.dimTxt}>Loading…</p>
            ) : menus.length === 0 ? (
              <p style={s.dimTxt}>No menus yet.</p>
            ) : (
              <div style={s.menuList}>
                {menus.map(menu => (
                  <div
                    key={menu._id}
                    style={{ ...s.menuTab, ...(activeMenu?._id === menu._id ? s.menuTabActive : {}) }}
                  >
                    {renamingId === menu._id ? (
                      <input
                        autoFocus
                        style={s.renameInput}
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onBlur={() => handleRename(menu)}
                        onKeyDown={e => { if (e.key === 'Enter') handleRename(menu); if (e.key === 'Escape') setRenamingId(null); }}
                      />
                    ) : (
                      <span style={s.menuTabName} onClick={() => setActiveMenu(menu)}>
                        {menu.name}
                      </span>
                    )}
                    <div style={s.menuTabActions}>
                      <button style={s.iconBtn} title="Rename" onClick={() => { setRenamingId(menu._id); setRenameVal(menu.name); }}>✏</button>
                      <button style={{ ...s.iconBtn, color: '#ef4444' }} title="Delete" onClick={() => handleDeleteMenu(menu)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create menu form */}
            <form onSubmit={handleCreateMenu} style={s.createMenuForm}>
              <div style={s.sideTitle}>New Menu</div>
              {menuError && <p style={s.error}>{menuError}</p>}
              <input
                style={s.input}
                placeholder="e.g. Main Menu"
                value={newMenuName}
                onChange={e => setNewMenuName(e.target.value)}
              />
              <button style={s.createBtn} type="submit" disabled={menuSaving || !newMenuName.trim()}>
                {menuSaving ? 'Creating…' : '＋ Create Menu'}
              </button>
            </form>
          </div>

          {/* ── RIGHT: item editor ── */}
          <div style={s.main}>
            {!activeMenu ? (
              <div style={s.emptyState}>
                <span style={{ fontSize: '3rem' }}>☰</span>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Select or create a menu to add links.</p>
              </div>
            ) : (
              <>
                {/* Menu name header */}
                <div style={s.menuHeader}>
                  <div>
                    <div style={s.menuName}>{activeMenu.name}</div>
                    <div style={s.menuSlug}>slug: {activeMenu.slug}</div>
                  </div>
                  <span style={s.itemCount}>{items.length} link{items.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Add / Edit item form */}
                <div style={s.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={s.cardTitle}>{editItemId ? 'Edit Link' : 'Add Link'}</div>
                    {!editItemId && (
                      <button style={s.pickerToggleBtn} type="button" onClick={() => { setShowPicker(p => !p); setPickerSearch(''); }}>
                        {showPicker ? '✕ Close picker' : '📄 Pick from Pages / Posts'}
                      </button>
                    )}
                  </div>

                  {/* Content picker panel */}
                  {showPicker && !editItemId && (
                    <div style={s.pickerPanel}>
                      {/* Tabs */}
                      <div style={s.pickerTabs}>
                        {[['pages','📄 Pages'], ['posts','✏️ Posts']].map(([key, label]) => (
                          <button
                            key={key}
                            style={{ ...s.pickerTab, ...(pickerTab === key ? s.pickerTabActive : {}) }}
                            onClick={() => { setPickerTab(key); setPickerSearch(''); }}
                            type="button"
                          >{label}</button>
                        ))}
                        <input
                          style={s.pickerSearch}
                          placeholder="Search…"
                          value={pickerSearch}
                          onChange={e => setPickerSearch(e.target.value)}
                        />
                      </div>

                      {/* Items */}
                      <div style={s.pickerList}>
                        {pickerTab === 'pages' && (() => {
                          const filtered = pages.filter(p => p.title.toLowerCase().includes(pickerSearch.toLowerCase()));
                          return filtered.length === 0
                            ? <p style={s.pickerEmpty}>{pages.length === 0 ? 'No pages found.' : 'No match.'}</p>
                            : filtered.map(page => (
                                <div key={page._id}
                                  style={s.pickerItem}
                                  onClick={() => pickContent(page, 'page')}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                >
                                  <div style={s.pickerItemIcon}>📄</div>
                                  <div style={s.pickerItemInfo}>
                                    <span style={s.pickerItemTitle}>{page.title}</span>
                                    <span style={s.pickerItemUrl}>/page/{page.slug}</span>
                                  </div>
                                  <span style={{ ...s.pickerBadge, ...(page.published ? s.badgeGreen : s.badgeDim) }}>
                                    {page.published ? 'Published' : 'Draft'}
                                  </span>
                                  <span style={s.pickerSelect}>Select →</span>
                                </div>
                              ));
                        })()}

                        {pickerTab === 'posts' && (() => {
                          const filtered = posts.filter(p => p.title.toLowerCase().includes(pickerSearch.toLowerCase()));
                          return filtered.length === 0
                            ? <p style={s.pickerEmpty}>{posts.length === 0 ? 'No posts found.' : 'No match.'}</p>
                            : filtered.map(post => (
                                <div key={post._id}
                                  style={s.pickerItem}
                                  onClick={() => pickContent(post, 'post')}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                >
                                  <div style={s.pickerItemIcon}>✏️</div>
                                  <div style={s.pickerItemInfo}>
                                    <span style={s.pickerItemTitle}>{post.title}</span>
                                    <span style={s.pickerItemUrl}>/blog/{post.slug}</span>
                                  </div>
                                  <span style={{ ...s.pickerBadge, ...(post.status === 'published' ? s.badgeGreen : s.badgeDim) }}>
                                    {post.status === 'published' ? 'Published' : 'Draft'}
                                  </span>
                                  <span style={s.pickerSelect}>Select →</span>
                                </div>
                              ));
                        })()}
                      </div>
                    </div>
                  )}

                  {itemError && <p style={s.error}>{itemError}</p>}
                  <form onSubmit={handleSaveItem}>
                    <div style={s.formRow}>
                      <div style={s.field}>
                        <label style={s.label}>Label *</label>
                        <input style={s.input} placeholder="e.g. About Us"
                          value={itemForm.label} onChange={e => setItemForm(f => ({ ...f, label: e.target.value }))} />
                      </div>
                      <div style={s.field}>
                        <label style={s.label}>URL *</label>
                        <input style={s.input} placeholder="e.g. /about or https://…"
                          value={itemForm.url} onChange={e => setItemForm(f => ({ ...f, url: e.target.value }))} />
                      </div>
                      <div style={{ ...s.field, maxWidth: '140px' }}>
                        <label style={s.label}>Open in</label>
                        <select style={s.input} value={itemForm.target}
                          onChange={e => setItemForm(f => ({ ...f, target: e.target.value }))}>
                          <option value="_self">Same tab</option>
                          <option value="_blank">New tab</option>
                        </select>
                      </div>
                    </div>
                    <div style={s.formActions}>
                      <button style={s.btnPrimary} type="submit" disabled={itemSaving}>
                        {itemSaving ? 'Saving…' : editItemId ? 'Update Link' : '＋ Add Link'}
                      </button>
                      {editItemId && (
                        <button style={s.btnCancel} type="button"
                          onClick={() => { setItemForm(EMPTY_ITEM); setEditItemId(null); setItemError(''); setShowPicker(false); }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Items list */}
                <div style={s.card}>
                  <div style={s.cardTitle}>Links in this menu</div>
                  {loadingItems ? (
                    <p style={s.dimTxt}>Loading…</p>
                  ) : items.length === 0 ? (
                    <div style={s.emptyLinks}>
                      <span style={{ fontSize: '1.5rem' }}>🔗</span>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No links yet. Add one above.</p>
                    </div>
                  ) : (
                    <div style={s.itemList}>
                      {items.map((item, i) => (
                        <div key={item._id} style={s.itemRow}>
                          <div style={s.orderBtns}>
                            <button style={s.orderBtn} onClick={() => moveItem(i, -1)} disabled={i === 0}>↑</button>
                            <button style={s.orderBtn} onClick={() => moveItem(i, 1)} disabled={i === items.length - 1}>↓</button>
                          </div>
                          <div style={s.itemInfo}>
                            <span style={s.itemLabel}>{item.label}</span>
                            <span style={s.itemUrl}>{item.url}</span>
                          </div>
                          <span style={{ ...s.badge, ...(item.target === '_blank' ? s.badgeBlue : s.badgeGreen) }}>
                            {item.target === '_blank' ? 'New tab' : 'Same tab'}
                          </span>
                          <div style={s.itemActions}>
                            <button style={s.editBtn} onClick={() => { setItemForm({ label: item.label, url: item.url, target: item.target }); setEditItemId(item._id); setItemError(''); }}>
                              ✏️ Edit
                            </button>
                            <button style={s.deleteBtn} onClick={() => handleDeleteItem(item._id)}>🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem', fontFamily: "'Poppins', sans-serif" },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' },
  title: { fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem' },
  sub:   { color: '#64748b', fontSize: '0.9rem', margin: 0 },

  layout: { display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' },

  /* Sidebar */
  sidebar: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  sideTitle: { fontSize: '0.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px', marginTop: '4px' },
  menuList: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' },
  menuTab: { display: 'flex', alignItems: 'center', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', transition: 'background 0.15s', border: '1px solid transparent' },
  menuTabActive: { background: '#eef2ff', border: '1px solid #c7d2fe' },
  menuTabName: { flex: 1, fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', cursor: 'pointer' },
  menuTabActions: { display: 'flex', gap: '4px', opacity: 0.5 },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 4px', borderRadius: '4px', color: '#64748b', fontFamily: "'Poppins', sans-serif" },
  renameInput: { flex: 1, fontSize: '0.85rem', fontWeight: '600', border: '1px solid #c7d2fe', borderRadius: '6px', padding: '2px 6px', fontFamily: "'Poppins', sans-serif", outline: 'none', background: '#f8fafc' },

  createMenuForm: { display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' },
  createBtn: {
    padding: '7px 12px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
  },

  dimTxt: { color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center' },

  /* Main */
  main: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  menuHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1rem 1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  menuName: { fontSize: '1rem', fontWeight: '800', color: '#0f172a' },
  menuSlug: { fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' },
  itemCount: { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px' },

  card: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem' },

  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', marginBottom: '1rem', alignItems: 'end' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.78rem', fontWeight: '600', color: '#475569' },
  input: { padding: '8px 11px', fontSize: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#f8fafc', fontFamily: "'Poppins', sans-serif", boxSizing: 'border-box', width: '100%' },
  formActions: { display: 'flex', gap: '8px' },
  btnPrimary: { padding: '8px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif" },
  btnCancel:  { padding: '8px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif" },
  error: { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.5rem 0.85rem', fontSize: '0.82rem', marginBottom: '0.75rem' },

  emptyLinks: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '2rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' },
  itemList:   { display: 'flex', flexDirection: 'column', gap: '6px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', border: '1px solid #f1f5f9' },
  orderBtns: { display: 'flex', flexDirection: 'column', gap: '2px' },
  orderBtn: { padding: '1px 5px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', fontSize: '0.68rem', color: '#64748b', fontFamily: "'Poppins', sans-serif", lineHeight: 1.4 },
  itemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  itemLabel: { fontSize: '0.88rem', fontWeight: '600', color: '#1e293b' },
  itemUrl:   { fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { fontSize: '0.68rem', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' },
  badgeBlue:  { background: '#eff6ff', color: '#3b82f6' },
  badgeGreen: { background: '#f0fdf4', color: '#16a34a' },
  itemActions: { display: 'flex', gap: '6px' },
  editBtn:   { padding: '5px 10px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: "'Poppins', sans-serif" },
  deleteBtn: { padding: '5px 10px', background: '#fff5f5', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', fontFamily: "'Poppins', sans-serif" },

  /* Content picker */
  pickerToggleBtn: {
    padding: '5px 12px', background: '#eef2ff', color: '#4f46e5',
    border: '1px solid #c7d2fe', borderRadius: '7px', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
  },
  pickerPanel: {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px',
    marginBottom: '1rem', overflow: 'hidden',
  },
  pickerTabs: { display: 'flex', gap: '2px', padding: '8px 8px 0', alignItems: 'center', borderBottom: '1px solid #e2e8f0', background: '#fff' },
  pickerTab: {
    padding: '6px 14px', background: 'transparent', border: 'none',
    borderBottom: '2px solid transparent', cursor: 'pointer', marginBottom: '-1px',
    fontSize: '0.82rem', fontWeight: '500', color: '#64748b',
    fontFamily: "'Poppins', sans-serif", transition: 'all 0.15s',
  },
  pickerTabActive: { color: '#4f46e5', borderBottomColor: '#4f46e5', fontWeight: '700' },
  pickerSearch: {
    marginLeft: 'auto', padding: '5px 10px', fontSize: '0.78rem',
    border: '1px solid #e2e8f0', borderRadius: '7px', outline: 'none',
    background: '#f8fafc', fontFamily: "'Poppins', sans-serif", width: '160px',
    marginBottom: '6px',
  },
  pickerList: { maxHeight: '220px', overflowY: 'auto', padding: '6px 8px' },
  pickerEmpty: { color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '1.5rem 0', margin: 0 },
  pickerItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
    transition: 'background 0.12s', marginBottom: '3px',
    border: '1px solid transparent',
  },
  pickerItemIcon: { fontSize: '1rem', flexShrink: 0, width: '22px', textAlign: 'center' },
  pickerItemInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  pickerItemTitle: { fontSize: '0.85rem', fontWeight: '600', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  pickerItemUrl:   { fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  pickerBadge: { fontSize: '0.65rem', fontWeight: '700', padding: '2px 7px', borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0 },
  badgeDim:    { background: '#f1f5f9', color: '#94a3b8' },
  pickerSelect: { fontSize: '0.72rem', fontWeight: '600', color: '#4f46e5', whiteSpace: 'nowrap', flexShrink: 0 },
};

export default MenuManager;
