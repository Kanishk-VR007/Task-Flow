const API_BASE = 'http://localhost:9005';

export const api = {
  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async get(path) {
    const res = await fetch(`${API_BASE}${path}`, { headers: this.getHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: You do not have permission to access this resource.');
    }
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: You do not have permission to access this resource.');
    }
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  },

  async put(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: You do not have permission to access this resource.');
    }
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  },

  async del(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: You do not have permission to access this resource.');
    }
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  },

  async upload(path, formData) {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    if (res.status === 403) {
      throw new Error('Forbidden: You do not have permission to access this resource.');
    }
    if (!res.ok) throw new Error(await res.text());
    const text = await res.text();
    try { return JSON.parse(text); } catch { return text; }
  },
};

export { API_BASE };

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
