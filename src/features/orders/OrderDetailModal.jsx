import { useEffect, useState } from 'react';
import { Modal, Button, Badge, Select, TextInput, formatRp } from '../../components/ui';
import api from '../../utils/api';
import { ALL_GROUP_KEYS, STATUS_GROUPS, groupOf, statusMeta, paymentMeta } from './orderStatus';
import { formatAddress, formatDbDateTime } from './orderFormat';

const COURIERS = ['JNE', 'J&T Express', 'SiCepat', 'AnterAja', 'Ninja Xpress', 'POS Indonesia', 'GoSend', 'GrabExpress'];
const PAYMENT_METHODS = ['Transfer Bank', 'COD', 'QRIS', 'E-Wallet', 'Kartu Kredit'];
const PAYMENT_OPTIONS = [
  { value: 'unpaid', label: 'Belum dibayar' },
  { value: 'pending', label: 'Menunggu konfirmasi' },
  { value: 'paid', label: 'Lunas' },
  { value: 'failed', label: 'Gagal' },
  { value: 'refunded', label: 'Dikembalikan' },
];

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-subdued">{label}</div>
      <div className="text-sm text-neutral mt-0.5 break-words">{children || '-'}</div>
    </div>
  );
}

const STOREFRONT_URL = import.meta.env.VITE_STOREFRONT_URL || 'https://zunixestore.vercel.app';

export default function OrderDetailModal({ storeId, orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('');
  const [ship, setShip] = useState({ courier: '', awb: '', cost: '', method: '', service: '' });
  const [fulfilled, setFulfilled] = useState(new Set());
  const [rates, setRates] = useState(null);
  const [cust, setCust] = useState({ name: '', phone: '', email: '', address: '' });
  const [payStatus, setPayStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [pickupSlot, setPickupSlot] = useState({ date: '', time: '10:00' });
  const [actionMsg, setActionMsg] = useState('');

  const reload = () => api.get(`/stores/${storeId}/orders/${orderId}`).then((res) => {
    setOrder(res.data);
    setStatus(groupOf(res.data?.status) || '');
    setPayStatus(res.data?.payment_status || 'unpaid');
    setShip({
      courier: res.data?.shipping_courier || '',
      awb: res.data?.shipping_awb || '',
      cost: res.data?.shipping_cost ?? '',
      method: res.data?.payment_method || '',
      service: res.data?.shipping_service || '',
    });
    setFulfilled(new Set((res.data?.items || []).filter((it) => it.fulfilled).map((it) => it.id)));
    let addr = ''; try { addr = JSON.parse(res.data?.shipping_address || '{}').address || res.data?.shipping_address || ''; } catch { addr = res.data?.shipping_address || ''; }
    setCust({
      name: res.data?.customer_name || '',
      phone: res.data?.customer_phone || '',
      email: res.data?.customer_email || '',
      address: addr,
    });
  });

  useEffect(() => {
    let alive = true;
    reload().catch((err) => { if (alive) setLoadError(err.message || 'Gagal memuat pesanan'); });
    return () => { alive = false; };
  }, [storeId, orderId]);

  const shareLink = () => {
    const url = `${STOREFRONT_URL}/order-success/${order.order_code}`;
    navigator.clipboard?.writeText(url).then(() => setActionMsg('Tautan disalin: ' + url)).catch(() => setActionMsg(url));
  };

  const openOrderDoc = async (kind, key) => {
    setBusy(key); setActionMsg('');
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${API_URL}/stores/${storeId}/orders/${orderId}/${kind}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || `Gagal mengambil ${kind} (${res.status})`);
      }
      if ((res.headers.get('content-type') || '').includes('text/html')) {
        const html = await res.text();
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); } else setActionMsg('Popup diblokir — izinkan popup');
      } else {
        const url = URL.createObjectURL(new Blob([await res.blob()], { type: 'application/pdf' }));
        const w = window.open(url, '_blank');
        if (!w) setActionMsg(`${kind}: ` + url);
      }
    } catch (err) {
      setActionMsg(err?.message || `Gagal mengambil ${kind}`);
    } finally { setBusy(''); }
  };

  const printInvoice = () => openOrderDoc('invoice', 'invoice');
  const printPos = () => openOrderDoc('invoice?type=pos', 'pos');
  const printLabel = () => openOrderDoc('label', 'label');

  const copyInvoiceText = () => {
    const rp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
    const lines = [
      `Faktur ${order.order_code}`,
      `Tanggal: ${formatDbDateTime(order.created_at)}`,
      '',
      `Penerima: ${order.customer_name || '-'} (${order.customer_phone || '-'})`,
      `Alamat: ${formatAddress(order.shipping_address)}`,
      '',
      ...(order.items || []).map((it, i) => `${i + 1}. ${it.product_name} — ${it.quantity}x ${rp(it.price)} = ${rp(it.total)}`),
      '',
      `Subtotal: ${rp(order.subtotal)}`,
      `Ongkir${order.shipping_courier ? ` (${order.shipping_courier} ${order.shipping_service || ''})` : ''}: ${rp(order.shipping_cost)}`,
      order.discount_amount ? `Diskon: -${rp(order.discount_amount)}` : null,
      `Total: ${rp(order.total)}`,
      `Pembayaran: ${order.payment_method || '-'} (${order.payment_status || '-'})`,
      order.shipping_awb ? `Resi: ${order.shipping_awb}` : null,
    ].filter((l) => l !== null).join('\n');
    navigator.clipboard?.writeText(lines).then(() => setActionMsg('Faktur disalin sebagai teks')).catch(() => setActionMsg('Gagal menyalin'));
  };

  const notifyWa = () => {
    const phone = String(order.customer_phone || '').replace(/\D/g, '').replace(/^0/, '62');
    if (!phone) { setActionMsg('Nomor HP pembeli kosong'); return; }
    const sm2 = statusMeta(order.status);
    const msg = `Halo ${order.customer_name || ''}, pesanan ${order.order_code} di ${location.hostname}:\nStatus: ${sm2.label}\nTotal: Rp ${Number(order.total || 0).toLocaleString('id-ID')}${order.shipping_awb ? `\nResi ${order.shipping_courier || ''}: ${order.shipping_awb}` : ''}\n\nLacak: ${STOREFRONT_URL}/order-success/${order.order_code}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const loadRates = async () => {
    if (!order.destination_postal_code && !order.destination_area_id) { setActionMsg('Order belum punya kode pos/area tujuan'); return; }
    setBusy('rates'); setActionMsg('');
    try {
      const res = await api.post(`/stores/${storeId}/shipping/rates`, {
        destination_area_id: order.destination_area_id || undefined,
        destination_postal_code: order.destination_postal_code || undefined,
        items: (order.items || []).map((it) => ({ name: it.product_name, price: it.price, quantity: it.quantity })),
      });
      setRates(res.data?.rates || []);
      if (!(res.data?.rates || []).length) setActionMsg(res.data?.message || res.data?.error || 'Tidak ada tarif untuk tujuan ini');
    } catch (err) {
      setActionMsg(err?.response?.data?.message || 'Gagal memuat tarif');
    } finally { setBusy(''); }
  };

  const applyRate = (r) => {
    setShip({ ...ship, courier: r.courier_code || r.courier, service: r.service_code || r.service, cost: r.price });
    setRates(null);
  };

  const requestPickup = async () => {
    setBusy('pickup'); setActionMsg(''); setSaveError('');
    try {
      const res = await api.post(`/stores/${storeId}/orders/${orderId}/pickup`, {
        delivery_date: pickupSlot.date || undefined,
        delivery_time: pickupSlot.time || undefined,
      });
      setActionMsg(`Penjemputan dipesan — resi ${res.data?.awb || '-'}`);
      await reload();
    } catch (err) {
      setActionMsg(err?.response?.data?.message || err?.message || 'Gagal memesan penjemputan');
    } finally { setBusy(''); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy('note'); setSaveError('');
    try {
      await api.post(`/stores/${storeId}/orders/${orderId}/events`, { message: note.trim(), type: 'note' });
      setNote('');
      await reload();
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Gagal menambah catatan');
    } finally { setBusy(''); }
  };

  const save = async (extra = {}) => {
    setSaving(true);
    setSaveError('');
    try {
      await api.put(`/stores/${storeId}/orders/${orderId}`, {
        ...(status ? { status: STATUS_GROUPS[status].write } : {}),
        payment_status: payStatus,
        payment_method: ship.method || null,
        shipping_courier: ship.courier || null,
        shipping_awb: ship.awb || null,
        shipping_service: ship.service || null,
        shipping_cost: Number(ship.cost) || 0,
        items_fulfilled: [...fulfilled],
        customer_name: cust.name || null,
        customer_phone: cust.phone || null,
        customer_email: cust.email || null,
        shipping_address: JSON.stringify({ address: cust.address }),
        ...extra,
      });
      onClose();
    } catch (err) {
      setSaveError(err?.message || 'Gagal menyimpan');
      setSaving(false);
    }
  };

  const confirmPayment = async () => {
    // Konfirmasi: pembayaran lunas + status maju ke Lunas bila masih Baru.
    await save({ payment_status: 'paid', status: groupOf(order.status) === 'baru' ? 'processing' : order.status });
  };

  const sm = order ? statusMeta(order.status) : null;
  const pm = order ? paymentMeta(order) : null;
  const dirty = order && (status !== groupOf(order.status) || payStatus !== order.payment_status
    || ship.courier !== (order.shipping_courier || '') || ship.awb !== (order.shipping_awb || '')
    || String(ship.cost) !== String(order.shipping_cost ?? '') || ship.method !== (order.payment_method || '')
    || ship.service !== (order.shipping_service || '')
    || fulfilled.size !== (order.items || []).filter((it) => it.fulfilled).length
    || (order.items || []).some((it) => (fulfilled.has(it.id) !== !!it.fulfilled))
    || cust.name !== (order.customer_name || '') || cust.phone !== (order.customer_phone || '')
    || cust.email !== (order.customer_email || '') || cust.address !== (() => { try { return JSON.parse(order.shipping_address || '{}').address || order.shipping_address || ''; } catch { return order.shipping_address || ''; } })());

  return (
    <Modal
      open
      title={order ? `Pesanan ${order.order_code || ''}` : 'Detail pesanan'}
      onClose={onClose}
      width="max-w-2xl"
      footer={(
        <>
          {order && payStatus !== 'paid' && (
            <Button variant="secondary" onClick={confirmPayment} disabled={saving}>Konfirmasi pembayaran</Button>
          )}
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          <Button onClick={() => save()} disabled={!order || !dirty || saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </>
      )}
    >
      {loadError && <p className="text-sm text-danger" role="alert">{loadError}</p>}
      {!order && !loadError && (
        <div className="space-y-2" aria-busy="true">
          {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
        </div>
      )}
      {order && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={sm.tone}>{sm.label}</Badge>
            <Badge tone={pm.tone}>{pm.label}</Badge>
            <span className="text-xs text-subdued ml-auto">Dibuat {formatDbDateTime(order.created_at)}</span>
          </div>

          {/* Aksi cepat ala Plugo: Cetak · Bagikan tautan · Pesan Penjemputan */}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={printInvoice} disabled={busy === 'invoice'}>
              {busy === 'invoice' ? 'Mengambil…' : 'Cetak Faktur'}
            </Button>
            <Button variant="secondary" onClick={printPos} disabled={busy === 'pos'}>
              {busy === 'pos' ? '…' : 'Struk'}
            </Button>
            <Button variant="secondary" onClick={copyInvoiceText}>Salin teks</Button>
            <Button variant="secondary" onClick={shareLink}>Bagikan tautan</Button>
            {order.customer_phone && <Button variant="secondary" onClick={notifyWa}>Kirim WA</Button>}
            {!order.shipping_awb && order.shipping_courier && (
              <>
                <input type="date" className="text-xs border border-divider rounded px-2 py-1" value={pickupSlot.date} onChange={(e) => setPickupSlot({ ...pickupSlot, date: e.target.value })} />
                <input type="time" className="text-xs border border-divider rounded px-2 py-1" value={pickupSlot.time} onChange={(e) => setPickupSlot({ ...pickupSlot, time: e.target.value })} />
                <Button variant="secondary" onClick={requestPickup} disabled={busy === 'pickup'}>
                  {busy === 'pickup' ? 'Memesan…' : 'Pesan Penjemputan'}
                </Button>
              </>
            )}
            {order.shipping_awb && (
              <>
                <Badge tone="primary">Resi: {order.shipping_awb}</Badge>
                <Button variant="secondary" onClick={printLabel} disabled={busy === 'label'}>
                  {busy === 'label' ? 'Mengambil…' : 'Cetak Label'}
                </Button>
              </>
            )}
          </div>
          {actionMsg && <p className="text-xs text-primary break-all" role="status">{actionMsg}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Penerima">{order.customer_name}</Field>
            <Field label="Kontak">{[order.customer_phone, order.customer_email].filter(Boolean).join(' · ')}</Field>
            <Field label="Alamat pengiriman">{formatAddress(order.shipping_address)}</Field>
            {(order.items || []).some((it) => !it.fulfilled) && (
              <Field label="Pemenuhan">
                {`Tidak terpenuhi (${(order.items || []).filter((it) => !it.fulfilled).length})`}
              </Field>
            )}
            <Field label="Kurir / Nomor Resi">
              {`${order.shipping_courier ? order.shipping_courier.toUpperCase() : '-'} / ${order.shipping_awb || '-'}`}
            </Field>
            {order.notes && <Field label="Catatan">{order.notes}</Field>}
          </div>

          <div className="border border-divider rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider bg-page/60">
                  <th className="py-2 px-3 w-8"></th>
                  <th className="py-2 px-3 text-left font-semibold">Produk</th>
                  <th className="py-2 px-3 text-right font-semibold">Jumlah</th>
                  <th className="py-2 px-3 text-right font-semibold">Harga</th>
                  <th className="py-2 px-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).length === 0 ? (
                  <tr><td colSpan={5} className="py-4 text-center text-subdued">Tidak ada item</td></tr>
                ) : order.items.map((it) => (
                  <tr key={it.id} className="border-b border-divider last:border-0">
                    <td className="py-2 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={fulfilled.has(it.id)}
                        onChange={(e) => {
                          const s = new Set(fulfilled);
                          e.target.checked ? s.add(it.id) : s.delete(it.id);
                          setFulfilled(s);
                        }}
                        title="Tandai terpenuhi"
                      />
                    </td>
                    <td className="py-2 px-3">{it.product_name}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{it.quantity}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{formatRp(it.price)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{formatRp(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-divider px-3 py-2 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-subdued">Subtotal</span><span className="tabular-nums">{formatRp(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-subdued">Ongkos kirim</span><span className="tabular-nums">{formatRp(order.shipping_cost)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-success"><span>Diskon{order.discount_code ? ` (${order.discount_code})` : ''}</span><span className="tabular-nums">-{formatRp(order.discount_amount)}</span></div>}
              {Number(order.extra_fee) > 0 && <div className="flex justify-between"><span className="text-subdued">Biaya tambahan</span><span className="tabular-nums">{formatRp(order.extra_fee)}</span></div>}
              <div className="flex justify-between font-bold"><span>Total</span><span className="tabular-nums">{formatRp(order.total)}</span></div>
            </div>
          </div>

          {(order.is_dropship || order.checkout_answer) && (
            <div className="rounded-lg border border-divider px-3 py-2 text-sm space-y-1">
              {!!order.is_dropship && <div className="flex justify-between"><span className="text-subdued">Dropship</span><span>{order.shipper_name || '-'} {order.shipper_phone ? `· ${order.shipper_phone}` : ''}</span></div>}
              {order.checkout_answer && <div className="flex justify-between gap-4"><span className="text-subdued">Jawaban checkout</span><span className="text-right">{order.checkout_answer}</span></div>}
            </div>
          )}
          {/* Riwayat Order — timeline + catatan admin (setara Plugo) */}
          <div className="rounded-lg border border-divider">
            <div className="px-3 py-2 border-b border-divider font-semibold text-sm">Riwayat Order</div>
            <div className="px-3 py-2 space-y-2 max-h-40 overflow-y-auto">
              {(order.events || []).length === 0 && <p className="text-xs text-subdued">Belum ada riwayat.</p>}
              {(order.events || []).map((ev) => (
                <div key={ev.id} className="flex justify-between gap-3 text-xs">
                  <span className="text-neutral">{ev.message}{ev.actor ? <span className="text-subdued"> · {ev.actor}</span> : null}</span>
                  <span className="text-subdued whitespace-nowrap">{formatDbDateTime(ev.created_at)}</span>
                </div>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-divider flex gap-2">
              <input
                className="flex-1 text-sm border border-divider rounded px-2 py-1"
                placeholder="Tambahkan Catatan"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addNote()}
              />
              <Button variant="secondary" onClick={addNote} disabled={busy === 'note' || !note.trim()}>
                {busy === 'note' ? '…' : 'Tambah'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              id="order-detail-custname"
              label="Nama penerima"
              value={cust.name}
              onChange={(e) => setCust({ ...cust, name: e.target.value })}
            />
            <TextInput
              id="order-detail-custphone"
              label="No. telepon"
              value={cust.phone}
              onChange={(e) => setCust({ ...cust, phone: e.target.value })}
            />
            <TextInput
              id="order-detail-custaddr"
              label="Alamat pengiriman"
              value={cust.address}
              onChange={(e) => setCust({ ...cust, address: e.target.value })}
            />
            <Select
              id="order-detail-status"
              label="Status pesanan"
              value={status}
              onChange={setStatus}
              options={[
                ...(groupOf(order.status) ? [] : [{ value: '', label: `${order.status || 'Tidak diketahui'} (status saat ini)` }]),
                ...ALL_GROUP_KEYS.map((k) => ({ value: k, label: STATUS_GROUPS[k].label })),
              ]}
            />
            <Select
              id="order-detail-payment"
              label="Status pembayaran"
              value={payStatus}
              onChange={setPayStatus}
              options={PAYMENT_OPTIONS}
            />
            <Select
              id="order-detail-method"
              label="Metode pembayaran"
              value={ship.method}
              onChange={(v) => setShip({ ...ship, method: v })}
              options={[{ value: '', label: 'Belum diatur' }, ...PAYMENT_METHODS.map((c) => ({ value: c, label: c }))]}
            />
            <Select
              id="order-detail-courier"
              label="Kurir"
              value={ship.courier}
              onChange={(v) => setShip({ ...ship, courier: v })}
              options={[{ value: '', label: 'Pilih kurir' }, ...COURIERS.map((c) => ({ value: c.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: c }))]}
            />
            <TextInput
              id="order-detail-awb"
              label="Nomor resi"
              value={ship.awb}
              onChange={(e) => setShip({ ...ship, awb: e.target.value })}
              placeholder="Resi pengiriman"
            />
            <TextInput
              id="order-detail-shipcost"
              label="Ongkos kirim (Rp)"
              type="number"
              min="0"
              value={ship.cost}
              onChange={(e) => setShip({ ...ship, cost: e.target.value })}
            />
            <TextInput
              id="order-detail-shipsvc"
              label="Layanan kurir"
              value={ship.service}
              onChange={(e) => setShip({ ...ship, service: e.target.value })}
              placeholder="cth: EZ, REG"
            />
          </div>
          {/* Ubah metode kirim — hitung ulang tarif Biteship dari tujuan order */}
          <div>
            <Button variant="secondary" onClick={loadRates} disabled={busy === 'rates'}>
              {busy === 'rates' ? 'Memuat tarif…' : 'Hitung ulang tarif pengiriman'}
            </Button>
            {rates && (
              <div className="mt-2 border border-divider rounded-lg max-h-44 overflow-y-auto">
                {rates.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyRate(r)}
                    className="w-full flex justify-between items-center px-3 py-2 text-sm hover:bg-page/60 border-b border-divider last:border-0 text-left"
                  >
                    <span>{(r.courier || '').toUpperCase()} — {r.service}{r.duration ? ` · ${r.duration}` : ''}</span>
                    <span className="font-semibold tabular-nums">{formatRp(r.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {saveError && <p className="text-sm text-danger" role="alert">{saveError}</p>}
        </div>
      )}
    </Modal>
  );
}
