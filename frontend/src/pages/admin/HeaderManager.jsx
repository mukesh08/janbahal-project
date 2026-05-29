import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HeaderManager = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/pages/ensure-header')
      .then(({ data }) => navigate(`/admin/editor/${data._id}`, { replace: true }))
      .catch(() => navigate('/admin', { replace: true }));
  }, [navigate]);

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'sans-serif', color:'#64748b', gap:'10px' }}>
      <div style={{ width:'18px', height:'18px', border:'3px solid #e2e8f0', borderTopColor:'#4f46e5', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Opening Header Editor…
    </div>
  );
};

export default HeaderManager;
