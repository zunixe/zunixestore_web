import { Lock } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { usePlan } from './usePlan';

/**
 * Kartu pengganti konten saat fitur terkunci paket — seperti prompt upgrade Plugo.
 * `feature` = key di FEATURE_MIN_PLAN (mis. 'loyalty'). `title` opsional label fitur.
 */
export default function UpgradeCard({ feature, title, description }) {
  const { requiredPlan } = usePlan();
  return (
    <Card className="text-center py-12">
      <div className="w-12 h-12 rounded-full bg-primary-surface flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-neutral">{title || 'Fitur terkunci'}</h3>
      <p className="text-sm text-subdued mt-2 max-w-md mx-auto">
        {description || `Fitur ini membutuhkan paket ${requiredPlan(feature)} atau lebih tinggi.`}
      </p>
      <Button size="sm" className="mt-5" to="/settings/plans">Upgrade Paket</Button>
    </Card>
  );
}

/**
 * Bungkus aksi terkunci: render children kalau can(feature), kalau tidak render
 * fallback (default: tombol asli dinonaktifkan + link upgrade). Pakai render-prop:
 *   <PlanGate feature="reviews">{(locked) => <Toggle onChange={locked ? undefined : save} />}</PlanGate>
 */
export function PlanGate({ feature, children }) {
  const { can, loading } = usePlan();
  return children(loading ? true : !can(feature));
}
