import {
  Camera,
  User,
  Mail,
  Lock,
  Save,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import { useAuthStore, useSubscriptionStore } from '../../store';

export function UserSettings() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const authError = useAuthStore((s) => s.error);

  const status = useSubscriptionStore((s) => s.status);
  const fetchSubscriptionStatus = useSubscriptionStore(
    (s) => s.fetchSubscriptionStatus,
  );
  const cancelSubscription = useSubscriptionStore((s) => s.cancelSubscription);
  const isSubscriptionLoading = useSubscriptionStore((s) => s.isLoading);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  const [username, setUsername] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    void fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  useEffect(() => {
    if (user) {
      setUsername(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateProfile({ name: username, email });
      if (newPassword) {
        await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
      toast.success('Profil güncellendi');
    } catch (err) {
      toast.error('Profil güncellenemedi', {
        description:
          err instanceof Error
            ? err.message
            : 'Lütfen bilgilerinizi kontrol edip tekrar deneyin.',
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      toast.success('Abonelik iptal edildi');
    } catch {
      toast.error('Abonelik iptal edilemedi', {
        description: 'Lütfen tekrar deneyin.',
      });
    }
  };

  return (
    <div className="h-full bg-[#0F172A]">
      <Tabs.Root defaultValue="profile" className="h-full flex flex-col">
        <div className="bg-[#1a2332] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-8">
            <Tabs.List className="flex gap-4 pt-6">
              <Tabs.Trigger
                value="profile"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Profil Ayarları
              </Tabs.Trigger>
              <Tabs.Trigger
                value="subscription"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Abonelik Durumu
              </Tabs.Trigger>
            </Tabs.List>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Tabs.Content value="profile" className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">
                  Profil Ayarları
                </h2>
                <p className="text-gray-400 mt-1">Hesap bilgilerinizi yönetin</p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Profil Fotoğrafı
                </h2>

                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-3xl font-semibold">
                        {user?.avatarInitials ?? ''}
                      </span>
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-700 transition-colors">
                      <Camera className="text-white" size={16} />
                    </button>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-medium">
                      Fotoğraf Yükle
                    </button>
                    <p className="text-sm text-gray-400 mt-2">
                      JPG, PNG veya GIF. Maksimum 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Kişisel Bilgiler
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Kullanıcı Adı
                      </div>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        E-posta Adresi
                      </div>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Şifre Değiştir
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} />
                        Mevcut Şifre
                      </div>
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Mevcut şifrenizi girin"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} />
                        Yeni Şifre
                      </div>
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Yeni şifrenizi girin"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2">
                        <Lock size={16} />
                        Yeni Şifre (Tekrar)
                      </div>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Yeni şifrenizi tekrar girin"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {authError && (
                <p className="text-sm text-red-400 mb-4">{authError}</p>
              )}

              <div className="flex justify-end gap-4">
                <button className="px-6 py-3 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-colors font-medium">
                  İptal
                </button>
                <button
                  onClick={() => void handleSave()}
                  disabled={isAuthLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  {isAuthLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="subscription" className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">
                  Abonelik Durumu
                </h2>
                <p className="text-gray-400 mt-1">
                  Abonelik bilgilerinizi görüntüleyin ve yönetin
                </p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="text-indigo-400" size={24} />
                      <h3 className="text-2xl font-semibold text-white">
                        Mevcut Plan: {status.planName}
                      </h3>
                    </div>
                    {status.isActive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-600/20 text-green-400 text-sm">
                        <CheckCircle2 size={14} />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm">
                        <AlertCircle size={14} />
                        İptal Edildi
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white">
                      ₺{status.price.toLocaleString('tr-TR')}
                    </p>
                    <p className="text-gray-400">/ay</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-indigo-400" size={20} />
                    <h4 className="text-lg font-semibold text-white">
                      Sonraki Fatura Tarihi
                    </h4>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">
                    {status.nextBillingDate}
                  </p>
                  <p className="text-sm text-gray-400">
                    Otomatik olarak ₺{status.price.toLocaleString('tr-TR')} tahsil
                    edilecektir
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Plan Özellikleri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {status.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-gray-300 text-sm"
                      >
                        <CheckCircle2 className="text-green-400" size={16} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Abonelik İşlemleri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-medium">
                    Planı Yükselt
                  </button>
                  <button className="px-6 py-3 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors font-medium">
                    Ödeme Yöntemi Güncelle
                  </button>
                </div>
              </div>

              <div className="bg-red-600/10 rounded-xl shadow-sm border border-red-500/30 p-6 mt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle
                    className="text-red-400 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Aboneliği İptal Et
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Aboneliğinizi iptal ederseniz, mevcut fatura döneminin
                      sonuna kadar premium özelliklere erişmeye devam
                      edeceksiniz.
                    </p>
                    <button
                      onClick={() => void handleCancelSubscription()}
                      disabled={isSubscriptionLoading || !status.isActive}
                      className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubscriptionLoading
                        ? 'İptal ediliyor...'
                        : 'Aboneliği İptal Et'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
