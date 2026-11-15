import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsage } from './subscriptionSlice';

const RANK = { lite: 0, basic: 1, business: 2, enterprise: 3 };

/* Minimum paket per fitur — mirror FEATURE_MIN_PLAN di backend. */
export const FEATURE_MIN_PLAN = {
  reviews: 'basic',
  remove_branding: 'basic',
  link_in_bio: 'basic',
  open_order: 'basic',
  loyalty: 'business',
  free_domain: 'business',
  support_24_7: 'business',
  unlimited_products: 'enterprise',
  unlimited_reports: 'enterprise',
  priority_support: 'enterprise',
};

export const PLAN_NAME = { lite: 'Lite', basic: 'Basic', business: 'Business', enterprise: 'Enterprise' };

/* Fungsi murni — mudah diuji tanpa redux. */
export const planRank = (plan) => RANK[plan] ?? 0;
export const planCan = (plan, feature) => planRank(plan) >= (RANK[FEATURE_MIN_PLAN[feature]] ?? 3);
export const planRequired = (feature) => PLAN_NAME[FEATURE_MIN_PLAN[feature]] || 'Enterprise';

/** Plan aktif toko + helper `can(feature)`. `requiredPlan(feature)` → nama paket minimum. */
export function usePlan() {
  const dispatch = useDispatch();
  const { currentStore } = useSelector((s) => s.stores);
  const usage = useSelector((s) => s.subscriptions?.usage);
  const current = useSelector((s) => s.subscriptions?.current);

  useEffect(() => {
    if (currentStore && !usage) dispatch(fetchUsage(currentStore.id));
  }, [dispatch, currentStore, usage]);

  const plan = usage?.plan || current?.plan || currentStore?.plan || 'lite';

  return {
    plan,
    rank: planRank(plan),
    can: (feature) => planCan(plan, feature),
    requiredPlan: planRequired,
    usage,
    loading: !usage && !currentStore?.plan,
  };
}
