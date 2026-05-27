import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import axios from 'axios';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const gjsInstance = useRef(null);

  const [page, setPage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Load page data from API
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const { data } = await axios.get(`/api/pages/${id}`);
        setPage(data);
        setPublished(data.published);
      } catch (err) {
        alert('Failed to load page');
        navigate('/admin');
      }
    };
    fetchPage();
  }, [id, navigate]);

  // Initialize GrapesJS once page data is loaded
  useEffect(() => {
    if (!page || gjsInstance.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      height: 'calc(100vh - 60px)',
      width: 'auto',
      storageManager: false, // we handle saves manually
      plugins: [],
      canvas: {
        styles: [],
      },
      blockManager: {
        appendTo: '#blocks',
        blocks: [
          {
            id: 'section',
            label: 'Section',
            category: 'Layout',
            content: '<section style="padding:40px 20px;"><div class="container"></div></section>',
          },
          {
            id: 'text',
            label: 'Text',
            category: 'Basic',
            content: '<p>Insert your text here</p>',
          },
          {
            id: 'heading',
            label: 'Heading',
            category: 'Basic',
            content: '<h2>Your Heading</h2>',
          },
          {
            id: 'button',
            label: 'Button',
            category: 'Basic',
            content: '<a href="#" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;">Click Me</a>',
          },
          {
            id: 'image',
            label: 'Image',
            category: 'Basic',
            content: { type: 'image' },
          },
          {
            id: 'two-col',
            label: '2 Columns',
            category: 'Layout',
            content: `<div style="display:flex;gap:20px;">
              <div style="flex:1;padding:20px;background:#f8f8f8;">Column 1</div>
              <div style="flex:1;padding:20px;background:#f8f8f8;">Column 2</div>
            </div>`,
          },
          {
            id: 'hero',
            label: 'Hero Section',
            category: 'Sections',
            content: `<section style="padding:80px 40px;text-align:center;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;">
              <h1 style="font-size:3rem;margin-bottom:1rem;">Welcome to Janbahal</h1>
              <p style="font-size:1.2rem;margin-bottom:2rem;">Build beautiful pages with drag and drop</p>
              <a href="#" style="padding:14px 32px;background:#fff;color:#4f46e5;border-radius:8px;text-decoration:none;font-weight:bold;">Get Started</a>
            </section>`,
          },
        ],
      },
    });

    // Load saved content if available
    if (page.gjsComponents && page.gjsComponents.length > 0) {
      editor.setComponents(page.gjsComponents);
      editor.setStyle(page.gjsStyles || []);
    } else if (page.gjsHtml) {
      editor.setComponents(page.gjsHtml);
      editor.setStyle(page.gjsCss || '');
    }

    gjsInstance.current = editor;

    return () => {
      if (gjsInstance.current) {
        gjsInstance.current.destroy();
        gjsInstance.current = null;
      }
    };
  }, [page]);

  const handleSave = async (publish = null) => {
    const editor = gjsInstance.current;
    if (!editor) return;

    setSaving(true);
    setSaveMsg('');

    try {
      const payload = {
        gjsHtml: editor.getHtml(),
        gjsCss: editor.getCss(),
        gjsComponents: editor.getComponents(),
        gjsStyles: editor.getStyle(),
      };

      if (publish !== null) {
        payload.published = publish;
        setPublished(publish);
      }

      await axios.put(`/api/pages/${id}`, payload);
      setSaveMsg(publish ? '✅ Published!' : '✅ Saved!');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch (err) {
      setSaveMsg('❌ Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top toolbar */}
      <div style={styles.toolbar}>
        <button style={styles.backBtn} onClick={() => navigate('/admin')}>← Dashboard</button>
        <span style={styles.pageTitle}>{page?.title || 'Loading...'}</span>
        <div style={styles.toolbarRight}>
          {saveMsg && <span style={styles.saveMsg}>{saveMsg}</span>}
          <button style={styles.saveBtn} onClick={() => handleSave()} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save'}
          </button>
          <button
            style={{
              ...styles.publishBtn,
              background: published ? '#f1f5f9' : '#4f46e5',
              color: published ? '#64748b' : '#fff',
            }}
            onClick={() => handleSave(!published)}
            disabled={saving}
          >
            {published ? '⬇ Unpublish' : '🚀 Publish'}
          </button>
        </div>
      </div>

      {/* Editor layout */}
      <div style={styles.editorLayout}>
        {/* Block panel */}
        <div id="blocks" style={styles.blocksPanel}></div>
        {/* GrapesJS canvas */}
        <div ref={editorRef} style={styles.canvas}></div>
      </div>
    </div>
  );
};

const styles = {
  toolbar: {
    height: '60px', background: '#1e293b', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 1rem', gap: '1rem', flexShrink: 0,
  },
  backBtn: {
    padding: '0.4rem 0.8rem', background: 'transparent', color: '#94a3b8',
    border: '1px solid #334155', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
  },
  pageTitle: { color: '#f1f5f9', fontWeight: '600', fontSize: '1rem', flex: 1, textAlign: 'center' },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  saveMsg: { color: '#94a3b8', fontSize: '0.85rem' },
  saveBtn: {
    padding: '0.4rem 1rem', background: '#334155', color: '#f1f5f9',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
  },
  publishBtn: {
    padding: '0.4rem 1.1rem', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
  },
  editorLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
  blocksPanel: {
    width: '220px', background: '#f8fafc', borderRight: '1px solid #e2e8f0',
    overflowY: 'auto', flexShrink: 0,
  },
  canvas: { flex: 1 },
};

export default Editor;
