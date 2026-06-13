import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from './productsSlice';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatters';

const LIMIT = 25;

export default function ProductsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { items, total, totalAll, isLoading } = useSelector((s) => s.products);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(LIMIT);
  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [openMenu, setOpenMenu] = useState(null);
  const [openCatMenu, setOpenCatMenu] = useState(false);
  const [openAvailMenu, setOpenAvailMenu] = useState(false);
  const [sort, setSort] = useState('');
  const fileRef = useRef(null);
  const menuRef = useRef(null);
  const catRef = useRef(null);
  const availRef = useRef(null);

  const productCount = totalAll || total;

  useEffect(() => {
    if (!currentStore) return;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (categoryFilter) params.set('category', categoryFilter);
    if (availFilter) params.set('status', availFilter);
    if (sort) params.set('sort', sort);
    dispatch(fetchProducts({ storeId: currentStore.id, params: Object.fromEntries(params) }));
  }, [dispatch, currentStore, search, page, limit, categoryFilter, availFilter, sort]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
      if (catRef.current && !catRef.current.contains(e.target)) setOpenCatMenu(false);
      if (availRef.current && !availRef.current.contains(e.target)) setOpenAvailMenu(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleSelectAll = () => {
    if (selected.size > 0 && selected.size === items.length) { setSelected(new Set()); }
    else { setSelected(new Set(items.map(p => p.id))); }
  };

  const handleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleDelete = (id) => {
    if (window.confirm('Hapus produk ini?')) dispatch(deleteProduct({ storeId: currentStore.id, productId: id }));
  };

  const handleAvailability = async (productId, availability) => {
    try {
      await api.put(`/stores/${currentStore.id}/products/${productId}/availability`, { availability });
      dispatch(fetchProducts({ storeId: currentStore.id, params: { search, page, limit } }));
    } catch {}
  };

  const extractAvailability = (desc) => {
    try { const d = JSON.parse(desc || '{}'); return d.availability || 'stock'; } catch { return 'stock'; }
  };

  const maxProducts = 100;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-900">Semua produk</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${Math.min((productCount / maxProducts) * 100, 100)}%` }} />
            </div>
            <span className="text-xs text-gray-500">{productCount} / {maxProducts}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 7l-2-3h2V9h2v4h2l-2 3v3h-2v-3z"/></svg>
            Unduh / Perbarui (Excel)
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Buat produk
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-5">Tambah Produk Baru</h3>
            <div className="space-y-3">
              <div onClick={() => { setShowModal(false); navigate('/products/add'); }} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 5h-2v2H7v-2H5v-2h2V9h2v2h2v2z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Tambah Manual</p>
                  <p className="text-xs text-gray-500">Input data produk satu per satu secara manual</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
              </div>
              <div onClick={() => fileRef.current?.click()} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2 7l-2-3h2V9h2v4h2l-2 3v3h-2v-3z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Upload dari Excel</p>
                  <p className="text-xs text-gray-500">Import produk menggunakan file Excel</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" />
          </div>
        </div>
      )}

      {/* Toggle + Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => { setCategoryFilter(''); setAvailFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!categoryFilter && !availFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Semua
        </button>
        <div className="relative ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/></svg>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Nama atau Kode Produk" className="pl-9 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 w-64" />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>
          </button>
        </div>
        <div className="relative" ref={catRef}>
          <button onClick={() => { setOpenCatMenu(!openCatMenu); setOpenAvailMenu(false); }} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
            {categoryFilter || 'Kategori'} <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
          </button>
          {openCatMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
              <button onClick={() => { setCategoryFilter(''); setOpenCatMenu(false); setPage(1); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-700">Semua Kategori</button>
              {[...new Set(items.map(p => p.category).filter(Boolean))].map(cat => (
                <button key={cat} onClick={() => { setCategoryFilter(cat); setOpenCatMenu(false); setPage(1); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${categoryFilter === cat ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>{cat}</button>
              ))}
            </div>
          )}
        </div>
        <div className="relative" ref={availRef}>
          <button onClick={() => { setOpenAvailMenu(!openAvailMenu); setOpenCatMenu(false); }} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
            {availFilter === 'published' ? 'Tersedia' : availFilter === 'draft' ? 'Draft' : 'Ketersediaan Apa Pun'} <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
          </button>
          {openAvailMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
              <button onClick={() => { setAvailFilter(''); setOpenAvailMenu(false); setPage(1); }} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-700">Apa Pun</button>
              <button onClick={() => { setAvailFilter('published'); setOpenAvailMenu(false); setPage(1); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${availFilter === 'published' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Tersedia</button>
              <button onClick={() => { setAvailFilter('draft'); setOpenAvailMenu(false); setPage(1); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${availFilter === 'draft' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>Draft</button>
            </div>
          )}
        </div>
        <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
          Tambah filter <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <th className="w-10 px-3 py-2.5">
                  <input type="checkbox" checked={selected.size > 0 && selected.size === items.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="px-3 py-2.5 cursor-pointer select-none" onClick={() => { setSort(sort === 'name_asc' ? 'name_desc' : 'name_asc'); setPage(1); }}>
                  <div className="flex items-center gap-1">
                    Nama <span className="text-gray-400">{sort === 'name_asc' ? '↑' : sort === 'name_desc' ? '↓' : '↕'}</span>
                  </div>
                </th>
                <th className="px-3 py-2.5">Kategori</th>
                <th className="px-3 py-2.5">Inventaris</th>
                <th className="px-3 py-2.5">Harga</th>
                <th className="px-3 py-2.5">Ketersediaan Produk</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Memuat...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Belum ada produk</td></tr>
              ) : (
                items.map((prod) => {
                  const avail = extractAvailability(prod.description);
                  return (
                    <tr key={prod.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/products/edit/${prod.id}`)}>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(prod.id)} onChange={() => handleSelect(prod.id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          {prod.image_urls && JSON.parse(prod.image_urls)[0] ? (
                            <img src={JSON.parse(prod.image_urls)[0]} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[280px]">{prod.name}</p>
                            <p className="text-xs text-gray-400">{prod.sku || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-600">{prod.category || '-'}</td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-medium ${Number(prod.stock) === 0 ? 'text-red-600' : Number(prod.stock) <= 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                              {Number(prod.stock).toLocaleString()} {Number(prod.stock) === 0 ? 'habis' : Number(prod.stock) <= 10 ? 'hampir habis' : 'ada stok'}
                            </span>
                          </div>
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-0.5">Lihat inventaris</button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{formatCurrency(prod.price)}</td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <div className="relative" ref={openMenu === prod.id ? menuRef : null}>
                          <button onClick={() => setOpenMenu(openMenu === prod.id ? null : prod.id)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                            {avail === 'stock' ? 'Gunakan Stok' : avail === 'always' ? 'Selalu Tersedia' : 'Pre-order'}
                            <svg className="w-3 h-3 ml-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                          </button>
                          {openMenu === prod.id && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[160px]">
                              {['stock', 'always', 'preorder'].map(a => (
                                <button key={a} onClick={() => { handleAvailability(prod.id, a); setOpenMenu(null); }} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${avail === a ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                  {a === 'stock' ? 'Gunakan Stok' : a === 'always' ? 'Selalu Tersedia' : 'Pre-order'}
                                </button>
                              ))}
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(prod.id); setOpenMenu(null); }} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Hapus</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Items per page:</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <span className="text-xs text-gray-500">{Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} dari {total}</span>
          <div className="flex items-center gap-0.5">
            <button disabled={page <= 1} onClick={() => setPage(1)} className="px-2 py-1 border rounded text-sm disabled:opacity-30 hover:bg-gray-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6 1.41-1.41zM6 6h2v12H6V6z"/></svg>
            </button>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded text-sm disabled:opacity-30 hover:bg-gray-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button disabled={items.length < limit} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded text-sm disabled:opacity-30 hover:bg-gray-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button disabled={items.length < limit} onClick={() => setPage(Math.ceil(total / limit))} className="px-2 py-1 border rounded text-sm disabled:opacity-30 hover:bg-gray-50">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
