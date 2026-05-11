import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CreditCard, Lock, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PaymentMethodUpdate() {
  const navigate = useNavigate();
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSaving(false);
    setSaved(true);
    toast.success('Ödeme yöntemi güncellendi');
    setTimeout(() => navigate('/settings'), 1500);
  };

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Ayarlara Dön
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Ödeme Yöntemi</h1>
          <p className="text-gray-400">Kayıtlı ödeme kartınızı güncelleyin</p>
        </div>

        <div className="bg-[#1a2332] rounded-2xl border border-white/10 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-5 flex items-center gap-3">
            <Lock size={22} className="text-white" />
            <div>
              <p className="text-white font-semibold">Güvenli Ödeme</p>
              <p className="text-blue-100 text-sm">Kart bilgileriniz şifrelenmiş ve güvenlidir</p>
            </div>
          </div>

          <div className="p-8">
            {saved ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle className="text-green-400" size={48} />
                <p className="text-white font-semibold text-lg">Kaydedildi</p>
                <p className="text-gray-400 text-sm">Ayarlar sayfasına yönlendiriliyorsunuz…</p>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Kart Numarası</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ''))}
                      maxLength={19}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Son Kullanma Tarihi</label>
                    <input
                      type="text"
                      placeholder="AA/YY"
                      value={formatExpiry(expiry)}
                      onChange={(e) => setExpiry(e.target.value.replace(/\D/g, ''))}
                      maxLength={5}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:border-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield className="text-green-400" size={16} />
                    <span>256-bit SSL</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isSaving ? 'Kaydediliyor...' : 'Kartı Güncelle'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
