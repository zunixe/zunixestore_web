/*
 * Unggah file ke backend (POST /api/upload, field "file").
 * utils/api.js selalu mengirim JSON, jadi unggahan memakai fetch + FormData langsung.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const FILE_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export function fileUrl(path) {
  if (!path) return '';
  return /^(https?:|blob:|data:)/.test(path) ? path : `${FILE_ORIGIN}${path}`;
}

export async function uploadFile(file) {
  const token = localStorage.getItem('token');
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  let data = {};
  try { data = await res.json(); } catch { /* respons bukan JSON */ }
  if (!res.ok || !data.data?.url) throw new Error(data.message || 'Upload gagal');
  return data.data;
}
