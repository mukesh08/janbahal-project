import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/*
 * Password field with a built-in show/hide toggle. Manages its own visibility
 * state. `style` is merged onto the input so callers can tweak width/spacing.
 */
const PasswordInput = ({ value, onChange, placeholder, required = false, style }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={s.wrap}>
      <input
        style={{ ...s.input, ...style }}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button type="button" style={s.eye} onClick={() => setShow(v => !v)} tabIndex={-1}>
        {show ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
      </button>
    </div>
  );
};

const s = {
  wrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  input: { padding: '0.65rem 0.9rem', paddingRight: '2.8rem', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontFamily: "'Poppins', sans-serif", width: '100%', boxSizing: 'border-box' },
  eye: { position: 'absolute', right: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
};

export default PasswordInput;
