const normalizeBase = (url, fallback) => {
  const raw = String(url || fallback || '').trim();
  return raw.replace(/\/+$/, '');
};

const inferDefaultApiBase = () => {
  // When running Vite locally (e.g. :5173), call Laravel on the same host at :8000.
  if (typeof window !== 'undefined') {
    const { hostname, origin, port } = window.location;
    const host = hostname || '127.0.0.1';

    if (port === '5173' || port === '4173' || port === '3000') {
      return `http://${host}:8000/api`;
    }

    return `${origin.replace(/\/+$/, '')}/api`;
  }

  return 'http://127.0.0.1:8000/api';
};

const inferDefaultBackendBase = (apiBase) => {
  const normalizedApiBase = normalizeBase(apiBase, '');
  return normalizedApiBase.replace(/\/api$/i, '');
};

export const API_BASE = normalizeBase(
  import.meta.env.VITE_API_BASE_URL,
  inferDefaultApiBase()
);

export const BACKEND_BASE = normalizeBase(
  import.meta.env.VITE_BACKEND_BASE_URL,
  inferDefaultBackendBase(API_BASE)
);

export const buildBackendUrl = (path) => {
  if (!path) return BACKEND_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_BASE}/${String(path).replace(/^\/+/, '')}`;
};

export const buildDocumentViewUrl = (path) => {
  if (!path) return API_BASE;
  return `${API_BASE}/documents/view?path=${encodeURIComponent(String(path))}`;
};


