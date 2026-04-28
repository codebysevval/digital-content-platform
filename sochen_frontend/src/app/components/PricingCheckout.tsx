import {
  Check,
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Star,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSubscriptionStore } from '../../store';
import type { PlanIconKey } from '../../types';

const PLAN_ICON_MAP: Record<PlanIconKey, LucideIcon> = {
  zap: Zap,
  star: Star,
  building2: Building2,
};

interface PricingCheckoutProps {
  /**
   * Optional callback invoked after a successful checkout. The parent uses
   * this to route the user to the Subscription Status page so the pay
   * button cannot be re-clicked while the toast is still on screen.
   */
  onSuccess?: () => void;
}

export function PricingCheckout({ onSuccess }: PricingCheckoutProps = {}) {
  const plans = useSubscriptionStore((s) => s.pricingPlans);
  const fetchPricingPlans = useSubscriptionStore((s) => s.fetchPricingPlans);
  const submitPayment = useSubscriptionStore((s) => s.submitPayment);
  const isPaying = useSubscriptionStore((s) => s.isLoading);

  const [step, setStep] = useState<'pricing' | 'checkout'>('pricing');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [cardNumber, setCardNumber] = useState('');
  const [cardValid, setCardValid] = useState<boolean | null>(null);
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    void fetchPricingPlans();
  }, [fetchPricingPlans]);

  const selectedPlanData =
    plans.find((p) => p.id === selectedPlan) ?? plans[1] ?? plans[0];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setStep('checkout');
  };

  const handleCardNumberChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    setCardNumber(cleaned);
    if (cleaned.length >= 13) {
      setCardValid(cleaned.length === 16);
    } else {
      setCardValid(null);
    }
  };

  const handlePay = async () => {
    if (!selectedPlanData) return;
    try {
      const result = await submitPayment({
        planId: selectedPlanData.id,
        cardNumber,
        expiry,
        cvv,
        cardholderName,
      });
      if (result.success) {
        toast.success('Ödeme Başarılı', {
          description: `${selectedPlanData.name} planınız aktifleştirildi.`,
        });
        onSuccess?.();
      }
    } catch {
      toast.error('Ödeme başarısız', {
        description: 'Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.',
      });
    }
  };

  if (step === 'pricing') {
    return (
      <div className="min-h-full bg-[#0F172A] overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Mükemmel Planınızı Seçin
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Premium içeriklere erişim için size en uygun planı seçin.
              İstediğiniz zaman değiştirebilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => {
              const Icon = PLAN_ICON_MAP[plan.iconKey];
              const planPrice = plan.price;
              const isRecommended = plan.recommended;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-[#1a2332] rounded-2xl border-2 transition-all hover:shadow-xl ${
                    isRecommended
                      ? 'border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        En Popüler
                      </span>
                    </div>
                  )}

                  {plan.savings && (
                    <div className="absolute -top-5 right-4">
                      <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        {plan.savings}
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div
                      className={`w-12 h-12 rounded-lg bg-${plan.color}-600/20 flex items-center justify-center mb-4`}
                    >
                      <Icon className={`text-${plan.color}-400`} size={24} />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      {plan.isFree ? (
                        <div className="text-5xl font-bold text-white">
                          Ücretsiz
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-white">
                            ₺{planPrice.toLocaleString('tr-TR')}
                          </span>
                          <span className="text-gray-400">/{plan.period}</span>
                        </div>
                      )}
                      {plan.period === 'yıl' && (
                        <p className="text-sm text-gray-500 mt-1">
                          ₺{(planPrice / 12).toFixed(2)}/ay yıllık faturalama
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                        plan.isFree
                          ? 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg'
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-lg hover:shadow-indigo-500/50'
                      }`}
                    >
                      {plan.isFree ? 'Ücretsiz Başla' : 'Planı Seç'}
                      <ArrowRight size={18} />
                    </button>

                    <div className="mt-8 space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check
                            className="text-green-400 flex-shrink-0 mt-0.5"
                            size={20}
                          />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-400 mb-2">
                  30 gün
                </div>
                <p className="text-gray-400">Para iade garantisi</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-400 mb-2">7/24</div>
                <p className="text-gray-400">Müşteri desteği</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-400 mb-2">
                  %99,9
                </div>
                <p className="text-gray-400">Çalışma süresi SLA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPlanData) return null;

  if (selectedPlanData.isFree) {
    return (
      <div className="min-h-full bg-[#0F172A] overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="bg-[#1a2332] rounded-2xl shadow-xl border border-white/10 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-400" size={40} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Hoş Geldiniz!</h1>
            <p className="text-xl text-gray-400 mb-8">
              Ücretsiz planınız aktif edildi. Hemen içerikleri keşfetmeye
              başlayabilirsiniz.
            </p>
            <button
              onClick={() => setStep('pricing')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-semibold text-lg"
            >
              İçerikleri Keşfet
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const price = selectedPlanData.price;
  const period = selectedPlanData.period;

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button
          onClick={() => setStep('pricing')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Planlara Geri Dön
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Ödeme Bilgileri</h1>
          <p className="text-lg text-gray-400">
            Seçilen plan:{' '}
            <span className="font-semibold text-indigo-400">
              {selectedPlanData.name}
            </span>
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1a2332] rounded-2xl shadow-xl border border-white/10 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock size={24} />
                Güvenli Ödeme
              </h2>
              <p className="text-blue-100 mt-1">
                Ödeme bilgileriniz şifrelenmiş ve güvenlidir
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Ödeme Bilgileri
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Kart Numarası
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          maxLength={16}
                          value={cardNumber}
                          onChange={(e) =>
                            handleCardNumberChange(e.target.value)
                          }
                          className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${
                            cardValid === true
                              ? 'border-green-500 bg-green-500/10 text-white'
                              : cardValid === false
                                ? 'border-red-500 bg-red-500/10 text-white'
                                : 'bg-white/5 border-white/10 text-white focus:border-indigo-500'
                          }`}
                        />
                        <CreditCard
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                      </div>
                      {cardValid === true && (
                        <p className="text-sm text-green-400 mt-1 flex items-center gap-1">
                          <Check size={14} />
                          Geçerli kart numarası
                        </p>
                      )}
                      {cardValid === false && (
                        <p className="text-sm text-red-400 mt-1">
                          Geçersiz kart numarası
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Son Kullanma Tarihi
                        </label>
                        <input
                          type="text"
                          placeholder="AA/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={3}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Kart Sahibinin Adı
                      </label>
                      <input
                        type="text"
                        placeholder="Ahmet Yılmaz"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Sipariş Özeti
                  </h3>

                  <div className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">
                          {selectedPlanData.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {period}lık faturalama
                        </p>
                      </div>
                      <p className="font-semibold text-white">
                        ₺{price.toLocaleString('tr-TR')}
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Ara Toplam</span>
                        <span className="text-white">
                          ₺{price.toLocaleString('tr-TR')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">KDV (%20)</span>
                        <span className="text-white">
                          ₺{(price * 0.2).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                      <span className="font-semibold text-white">Toplam</span>
                      <span className="text-2xl font-bold text-white">
                        ₺{(price * 1.2).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Shield className="text-green-400" size={20} />
                      <span>256-bit SSL Şifreleme</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <Lock className="text-green-400" size={20} />
                      <span>Güvenli Ödeme İşlemi</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>30 Gün Para İade Garantisi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => void handlePay()}
                  disabled={isPaying}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:shadow-indigo-500/50 transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isPaying
                    ? 'Ödeme işleniyor...'
                    : `Satın Almayı Tamamla - ₺${(price * 1.2).toFixed(2)}`}
                </button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Bu satın alma işlemini tamamlayarak Hizmet Şartlarımızı ve
                  Gizlilik Politikamızı kabul etmiş olursunuz
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
