import { useEffect, useState } from 'react';
import { Modal, Button, Badge, Select, formatRp } from '../../components/ui';
import api from '../../utils/api';
import { ALL_GROUP_KEYS, STATUS_GROUPS, groupOf, statusMeta, paymentMeta } from './orderStatus';
import { formatAddress, formatDbDateTime } from './orderFormat';

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-subdued">{label}</div>
      <div className="text-sm text-neutral mt-0.5 break-words">{children || '-'}</div>
    </div>
  );
}

export default function OrderDetailModal({ storeId, orderId, onClose, onChangeStatus }) {
  const [order, setOrder] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let alive = true;
    api.get(`/stores/${storeId}/orders/${orderId}`)
      .then((res) => {
        if (!alive) return;
        setOrder(res.data);
        setStatus(groupOf(res.data?.status) || '');
      })
      .catch((err) => { if (alive) setLoadError(err.message || 'Gagal memuat pesanan'); });
    return () => { alive = false; };
  }, [storeId, orderId]);

  const save = async () => {
    if (!status) return;
    setSaving(true);
    setSaveError('');
    try {
      await onChangeStatus(orderId, status);
      onClose();
    } catch (err) {
      setSaveError(typeof err === 'string' ? err : err?.message || 'Gagal menyimpan status');
      setSaving(false);
    }
  };

  const sm = order ? statusMeta(order.status) : null;
  const pm = order ? paymentMeta(order) : null;
  const unchanged = order && status === groupOf(order.status);

  return (
    <Modal
      open
      title={order ? `Pesanan ${order.order_code || ''}` : 'Detail pesanan'}
      onClose={onClose}
      width="max-w-2xl"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          <Button onClick={save} disabled={!order || !status || unchanged || saving}>
            {saving ? 'Menyimpan...' : 'Simpan status'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Penerima">{order.customer_name}</Field>
            <Field label="Kontak">{[order.customer_phone, order.customer_email].filter(Boolean).join(' · ')}</Field>
            <Field label="Alamat pengiriman">{formatAddress(order.shipping_address)}</Field>
            <Field label="Kurir / Nomor Resi">
              {`${order.shipping_courier ? order.shipping_courier.toUpperCase() : '-'} / ${order.shipping_awb || '-'}`}
            </Field>
            {order.notes && <Field label="Catatan">{order.notes}</Field>}
          </div>

          <div className="border border-divider rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-divider bg-page/60">
                  <th className="py-2 px-3 text-left font-semibold">Produk</th>
                  <th className="py-2 px-3 text-right font-semibold">Jumlah</th>
                  <th className="py-2 px-3 text-right font-semibold">Harga</th>
                  <th className="py-2 px-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center text-subdued">Tidak ada item</td></tr>
                ) : order.items.map((it) => (
                  <tr key={it.id} className="border-b border-divider last:border-0">
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
              <div className="flex justify-between font-bold"><span>Total</span><span className="tabular-nums">{formatRp(order.total)}</span></div>
            </div>
          </div>

          <Select
            id="order-detail-status"
            label="Ubah status pesanan"
            value={status}
            onChange={setStatus}
            options={[
              ...(groupOf(order.status) ? [] : [{ value: '', label: `${order.status || 'Tidak diketahui'} (status saat ini)` }]),
              ...ALL_GROUP_KEYS.map((k) => ({ value: k, label: STATUS_GROUPS[k].label })),
            ]}
          />
          {saveError && <p className="text-sm text-danger" role="alert">{saveError}</p>}
        </div>
      )}
    </Modal>
  );
}
