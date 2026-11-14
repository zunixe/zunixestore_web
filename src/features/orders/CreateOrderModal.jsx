import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal, Button, IconButton, TextInput, Select, formatRp } from '../../components/ui';
import api from '../../utils/api';

const emptyItem = () => ({ product_id: '', product_name: '', quantity: 1, price: '' });

export default function CreateOrderModal({ storeId, onClose, onCreated }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', shipping_address: '', notes: '' });
  const [items, setItems] = useState([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let alive = true;
    api.get(`/stores/${storeId}/products?limit=100`)
      .then((res) => { if (alive) setProducts(res?.data?.items || []); })
      .catch(() => { if (alive) setProducts([]); });
    return () => { alive = false; };
  }, [storeId]);

  const setItem = (idx, patch) => setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const pickProduct = (idx, productId) => {
    if (!productId) { setItem(idx, { product_id: '' }); return; }
    const p = products.find((x) => x.id === productId);
    setItem(idx, { product_id: productId, product_name: p?.name || '', price: p?.price ?? '' });
  };

  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const validItems = items.filter((it) => it.product_name.trim() && Number(it.quantity) > 0);
    if (!form.customer_name.trim()) { setErrorMsg('Nama penerima wajib diisi.'); return; }
    if (validItems.length === 0) { setErrorMsg('Tambahkan minimal satu produk.'); return; }
    setSaving(true);
    try {
      await api.post(`/stores/${storeId}/orders`, {
        ...form,
        customer_name: form.customer_name.trim(),
        items: validItems.map((it) => ({
          product_id: it.product_id || null,
          product_name: it.product_name.trim(),
          quantity: Number(it.quantity),
          price: Number(it.price || 0),
        })),
      });
      onCreated?.();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal membuat pesanan');
      setSaving(false);
    }
  };

  const productOptions = [{ value: '', label: 'Produk kustom' }, ...products.map((p) => ({ value: p.id, label: p.name }))];

  return (
    <Modal
      open
      title="Buat pesanan"
      onClose={onClose}
      width="max-w-2xl"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" form="create-order-form" disabled={saving}>{saving ? 'Menyimpan...' : 'Buat pesanan'}</Button>
        </>
      )}
    >
      <form id="create-order-form" onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput id="co-name" label="Nama penerima" required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
          <TextInput id="co-phone" label="Nomor telepon" type="tel" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
          <TextInput id="co-email" label="Email" type="email" className="sm:col-span-2" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} />
          <div className="sm:col-span-2">
            <label htmlFor="co-address" className="block text-sm font-medium text-neutral mb-1.5">Alamat pengiriman</label>
            <textarea
              id="co-address"
              rows={2}
              value={form.shipping_address}
              onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-neutral mb-2">Produk</legend>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1.3fr_1.3fr_70px_110px_36px] gap-2 items-end border-b border-divider pb-3 last:border-0">
              <Select id={`co-prod-${idx}`} label="Pilih produk" value={it.product_id} onChange={(v) => pickProduct(idx, v)} options={productOptions} />
              <TextInput id={`co-pname-${idx}`} label="Nama produk" value={it.product_name} onChange={(e) => setItem(idx, { product_name: e.target.value })} />
              <TextInput id={`co-qty-${idx}`} label="Jumlah" type="number" min="1" value={it.quantity} onChange={(e) => setItem(idx, { quantity: e.target.value })} />
              <TextInput id={`co-price-${idx}`} label="Harga (Rp)" type="number" min="0" value={it.price} onChange={(e) => setItem(idx, { price: e.target.value })} />
              <IconButton
                icon={Trash2}
                label="Hapus produk"
                className="text-danger disabled:opacity-40"
                disabled={items.length === 1}
                onClick={() => setItems((list) => list.filter((_, i) => i !== idx))}
              />
            </div>
          ))}
          <Button variant="ghost" size="sm" icon={Plus} onClick={() => setItems((list) => [...list, emptyItem()])}>Tambah produk</Button>
        </fieldset>

        <div>
          <label htmlFor="co-notes" className="block text-sm font-medium text-neutral mb-1.5">Catatan</label>
          <textarea
            id="co-notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-divider text-sm bg-white focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex justify-between text-sm font-bold border-t border-divider pt-3">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatRp(subtotal)}</span>
        </div>
        {errorMsg && <p className="text-sm text-danger" role="alert">{errorMsg}</p>}
      </form>
    </Modal>
  );
}
