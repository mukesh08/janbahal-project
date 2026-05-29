import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { ArrowLeft, Save, ArrowDown, Rocket, Image as ImageIcon, FolderOpen, RefreshCw, ExternalLink, X } from 'lucide-react';

const CATEGORIES = ['General', 'News', 'Tutorial', 'Opinion', 'Case Study', 'Announcement', 'Technology', 'Design'];

const PostEditor = () => {
  const { id }    = useParams();        // undefined = new post
  const navigate  = useNavigate();
  const isNew     = !id;

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    featuredImage: '', category: 'General', tags: '', status: 'draft',
  });
  const [loading,  setLoading]  = useState(!isNew);
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState('');
  const [uploads,  setUploads]  = useState([]);
  const [showImgPicker, setShowImgPicker] = useState(false);
  const titleRef = useRef(null);

  /* Load post if editing */
  useEffect(() => {
    if (isNew) { setTimeout(() => titleRef.current?.focus(), 100); return; }
    axios.get(`/api/posts/${id}`)
      .then(({ data }) => {
        setForm({
          title:         data.title         || '',
          slug:          data.slug          || '',
          excerpt:       data.excerpt       || '',
          content:       data.content       || '',
          featuredImage: data.featuredImage || '',
          category:      data.category      || 'General',
          tags:          Array.isArray(data.tags) ? data.tags.join(', ') : '',
          status:        data.status        || 'draft',
        });
      })
      .catch(() => { alert('Post not found'); navigate('/admin/posts'); })
      .finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  /* Load images for picker */
  useEffect(() => {
    axios.get('/api/upload')
      .then(({ data }) => setUploads(data.filter(f => f.mimetype?.startsWith('image/'))))
      .catch(() => {});
  }, []);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm(f => {
      const next = { ...f, [field]: val };
      /* Auto-generate slug from title on new post */
      if (field === 'title' && isNew) {
        next.slug = val.toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
      }
      return next;
    });
  };

  const handleSave = async (statusOverride) => {
    if (!form.title.trim()) { alert('Title is required'); titleRef.current?.focus(); return; }
    setSaving(true); setSaveMsg('');
    try {
      const payload = {
        ...form,
        status: statusOverride || form.status,
        tags: form.tags,
      };
      if (isNew) {
        const { data } = await axios.post('/api/posts', payload);
        setSaveMsg('✅ Created!');
        setTimeout(() => navigate(`/admin/posts/${data._id}/edit`), 800);
      } else {
        await axios.put(`/api/posts/${id}`, payload);
        setForm(f => ({ ...f, status: payload.status }));
        setSaveMsg(statusOverride === 'published' ? '✅ Published!' : statusOverride === 'draft' ? '✅ Moved to Draft' : '✅ Saved!');
        setTimeout(() => setSaveMsg(''), 2500);
      }
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.message || 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading post…</div>
    </AdminLayout>
  );

  const isPublished = form.status === 'published';

  return (
    <AdminLayout>
      <div style={s.shell}>

        {/* ── Top bar ── */}
        <div style={s.topBar}>
          <div style={s.topLeft}>
            <button style={{ ...s.backBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/admin/posts')}><ArrowLeft size={14} strokeWidth={1.8} /> Posts</button>
            <span style={s.topTitle}>{isNew ? 'New Post' : 'Edit Post'}</span>
            <span style={{ ...s.statusPill, ...(isPublished ? s.pillPublished : s.pillDraft) }}>
              {isPublished
                ? <><span style={{width:6,height:6,borderRadius:'50%',background:'#16a34a',display:'inline-block',marginRight:4}} />Published</>
                : <><span style={{width:6,height:6,borderRadius:'50%',background:'#d97706',display:'inline-block',marginRight:4}} />Draft</>
              }
            </span>
          </div>
          <div style={s.topRight}>
            {saveMsg && <span style={s.saveMsg}>{saveMsg}</span>}
            <button style={{ ...s.saveDraftBtn, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleSave('draft')} disabled={saving}>
              <Save size={14} strokeWidth={1.8} /> Save Draft
            </button>
            <button
              style={{ ...(isPublished ? s.unpublishBtn : s.publishBtn), display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => handleSave(isPublished ? 'draft' : 'published')}
              disabled={saving}
            >
              {saving ? 'Saving…' : isPublished ? <><ArrowDown size={14} strokeWidth={1.8} /> Unpublish</> : <><Rocket size={14} strokeWidth={1.8} /> Publish</>}
            </button>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={s.body}>

          {/* LEFT — main content */}
          <div style={s.main}>

            {/* Title */}
            <input
              ref={titleRef}
              style={s.titleInput}
              placeholder="Post title…"
              value={form.title}
              onChange={set('title')}
            />

            {/* Slug */}
            <div style={s.slugRow}>
              <span style={s.slugLabel}>Slug:</span>
              <input
                style={s.slugInput}
                value={form.slug}
                onChange={set('slug')}
                placeholder="auto-generated-from-title"
              />
              {!isNew && (
                <a
                  href={`/blog/${form.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...s.previewLink, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={13} strokeWidth={2} /> Preview
                </a>
              )}
            </div>

            {/* Excerpt */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Excerpt <span style={s.labelHint}>(short description shown in blog list)</span></label>
              <textarea
                style={{ ...s.textarea, height: '72px' }}
                placeholder="A brief summary of this post…"
                value={form.excerpt}
                onChange={set('excerpt')}
              />
            </div>

            {/* Content */}
            <div style={s.fieldWrap}>
              <label style={s.label}>
                Content
                <span style={s.labelHint}> (supports HTML)</span>
              </label>
              <textarea
                style={{ ...s.textarea, height: '420px', fontFamily: "'Courier New', monospace", fontSize: '0.85rem', lineHeight: '1.7' }}
                placeholder={`<h2>Introduction</h2>\n<p>Write your post content here...</p>\n\n<h2>Section Two</h2>\n<p>More content...</p>`}
                value={form.content}
                onChange={set('content')}
              />
              <p style={s.hint}>Tip: You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;img&gt;, &lt;a&gt; etc.</p>
            </div>

          </div>

          {/* RIGHT — sidebar */}
          <div style={s.sidebar}>

            {/* Featured image */}
            <div style={s.sideCard}>
              <div style={s.sideTitle}>Featured Image</div>
              {form.featuredImage ? (
                <div style={s.imgPreviewWrap}>
                  <img src={form.featuredImage} alt="" style={s.imgPreview} />
                  <button style={{ ...s.removeImgBtn, display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => setForm(f => ({ ...f, featuredImage: '' }))}><X size={11} strokeWidth={2} /> Remove</button>
                </div>
              ) : (
                <div style={s.imgEmpty} onClick={() => setShowImgPicker(true)}>
                  <ImageIcon size={32} strokeWidth={1.8} color="#94a3b8" />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click to choose image</span>
                </div>
              )}
              <button style={{ ...s.chooseImgBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setShowImgPicker(true)}>
                {form.featuredImage ? <><RefreshCw size={13} strokeWidth={1.8} /> Change Image</> : <><FolderOpen size={13} strokeWidth={1.8} /> Choose from Uploads</>}
              </button>
              <div style={s.orRow}><span style={s.orLine}/><span style={s.orText}>or paste URL</span><span style={s.orLine}/></div>
              <input
                style={s.urlInput}
                placeholder="https://example.com/image.jpg"
                value={form.featuredImage}
                onChange={set('featuredImage')}
              />
            </div>

            {/* Category */}
            <div style={s.sideCard}>
              <div style={s.sideTitle}>Category</div>
              <select style={s.select} value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                {!CATEGORIES.includes(form.category) && <option value={form.category}>{form.category}</option>}
              </select>
              <input
                style={{ ...s.urlInput, marginTop: '8px' }}
                placeholder="Or type custom category…"
                value={CATEGORIES.includes(form.category) ? '' : form.category}
                onChange={(e) => setForm(f => ({ ...f, category: e.target.value || 'General' }))}
              />
            </div>

            {/* Tags */}
            <div style={s.sideCard}>
              <div style={s.sideTitle}>Tags</div>
              <input
                style={s.urlInput}
                placeholder="tag1, tag2, tag3"
                value={form.tags}
                onChange={set('tags')}
              />
              <p style={{ ...s.hint, marginTop: '6px' }}>Separate tags with commas</p>
            </div>

            {/* Status info */}
            <div style={{ ...s.sideCard, background: isPublished ? '#f0fdf4' : '#fffbeb', border: `1px solid ${isPublished ? '#bbf7d0' : '#fde68a'}` }}>
              <div style={s.sideTitle}>Status</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px' }}>
                {isPublished
                  ? `Published on ${form.publishedAt ? new Date(form.publishedAt).toLocaleDateString() : 'this post'}`
                  : 'This post is saved as a draft and not visible to the public.'}
              </p>
              <select
                style={s.select}
                value={form.status}
                onChange={set('status')}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

          </div>
        </div>

      </div>

      {/* ── Image picker modal ── */}
      {showImgPicker && (
        <div style={s.modalOverlay} onClick={() => setShowImgPicker(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <span style={s.modalTitle}>Choose Image</span>
              <button style={s.modalClose} onClick={() => setShowImgPicker(false)}><X size={16} strokeWidth={2} /></button>
            </div>
            {uploads.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>No images uploaded yet.</p>
                <p style={{ fontSize: '0.8rem' }}>Go to Upload section to add images.</p>
              </div>
            ) : (
              <div style={s.imgGrid}>
                {uploads.map(img => (
                  <div key={img._id} style={s.imgItem} onClick={() => { setForm(f => ({ ...f, featuredImage: img.url })); setShowImgPicker(false); }}>
                    <img src={img.url} alt={img.originalName} style={s.imgThumb} />
                    <span style={s.imgName}>{img.originalName?.slice(0, 20)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

/* ── Styles ──────────────────────────────────────────────── */
const s = {
  shell: { display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "'Poppins', sans-serif", background: '#f8fafc' },

  /* Top bar */
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0 1.5rem', height: '56px', background: '#fff',
    borderBottom: '1px solid #e8ecf0', flexShrink: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  topLeft:  { display: 'flex', alignItems: 'center', gap: '10px' },
  topRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  backBtn: {
    padding: '6px 12px', background: '#f8fafc', color: '#475569',
    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: '500', fontFamily: "'Poppins', sans-serif",
  },
  topTitle: { fontSize: '0.9rem', fontWeight: '700', color: '#1e293b' },
  statusPill: { fontSize: '0.7rem', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' },
  pillPublished: { background: '#dcfce7', color: '#16a34a' },
  pillDraft:     { background: '#fef3c7', color: '#d97706' },
  saveMsg:   { fontSize: '0.8rem', fontWeight: '600', color: '#16a34a' },
  saveDraftBtn: {
    padding: '7px 14px', background: '#f8fafc', color: '#1e293b',
    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.82rem', fontFamily: "'Poppins', sans-serif",
  },
  publishBtn: {
    padding: '7px 14px', background: '#4f46e5', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.82rem', fontFamily: "'Poppins', sans-serif",
  },
  unpublishBtn: {
    padding: '7px 14px', background: '#64748b', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '600', fontSize: '0.82rem', fontFamily: "'Poppins', sans-serif",
  },

  /* Body */
  body: { display: 'flex', flex: 1, overflow: 'auto', gap: '1.5rem', padding: '1.5rem', alignItems: 'flex-start' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 },
  sidebar: { width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' },

  /* Main fields */
  titleInput: {
    width: '100%', fontSize: '1.6rem', fontWeight: '800', color: '#0f172a',
    border: 'none', borderBottom: '2px solid #e2e8f0', background: 'transparent',
    padding: '0.5rem 0', outline: 'none', fontFamily: "'Poppins', sans-serif",
    boxSizing: 'border-box',
  },
  slugRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  slugLabel: { fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8', whiteSpace: 'nowrap' },
  slugInput: {
    flex: 1, padding: '5px 10px', fontSize: '0.8rem', color: '#64748b',
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px',
    fontFamily: "'Poppins', sans-serif", outline: 'none', boxSizing: 'border-box',
  },
  previewLink: { fontSize: '0.78rem', color: '#4f46e5', fontWeight: '600', whiteSpace: 'nowrap' },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.82rem', fontWeight: '700', color: '#334155' },
  labelHint: { fontWeight: '400', color: '#94a3b8', fontSize: '0.75rem' },
  textarea: {
    width: '100%', padding: '12px 14px', fontSize: '0.9rem', color: '#1e293b',
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px',
    resize: 'vertical', outline: 'none', fontFamily: "'Poppins', sans-serif",
    lineHeight: '1.6', boxSizing: 'border-box',
  },
  hint: { fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0 0' },

  /* Sidebar cards */
  sideCard: {
    background: '#fff', border: '1px solid #f1f5f9',
    borderRadius: '12px', padding: '14px',
  },
  sideTitle: { fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' },
  imgPreviewWrap: { position: 'relative', marginBottom: '10px' },
  imgPreview: { width: '100%', borderRadius: '8px', display: 'block', maxHeight: '160px', objectFit: 'cover' },
  removeImgBtn: {
    position: 'absolute', top: '6px', right: '6px',
    background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
    borderRadius: '6px', padding: '3px 8px', cursor: 'pointer',
    fontSize: '0.72rem', fontFamily: "'Poppins', sans-serif",
  },
  imgEmpty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: '6px', height: '100px', background: '#f8fafc', border: '2px dashed #e2e8f0',
    borderRadius: '8px', cursor: 'pointer', marginBottom: '10px',
  },
  chooseImgBtn: {
    width: '100%', padding: '7px', background: '#f8fafc', color: '#4f46e5',
    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: '600', fontFamily: "'Poppins', sans-serif",
  },
  orRow: { display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' },
  orLine: { flex: 1, height: '1px', background: '#f1f5f9' },
  orText: { fontSize: '0.68rem', color: '#b0bcc8', whiteSpace: 'nowrap' },
  urlInput: {
    width: '100%', padding: '7px 10px', fontSize: '0.78rem', color: '#1e293b',
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px',
    fontFamily: "'Poppins', sans-serif", outline: 'none', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '7px 10px', fontSize: '0.82rem', color: '#1e293b',
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px',
    fontFamily: "'Poppins', sans-serif", outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
  },

  /* Image picker modal */
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: '16px', width: '680px', maxWidth: '95vw',
    maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
  },
  modalTitle: { fontSize: '1rem', fontWeight: '700', color: '#1e293b' },
  modalClose: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontSize: '1rem', color: '#94a3b8', fontFamily: "'Poppins', sans-serif",
  },
  imgGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px',
    padding: '16px', overflowY: 'auto',
  },
  imgItem: {
    display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer',
    borderRadius: '8px', overflow: 'hidden', border: '2px solid transparent',
    transition: 'border-color 0.15s',
  },
  imgThumb: { width: '100%', aspectRatio: '1', objectFit: 'cover' },
  imgName: { fontSize: '0.65rem', color: '#64748b', padding: '2px 4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
};

export default PostEditor;
