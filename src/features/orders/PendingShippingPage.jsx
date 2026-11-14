import OrdersListView from './OrdersListView';

const SCOPE = ['lunas', 'dikemas'];

export default function PendingShippingPage() {
  return (
    <OrdersListView
      title="Pengiriman Tertunda"
      tabs={SCOPE}
      fixedStatuses={SCOPE}
      initialStatusFilter={SCOPE}
      showCreate={false}
    />
  );
}
