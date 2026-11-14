import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check } from 'lucide-react';
import { fetchPlans, fetchSubscription, subscribe } from './subscriptionSlice';
import {
  PageHeader, Card, Button, Badge, formatRp,
} from '../../components/ui';

const FALLBACK_PLANS = {
  basic: { name: 'Basic', price: 0 },
  pro: { name: 'Pro', price: 99000 },
  enterprise: { name: 'Enterprise', price: 299000 },
};

const PLAN_FEATURES = {
  basic: ['Dashboard', 'Pesanan', 'Produk', 'Customer'],
  pro: ['Semua fitur Basic', 'Analytics Advanced'],
  enterprise: ['Semua fitur Pro', 'Kustomisasi', 'Akses API'],
};

export default function SubscriptionPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { plans, current } = useSelector((s) => s.subscriptions);

  useEffect(() => {
    if (currentStore) {
      dispatch(fetchPlans(currentStore.id));
      dispatch(fetchSubscription(currentStore.id));
    }
  }, [dispatch, currentStore]);

  const handleSubscribe = (planKey) => {
    if (!currentStore) return;
    dispatch(subscribe({ storeId: currentStore.id, plan: { plan: planKey } }));
  };

  const planList = Object.entries(Object.keys(plans || {}).length ? plans : FALLBACK_PLANS);
  const statusTone = current?.status === 'active' ? 'success' : 'muted';

  return (
    <div>
      <PageHeader title="Paket Langganan" subtitle="Pilih paket langganan yang sesuai untuk toko Anda" />

      {current && (
        <Card className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-subdued font-[family-name:var(--font-label)]">Paket Saat Ini</p>
              <p className="text-xl font-bold text-neutral capitalize mt-0.5">{current.plan}</p>
              <p className="text-xs text-subdued mt-1">
                Berlaku sampai {current.end_date ? new Date(current.end_date).toLocaleDateString('id-ID') : '-'}
              </p>
            </div>
            {current.status && <Badge tone={statusTone} className="capitalize">{current.status === 'active' ? 'Aktif' : current.status}</Badge>}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {planList.map(([key, plan]) => {
          const isCurrent = current?.plan === key;
          const features = Array.isArray(plan.features) && plan.features.length ? plan.features : PLAN_FEATURES[key] || [];
          return (
            <Card key={key} className={`flex flex-col border ${isCurrent ? 'border-primary' : 'border-transparent'}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-neutral">{plan.name}</h2>
                {isCurrent && <Badge tone="primary">Paket Saat Ini</Badge>}
              </div>
              <p className="text-2xl font-bold text-neutral mt-3 tabular-nums">
                {Number(plan.price) === 0 ? 'Gratis' : formatRp(plan.price)}
                <span className="text-sm font-normal text-subdued">/bulan</span>
              </p>
              <ul className="mt-4 space-y-2 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral">
                    <Check className="w-4 h-4 text-success mt-0.5 shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? 'secondary' : 'primary'}
                className="w-full mt-5"
                disabled={isCurrent || !currentStore}
                onClick={() => handleSubscribe(key)}
              >
                {isCurrent ? 'Paket Saat Ini' : 'Pilih Paket'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
