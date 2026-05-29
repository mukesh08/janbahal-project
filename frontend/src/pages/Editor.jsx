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
    name: 'Position', open: false,
    properties: [
      { name: 'Position', property: 'position', type: 'select',
        options: [
          { value: 'static',   name: 'Static'   },
          { value: 'relative', name: 'Relative' },
          { value: 'absolute', name: 'Absolute' },
          { value: 'fixed',    name: 'Fixed'    },
          { value: 'sticky',   name: 'Sticky'   },
        ]},
      { name: 'Top',    property: 'top',    type: 'integer', units: ['px','%','em','rem','auto'] },
      { name: 'Right',  property: 'right',  type: 'integer', units: ['px','%','em','rem','auto'] },
      { name: 'Bottom', property: 'bottom', type: 'integer', units: ['px','%','em','rem','auto'] },
      { name: 'Left',   property: 'left',   type: 'integer', units: ['px','%','em','rem','auto'] },
      { name: 'Z-Index', property: 'z-index', type: 'integer', units: [''] },
    ],
  },
  {
    name: 'Transform', open: false,
    properties: [
      { name: 'Transform', property: 'transform', type: 'select',
        options: [
          { value: 'none',                  name: 'None'              },
          { value: 'scale(1.05)',            name: 'Scale Up 5%'       },
          { value: 'scale(1.1)',             name: 'Scale Up 10%'      },
          { value: 'scale(0.95)',            name: 'Scale Down 5%'     },
          { value: 'scale(0.9)',             name: 'Scale Down 10%'    },
          { value: 'rotate(45deg)',          name: 'Rotate 45°'        },
          { value: 'rotate(90deg)',          name: 'Rotate 90°'        },
          { value: 'rotate(180deg)',         name: 'Rotate 180°'       },
          { value: 'rotate(-45deg)',         name: 'Rotate -45°'       },
          { value: 'scaleX(-1)',             name: 'Flip Horizontal'   },
          { value: 'scaleY(-1)',             name: 'Flip Vertical'     },
          { value: 'skewX(10deg)',           name: 'Skew X 10°'        },
          { value: 'skewY(10deg)',           name: 'Skew Y 10°'        },
          { value: 'translateX(20px)',       name: 'Shift Right 20px'  },
          { value: 'translateX(-20px)',      name: 'Shift Left 20px'   },
          { value: 'translateY(20px)',       name: 'Shift Down 20px'   },
          { value: 'translateY(-20px)',      name: 'Shift Up 20px'     },
        ]},
      { name: 'Transform Origin', property: 'transform-origin', type: 'select',
        options: [
          { value: 'center center',  name: 'Center'        },
          { value: 'top left',       name: 'Top Left'      },
          { value: 'top center',     name: 'Top Center'    },
          { value: 'top right',      name: 'Top Right'     },
          { value: 'bottom left',    name: 'Bottom Left'   },
          { value: 'bottom center',  name: 'Bottom Center' },
          { value: 'bottom right',   name: 'Bottom Right'  },
        ]},
    ],
  },
  {
    name: 'Transition', open: false,
    properties: [
      { name: 'Transition', property: 'transition', type: 'select',
        options: [
          { value: 'none',                           name: 'None'                  },
          { value: 'all 0.15s ease',                 name: 'Fast — 0.15s'          },
          { value: 'all 0.2s ease',                  name: 'Quick — 0.2s'          },
          { value: 'all 0.3s ease',                  name: 'Normal — 0.3s'         },
          { value: 'all 0.5s ease',                  name: 'Slow — 0.5s'           },
          { value: 'all 0.8s ease',                  name: 'Slower — 0.8s'         },
          { value: 'all 0.3s ease-in',               name: 'Ease In — 0.3s'        },
          { value: 'all 0.3s ease-out',              name: 'Ease Out — 0.3s'       },
          { value: 'all 0.3s ease-in-out',           name: 'Ease In-Out — 0.3s'    },
          { value: 'all 0.3s linear',                name: 'Linear — 0.3s'         },
          { value: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)', name: 'Spring — 0.4s' },
          { value: 'opacity 0.3s ease',              name: 'Opacity only'          },
          { value: 'transform 0.3s ease',            name: 'Transform only'        },
          { value: 'background-color 0.3s ease',     name: 'BG Color only'         },
        ]},
      { name: 'Duration', property: 'transition-duration', type: 'integer', units: ['s','ms'] },
      { name: 'Timing',   property: 'transition-timing-function', type: 'select',
        options: [
          { value: 'ease',         name: 'Ease'        },
          { value: 'linear',       name: 'Linear'      },
          { value: 'ease-in',      name: 'Ease In'     },
          { value: 'ease-out',     name: 'Ease Out'    },
          { value: 'ease-in-out',  name: 'Ease In-Out' },
          { value: 'cubic-bezier(0.34,1.56,0.64,1)', name: 'Spring' },
        ]},
      { name: 'Delay', property: 'transition-delay', type: 'integer', units: ['s','ms'] },
    ],
  },
  {
    name: 'Animation', open: false,
    properties: [
      { name: 'Animation', property: 'animation-name', type: 'select',
        options: [
          { value: 'none',              name: 'None'          },
          { value: 'gjs-fadeIn',        name: 'Fade In'       },
          { value: 'gjs-fadeInUp',      name: 'Fade In Up'    },
          { value: 'gjs-fadeInDown',    name: 'Fade In Down'  },
          { value: 'gjs-fadeInLeft',    name: 'Fade In Left'  },
          { value: 'gjs-fadeInRight',   name: 'Fade In Right' },
          { value: 'gjs-slideInUp',     name: 'Slide In Up'   },
          { value: 'gjs-slideInLeft',   name: 'Slide In Left' },
          { value: 'gjs-slideInRight',  name: 'Slide In Right'},
          { value: 'gjs-zoomIn',        name: 'Zoom In'       },
          { value: 'gjs-bounce',        name: 'Bounce'        },
          { value: 'gjs-pulse',         name: 'Pulse'         },
          { value: 'gjs-spin',          name: 'Spin'          },
          { value: 'gjs-shake',         name: 'Shake'         },
          { value: 'gjs-flip',          name: 'Flip'          },
          { value: 'gjs-float',         name: 'Float'         },
        ]},
      { name: 'Duration',   property: 'animation-duration',         type: 'integer', units: ['s','ms'] },
      { name: 'Delay',      property: 'animation-delay',            type: 'integer', units: ['s','ms'] },
      { name: 'Repeat',     property: 'animation-iteration-count',  type: 'select',
        options: [
          { value: '1', name: '1×' }, { value: '2', name: '2×' },
          { value: '3', name: '3×' }, { value: 'infinite', name: 'Infinite' },
        ]},
      { name: 'Timing',     property: 'animation-timing-function',  type: 'select',
        options: [
          { value: 'ease', name: 'Ease' }, { value: 'linear', name: 'Linear' },
          { value: 'ease-in', name: 'Ease In' }, { value: 'ease-out', name: 'Ease Out' },
          { value: 'ease-in-out', name: 'Ease In-Out' },
        ]},
      { name: 'Direction',  property: 'animation-direction', type: 'select',
        options: [
          { value: 'normal',            name: 'Normal'           },
          { value: 'reverse',           name: 'Reverse'          },
          { value: 'alternate',         name: 'Alternate'        },
          { value: 'alternate-reverse', name: 'Alternate Reverse'},
        ]},
      { name: 'Fill Mode',  property: 'animation-fill-mode', type: 'select',
        options: [
          { value: 'none',      name: 'None'      },
          { value: 'forwards',  name: 'Forwards'  },
          { value: 'backwards', name: 'Backwards' },
          { value: 'both',      name: 'Both'      },
        ]},
      { name: 'Play State', property: 'animation-play-state', type: 'select',
        options: [
          { value: 'running', name: 'Running' },
          { value: 'paused',  name: 'Paused'  },
        ]},
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

/* ─── Animation keyframes injected into canvas iframe ───── */
const ANIMATION_CSS = `
@keyframes gjs-fadeIn      { from { opacity:0 }                                    to { opacity:1 } }
@keyframes gjs-fadeInUp    { from { opacity:0; transform:translateY(30px) }        to { opacity:1; transform:translateY(0) } }
@keyframes gjs-fadeInDown  { from { opacity:0; transform:translateY(-30px) }       to { opacity:1; transform:translateY(0) } }
@keyframes gjs-fadeInLeft  { from { opacity:0; transform:translateX(-30px) }       to { opacity:1; transform:translateX(0) } }
@keyframes gjs-fadeInRight { from { opacity:0; transform:translateX(30px) }        to { opacity:1; transform:translateX(0) } }
@keyframes gjs-slideInUp   { from { transform:translateY(100%) }                   to { transform:translateY(0) } }
@keyframes gjs-slideInLeft { from { transform:translateX(-100%) }                  to { transform:translateX(0) } }
@keyframes gjs-slideInRight{ from { transform:translateX(100%) }                   to { transform:translateX(0) } }
@keyframes gjs-zoomIn      { from { opacity:0; transform:scale(0.5) }              to { opacity:1; transform:scale(1) } }
@keyframes gjs-bounce      { 0%,100% { transform:translateY(0) }    50% { transform:translateY(-20px) } }
@keyframes gjs-pulse       { 0%,100% { transform:scale(1) }         50% { transform:scale(1.06) } }
@keyframes gjs-spin        { from { transform:rotate(0deg) }                       to { transform:rotate(360deg) } }
@keyframes gjs-shake       { 0%,100% { transform:translateX(0) }    25% { transform:translateX(-8px) }   75% { transform:translateX(8px) } }
@keyframes gjs-flip        { from { transform:perspective(400px) rotateY(0) }      to { transform:perspective(400px) rotateY(360deg) } }
@keyframes gjs-float       { 0%,100% { transform:translateY(0) }    50% { transform:translateY(-10px) } }
`;

/* ─── Editor ──────────────────────────────────────────────── */
/* ─── Header / Footer preview bars (read-only) ─────────── */
const HeaderPreview = ({ data, onEdit }) => {
  if (!data) return null;
  const bg    = data.bgColor    || '#ffffff';
  const text  = data.textColor  || '#0f172a';
  const accent = data.accentColor || '#4f46e5';
  return (
    <div className="preview-section">
      <div className="preview-label">Header</div>
      <nav style={{ display:'flex', alignItems:'center', gap:'12px', padding:'0 2rem', height:'52px', background:bg, borderBottom:'1px solid rgba(0,0,0,0.07)', fontFamily:"'Poppins',sans-serif" }}>
        {data.logoImage
          ? <img src={data.logoImage} alt={data.logoText} style={{ height:'28px', borderRadius:'6px' }} />
          : <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:`linear-gradient(135deg,${accent},${accent}cc)`, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'0.85rem' }}>{(data.logoText||'S')[0]}</div>
        }
        <span style={{ fontWeight:'800', fontSize:'0.9rem', color:text }}>{data.logoText || 'Site'}</span>
        <div style={{ flex:1 }} />
        {(data.navItems||[]).slice(0,5).map((item,i) => (
          <span key={i} style={{ fontSize:'0.82rem', color:text, opacity:0.75 }}>{item.label}</span>
        ))}
        {data.showCta && (
          <span style={{ padding:'5px 14px', background:accent, color:'#fff', borderRadius:'7px', fontSize:'0.78rem', fontWeight:'600' }}>{data.ctaLabel||'Get Started'}</span>
        )}
      </nav>
      <button className="preview-edit-btn" onClick={onEdit}>✏ Edit Header</button>
    </div>
  );
};

const FooterPreview = ({ data, onEdit }) => {
  if (!data) return null;
  return (
    <div className="preview-section">
      <div className="preview-label">Footer</div>
      <footer style={{ background:'#1e293b', color:'#94a3b8', fontFamily:"'Poppins',sans-serif", padding:'1.5rem 2rem' }}>
        {(data.columns||[]).length > 0 && (
          <div style={{ display:'flex', gap:'2.5rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
            {data.columns.map((col,i) => (
              <div key={i} style={{ minWidth:'120px' }}>
                <div style={{ color:'#e2e8f0', fontWeight:'700', fontSize:'0.8rem', marginBottom:'0.5rem' }}>{col.title}</div>
                {(col.links||[]).slice(0,3).map((l,j) => (
                  <div key={j} style={{ fontSize:'0.75rem', opacity:0.65, marginBottom:'3px' }}>{l.label}</div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize:'0.75rem', borderTop: (data.columns||[]).length ? '1px solid rgba(255,255,255,0.08)' : 'none', paddingTop:(data.columns||[]).length ? '0.85rem' : '0' }}>
          {data.copyrightText || `© ${new Date().getFullYear()} — All rights reserved`}
        </div>
      </footer>
      <button className="preview-edit-btn footer" onClick={onEdit}>✏ Edit Footer</button>
    </div>
  );
};

const Editor = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const gjsRef   = useRef(null);

  const [page,        setPage]        = useState(null);
  const [headerData,  setHeaderData]  = useState(null);
  const [footerData,  setFooterData]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [published,   setPublished]   = useState(false);
  const [saveMsg,     setSaveMsg]     = useState('');
  const [rightTab,    setRightTab]    = useState('content');
  const [device,      setDevice]      = useState('desktop');
  // Live CSS preview
  const [selectedTag, setSelectedTag] = useState('');
  const [liveCSS,     setLiveCSS]     = useState('');
  // Content editor
  const [editContent,  setEditContent]  = useState('');
  const [editTag,      setEditTag]      = useState('');

  /* ── fetch page + header + footer ── */
  useEffect(() => {
    axios.get(`/api/pages/${id}`)
      .then(({ data }) => { setPage(data); setPublished(data.published); })
      .catch(() => { alert('Page not found'); navigate('/admin/pages'); });
    axios.get('/api/header').then(({ data }) => setHeaderData(data)).catch(() => {});
    axios.get('/api/footer').then(({ data }) => setFooterData(data)).catch(() => {});
  }, [id, navigate]);

  const contentDebounce = useRef(null);

  /* Tags that show the content editor */
  const TEXT_TAGS = new Set(['h1','h2','h3','h4','h5','h6','p','span','a','li','label','button','blockquote','figcaption','cite','td','th','dt','dd']);

  /* Live content update — debounced 120ms so canvas stays in sync as user types */
  const handleContentChange = useCallback((value) => {
    setEditContent(value);
    clearTimeout(contentDebounce.current);
    contentDebounce.current = setTimeout(() => {
      const sel = gjsRef.current?.getSelected();
      if (!sel) return;
      try {
        // Replace children with a single plain-text node so HTML isn't injected
        sel.components([{ type: 'textnode', content: value }]);
      } catch (_) {
        try { sel.set('content', value); } catch (__) {}
      }
    }, 120);
  }, []);

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
          scripts: [],
        },
      });

      /* Load saved content — prefer gjsComponents (native GrapesJS format, syncs style manager)
         Fall back to gjsHtml for new/seeded pages that have no saved components yet.
         When loading from gjsHtml, do NOT call setStyle — inline styles in the HTML are
         extracted automatically by GrapesJS; calling setStyle('') would clear them. */
      if (page.gjsComponents?.length) {
        editor.setComponents(page.gjsComponents);
        editor.setStyle(page.gjsStyles || []);
      } else if (page.gjsHtml) {
        editor.setComponents(page.gjsHtml);
      }

      /* Live CSS + Content sync events */
      const syncContent = () => {
        const sel = editor.getSelected();
        if (!sel) { setEditContent(''); setEditTag(''); return; }
        const tag = (sel.get('tagName') || '').toLowerCase();
        const isText = ['h1','h2','h3','h4','h5','h6','p','span','a','li','label','button','blockquote','figcaption','cite','td','th','dt','dd'].includes(tag);
        setEditTag(isText ? tag : '');
        setEditContent(isText ? (sel.getEl()?.textContent || '') : '');
      };

      editor.on('component:selected',  () => { refreshCSS(editor); syncContent(); });
      editor.on('component:deselected',() => { setSelectedTag(''); setLiveCSS(''); setEditContent(''); setEditTag(''); });
      editor.on('style:change',        () => refreshCSS(editor));

      editor.on('change:device', () => setDevice(editor.getDevice()));

      /* Inject base CSS + animation keyframes into canvas iframe */
      editor.on('load', () => {

        const doc = editor.Canvas.getDocument();
        if (doc) {
          const base = doc.createElement('style');
          base.id = 'gjs-base-reset';
          base.textContent = `
            *, *::before, *::after { box-sizing: border-box; }
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; }
            h1,h2,h3,h4,h5,h6,p { margin: 0; }
            section, div, footer, header, nav { box-sizing: border-box; }
          `;
          doc.head.appendChild(base);

          const anim = doc.createElement('style');
          anim.id = 'gjs-animation-keyframes';
          anim.textContent = ANIMATION_CSS;
          doc.head.appendChild(anim);
        }
      });

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

  const isHeaderPage = page?.slug === '__header__';
  const isFooterPage = page?.slug === '__footer__';
  const backLabel    = isHeaderPage ? '← Header' : isFooterPage ? '← Footer' : '← Pages';
  const backPath     = isHeaderPage ? '/admin/header' : isFooterPage ? '/admin/footer' : '/admin/pages';

  return (
    <div className="editor-shell">

      {/* ── TOOLBAR ── */}
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <div className="editor-logo" onClick={() => navigate('/')}>N</div>
          <button className="editor-back-btn" onClick={() => navigate(backPath)}>{backLabel}</button>
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
          {!isHeaderPage && !isFooterPage && (
            <button className={`editor-publish-btn ${published ? 'unpublish' : 'publish'}`}
              onClick={() => handleSave(!published)} disabled={saving}>
              {published ? '⬇ Unpublish' : '🚀 Publish'}
            </button>
          )}
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

        {/* CENTER — Canvas with header/footer previews (hidden when editing that section) */}
        <div className="editor-center">
          {!isHeaderPage && <HeaderPreview data={headerData} onEdit={() => { handleSave(); navigate('/admin/header'); }} />}
          <div id="gjs-canvas" className="gjs-canvas-wrap" />
          {!isFooterPage && <FooterPreview data={footerData} onEdit={() => { handleSave(); navigate('/admin/footer'); }} />}
        </div>

        {/* RIGHT — panels always in DOM, tabs switch visibility */}
        <div className="editor-right">

          {/* Tab pill bar */}
          <div className="right-tab-bar">
            {[
              ['content', '✏', 'Content'],
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

            {/* Content editor */}
            <div className={`panel-pane ${rightTab === 'content' ? 'active' : ''}`}>
              <div className="side-card">
                <div className="side-card-title">
                  {editTag
                    ? <><span className="css-tag-inline">&lt;{editTag}&gt;</span> Text Content</>
                    : 'Text Content'}
                </div>
                <div className="content-panel">
                  {editTag ? (
                    <>
                      <textarea
                        className="content-textarea"
                        value={editContent}
                        onChange={e => handleContentChange(e.target.value)}
                        placeholder="Type to edit text…"
                        spellCheck={true}
                        autoFocus
                      />
                      <div className="content-actions">
                        <span className="content-hint">Changes apply instantly</span>
                      </div>
                    </>
                  ) : (
                    <div className="css-empty">
                      <span className="css-empty-icon">✏️</span>
                      <p>Click a heading, paragraph<br/>or text element to edit it</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
