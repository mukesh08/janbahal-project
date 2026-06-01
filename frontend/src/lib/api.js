// Drop-in fetch wrapper — same API as axios, replaces the axios package
const api = {
  defaults: { headers: { common: {} } },

  async _request(method, url, data, config = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...api.defaults.headers.common,
      ...(config.headers || {}),
    };
    const res = await fetch(url, {
      method,
      headers,
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
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
