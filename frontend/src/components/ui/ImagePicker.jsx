import { X } from 'lucide-react';

/*
 * Modal that lets an admin pick one previously-uploaded image. Used by the page
 * editor (featured image), the slider editor and the site customizer.
 *
 * Props:
 *   title     — modal heading
 *   uploads   — array of { _id, url, originalName }
 *   onSelect  — called with the chosen upload object
 *   onClose   — called when the modal is dismissed
 *   emptyText — message shown when there are no uploads
 *   showName  — whether to show each file's name under its thumbnail
 */
const ImagePicker = ({ title = 'Choose Image', uploads = [], onSelect, onClose, emptyText = 'No images uploaded yet.', showName = true }) => (
  <div style={s.overlay} onClick={onClose}>
    <div style={s.modal} onClick={e => e.stopPropagation()}>
      <div style={s.header}>
        <span style={s.title}>{title}</span>
        <button style={s.close} onClick={onClose}><X size={16} strokeWidth={2} /></button>
      </div>
      {uploads.length === 0 ? (
        <div style={s.empty}>
          <p style={{ margin: 0 }}>{emptyText}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Go to the Upload section to add images.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {uploads.map(img => (
            <div
              key={img._id}
              style={s.item}
              onClick={() => onSelect(img)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <img src={img.url} alt={img.originalName} style={s.thumb} />
              {showName && <span style={s.name}>{img.originalName?.slice(0, 20)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
  modal: { background: '#fff', borderRadius: '16px', width: '680px', maxWidth: '95vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' },
  title: { fontSize: '1rem', fontWeight: '700', color: '#1e293b' },
  close: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#94a3b8', display: 'flex', fontFamily: "'Poppins', sans-serif" },
  empty: { padding: '3rem', textAlign: 'center', color: '#94a3b8' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '16px', overflowY: 'auto' },
  item: { display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '2px solid transparent', transition: 'border-color 0.15s' },
  thumb: { width: '100%', aspectRatio: '1', objectFit: 'cover' },
  name: { fontSize: '0.65rem', color: '#64748b', padding: '2px 4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' },
};

export default ImagePicker;
