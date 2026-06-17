import { X } from 'lucide-react';

/*
 * Centered modal dialog with a translucent backdrop. Renders an optional title
 * row with a close button; `children` are the body. `maxWidth` sizes the dialog.
 */
const Modal = ({ title, onClose, children, maxWidth = '460px', style }) => (
  <div style={s.overlay}>
    <div style={{ ...s.modal, maxWidth, ...style }}>
      {(title || onClose) && (
        <div style={s.header}>
          {title && <h3 style={s.title}>{title}</h3>}
          {onClose && <button style={s.close} onClick={onClose}><X size={18} /></button>}
        </div>
      )}
      {children}
    </div>
  </div>
);

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  close: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' },
};

export default Modal;
