import { Sparkles, Store } from 'lucide-react';
import ScreenHeader from '@/components/ScreenHeader';
import Card from '@/components/Card';

export default function ShopScreen() {
  return (
    <>
      <ScreenHeader title="Shop" backTo="/" />
      <div className="grid gap-4 pb-4">
        <Card className="grid gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Store className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Marketplace</h2>
              <p className="text-sm text-subtle">Avatar cosmetics, power-ups, and daily deals.</p>
            </div>
          </div>
          <p className="text-sm text-subtle">Coming soon. Spend your earned currency and grab new looks.</p>
        </Card>
        <Card className="grid gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Battle Pass</h2>
              <p className="text-sm text-subtle">Seasonal rewards and unlocks.</p>
            </div>
          </div>
          <p className="text-sm text-subtle">Coming soon. Progress through tiers and earn exclusive items.</p>
        </Card>
      </div>
    </>
  );
}
