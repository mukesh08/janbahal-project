import Modal from './Modal';

/*
 * Destructive-action confirmation dialog. Renders a title, an explanatory line
 * and Cancel / confirm buttons (the confirm button is red by default).
 */
const ConfirmDialog = ({ title = 'Are you sure?', message = 'This action cannot be undone.', confirmLabel = 'Delete', onConfirm, onCancel }) => (
  <Modal maxWidth="380px">
    <h3 style={s.title}>{title}</h3>
    <p style={s.message}>{message}</p>
    <div style={s.actions}>
      <button style={s.cancel} onClick={onCancel}>Cancel</button>
      <button style={s.confirm} onClick={onConfirm}>{confirmLabel}</button>
    </div>
  </Modal>
);

const s = {
  title: { fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', margin: 0 },
  message: { color: '#64748b', margin: '0.5rem 0 1.5rem', fontSize: '0.9rem' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.25rem' },
  cancel: { padding: '0.6rem 1.2rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif", color: '#475569' },
  confirm: { padding: '0.6rem 1.4rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', fontFamily: "'Poppins', sans-serif" },
};

export default ConfirmDialog;
