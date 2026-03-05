const normalizeBase = (url, fallback) => {
  const raw = String(url || fallback || '').trim();
  return raw.replace(/\/+$/, '');
};

export const API_BASE = normalizeBase(
  import.meta.env.VITE_API_BASE_URL,
  'http://172.20.10.3:8000/api'
);

export const BACKEND_BASE = normalizeBase(
  import.meta.env.VITE_BACKEND_BASE_URL,
  API_BASE.replace(/\/api$/i, '')
);

export const buildBackendUrl = (path) => {
  if (!path) return BACKEND_BASE;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_BASE}/${String(path).replace(/^\/+/, '')}`;
};


