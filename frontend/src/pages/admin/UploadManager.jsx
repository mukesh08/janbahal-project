import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import { Upload, FileText, Video, FolderOpen, Copy, Trash2, X } from 'lucide-react';

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImage = (mime) => mime?.startsWith('image/');

const UploadManager = () => {
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState(null);  // preview
  const [error, setError]       = useState('');
  const inputRef = useRef();

  const fetchFiles = async () => {
    try { const { data } = await axios.get('/api/upload'); setFiles(data); }
    catch { setError('Failed to load media'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFiles(); }, []);

  const upload = async (fileList) => {
    if (!fileList?.length) return;
    setUploading(true); setProgress(0); setError('');
    const form = new FormData();
    Array.from(fileList).forEach(f => form.append('files', f));
    try {
      const { data } = await axios.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      setFiles(prev => [...data, ...prev]);
    } catch (e) { setError(e.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); setProgress(0); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    upload(e.dataTransfer.files);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this file?')) return;
    try {
      await axios.delete(`/api/upload/${id}`);
      setFiles(files.filter(f => f._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch { setError('Delete failed'); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(window.location.origin + url);
  };

  return (
    <AdminLayout>
      <div style={s.container}>
        <PageHeader
          title="Upload"
          subtitle={`Media library — ${files.length} file${files.length !== 1 ? 's' : ''}`}
          actions={<>
            <button style={{ ...s.btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => inputRef.current?.click()}><Upload size={14} strokeWidth={1.8} /> Upload Files</button>
            <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf,.svg"
              style={{ display: 'none' }} onChange={e => upload(e.target.files)} />
          </>}
        />

        {error && <p style={s.error}>{error}</p>}

        {/* Drop zone */}
        <div
          style={{ ...s.dropZone, ...(dragging ? s.dropZoneActive : {}) }}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {uploading
            ? <div style={s.progressWrap}>
                <p style={s.progressLabel}>Uploading... {progress}%</p>
                <div style={s.progressBar}><div style={{ ...s.progressFill, width: `${progress}%` }} /></div>
              </div>
            : <>
                <span style={s.dropIcon}><Upload size={32} strokeWidth={1.8} /></span>
                <p style={s.dropText}>{dragging ? 'Drop files here' : 'Drag & drop files here'}</p>
                <p style={s.dropHint}>PNG, JPG, GIF, SVG, WebP, PDF, MP4 — max 10 MB</p>
              </>
          }
        </div>

        {/* Grid + Preview layout */}
        <div style={s.workspace}>
          {/* Files grid */}
          <div style={s.gridWrap}>
            {loading ? <p style={s.empty}>Loading...</p>
              : files.length === 0 ? <p style={s.empty}>No files uploaded yet.</p>
              : (
                <div style={s.grid}>
                  {files.map(file => (
                    <div
                      key={file._id}
                      style={{ ...s.gridItem, ...(selected?._id === file._id ? s.gridItemSelected : {}) }}
                      onClick={() => setSelected(selected?._id === file._id ? null : file)}
                    >
                      {isImage(file.mimetype)
                        ? <img src={file.url} alt={file.originalName} style={s.thumb} />
                        : <div style={s.fileIcon}>{file.mimetype.includes('pdf') ? <FileText size={32} strokeWidth={1.8} color="#64748b" /> : file.mimetype.includes('video') ? <Video size={32} strokeWidth={1.8} color="#64748b" /> : <FolderOpen size={32} strokeWidth={1.8} color="#64748b" />}</div>
                      }
                      <div style={s.itemName}>{file.originalName}</div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Preview panel */}
          {selected && (
            <div style={s.preview}>
              <div style={s.previewHeader}>
                <h4 style={s.previewTitle}>File Details</h4>
                <button style={s.closeBtn} onClick={() => setSelected(null)}><X size={16} strokeWidth={2} /></button>
              </div>
              {isImage(selected.mimetype)
                ? <img src={selected.url} alt={selected.originalName} style={s.previewImg} />
                : <div style={s.previewIconBig}>{selected.mimetype.includes('pdf') ? <FileText size={64} strokeWidth={1.8} color="#94a3b8" /> : <Video size={64} strokeWidth={1.8} color="#94a3b8" />}</div>
              }
              <div style={s.previewMeta}>
                <p style={s.metaName}>{selected.originalName}</p>
                <div style={s.metaRow}><span style={s.metaKey}>Type</span><span>{selected.mimetype}</span></div>
                <div style={s.metaRow}><span style={s.metaKey}>Size</span><span>{formatSize(selected.size)}</span></div>
                <div style={s.metaRow}><span style={s.metaKey}>URL</span>
                  <span style={s.metaUrl}>{selected.url}</span>
                </div>
              </div>
              <div style={s.previewActions}>
                <button style={{ ...s.copyBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => copyUrl(selected.url)}><Copy size={14} strokeWidth={1.8} /> Copy URL</button>
                <button style={{ ...s.deleteBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => handleDelete(selected._id)}><Trash2 size={14} strokeWidth={1.8} /> Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

const s = {
  container: { padding: '2rem' },
  btnPrimary: { padding: '0.6rem 1.25rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  error: { color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.6rem 0.85rem', fontSize: '0.85rem', marginBottom: '1rem' },

  dropZone: { border: '2px dashed #c7d2fe', borderRadius: '12px', padding: '2.5rem', textAlign: 'center', background: '#fff', marginBottom: '1.5rem', transition: 'all 0.2s' },
  dropZoneActive: { background: '#eef2ff', borderColor: '#4f46e5' },
  dropIcon: { fontSize: '2rem', display: 'block', marginBottom: '0.5rem' },
  dropText: { fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' },
  dropHint: { color: '#94a3b8', fontSize: '0.82rem' },
  progressWrap: { padding: '0.5rem 0' },
  progressLabel: { color: '#4f46e5', fontWeight: '600', marginBottom: '0.75rem' },
  progressBar: { background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden', maxWidth: '400px', margin: '0 auto' },
  progressFill: { height: '100%', background: '#4f46e5', borderRadius: '999px', transition: 'width 0.2s' },

  workspace: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start' },
  gridWrap: { flex: 1 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' },
  gridItem: { background: '#fff', border: '2px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.15s' },
  gridItemSelected: { borderColor: '#4f46e5' },
  thumb: { width: '100%', height: '90px', objectFit: 'cover', display: 'block' },
  fileIcon: { height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', background: '#f8fafc' },
  itemName: { padding: '0.4rem 0.5rem', fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },

  preview: { width: '260px', flexShrink: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', position: 'sticky', top: '1rem' },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  previewTitle: { fontWeight: '700', color: '#1e293b', fontSize: '0.95rem', margin: 0 },
  closeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#94a3b8', lineHeight: 1 },
  previewImg: { width: '100%', borderRadius: '8px', marginBottom: '1rem', objectFit: 'contain', maxHeight: '160px' },
  previewIconBig: { fontSize: '4rem', textAlign: 'center', padding: '1rem 0', marginBottom: '1rem' },
  previewMeta: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' },
  metaName: { fontWeight: '700', color: '#1e293b', fontSize: '0.85rem', wordBreak: 'break-all', marginBottom: '0.25rem' },
  metaRow: { display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#475569', alignItems: 'flex-start' },
  metaKey: { color: '#94a3b8', width: '40px', flexShrink: 0, fontWeight: '600' },
  metaUrl: { wordBreak: 'break-all', color: '#4f46e5', fontSize: '0.75rem' },
  previewActions: { display: 'flex', gap: '0.5rem' },
  copyBtn: { flex: 1, padding: '0.5rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  deleteBtn: { flex: 1, padding: '0.5rem', background: '#fff5f5', color: '#e53e3e', border: '1px solid #fecaca', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  empty: { color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '3rem' },
};

export default UploadManager;
