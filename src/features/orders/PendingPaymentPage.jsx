import OrdersListView from './OrdersListView';

const SCOPE = ['baru'];

export default function PendingPaymentPage() {
  return <OrdersListView title="Konfirmasi pembayaran" tabs={SCOPE} fixedStatuses={SCOPE} />;
}
