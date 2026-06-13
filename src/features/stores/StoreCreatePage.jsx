import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createStore } from './storeSlice';

export default function StoreCreatePage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await dispatch(createStore({ name, slug, domain }));
    setLoading(false);
    if (createStore.fulfilled.match(result)) {
      navigate('/dashboard');
    } else {
      setError(result.payload || 'Gagal membuat toko. Silakan coba lagi.');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Tambah Toko Baru</h2>
      <p className="text-sm text-gray-500 mb-6">Buat toko pertama Anda dan mulai jualan</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
          <input type="text" value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm" placeholder="Nama toko Anda" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm" placeholder="nama-toko" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Domain (opsional)</label>
          <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm" placeholder="tokosaya.com" />
        </div>
        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Menyimpan...' : 'Buat Toko'}
        </button>
      </form>
    </div>
  );
}
