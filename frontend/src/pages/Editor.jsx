import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import './Editor.css';
import axios from 'axios';

/* ─── Blocks ──────────────────────────────────────────────── */
const BLOCKS = [
  // ── Layout ──
  {
    id: 'section', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">⬛</span><span>Section</span></div>`,
    content: `<section data-gjs-type="default" style="padding:60px 20px;min-height:80px;width:100%;box-sizing:border-box;"></section>`,
  },
  {
    id: 'row', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">⬜</span><span>Row</span></div>`,
    content: `<div data-gjs-type="default" style="display:flex;flex-wrap:wrap;gap:16px;width:100%;box-sizing:border-box;padding:10px;"></div>`,
  },
  {
    id: 'col-1', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">▬</span><span>Column</span></div>`,
    content: `<div data-gjs-type="default" style="flex:1;min-width:120px;padding:16px;box-sizing:border-box;"></div>`,
  },
  {
    id: 'col-2', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">▬▬</span><span>2 Cols</span></div>`,
    content: `<div data-gjs-type="default" style="display:flex;flex-wrap:wrap;gap:16px;">
      <div style="flex:1;min-width:200px;padding:16px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:200px;padding:16px;box-sizing:border-box;"></div>
    </div>`,
  },
  {
    id: 'col-3', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">▬▬▬</span><span>3 Cols</span></div>`,
    content: `<div data-gjs-type="default" style="display:flex;flex-wrap:wrap;gap:16px;">
      <div style="flex:1;min-width:150px;padding:16px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:150px;padding:16px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:150px;padding:16px;box-sizing:border-box;"></div>
    </div>`,
  },
  {
    id: 'col-4', category: 'Layout',
    label: `<div class="blk-wrap"><span class="blk-ico">▬▬▬▬</span><span>4 Cols</span></div>`,
    content: `<div data-gjs-type="default" style="display:flex;flex-wrap:wrap;gap:12px;">
      <div style="flex:1;min-width:120px;padding:12px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:120px;padding:12px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:120px;padding:12px;box-sizing:border-box;"></div>
      <div style="flex:1;min-width:120px;padding:12px;box-sizing:border-box;"></div>
    </div>`,
  },

  // ── Content ──
  {
    id: 'text', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">¶</span><span>Text</span></div>`,
    content: `<p style="font-size:1rem;line-height:1.7;color:#333;margin:0;">Your text goes here. Click to edit.</p>`,
  },
  {
    id: 'h1', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">H1</span><span>Heading 1</span></div>`,
    content: `<h1 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin:0 0 1rem;">Main Heading</h1>`,
  },
  {
    id: 'h2', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">H2</span><span>Heading 2</span></div>`,
    content: `<h2 style="font-size:1.8rem;font-weight:700;color:#1e293b;margin:0 0 0.75rem;">Sub Heading</h2>`,
  },
  {
    id: 'h3', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">H3</span><span>Heading 3</span></div>`,
    content: `<h3 style="font-size:1.3rem;font-weight:700;color:#334155;margin:0 0 0.5rem;">Section Title</h3>`,
  },
  {
    id: 'image', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">🖼</span><span>Image</span></div>`,
    content: { type: 'image' },
    activate: true,
  },
  {
    id: 'button', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">▶</span><span>Button</span></div>`,
    content: `<a href="#" style="display:inline-block;padding:12px 28px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:1rem;">Click Me</a>`,
  },
  {
    id: 'list', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">≡</span><span>List</span></div>`,
    content: `<ul style="padding-left:1.5rem;line-height:2;color:#334155;margin:0;"><li>First item</li><li>Second item</li><li>Third item</li></ul>`,
  },
  {
    id: 'divider', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">─</span><span>Divider</span></div>`,
    content: `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`,
  },
  {
    id: 'spacer', category: 'Content',
    label: `<div class="blk-wrap"><span class="blk-ico">↕</span><span>Spacer</span></div>`,
    content: `<div style="height:60px;width:100%;"></div>`,
  },

  // ── Sections ──
  {
    id: 'hero', category: 'Sections',
    label: `<div class="blk-wrap"><span class="blk-ico">★</span><span>Hero</span></div>`,
    content: `<section style="padding:80px 40px;text-align:center;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;">
      <h1 style="font-size:3rem;font-weight:800;margin:0 0 1rem;">Welcome to Our Site</h1>
      <p style="font-size:1.2rem;margin:0 auto 2rem;max-width:600px;opacity:0.9;">A short description of your product or service.</p>
      <a href="#" style="display:inline-block;padding:14px 32px;background:#fff;color:#4f46e5;border-radius:8px;text-decoration:none;font-weight:700;">Get Started</a>
    </section>`,
  },
  {
    id: 'features', category: 'Sections',
    label: `<div class="blk-wrap"><span class="blk-ico">⊞</span><span>Features</span></div>`,
    content: `<section style="padding:60px 40px;background:#f8fafc;">
      <h2 style="text-align:center;font-size:2rem;font-weight:800;color:#0f172a;margin:0 0 2.5rem;">Our Features</h2>
      <div style="display:flex;gap:24px;flex-wrap:wrap;max-width:1100px;margin:0 auto;">
        <div style="flex:1;min-width:200px;background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;">
          <div style="font-size:2rem;margin-bottom:12px;">⚡</div>
          <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Feature One</h3>
          <p style="color:#64748b;font-size:0.9rem;margin:0;">Describe your first feature here.</p>
        </div>
        <div style="flex:1;min-width:200px;background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;">
          <div style="font-size:2rem;margin-bottom:12px;">🔒</div>
          <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Feature Two</h3>
          <p style="color:#64748b;font-size:0.9rem;margin:0;">Describe your second feature here.</p>
        </div>
        <div style="flex:1;min-width:200px;background:#fff;border-radius:12px;padding:24px;text-align:center;border:1px solid #e2e8f0;">
          <div style="font-size:2rem;margin-bottom:12px;">🎯</div>
          <h3 style="font-size:1.1rem;font-weight:700;margin:0 0 8px;color:#1e293b;">Feature Three</h3>
          <p style="color:#64748b;font-size:0.9rem;margin:0;">Describe your third feature here.</p>
        </div>
      </div>
    </section>`,
  },
  {
    id: 'cta', category: 'Sections',
    label: `<div class="blk-wrap"><span class="blk-ico">📢</span><span>CTA</span></div>`,
    content: `<section style="padding:60px 40px;text-align:center;background:#1e293b;color:#fff;">
      <h2 style="font-size:2rem;font-weight:800;margin:0 0 1rem;">Ready to get started?</h2>
      <p style="margin:0 0 2rem;opacity:0.75;font-size:1.05rem;">Join thousands of users today.</p>
      <a href="#" style="display:inline-block;padding:14px 32px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Start Now</a>
    </section>`,
  },
];

/* ─── Style sectors ───────────────────────────────────────── */
const SECTORS = [
  {
    name: 'Spacing',
    open: true,
    properties: [
      {
        name: 'Padding', property: 'padding', type: 'composite', detached: true,
        properties: [
          { name: 'Top',    property: 'padding-top',    type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Right',  property: 'padding-right',  type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Bottom', property: 'padding-bottom', type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
          { name: 'Left',   property: 'padding-left',   type: 'integer', units: ['px','%','em','rem'], defaults: '0' },
        ],
      },
      {
        name: 'Margin', property: 'margin', type: 'composite', detached: true,
        properties: [
          { name: 'Top',    property: 'margin-top',    type: 'integer', units: ['px','%','em','rem','auto'], defaults: '0' },
          { name: 'Right',  property: 'margin-right',  type: 'integer', units: ['px','%','em','rem','auto'], defaults: '0' },
          { name: 'Bottom', property: 'margin-bottom', type: 'integer', units: ['px','%','em','rem','auto'], defaults: '0' },
          { name: 'Left',   property: 'margin-left',   type: 'integer', units: ['px','%','em','rem','auto'], defaults: '0' },
        ],
      },
    ],
  },
  {
    name: 'Size',
    open: false,
    properties: [
      { name: 'Width',      property: 'width',      type: 'integer', units: ['px','%','vw','auto'] },
      { name: 'Height',     property: 'height',     type: 'integer', units: ['px','%','vh','auto'] },
      { name: 'Min Height', property: 'min-height', type: 'integer', units: ['px','%','vh'] },
      { name: 'Max Width',  property: 'max-width',  type: 'integer', units: ['px','%'] },
    ],
  },
  {
    name: 'Typography',
    open: false,
    properties: [
      { name: 'Color',          property: 'color',          type: 'color' },
      { name: 'Font Size',      property: 'font-size',      type: 'integer', units: ['px','rem','em','%'] },
      {
        name: 'Font Weight', property: 'font-weight', type: 'select',
        options: [
          { id: '300', label: 'Light' }, { id: '400', label: 'Normal' },
          { id: '500', label: 'Medium' }, { id: '600', label: 'Semi Bold' },
          { id: '700', label: 'Bold' }, { id: '800', label: 'Extra Bold' },
        ],
      },
      { name: 'Line Height',   property: 'line-height',    type: 'integer', units: ['','px','em'] },
      { name: 'Letter Spacing',property: 'letter-spacing', type: 'integer', units: ['px','em'] },
      {
        name: 'Text Align', property: 'text-align', type: 'radio',
        options: [
          { id: 'left', label: '←' }, { id: 'center', label: '↔' },
          { id: 'right', label: '→' }, { id: 'justify', label: '≡' },
        ],
      },
      {
        name: 'Font Family', property: 'font-family', type: 'select',
        options: [
          { id: 'inherit', label: 'Default' },
          { id: 'system-ui, sans-serif', label: 'System UI' },
          { id: 'Georgia, serif', label: 'Georgia' },
          { id: '"Courier New", monospace', label: 'Courier New' },
        ],
      },
    ],
  },
  {
    name: 'Background',
    open: false,
    properties: [
      { name: 'Background Color', property: 'background-color', type: 'color' },
      { name: 'Background Image', property: 'background-image', type: 'file',
        functionName: 'url', full: true },
      {
        name: 'BG Size', property: 'background-size', type: 'select',
        options: [
          { id: 'auto', label: 'Auto' }, { id: 'cover', label: 'Cover' },
          { id: 'contain', label: 'Contain' },
        ],
      },
      {
        name: 'BG Repeat', property: 'background-repeat', type: 'select',
        options: [
          { id: 'no-repeat', label: 'No Repeat' }, { id: 'repeat', label: 'Repeat' },
          { id: 'repeat-x', label: 'Repeat X' }, { id: 'repeat-y', label: 'Repeat Y' },
        ],
      },
      {
        name: 'BG Position', property: 'background-position', type: 'select',
        options: [
          { id: 'center center', label: 'Center' }, { id: 'top center', label: 'Top' },
          { id: 'bottom center', label: 'Bottom' }, { id: 'left center', label: 'Left' },
          { id: 'right center', label: 'Right' },
        ],
      },
    ],
  },
  {
    name: 'Border',
    open: false,
    properties: [
      { name: 'Border Radius', property: 'border-radius', type: 'integer', units: ['px','%'] },
      { name: 'Border Width',  property: 'border-width',  type: 'integer', units: ['px'] },
      {
        name: 'Border Style', property: 'border-style', type: 'select',
        options: [
          { id: 'none', label: 'None' }, { id: 'solid', label: 'Solid' },
          { id: 'dashed', label: 'Dashed' }, { id: 'dotted', label: 'Dotted' },
        ],
      },
      { name: 'Border Color', property: 'border-color', type: 'color' },
    ],
  },
  {
    name: 'Layout',
    open: false,
    properties: [
      {
        name: 'Display', property: 'display', type: 'select',
        options: [
          { id: 'block', label: 'Block' }, { id: 'flex', label: 'Flex' },
          { id: 'grid', label: 'Grid' }, { id: 'inline-block', label: 'Inline Block' },
          { id: 'none', label: 'None' },
        ],
      },
      {
        name: 'Flex Direction', property: 'flex-direction', type: 'select',
        options: [
          { id: 'row', label: 'Row →' }, { id: 'column', label: 'Column ↓' },
          { id: 'row-reverse', label: 'Row ←' }, { id: 'column-reverse', label: 'Column ↑' },
        ],
      },
      {
        name: 'Align Items', property: 'align-items', type: 'select',
        options: [
          { id: 'stretch', label: 'Stretch' }, { id: 'flex-start', label: 'Start' },
          { id: 'center', label: 'Center' }, { id: 'flex-end', label: 'End' },
        ],
      },
      {
        name: 'Justify Content', property: 'justify-content', type: 'select',
        options: [
          { id: 'flex-start', label: 'Start' }, { id: 'center', label: 'Center' },
          { id: 'flex-end', label: 'End' }, { id: 'space-between', label: 'Space Between' },
          { id: 'space-around', label: 'Space Around' },
        ],
      },
      { name: 'Gap', property: 'gap', type: 'integer', units: ['px','rem','em'] },
      {
        name: 'Overflow', property: 'overflow', type: 'select',
        options: [
          { id: 'visible', label: 'Visible' }, { id: 'hidden', label: 'Hidden' },
          { id: 'auto', label: 'Auto' }, { id: 'scroll', label: 'Scroll' },
        ],
      },
      { name: 'Opacity', property: 'opacity', type: 'slider', min: 0, max: 1, step: 0.01 },
    ],
  },
];

/* ─── Editor ──────────────────────────────────────────────── */
const Editor = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const gjsRef   = useRef(null);

  const [page,      setPage]      = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [published, setPublished] = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');
  const [rightTab,  setRightTab]  = useState('styles');   // styles | layers | traits
  const [device,    setDevice]    = useState('desktop');

  /* ── fetch page ── */
  useEffect(() => {
    axios.get(`/api/pages/${id}`)
      .then(({ data }) => { setPage(data); setPublished(data.published); })
      .catch(() => { alert('Page not found'); navigate('/admin/pages'); });
  }, [id, navigate]);

  /* ── init GrapesJS after page loaded ── */
  useEffect(() => {
    if (!page || gjsRef.current) return;

    // Load uploaded images for asset manager
    axios.get('/api/upload')
      .then(({ data }) => initEditor(data.filter(f => f.mimetype?.startsWith('image/'))))
      .catch(() => initEditor([]));

    function initEditor(uploads) {
      const assets = uploads.map(f => ({ src: f.url, name: f.originalName, type: 'image' }));

      const editor = grapesjs.init({
        container: document.getElementById('gjs-canvas'),
        height: '100%',
        width: 'auto',
        storageManager: false,
        undoManager: { trackChanges: true },

        /* Disable built-in panels — we draw our own */
        panels: { defaults: [] },

        /* Device manager */
        deviceManager: {
          devices: [
            { id: 'desktop', name: 'Desktop',  width: '' },
            { id: 'tablet',  name: 'Tablet',   width: '768px', widthMedia: '992px' },
            { id: 'mobile',  name: 'Mobile',   width: '375px', widthMedia: '480px' },
          ],
        },

        /* Asset manager — shows uploaded images */
        assetManager: {
          assets,
          upload: false,
          noAssets: 'No images yet — upload via the Upload section.',
        },

        /* Blocks */
        blockManager: {
          appendTo: document.getElementById('gjs-blocks'),
          blocks: BLOCKS,
        },

        /* Style manager — right panel */
        styleManager: {
          appendTo: document.getElementById('gjs-styles'),
          sectors: SECTORS,
        },

        /* Layers — component tree */
        layerManager: {
          appendTo: document.getElementById('gjs-layers'),
        },

        /* Traits — attributes */
        traitManager: {
          appendTo: document.getElementById('gjs-traits'),
        },

        /* Canvas keeps the inter-element highlight */
        canvas: {
          styles: ['https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'],
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

      /* Sync device state */
      editor.on('change:device', () => setDevice(editor.getDevice()));

      gjsRef.current = editor;
    }

    return () => {
      if (gjsRef.current) { gjsRef.current.destroy(); gjsRef.current = null; }
    };
  }, [page]);

  /* ── device switch ── */
  const switchDevice = (d) => { gjsRef.current?.setDevice(d); setDevice(d); };

  /* ── save / publish ── */
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
          <span className="editor-logo" onClick={() => navigate('/')}>Janbahal</span>
          <button className="editor-back-btn" onClick={() => navigate('/admin/pages')}>← Pages</button>
          <span className="editor-page-title">{page?.title || '...'}</span>
        </div>

        {/* Responsive device switcher */}
        <div className="editor-devices">
          {[
            { id: 'desktop', icon: '🖥', label: 'Desktop' },
            { id: 'tablet',  icon: '📱', label: 'Tablet'  },
            { id: 'mobile',  icon: '📲', label: 'Mobile'  },
          ].map(d => (
            <button
              key={d.id}
              className={`editor-device-btn ${device === d.id ? 'active' : ''}`}
              onClick={() => switchDevice(d.id)}
              title={d.label}
            >
              {d.icon} <span className="device-label">{d.label}</span>
            </button>
          ))}
        </div>

        <div className="editor-toolbar-right">
          <button className="editor-icon-btn" title="Undo" onClick={() => gjsRef.current?.UndoManager.undo()}>↩ Undo</button>
          <button className="editor-icon-btn" title="Redo" onClick={() => gjsRef.current?.UndoManager.redo()}>↪ Redo</button>
          {saveMsg && <span className="editor-save-msg">{saveMsg}</span>}
          <button className="editor-save-btn" onClick={() => handleSave()} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save'}
          </button>
          <button
            className={`editor-publish-btn ${published ? 'unpublish' : 'publish'}`}
            onClick={() => handleSave(!published)}
            disabled={saving}
          >
            {published ? '⬇ Unpublish' : '🚀 Publish'}
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="editor-body">

        {/* LEFT — Blocks */}
        <div className="editor-left">
          <div className="panel-title">🧩 Blocks</div>
          <div className="panel-hint">Drag a block onto the canvas →</div>
          <div id="gjs-blocks" className="gjs-blocks-wrap" />
        </div>

        {/* CENTER — Canvas */}
        <div className="editor-center">
          <div id="gjs-canvas" className="gjs-canvas-wrap" />
        </div>

        {/* RIGHT — Style / Layers / Traits */}
        <div className="editor-right">
          {/* Tab switcher */}
          <div className="right-tabs">
            {[
              { id: 'styles', label: '🎨 Style'      },
              { id: 'layers', label: '🗂 Layers'      },
              { id: 'traits', label: '⚙️ Attributes'  },
            ].map(t => (
              <button
                key={t.id}
                className={`right-tab ${rightTab === t.id ? 'active' : ''}`}
                onClick={() => setRightTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Style panel */}
          <div
            id="gjs-styles"
            className="right-panel-content"
            style={{ display: rightTab === 'styles' ? 'block' : 'none' }}
          />

          {/* Layers panel */}
          <div
            id="gjs-layers"
            className="right-panel-content"
            style={{ display: rightTab === 'layers' ? 'block' : 'none' }}
          />

          {/* Traits panel */}
          <div
            id="gjs-traits"
            className="right-panel-content traits-wrap"
            style={{ display: rightTab === 'traits' ? 'block' : 'none' }}
          />
        </div>

      </div>
    </div>
  );
};

export default Editor;
