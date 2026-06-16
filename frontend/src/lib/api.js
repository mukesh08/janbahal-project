// Drop-in fetch wrapper — same API as axios, replaces the axios package
const api = {
  defaults: { headers: { common: {} } },

  async _request(method, url, data, config = {}) {
    // File uploads send a FormData body — it must NOT be JSON-stringified, and the
    // browser must set its own multipart Content-Type (with boundary) for multer to parse it.
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...api.defaults.headers.common,
      ...(config.headers || {}),
    };
    // Never send an explicit Content-Type for multipart — the boundary is added by fetch.
    if (isFormData) delete headers['Content-Type'];
    if (config.params) {
      const qs = new URLSearchParams(
        Object.entries(config.params).filter(([, v]) => v !== undefined && v !== null)
      ).toString();
      if (qs) url = url + (url.includes('?') ? '&' : '?') + qs;
    }
    const res = await fetch(url, {
      method,
      headers,
      body: data !== undefined ? (isFormData ? data : JSON.stringify(data)) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Session expired or invalid — clear it and send the user back to login
      if (res.status === 401 && !url.startsWith('/api/auth/login') && !url.startsWith('/api/auth/register')) {
        localStorage.removeItem('newacore_user');
        delete api.defaults.headers.common['Authorization'];
        if (window.location.pathname !== '/login') window.location.href = '/login';
      }
      const err = new Error(json.message || 'Request failed');
      err.response = { data: json, status: res.status };
      throw err;
    }
    return { data: json, status: res.status };
  },

  get:    (url, config)        => api._request('GET',    url, undefined, config),
  post:   (url, data, config)  => api._request('POST',   url, data,      config),
  put:    (url, data, config)  => api._request('PUT',    url, data,      config),
  delete: (url, config)        => api._request('DELETE', url, undefined, config),
};

export default api;
