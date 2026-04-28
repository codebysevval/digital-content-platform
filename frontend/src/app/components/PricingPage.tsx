import { Check, ArrowRight, Zap, Star, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Switch from '@radix-ui/react-switch';
import { useSubscriptionStore } from '../../store';
import type { PlanIconKey } from '../../types';

const PLAN_ICON_MAP: Record<PlanIconKey, LucideIcon> = {
  zap: Zap,
  star: Star,
  building2: Building2,
};

export function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const plans = useSubscriptionStore((s) => s.yearlyTogglePlans);
  const fetchYearlyTogglePlans = useSubscriptionStore(
    (s) => s.fetchYearlyTogglePlans,
  );

  useEffect(() => {
    void fetchYearlyTogglePlans();
  }, [fetchYearlyTogglePlans]);

  return (
    <div className="min-h-full bg-white overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Mükemmel Planınızı Seçin
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            İhtiyaçlarınıza uygun aboneliği seçin. İstediğiniz zaman yükseltme
            veya düşürme yapabilirsiniz.
          </p>

          <div className="inline-flex items-center gap-4 bg-gray-100 p-2 rounded-lg">
            <span
              className={`text-sm font-medium transition-colors ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}
            >
              Aylık
            </span>
            <Switch.Root
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="w-12 h-6 bg-gray-300 rounded-full relative data-[state=checked]:bg-blue-600 transition-colors"
            >
              <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[26px]" />
            </Switch.Root>
            <span
              className={`text-sm font-medium transition-colors ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}
            >
              Yıllık
              <span className="ml-2 text-green-600 font-semibold">
                %17 Tasarruf
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = PLAN_ICON_MAP[plan.iconKey];
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isRecommended = plan.recommended;

            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border-2 transition-all hover:shadow-xl ${
                  isRecommended
                    ? 'border-blue-600 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Önerilen
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div
                    className={`w-12 h-12 rounded-lg bg-${plan.color}-100 flex items-center justify-center mb-4`}
                  >
                    <Icon className={`text-${plan.color}-600`} size={24} />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        ₺{price.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-gray-600">
                        /{isYearly ? 'yıl' : 'ay'}
                      </span>
                    </div>
                    {isYearly && (
                      <p className="text-sm text-gray-500 mt-1">
                        ₺{(price / 12).toFixed(2)}/ay yıllık faturalama
                      </p>
                    )}
                  </div>

                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                      isRecommended
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Başlayın
                    <ArrowRight size={18} />
                  </button>

                  <div className="mt-8 space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check
                          className="text-green-600 flex-shrink-0 mt-0.5"
                          size={20}
                        />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-all">
            Tüm Planları Karşılaştır
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">30 gün</div>
              <p className="text-gray-600">Para iade garantisi</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">7/24</div>
              <p className="text-gray-600">Müşteri desteği</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">%99,9</div>
              <p className="text-gray-600">Çalışma süresi SLA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
