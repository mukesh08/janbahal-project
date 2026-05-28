import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './Editor.css';
import axios from 'axios';

/* ─── Blocks ──────────────────────────────────────────────── */
const BLOCKS = [
  { id: 'section', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">⬛</span><span>Section</span></div>`,
    content: `<section style="padding:60px 20px;min-height:80px;width:100%;box-sizing:border-box;"></section>` },
  { id: 'row', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">⬜</span><span>Row</span></div>`,
    content: `<div style="display:flex;flex-wrap:wrap;gap:16px;width:100%;box-sizing:border-box;padding:10px;min-height:40px;"></div>` },
  { id: 'col-1', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">▬</span><span>Column</span></div>`,
    content: `<div style="flex:1;min-width:120px;padding:16px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div>` },
  { id: 'col-2', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">▬▬</span><span>2 Cols</span></div>`,
    content: `<div style="display:flex;flex-wrap:wrap;gap:12px;"><div style="flex:1;min-width:200px;padding:16px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div><div style="flex:1;min-width:200px;padding:16px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div></div>` },
  { id: 'col-3', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">▬▬▬</span><span>3 Cols</span></div>`,
    content: `<div style="display:flex;flex-wrap:wrap;gap:12px;"><div style="flex:1;min-width:150px;padding:16px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div><div style="flex:1;min-width:150px;padding:16px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div><div style="flex:1;min-width:150px;padding:16px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div></div>` },
  { id: 'col-4', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">▬▬▬▬</span><span>4 Cols</span></div>`,
    content: `<div style="display:flex;flex-wrap:wrap;gap:12px;"><div style="flex:1;min-width:120px;padding:12px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div><div style="flex:1;min-width:120px;padding:12px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div><div style="flex:1;min-width:120px;padding:12px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div><div style="flex:1;min-width:120px;padding:12px;box-sizing:border-box;min-height:60px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;"></div></div>` },
  { id: 'text', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">¶</span><span>Text</span></div>`,
    content: `<p style="font-size:1rem;line-height:1.7;color:#333;margin:0;">Your text goes here. Click to edit.</p>` },
  { id: 'h1', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">H1</span><span>Heading 1</span></div>`,
    content: `<h1 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin:0 0 1rem;">Main Heading</h1>` },
  { id: 'h2', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">H2</span><span>Heading 2</span></div>`,
    content: `<h2 style="font-size:1.8rem;font-weight:700;color:#1e293b;margin:0 0 0.75rem;">Sub Heading</h2>` },
  { id: 'h3', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">H3</span><span>Heading 3</span></div>`,
    content: `<h3 style="font-size:1.3rem;font-weight:700;color:#334155;margin:0 0 0.5rem;">Section Title</h3>` },
  { id: 'image', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">🖼</span><span>Image</span></div>`,
    content: { type: 'image' }, activate: true },
  { id: 'button', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">▶</span><span>Button</span></div>`,
    content: `<a href="#" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem;">Click Me</a>` },
  { id: 'list', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">≡</span><span>List</span></div>`,
    content: `<ul style="padding-left:1.5rem;line-height:2;color:#334155;margin:0;"><li>First item</li><li>Second item</li><li>Third item</li></ul>` },
  { id: 'divider', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">─</span><span>Divider</span></div>`,
    content: `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />` },
  { id: 'spacer', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">↕</span><span>Spacer</span></div>`,
    content: `<div style="height:60px;width:100%;"></div>` },
  { id: 'hero', category: 'Sections',
    label: `<div class="blk-wrap"><span class="blk-ico">★</span><span>Hero</span></div>`,
    content: `<section style="padding:80px 40px;text-align:center;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;"><h1 style="font-size:3rem;font-weight:800;margin:0 0 1rem;">Welcome to Our Site</h1><p style="font-size:1.2rem;margin:0 auto 2rem;max-width:600px;opacity:0.9;">A short description of your product.</p><a href="#" style="display:inline-block;padding:14px 32px;background:#fff;color:#4f46e5;border-radius:8px;text-decoration:none;font-weight:700;">Get Started</a></section>` },
  { id: 'features', category: 'Sections',
    label: `<div class="blk-wrap"><span class="blk-ico">⊞</span><span>Features</span></div>`,
    content: `<section style="padding:60px 40px;background:#f8fafc;"><h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0f172a;margin:0 0 2.5rem;">Our Features</h2><div style="display:flex;gap:24px;flex-wrap:wrap;max-width:1100px;margin:0 auto;"><div style="flex:1;min-width:200px;background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;"><div style="font-size:2rem;margin-bottom:12px;">⚡</div><h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Feature One</h3><p style="color:#64748b;font-size:0.9rem;margin:0;">Describe your first feature here.</p></div><div style="flex:1;min-width:200px;background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;"><div style="font-size:2rem;margin-bottom:12px;">🔒</div><h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Feature Two</h3><p style="color:#64748b;font-size:0.9rem;margin:0;">Describe your second feature here.</p></div></div></section>` },
  { id: 'cta', category: 'Sections',
    label: `<div class="blk-wrap"><span class="blk-ico">📢</span><span>CTA</span></div>`,
    content: `<section style="padding:60px 40px;text-align:center;background:#1e293b;color:#fff;"><h2 style="font-size:2rem;font-weight:800;margin:0 0 1rem;">Ready to get started?</h2><p style="margin:0 0 2rem;opacity:0.75;font-size:1.05rem;">Join thousands of users today.</p><a href="#" style="display:inline-block;padding:14px 32px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Start Now</a></section>` },
];

/* ─── Style sectors — use { value, name } for GrapesJS 0.21+ ─ */
const SECTORS = [
  {
    name: 'Spacing', open: true,
    properties: [
      { name: 'Padding', property: 'padding', type: 'composite', detached: true,
        properties: [
          { name: 'Top',    property: 'padding-top',    type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Right',  property: 'padding-right',  type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Bottom', property: 'padding-bottom', type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Left',   property: 'padding-left',   type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
        ] },
      { name: 'Margin', property: 'margin', type: 'composite', detached: true,
        properties: [
          { name: 'Top',    property: 'margin-top',    type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Right',  property: 'margin-right',  type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Bottom', property: 'margin-bottom', type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Left',   property: 'margin-left',   type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
        ] },
    ],
  },
  {
    name: 'Size', open: false,
    properties: [
      { name: 'Width',      property: 'width',      type: 'integer', units: ['px','%','vw','auto'] },
      { name: 'Height',     property: 'height',     type: 'integer', units: ['px','%','vh','auto'] },
      { name: 'Min Height', property: 'min-height', type: 'integer', units: ['px','%','vh'] },
      { name: 'Max Width',  property: 'max-width',  type: 'integer', units: ['px','%'] },
    ],
  },
  {
    name: 'Typography', open: false,
    properties: [
      { name: 'Color',          property: 'color',          type: 'color' },
      { name: 'Font Size',      property: 'font-size',      type: 'integer', units: ['px','rem','em','%'] },
      { name: 'Font Weight',    property: 'font-weight',    type: 'select',
        options: [
          { value: '300', name: 'Light' }, { value: '400', name: 'Normal' },
          { value: '500', name: 'Medium' }, { value: '600', name: 'Semi Bold' },
          { value: '700', name: 'Bold' }, { value: '800', name: 'Extra Bold' },
        ] },
      { name: 'Line Height',    property: 'line-height',    type: 'integer', units: ['','px','em'] },
      { name: 'Letter Spacing', property: 'letter-spacing', type: 'integer', units: ['px','em'] },
      { name: 'Text Align',     property: 'text-align',     type: 'radio',
        options: [
          { value: 'left', name: '← Left' }, { value: 'center', name: '↔ Center' },
          { value: 'right', name: '→ Right' },
        ] },
      { name: 'Text Decoration', property: 'text-decoration', type: 'select',
        options: [
          { value: 'none', name: 'None' }, { value: 'underline', name: 'Underline' },
          { value: 'line-through', name: 'Line Through' },
        ] },
      { name: 'Font Family', property: 'font-family', type: 'select',
        options: [
          { value: "'Poppins', sans-serif", name: 'Poppins' },
          { value: 'inherit', name: 'Default' },
          { value: 'system-ui, sans-serif', name: 'System UI' },
          { value: 'Georgia, serif', name: 'Georgia' },
          { value: '"Courier New", monospace', name: 'Courier New' },
        ] },
    ],
  },
  {
    name: 'Background', open: true,
    properties: [
      { name: 'Background Color',    property: 'background-color', type: 'color' },
      { name: 'Background Image',    property: 'background-image', type: 'file', functionName: 'url', full: true },
      { name: 'BG Size',     property: 'background-size',     type: 'select',
        options: [{ value: 'auto', name: 'Auto' }, { value: 'cover', name: 'Cover' }, { value: 'contain', name: 'Contain' }] },
      { name: 'BG Repeat',   property: 'background-repeat',   type: 'select',
        options: [{ value: 'no-repeat', name: 'No Repeat' }, { value: 'repeat', name: 'Repeat' }, { value: 'repeat-x', name: 'Repeat X' }, { value: 'repeat-y', name: 'Repeat Y' }] },
      { name: 'BG Position', property: 'background-position', type: 'select',
        options: [{ value: 'center center', name: 'Center' }, { value: 'top center', name: 'Top' }, { value: 'bottom center', name: 'Bottom' }, { value: 'left center', name: 'Left' }, { value: 'right center', name: 'Right' }] },
    ],
  },
  {
    name: 'Border', open: false,
    properties: [
      { name: 'Border Radius', property: 'border-radius', type: 'integer', units: ['px','%'] },
      { name: 'Border Width',  property: 'border-width',  type: 'integer', units: ['px'] },
      { name: 'Border Style',  property: 'border-style',  type: 'select',
        options: [{ value: 'none', name: 'None' }, { value: 'solid', name: 'Solid' }, { value: 'dashed', name: 'Dashed' }, { value: 'dotted', name: 'Dotted' }] },
      { name: 'Border Color',  property: 'border-color',  type: 'color' },
    ],
  },
  {
    name: 'Box Shadow', open: false,
    properties: [
      { name: 'Box Shadow', property: 'box-shadow', type: 'select',
        options: [
          { value: 'none',                                                              name: 'None' },
          { value: '0 1px 3px rgba(0,0,0,0.08)',                                       name: 'XS — subtle' },
          { value: '0 2px 8px rgba(0,0,0,0.10)',                                       name: 'SM — soft' },
          { value: '0 4px 16px rgba(0,0,0,0.12)',                                      name: 'MD — card' },
          { value: '0 8px 24px rgba(0,0,0,0.14)',                                      name: 'LG — elevated' },
          { value: '0 16px 48px rgba(0,0,0,0.18)',                                     name: 'XL — floating' },
          { value: '0 4px 16px rgba(79,70,229,0.25)',                                  name: 'Indigo glow' },
          { value: '0 4px 16px rgba(124,58,237,0.25)',                                 name: 'Purple glow' },
          { value: '0 4px 16px rgba(16,163,74,0.22)',                                  name: 'Green glow' },
          { value: 'inset 0 1px 3px rgba(0,0,0,0.10)',                                 name: 'Inset — pressed' },
        ],
      },
      { name: 'Shadow X',     property: 'box-shadow', type: 'integer', units: ['px'], defaults: '0' },
      { name: 'Shadow Y',     property: 'box-shadow', type: 'integer', units: ['px'], defaults: '4' },
      { name: 'Shadow Blur',  property: 'box-shadow', type: 'integer', units: ['px'], defaults: '12' },
      { name: 'Shadow Color', property: 'box-shadow', type: 'color' },
    ],
  },
  {
    name: 'Layout', open: false,
    properties: [
      { name: 'Display', property: 'display', type: 'select',
        options: [{ value: 'block', name: 'Block' }, { value: 'flex', name: 'Flex' }, { value: 'grid', name: 'Grid' }, { value: 'inline-block', name: 'Inline Block' }, { value: 'none', name: 'None' }] },
      { name: 'Flex Direction', property: 'flex-direction', type: 'select',
        options: [{ value: 'row', name: 'Row →' }, { value: 'column', name: 'Column ↓' }, { value: 'row-reverse', name: 'Row ←' }, { value: 'column-reverse', name: 'Column ↑' }] },
      { name: 'Align Items', property: 'align-items', type: 'select',
        options: [{ value: 'stretch', name: 'Stretch' }, { value: 'flex-start', name: 'Start' }, { value: 'center', name: 'Center' }, { value: 'flex-end', name: 'End' }] },
      { name: 'Justify Content', property: 'justify-content', type: 'select',
        options: [{ value: 'flex-start', name: 'Start' }, { value: 'center', name: 'Center' }, { value: 'flex-end', name: 'End' }, { value: 'space-between', name: 'Space Between' }, { value: 'space-around', name: 'Space Around' }] },
      { name: 'Gap', property: 'gap', type: 'integer', units: ['px','rem','em'] },
      { name: 'Overflow', property: 'overflow', type: 'select',
        options: [{ value: 'visible', name: 'Visible' }, { value: 'hidden', name: 'Hidden' }, { value: 'auto', name: 'Auto' }, { value: 'scroll', name: 'Scroll' }] },
      { name: 'Opacity', property: 'opacity', type: 'slider', min: 0, max: 1, step: 0.01 },
    ],
  },
];

/* ─── Editor ──────────────────────────────────────────────── */
const Editor = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const gjsRef   = useRef(null);

  const [page,        setPage]        = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [published,   setPublished]   = useState(false);
  const [saveMsg,     setSaveMsg]     = useState('');
  const [rightTab,    setRightTab]    = useState('styles');
  const [device,      setDevice]      = useState('desktop');
  // Live CSS preview
  const [selectedTag, setSelectedTag] = useState('');
  const [liveCSS,     setLiveCSS]     = useState('');

  /* ── fetch page ── */
  useEffect(() => {
    axios.get(`/api/pages/${id}`)
      .then(({ data }) => { setPage(data); setPublished(data.published); })
      .catch(() => { alert('Page not found'); navigate('/admin/pages'); });
  }, [id, navigate]);

  /* ── live CSS helper ── */
  const refreshCSS = useCallback((editor) => {
    const sel = editor.getSelected();
    if (!sel) { setSelectedTag(''); setLiveCSS(''); return; }
    const tag   = sel.get('tagName') || 'div';
    const style = sel.getStyle();
    const lines = Object.entries(style).map(([k, v]) => `  ${k}: ${v};`).join('\n');
    setSelectedTag(tag);
    setLiveCSS(lines ? `${tag} {\n${lines}\n}` : `/* select a property above to start styling */`);
  }, []);

  /* ── init GrapesJS ── */
  useEffect(() => {
    if (!page || gjsRef.current) return;

    axios.get('/api/upload')
      .then(({ data }) => init(data.filter(f => f.mimetype?.startsWith('image/'))))
      .catch(() => init([]));

    function init(uploads) {
      // Clear mount targets so GrapesJS doesn't double-append on StrictMode re-mount
      ['gjs-blocks', 'gjs-styles', 'gjs-layers', 'gjs-traits'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });

      const assets = uploads.map(f => ({ src: f.url, name: f.originalName, type: 'image' }));

      const editor = grapesjs.init({
        container:      document.getElementById('gjs-canvas'),
        height:         '100%',
        width:          'auto',
        storageManager: false,
        undoManager:    { trackChanges: true },
        panels:         { defaults: [] },

        deviceManager: {
          devices: [
            { id: 'desktop', name: 'Desktop', width: ''      },
            { id: 'tablet',  name: 'Tablet',  width: '768px', widthMedia: '992px' },
            { id: 'mobile',  name: 'Mobile',  width: '375px', widthMedia: '480px' },
          ],
        },

        assetManager: { assets, upload: false },

        blockManager: {
          appendTo: document.getElementById('gjs-blocks'),
          blocks: BLOCKS,
        },

        styleManager: {
          appendTo: document.getElementById('gjs-styles'),
          sectors:  SECTORS,
        },

        layerManager: { appendTo: document.getElementById('gjs-layers') },
        traitManager: { appendTo: document.getElementById('gjs-traits') },

        canvas: {
          styles: ['https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'],
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

      /* Live CSS events */
      editor.on('component:selected',  () => refreshCSS(editor));
      editor.on('component:deselected',() => { setSelectedTag(''); setLiveCSS(''); });
      editor.on('style:change',        () => refreshCSS(editor));

      editor.on('change:device', () => setDevice(editor.getDevice()));

      gjsRef.current = editor;
    }

    return () => {
      if (gjsRef.current) { gjsRef.current.destroy(); gjsRef.current = null; }
    };
  }, [page, refreshCSS]);

  const switchDevice = (d) => { gjsRef.current?.setDevice(d); setDevice(d); };

  const handleSave = async (togglePublish = null) => {
    const editor = gjsRef.current;
    if (!editor) return;
    setSaving(true); setSaveMsg('');
    try {
      const payload = {
        gjsHtml:       editor.getHtml(),
        gjsCss:        editor.getCss(),
        gjsComponents: editor.getComponents(),
        gjsStyles:     editor.getStyle(),
      };
      if (togglePublish !== null) { payload.published = togglePublish; setPublished(togglePublish); }
      await axios.put(`/api/pages/${id}`, payload);
      setSaveMsg(togglePublish === true ? '✅ Published!' : togglePublish === false ? '✅ Unpublished' : '✅ Saved');
      setTimeout(() => setSaveMsg(''), 2500);
    } catch { setSaveMsg('❌ Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="editor-shell">

      {/* ── TOOLBAR ── */}
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <div className="editor-logo" onClick={() => navigate('/')}>N</div>
          <button className="editor-back-btn" onClick={() => navigate('/admin/pages')}>← Pages</button>
          <span className="editor-page-title">{page?.title || '...'}</span>
        </div>

        <div className="editor-devices">
          {[{ id:'desktop', icon:'🖥', label:'Desktop' }, { id:'tablet', icon:'📱', label:'Tablet' }, { id:'mobile', icon:'📲', label:'Mobile' }]
            .map(d => (
              <button key={d.id} className={`editor-device-btn ${device === d.id ? 'active' : ''}`}
                onClick={() => switchDevice(d.id)} title={d.label}>
                {d.icon} <span className="device-label">{d.label}</span>
              </button>
            ))}
        </div>

        <div className="editor-toolbar-right">
          <button className="editor-icon-btn" onClick={() => gjsRef.current?.UndoManager.undo()}>↩ Undo</button>
          <button className="editor-icon-btn" onClick={() => gjsRef.current?.UndoManager.redo()}>↪ Redo</button>
          {saveMsg && <span className="editor-save-msg">{saveMsg}</span>}
          <button className="editor-save-btn" onClick={() => handleSave()} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save'}
          </button>
          <button className={`editor-publish-btn ${published ? 'unpublish' : 'publish'}`}
            onClick={() => handleSave(!published)} disabled={saving}>
            {published ? '⬇ Unpublish' : '🚀 Publish'}
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="editor-body">

        {/* LEFT — Blocks */}
        <div className="editor-left">
          <div className="side-card blocks-card">
            <div className="side-card-title">Blocks</div>
            <div id="gjs-blocks" className="gjs-blocks-wrap" />
          </div>
        </div>

        {/* CENTER — Canvas */}
        <div className="editor-center">
          <div id="gjs-canvas" className="gjs-canvas-wrap" />
        </div>

        {/* RIGHT — panels always in DOM, tabs switch visibility */}
        <div className="editor-right">

          {/* Tab pill bar */}
          <div className="right-tab-bar">
            {[
              ['styles',  '🎨', 'Style'],
              ['layers',  '🗂', 'Layers'],
              ['traits',  '⚙',  'Attrs'],
              ['css',     '<>', 'CSS'],
            ].map(([k, icon, label]) => (
              <button key={k}
                className={`right-tab ${rightTab === k ? 'active' : ''}`}
                onClick={() => setRightTab(k)}
              >
                <span className="rt-icon">{icon}</span>
                <span className="rt-label">{label}</span>
              </button>
            ))}
          </div>

          {/* All panels always mounted — visibility-toggled */}
          <div className="right-panels-wrap">

            {/* Style — GrapesJS renders sectors, each styled as a card */}
            <div className={`panel-pane ${rightTab === 'styles' ? 'active' : ''}`}>
              <div id="gjs-styles" />
            </div>

            {/* Layers */}
            <div className={`panel-pane ${rightTab === 'layers' ? 'active' : ''}`}>
              <div className="side-card">
                <div className="side-card-title">Page Layers</div>
                <div id="gjs-layers" />
              </div>
            </div>

            {/* Traits / Attrs */}
            <div className={`panel-pane ${rightTab === 'traits' ? 'active' : ''}`}>
              <div className="side-card">
                <div className="side-card-title">Element Attributes</div>
                <div id="gjs-traits" />
              </div>
            </div>

            {/* Live CSS */}
            <div className={`panel-pane ${rightTab === 'css' ? 'active' : ''}`}>
              <div className="side-card">
                <div className="side-card-title">
                  {selectedTag ? <><span className="css-tag-inline">&lt;{selectedTag}&gt;</span> Live CSS</> : 'Live CSS Output'}
                </div>
                <div className="css-panel">
                  {selectedTag
                    ? <pre className="css-code">{liveCSS || '/* no styles yet */'}</pre>
                    : <div className="css-empty">
                        <span className="css-empty-icon">👆</span>
                        <p>Click any element on the canvas</p>
                      </div>
                  }
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Editor;
