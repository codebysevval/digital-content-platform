import { Check, CreditCard, Shield, Lock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSubscriptionStore } from '../../store';

interface CheckoutFlowProps {
  /**
   * Called after a successful payment so the parent can route the user
   * away from the checkout screen (typically to the subscription status
   * page) and prevent the payment button from being spammed.
   */
  onSuccess?: () => void;
}

export function CheckoutFlow({ onSuccess }: CheckoutFlowProps = {}) {
  const plans = useSubscriptionStore((s) => s.checkoutPlans);
  const fetchCheckoutPlans = useSubscriptionStore((s) => s.fetchCheckoutPlans);
  const submitPayment = useSubscriptionStore((s) => s.submitPayment);
  const isPaying = useSubscriptionStore((s) => s.isLoading);

  const [selectedPlan, setSelectedPlan] = useState('monthly-pro');
  const [cardNumber, setCardNumber] = useState('');
  const [cardValid, setCardValid] = useState<boolean | null>(null);
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    void fetchCheckoutPlans();
  }, [fetchCheckoutPlans]);

  const selectedPlanData =
    plans.find((p) => p.id === selectedPlan) ?? plans[1] ?? plans[0];

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

  if (!selectedPlanData) {
    return null;
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planınızı Seçin
          </h1>
          <p className="text-lg text-gray-600">
            Premium içeriklerle yolculuğunuza bugün başlayın
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative bg-white rounded-2xl p-8 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'ring-4 ring-blue-500 shadow-2xl scale-105'
                  : 'shadow-md hover:shadow-xl border-2 border-gray-100'
              } ${plan.popular ? 'lg:scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    En Popüler
                  </span>
                </div>
              )}

              {plan.savings && (
                <div className="absolute -top-4 right-4">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    {plan.savings}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    ₺{plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <Check className="text-green-600" size={14} />
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {selectedPlan === plan.id && (
                <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
                  <CheckCircle
                    size={20}
                    fill="currentColor"
                    className="text-blue-600"
                  />
                  Seçildi
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ödeme Bilgileri
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              ? 'border-green-500 bg-green-50'
                              : cardValid === false
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                        <CreditCard
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={20}
                        />
                      </div>
                      {cardValid === true && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <Check size={14} />
                          Geçerli kart numarası
                        </p>
                      )}
                      {cardValid === false && (
                        <p className="text-sm text-red-600 mt-1">
                          Geçersiz kart numarası
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Son Kullanma Tarihi
                        </label>
                        <input
                          type="text"
                          placeholder="AA/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={3}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kart Sahibinin Adı
                      </label>
                      <input
                        type="text"
                        placeholder="Ahmet Yılmaz"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sipariş Özeti
                  </h3>

                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedPlanData.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedPlanData.period}lık faturalama
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₺{selectedPlanData.price}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Ara Toplam</span>
                        <span className="text-gray-900">
                          ₺{selectedPlanData.price}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">KDV (%20)</span>
                        <span className="text-gray-900">
                          ₺{(selectedPlanData.price * 0.2).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Toplam</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₺{(selectedPlanData.price * 1.2).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield className="text-green-600" size={20} />
                      <span>256-bit SSL Şifreleme</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Lock className="text-green-600" size={20} />
                      <span>Güvenli Ödeme İşlemi</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="text-green-600" size={20} />
                      <span>30 Gün Para İade Garantisi</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => void handlePay()}
                  disabled={isPaying}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isPaying
                    ? 'Ödeme işleniyor...'
                    : `Satın Almayı Tamamla - ₺${(selectedPlanData.price * 1.2).toFixed(2)}`}
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
