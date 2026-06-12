import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlans, fetchSubscription, subscribe } from './subscriptionSlice';
import { formatCurrency } from '../../utils/formatters';

export default function SubscriptionPage() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const { plans, current } = useSelector((s) => s.subscriptions);

  useEffect(() => {
    dispatch(fetchPlans());
    if (currentStore) dispatch(fetchSubscription(currentStore.id));
  }, [dispatch, currentStore]);

  const handleSubscribe = (planKey) => {
    dispatch(subscribe({ storeId: currentStore.id, plan: { plan: planKey } }));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Langganan</h2>
      <p className="text-sm text-gray-500 mb-6">Pilih paket langganan yang sesuai untuk toko Anda</p>

      {current && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paket Saat Ini</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{current.plan}</p>
              <p className="text-xs text-gray-500 mt-1">Berlaku sampai {current.end_date ? new Date(current.end_date).toLocaleDateString('id-ID') : '-'}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold capitalize">{current.status}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(plans).length === 0 ? (
          <div className="col-span-3 grid grid-cols-3 gap-4">
            {[
              { key: 'basic', name: 'Basic', price: 0, desc: 'Dashboard, Pesanan, Produk, Customer' },
              { key: 'pro', name: 'Pro', price: 99000, desc: 'Semua fitur + Analytics Advanced' },
              { key: 'enterprise', name: 'Enterprise', price: 299000, desc: 'Semua fitur + Custom + API' },
            ].map((plan) => (
              <div key={plan.key} className="bg-white rounded-xl shadow-sm p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-3xl font-bold text-gray-900 my-3">{plan.price === 0 ? 'Gratis' : formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-500">/bulan</span></p>
                <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                <button onClick={() => handleSubscribe(plan.key)} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  {current?.plan === plan.key ? 'Paket Saat Ini' : 'Pilih Paket'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          Object.entries(plans).map(([key, plan]) => (
            <div key={key} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-gray-900 my-3">{plan.price === 0 ? 'Gratis' : formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-500">/bulan</span></p>
              <p className="text-sm text-gray-500 mb-6">{plan.features?.join(', ')}</p>
              <button onClick={() => handleSubscribe(key)} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
                {current?.plan === key ? 'Paket Saat Ini' : 'Pilih Paket'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
