import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import axios from 'axios';

/* ─── Custom blocks definition ─────────────────────────────── */
const BLOCKS = [
  /* Layout */
  {
    id: 'section', category: 'Layout', label: 'Section',
    content: `<section class="gjs-section" style="padding:60px 20px;width:100%;">
      <div class="container" style="max-width:1100px;margin:0 auto;"></div>
    </section>`,
  },
  {
    id: 'col-1', category: 'Layout', label: '1 Column',
    content: `<div style="padding:20px;width:100%;box-sizing:border-box;"></div>`,
  },
  {
    id: 'col-2', category: 'Layout', label: '2 Columns',
    content: `<div style="display:flex;gap:20px;flex-wrap:wrap;">
      <div style="flex:1;min-width:200px;padding:20px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:200px;padding:20px;box-sizing:border-box;"></div>
    </div>`,
  },
  {
    id: 'col-3', category: 'Layout', label: '3 Columns',
    content: `<div style="display:flex;gap:20px;flex-wrap:wrap;">
      <div style="flex:1;min-width:150px;padding:20px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:150px;padding:20px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:150px;padding:20px;box-sizing:border-box;"></div>
    </div>`,
  },
  {
    id: 'col-4', category: 'Layout', label: '4 Columns',
    content: `<div style="display:flex;gap:16px;flex-wrap:wrap;">
      <div style="flex:1;min-width:120px;padding:16px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:120px;padding:16px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:120px;padding:16px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:120px;padding:16px;box-sizing:border-box;"></div>
    </div>`,
  },
  {
    id: 'col-70-30', category: 'Layout', label: '70 / 30',
    content: `<div style="display:flex;gap:20px;flex-wrap:wrap;">
      <div style="flex:7;min-width:200px;padding:20px;box-sizing:border-box;"></div>
      <div style="flex:3;min-width:150px;padding:20px;box-sizing:border-box;"></div>
    </div>`,
  },
  /* Basic */
  {
    id: 'text', category: 'Basic', label: 'Text',
    content: '<p style="font-size:1rem;line-height:1.7;color:#333;">Insert your text here. Click to edit.</p>',
  },
  {
    id: 'h1', category: 'Basic', label: 'Heading 1',
    content: '<h1 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin:0 0 1rem;">Your Main Heading</h1>',
  },
  {
    id: 'h2', category: 'Basic', label: 'Heading 2',
    content: '<h2 style="font-size:1.8rem;font-weight:700;color:#1e293b;margin:0 0 0.75rem;">Your Sub Heading</h2>',
  },
  {
    id: 'h3', category: 'Basic', label: 'Heading 3',
    content: '<h3 style="font-size:1.3rem;font-weight:700;color:#334155;margin:0 0 0.5rem;">Section Title</h3>',
  },
  {
    id: 'image', category: 'Basic', label: 'Image',
    content: { type: 'image' },
    activate: true,
  },
  {
    id: 'button', category: 'Basic', label: 'Button',
    content: `<a href="#" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem;">Click Me</a>`,
  },
  {
    id: 'divider', category: 'Basic', label: 'Divider',
    content: '<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />',
  },
  {
    id: 'spacer', category: 'Basic', label: 'Spacer',
    content: '<div style="height:60px;"></div>',
  },
  {
    id: 'list', category: 'Basic', label: 'List',
    content: `<ul style="padding-left:1.5rem;line-height:2;color:#334155;">
      <li>First item</li><li>Second item</li><li>Third item</li>
    </ul>`,
  },
  /* Sections */
  {
    id: 'hero', category: 'Sections', label: 'Hero',
    content: `<section style="padding:80px 40px;text-align:center;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;">
      <h1 style="font-size:3rem;font-weight:800;margin:0 0 1rem;">Welcome to Our Site</h1>
      <p style="font-size:1.2rem;margin:0 0 2rem;opacity:0.9;max-width:600px;margin-left:auto;margin-right:auto;">
        A short description that explains what your site is about.
      </p>
      <a href="#" style="display:inline-block;padding:14px 32px;background:#fff;color:#4f46e5;border-radius:8px;text-decoration:none;font-weight:700;font-size:1rem;">
        Get Started
      </a>
    </section>`,
  },
  {
    id: 'features', category: 'Sections', label: 'Features',
    content: `<section style="padding:60px 40px;background:#f8fafc;">
      <h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0f172a;margin:0 0 2.5rem;">Our Features</h2>
      <div style="display:flex;gap:24px;flex-wrap:wrap;max-width:1100px;margin:0 auto;">
        <div style="flex:1;min-width:200px;background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;">
          <div style="font-size:2rem;margin-bottom:12px;">⚡</div>
          <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Fast</h3>
          <p style="color:#64748b;font-size:0.9rem;margin:0;">Lightning-fast performance you can count on.</p>
        </div>
        <div style="flex:1;min-width:200px;background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;">
          <div style="font-size:2rem;margin-bottom:12px;">🔒</div>
          <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Secure</h3>
          <p style="color:#64748b;font-size:0.9rem;margin:0;">Enterprise-grade security for your peace of mind.</p>
        </div>
        <div style="flex:1;min-width:200px;background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;">
          <div style="font-size:2rem;margin-bottom:12px;">🎯</div>
          <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Accurate</h3>
          <p style="color:#64748b;font-size:0.9rem;margin:0;">Precise results tailored to your needs.</p>
        </div>
      </div>
    </section>`,
  },
  {
    id: 'cta', category: 'Sections', label: 'Call to Action',
    content: `<section style="padding:60px 40px;text-align:center;background:#1e293b;color:#fff;">
      <h2 style="font-size:2rem;font-weight:800;margin:0 0 1rem;">Ready to get started?</h2>
      <p style="margin:0 0 2rem;opacity:0.75;font-size:1.05rem;">Join thousands of users today.</p>
      <a href="#" style="display:inline-block;padding:14px 32px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Start Now</a>
    </section>`,
  },
  {
    id: 'text-image', category: 'Sections', label: 'Text + Image',
    content: `<section style="padding:60px 40px;">
      <div style="display:flex;gap:40px;align-items:center;flex-wrap:wrap;max-width:1100px;margin:0 auto;">
        <div style="flex:1;min-width:250px;">
          <h2 style="font-size:2rem;font-weight:800;color:#0f172a;margin:0 0 1rem;">Your Headline Here</h2>
          <p style="color:#64748b;line-height:1.75;margin:0 0 1.5rem;">Describe your product or service in detail. Add what makes it special and why users should care.</p>
          <a href="#" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Learn More</a>
        </div>
        <div style="flex:1;min-width:250px;background:#e2e8f0;border-radius:12px;height:280px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.9rem;">
          Drop image here
        </div>
      </div>
    </section>`,
  },
  {
    id: 'card-grid', category: 'Sections', label: 'Card Grid',
    content: `<section style="padding:60px 40px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;max-width:1100px;margin:0 auto;">
        ${[1,2,3].map(n => `
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <div style="height:140px;background:#e2e8f0;"></div>
          <div style="padding:20px;">
            <h3 style="font-size:1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Card Title ${n}</h3>
            <p style="font-size:0.9rem;color:#64748b;margin:0;">Short description for this card.</p>
          </div>
        </div>`).join('')}
      </div>
    </section>`,
  },
];

/* ─── Style manager sectors ─────────────────────────────────── */
const STYLE_SECTORS = [
  {
    name: 'Dimension',
    open: true,
    properties: [
      { property: 'width', type: 'integer', units: ['px', '%', 'vw', 'auto'], label: 'Width' },
      { property: 'height', type: 'integer', units: ['px', '%', 'vh', 'auto'], label: 'Height' },
      { property: 'min-height', type: 'integer', units: ['px', '%', 'vh'], label: 'Min Height' },
      { property: 'max-width', type: 'integer', units: ['px', '%'], label: 'Max Width' },
      { extend: 'margin', id: 'margin', label: 'Margin' },
      { extend: 'padding', id: 'padding', label: 'Padding' },
    ],
  },
  {
    name: 'Typography',
    open: false,
    properties: [
      {
        property: 'font-family', type: 'select', label: 'Font',
        options: [
          { value: 'inherit', name: 'Default' },
          { value: 'system-ui, sans-serif', name: 'System UI' },
          { value: 'Georgia, serif', name: 'Georgia' },
          { value: '"Courier New", monospace', name: 'Courier' },
        ],
      },
      { property: 'font-size', type: 'integer', units: ['px', 'rem', 'em', '%'], label: 'Size' },
      {
        property: 'font-weight', type: 'select', label: 'Weight',
        options: [
          { value: '400', name: 'Normal' }, { value: '500', name: 'Medium' },
          { value: '600', name: 'Semi Bold' }, { value: '700', name: 'Bold' },
          { value: '800', name: 'Extra Bold' },
        ],
      },
      { property: 'line-height', type: 'integer', units: ['', 'px', 'em'], label: 'Line Height' },
      { property: 'letter-spacing', type: 'integer', units: ['px', 'em'], label: 'Letter Spacing' },
      { property: 'color', type: 'color', label: 'Color' },
      {
        property: 'text-align', type: 'radio', label: 'Align',
        options: [
          { value: 'left', name: 'Left' }, { value: 'center', name: 'Center' },
          { value: 'right', name: 'Right' }, { value: 'justify', name: 'Justify' },
        ],
      },
      {
        property: 'text-decoration', type: 'select', label: 'Decoration',
        options: [
          { value: 'none', name: 'None' }, { value: 'underline', name: 'Underline' },
          { value: 'line-through', name: 'Strikethrough' },
        ],
      },
    ],
  },
  {
    name: 'Background',
    open: false,
    properties: [
      { property: 'background-color', type: 'color', label: 'Background Color' },
      { property: 'background-image', type: 'file', label: 'Background Image' },
      {
        property: 'background-size', type: 'select', label: 'BG Size',
        options: [
          { value: 'auto', name: 'Auto' }, { value: 'cover', name: 'Cover' },
          { value: 'contain', name: 'Contain' },
        ],
      },
      {
        property: 'background-position', type: 'select', label: 'BG Position',
        options: [
          { value: 'center center', name: 'Center' }, { value: 'top center', name: 'Top' },
          { value: 'bottom center', name: 'Bottom' },
        ],
      },
    ],
  },
  {
    name: 'Border',
    open: false,
    properties: [
      { property: 'border-radius', type: 'integer', units: ['px', '%'], label: 'Radius' },
      { property: 'border-width', type: 'integer', units: ['px'], label: 'Width' },
      {
        property: 'border-style', type: 'select', label: 'Style',
        options: [
          { value: 'none', name: 'None' }, { value: 'solid', name: 'Solid' },
          { value: 'dashed', name: 'Dashed' }, { value: 'dotted', name: 'Dotted' },
        ],
      },
      { property: 'border-color', type: 'color', label: 'Color' },
      { property: 'box-shadow', type: 'shadow', label: 'Shadow' },
    ],
  },
  {
    name: 'Extra',
    open: false,
    properties: [
      { property: 'opacity', type: 'slider', min: 0, max: 1, step: 0.01, label: 'Opacity' },
      {
        property: 'overflow', type: 'select', label: 'Overflow',
        options: [
          { value: 'visible', name: 'Visible' }, { value: 'hidden', name: 'Hidden' },
          { value: 'auto', name: 'Auto' }, { value: 'scroll', name: 'Scroll' },
        ],
      },
      {
        property: 'display', type: 'select', label: 'Display',
        options: [
          { value: 'block', name: 'Block' }, { value: 'flex', name: 'Flex' },
          { value: 'grid', name: 'Grid' }, { value: 'inline-block', name: 'Inline Block' },
          { value: 'none', name: 'None' },
        ],
      },
      {
        property: 'flex-direction', type: 'select', label: 'Flex Dir.',
        options: [
          { value: 'row', name: 'Row' }, { value: 'column', name: 'Column' },
          { value: 'row-reverse', name: 'Row Reverse' },
        ],
      },
      {
        property: 'align-items', type: 'select', label: 'Align Items',
        options: [
          { value: 'stretch', name: 'Stretch' }, { value: 'flex-start', name: 'Start' },
          { value: 'center', name: 'Center' }, { value: 'flex-end', name: 'End' },
        ],
      },
      {
        property: 'justify-content', type: 'select', label: 'Justify',
        options: [
          { value: 'flex-start', name: 'Start' }, { value: 'center', name: 'Center' },
          { value: 'flex-end', name: 'End' }, { value: 'space-between', name: 'Space Between' },
          { value: 'space-around', name: 'Space Around' },
        ],
      },
    ],
  },
];

/* ─── Editor Component ──────────────────────────────────────── */
const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasRef  = useRef(null);
  const gjsRef     = useRef(null);

  const blocksRef  = useRef(null);
  const layersRef  = useRef(null);
  const stylesRef  = useRef(null);
  const traitsRef  = useRef(null);

  const [page, setPage]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [published, setPublished] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [leftTab, setLeftTab] = useState('blocks');  // blocks | layers
  const [rightTab, setRightTab] = useState('styles'); // styles | traits
  const [device, setDevice]   = useState('desktop');

  /* ── Load page ── */
  useEffect(() => {
    axios.get(`/api/pages/${id}`)
      .then(({ data }) => { setPage(data); setPublished(data.published); })
      .catch(() => { alert('Failed to load page'); navigate('/admin/pages'); });
  }, [id, navigate]);

  /* ── Load assets from upload API ── */
  const loadAssets = async () => {
    try {
      const { data } = await axios.get('/api/upload');
      return data
        .filter(f => f.mimetype?.startsWith('image/'))
        .map(f => ({ src: f.url, name: f.originalName, type: 'image' }));
    } catch { return []; }
  };

  /* ── Init GrapesJS ── */
  useEffect(() => {
    if (!page || gjsRef.current) return;

    (async () => {
      const assets = await loadAssets();

      const editor = grapesjs.init({
        container: canvasRef.current,
        height: '100%',
        width: 'auto',
        storageManager: false,
        undoManager: { trackChanges: true },

        /* Devices */
        deviceManager: {
          devices: [
            { id: 'desktop', name: 'Desktop', width: '' },
            { id: 'tablet',  name: 'Tablet',  width: '768px', widthMedia: '992px' },
            { id: 'mobile',  name: 'Mobile',  width: '375px', widthMedia: '480px' },
          ],
        },

        /* Asset manager — images from upload section */
        assetManager: {
          assets,
          upload: false,
          addBtnText: 'Upload Image',
          noAssets: 'No images. Upload some in the Upload section.',
        },

        /* Panels — all disabled, we render our own UI */
        panels: { defaults: [] },

        /* Layers */
        layerManager: { appendTo: layersRef.current },

        /* Traits */
        traitManager: { appendTo: traitsRef.current },

        /* Style manager */
        styleManager: {
          appendTo: stylesRef.current,
          sectors: STYLE_SECTORS,
        },

        /* Block manager */
        blockManager: {
          appendTo: blocksRef.current,
          blocks: BLOCKS,
        },

        /* Canvas styles for preview */
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
          ],
        },
      });

      /* Load saved content */
      if (page.gjsComponents?.length) {
        editor.setComponents(page.gjsComponents);
        editor.setStyle(page.gjsStyles || []);
      } else if (page.gjsHtml) {
        editor.setComponents(page.gjsHtml);
        editor.setStyle(page.gjsCss || '');
      }

      /* Sync device button */
      editor.on('change:device', () => setDevice(editor.getDevice()));

      gjsRef.current = editor;
    })();

    return () => {
      if (gjsRef.current) { gjsRef.current.destroy(); gjsRef.current = null; }
    };
  }, [page]);

  /* ── Device switch ── */
  const switchDevice = (d) => {
    gjsRef.current?.setDevice(d);
    setDevice(d);
  };

  /* ── Save / Publish ── */
  const handleSave = async (togglePublish = null) => {
    const editor = gjsRef.current;
    if (!editor) return;
    setSaving(true); setSaveMsg('');
    try {
      const payload = {
        gjsHtml: editor.getHtml(),
        gjsCss:  editor.getCss(),
        gjsComponents: editor.getComponents(),
        gjsStyles:     editor.getStyle(),
      };
      if (togglePublish !== null) { payload.published = togglePublish; setPublished(togglePublish); }
      await axios.put(`/api/pages/${id}`, payload);
      setSaveMsg(togglePublish ? '✅ Published!' : togglePublish === false ? '✅ Unpublished' : '✅ Saved');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch { setSaveMsg('❌ Failed'); }
    finally { setSaving(false); }
  };

  /* ── Undo / Redo ── */
  const undo = () => gjsRef.current?.UndoManager.undo();
  const redo = () => gjsRef.current?.UndoManager.redo();

  return (
    <div style={s.shell}>

      {/* ── TOP TOOLBAR ── */}
      <div style={s.toolbar}>
        <div style={s.toolbarLeft}>
          <span style={s.logo} onClick={() => navigate('/')}>Janbahal</span>
          <button style={s.backBtn} onClick={() => navigate('/admin/pages')}>← Pages</button>
          <span style={s.pageTitle}>{page?.title || '...'}</span>
        </div>

        {/* Device switcher */}
        <div style={s.devices}>
          {[
            { id: 'desktop', icon: '🖥' },
            { id: 'tablet',  icon: '📱' },
            { id: 'mobile',  icon: '📲' },
          ].map(d => (
            <button
              key={d.id}
              style={{ ...s.deviceBtn, ...(device === d.id ? s.deviceBtnActive : {}) }}
              onClick={() => switchDevice(d.id)}
              title={d.id}
            >
              {d.icon}
            </button>
          ))}
        </div>

        <div style={s.toolbarRight}>
          <button style={s.iconBtn} onClick={undo} title="Undo">↩</button>
          <button style={s.iconBtn} onClick={redo} title="Redo">↪</button>
          {saveMsg && <span style={s.saveMsg}>{saveMsg}</span>}
          <button style={s.saveBtn}  onClick={() => handleSave()} disabled={saving}>
            {saving ? '...' : '💾 Save'}
          </button>
          <button
            style={{ ...s.publishBtn, background: published ? '#374151' : '#4f46e5' }}
            onClick={() => handleSave(!published)} disabled={saving}
          >
            {published ? '⬇ Unpublish' : '🚀 Publish'}
          </button>
        </div>
      </div>

      {/* ── EDITOR BODY ── */}
      <div style={s.body}>

        {/* LEFT PANEL */}
        <div style={s.leftPanel}>
          <div style={s.tabs}>
            {[['blocks','🧩 Blocks'], ['layers','🗂 Layers']].map(([k, label]) => (
              <button key={k} style={{ ...s.tab, ...(leftTab === k ? s.tabActive : {}) }}
                onClick={() => setLeftTab(k)}>{label}</button>
            ))}
          </div>
          <div style={{ display: leftTab === 'blocks' ? 'block' : 'none', flex: 1, overflow: 'auto' }}>
            <div ref={blocksRef} style={s.blocksContainer} />
          </div>
          <div style={{ display: leftTab === 'layers' ? 'block' : 'none', flex: 1, overflow: 'auto' }}>
            <div ref={layersRef} style={s.layersContainer} />
          </div>
        </div>

        {/* CANVAS */}
        <div ref={canvasRef} style={s.canvas} />

        {/* RIGHT PANEL */}
        <div style={s.rightPanel}>
          <div style={s.tabs}>
            {[['styles','🎨 Style'], ['traits','⚙️ Attributes']].map(([k, label]) => (
              <button key={k} style={{ ...s.tab, ...(rightTab === k ? s.tabActive : {}) }}
                onClick={() => setRightTab(k)}>{label}</button>
            ))}
          </div>
          <div style={{ display: rightTab === 'styles' ? 'block' : 'none', flex: 1, overflow: 'auto' }}>
            <div ref={stylesRef} style={s.stylesContainer} />
          </div>
          <div style={{ display: rightTab === 'traits' ? 'block' : 'none', flex: 1, overflow: 'auto' }}>
            <div ref={traitsRef} style={s.traitsContainer} />
          </div>
        </div>

      </div>
    </div>
  );
};

/* ─── Styles ─────────────────────────────────────────────────── */
const s = {
  shell: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' },

  toolbar: {
    height: '52px', background: '#1e293b', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 0.75rem', gap: '0.75rem', flexShrink: 0, zIndex: 10,
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 },
  logo: { color: '#4f46e5', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', flexShrink: 0 },
  backBtn: { padding: '0.3rem 0.75rem', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 },
  pageTitle: { color: '#f1f5f9', fontWeight: '600', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  devices: { display: 'flex', gap: '2px', background: '#0f172a', padding: '3px', borderRadius: '8px' },
  deviceBtn: { padding: '0.3rem 0.6rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '5px', opacity: 0.5 },
  deviceBtnActive: { background: '#334155', opacity: 1 },

  toolbarRight: { display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' },
  iconBtn: { padding: '0.3rem 0.6rem', background: '#334155', color: '#94a3b8', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem' },
  saveMsg: { color: '#94a3b8', fontSize: '0.8rem' },
  saveBtn: { padding: '0.35rem 0.9rem', background: '#334155', color: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem' },
  publishBtn: { padding: '0.35rem 0.9rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.82rem', color: '#fff' },

  body: { display: 'flex', flex: 1, overflow: 'hidden' },

  leftPanel: { width: '220px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' },
  rightPanel: { width: '260px', background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' },

  tabs: { display: 'flex', borderBottom: '1px solid #e2e8f0', flexShrink: 0 },
  tab: { flex: 1, padding: '0.55rem 0.25rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' },
  tabActive: { color: '#4f46e5', borderBottom: '2px solid #4f46e5' },

  blocksContainer: { padding: '4px' },
  layersContainer: { padding: '4px' },
  stylesContainer: { padding: '4px' },
  traitsContainer: { padding: '8px' },

  canvas: { flex: 1, overflow: 'hidden' },
};

export default Editor;
