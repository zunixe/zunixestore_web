import { useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    setCategories([...categories, { id: Date.now().toString(), name: newName, count: 0 }]);
    setNewName('');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus kategori ini?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Kategori</h2>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          + Tambah Kategori
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nama kategori"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Simpan</button>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Batal</button>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50">
              <th className="p-3">Nama Kategori</th>
              <th className="p-3">Jumlah Produk</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-gray-400">Belum ada kategori</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3"><span className="font-medium text-sm">{c.name}</span></td>
                  <td className="p-3 text-sm text-gray-500">{c.count} produk</td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 border border-red-200 rounded-lg text-xs text-red-600 hover:bg-red-50">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
