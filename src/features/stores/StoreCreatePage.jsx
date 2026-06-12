import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createStore } from './storeSlice';

export default function StoreCreatePage() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createStore({ name, slug, domain }));
    if (createStore.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Tambah Toko Baru</h2>
      <p className="text-sm text-gray-500 mb-6">Buat toko pertama Anda dan mulai jualan</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
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
        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Buat Toko</button>
      </form>
    </div>
  );
}
