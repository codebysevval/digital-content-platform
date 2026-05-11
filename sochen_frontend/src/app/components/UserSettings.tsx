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
  BookOpen,
  Sliders,
  ZoomIn,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useAuthStore, useContentStore, useCreatorApplicationStore, useCreatorStore, useSubscriptionStore } from '../../store';
import { getAvatarInitials } from '../../lib/formatters';
import { API_BASE_URL, resolveMediaUrl } from '../../lib/api';

export function UserSettings() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const updateFavoriteCategory = useAuthStore((s) => s.updateFavoriteCategory);
  const fetchCurrentUser = useAuthStore((s) => s.fetchCurrentUser);
  const authError = useAuthStore((s) => s.error);

  const status = useSubscriptionStore((s) => s.status);
  const fetchSubscriptionStatus = useSubscriptionStore((s) => s.fetchSubscriptionStatus);
  const cancelSubscription = useSubscriptionStore((s) => s.cancelSubscription);
  const isSubscriptionLoading = useSubscriptionStore((s) => s.isLoading);
  const isAuthLoading = useAuthStore((s) => s.isLoading);

  const allTopics = useContentStore((s) => s.topics).filter((t) => t.id !== 'all');
  const fetchTopics = useContentStore((s) => s.fetchTopics);

  const creators = useCreatorStore((s) => s.creators);
  const fetchCreatorById = useCreatorStore((s) => s.fetchCreatorById);
  const updateCreatorProfile = useCreatorApplicationStore((s) => s.updateCreatorProfile);
  const isCreatorAppLoading = useCreatorApplicationStore((s) => s.isLoading);

  const creatorData = user ? creators[user.id] : null;
  const avatarDisplay = user ? getAvatarInitials(user.name, user.avatarInitials) : '';

  const [username, setUsername] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [creatorType, setCreatorType] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    () => user?.favoriteCategory?.split(',').filter(Boolean) ?? [],
  );

  // Circular crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropImgDisplayHeight, setCropImgDisplayHeight] = useState(256);
  const cropImgRef = useRef<HTMLImageElement | null>(null);
  const pointerStartRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetchSubscriptionStatus();
    void fetchTopics();
  }, [fetchSubscriptionStatus, fetchTopics]);

  useEffect(() => {
    if (user) {
      setUsername(user.name);
      setEmail(user.email);
      setSelectedCategories(user.favoriteCategory?.split(',').filter(Boolean) ?? []);
    }
    if (user?.role === 'creator') {
      void fetchCreatorById(user.id);
    }
  }, [user, fetchCreatorById]);

  useEffect(() => {
    if (creatorData) {
      setBio(creatorData.bio ?? '');
      setCreatorType(creatorData.type ?? '');
    }
  }, [creatorData]);

  const handleSave = async () => {
    try {
      await updateProfile({ name: username, email });
      if (newPassword) {
        await changePassword({ currentPassword, newPassword, confirmPassword });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
      toast.success('Profil güncellendi');
    } catch (err) {
      toast.error('Profil güncellenemedi', {
        description: err instanceof Error ? err.message : 'Lütfen bilgilerinizi kontrol edip tekrar deneyin.',
      });
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      e.target.value = '';
      toast.error('Lütfen geçerli bir resim dosyası seçin');
      return;
    }
    try {
      const objectUrl = URL.createObjectURL(file);
      e.target.value = '';
      if (cropSrc) {
        try { URL.revokeObjectURL(cropSrc); } catch { /* ignore */ }
      }
      setCropImgDisplayHeight(256);
      setCropOffset({ x: 0, y: 0 });
      setCropZoom(1);
      setCropSrc(objectUrl);
    } catch {
      e.target.value = '';
      toast.error('Fotoğraf açılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleCropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStartRef.current = { startX: e.clientX, startY: e.clientY, startPosX: cropOffset.x, startPosY: cropOffset.y };
  };

  const handleCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current) return;
    const { startX, startY, startPosX, startPosY } = pointerStartRef.current;
    setCropOffset({ x: startPosX + (e.clientX - startX), y: startPosY + (e.clientY - startY) });
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    pointerStartRef.current = null;
  };

  const handleCropConfirm = async () => {
    const img = cropImgRef.current;
    if (!img) return;
    const SIZE = 256;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    const dw = SIZE * cropZoom;
    const dh = cropImgDisplayHeight * cropZoom;
    const dx = SIZE / 2 - (SIZE * cropZoom) / 2 + cropOffset.x;
    const dy = SIZE / 2 - (cropImgDisplayHeight * cropZoom) / 2 + cropOffset.y;
    ctx.drawImage(img, dx, dy, dw, dh);
    canvas.toBlob(async (blob) => {
      if (!blob) { toast.error('Görsel işlenemedi'); return; }
      handleCropCancel();
      setIsUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append('file', blob, 'avatar.jpg');
        const token = localStorage.getItem('sochen_token');
        const res = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({} as { message?: string }));
          throw new Error(errBody.message ?? `HTTP ${res.status}`);
        }
        await fetchCurrentUser();
        toast.success('Profil fotoğrafı güncellendi');
      } catch (e) {
        toast.error('Fotoğraf yüklenemedi', {
          description: e instanceof Error ? e.message : 'Lütfen tekrar deneyin.',
        });
      } finally {
        setIsUploadingAvatar(false);
      }
    }, 'image/jpeg', 0.85);
  };

  const handleCreatorProfileSave = async () => {
    try {
      await updateCreatorProfile({ bio, type: creatorType });
      toast.success('Üretici profili güncellendi');
    } catch (err) {
      toast.error('Profil güncellenemedi', {
        description: err instanceof Error ? err.message : 'Lütfen tekrar deneyin.',
      });
    }
  };

  const handleCropPointerUp = () => {
    pointerStartRef.current = null;
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      toast.success('Abonelik iptal edildi');
    } catch {
      toast.error('Abonelik iptal edilemedi', { description: 'Lütfen tekrar deneyin.' });
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
              <Tabs.Trigger
                value="preferences"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                İçerik Tercihleri
              </Tabs.Trigger>
              {user?.role === 'creator' && (
                <Tabs.Trigger
                  value="creator-profile"
                  className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
                >
                  Üretici Profili
                </Tabs.Trigger>
              )}
            </Tabs.List>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {/* ── Profil Ayarları ── */}
          <Tabs.Content value="profile" className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">Profil Ayarları</h2>
                <p className="text-gray-400 mt-1">Hesap bilgilerinizi yönetin</p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-6">
                <h2 className="text-xl font-semibold text-white mb-6">Profil Fotoğrafı</h2>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden">
                      {user?.avatarUrl ? (
                        <img src={resolveMediaUrl(user.avatarUrl)} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-3xl font-semibold">{avatarDisplay}</span>
                      )}
                    </div>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    >
                      <Camera className="text-white" size={16} />
                    </button>
                  </div>
                  <div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarSelect}
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isUploadingAvatar ? 'Yükleniyor...' : 'Fotoğraf Seç'}
                    </button>
                    <p className="text-sm text-gray-400 mt-2">
                      JPG veya PNG — 256 px dairesel kırpma ile yüklenir
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-6">
                <h2 className="text-xl font-semibold text-white mb-6">Kişisel Bilgiler</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2"><User size={16} /> Kullanıcı Adı</div>
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
                      <div className="flex items-center gap-2"><Mail size={16} /> E-posta Adresi</div>
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
                <h2 className="text-xl font-semibold text-white mb-6">Şifre Değiştir</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      <div className="flex items-center gap-2"><Lock size={16} /> Mevcut Şifre</div>
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
                      <div className="flex items-center gap-2"><Lock size={16} /> Yeni Şifre</div>
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
                      <div className="flex items-center gap-2"><Lock size={16} /> Yeni Şifre (Tekrar)</div>
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

              {authError && <p className="text-sm text-red-400 mb-4">{authError}</p>}

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

          {/* ── Abonelik Durumu ── */}
          <Tabs.Content value="subscription" className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">Abonelik Durumu</h2>
                <p className="text-gray-400 mt-1">Abonelik bilgilerinizi görüntüleyin ve yönetin</p>
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
                        <CheckCircle2 size={14} /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-sm">
                        <AlertCircle size={14} /> İptal Edildi
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white">
                      ₺{status.price.toLocaleString('tr-TR')}
                    </p>
                    <p className="text-gray-400">/{status.planName.includes('Yıllık') ? 'yıl' : 'ay'}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="text-indigo-400" size={20} />
                    <h4 className="text-lg font-semibold text-white">Sonraki Fatura Tarihi</h4>
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{status.nextBillingDate}</p>
                  <p className="text-sm text-gray-400">
                    Otomatik olarak ₺{status.price.toLocaleString('tr-TR')} tahsil edilecektir
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white mb-3">Plan Özellikleri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {status.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="text-green-400" size={16} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Abonelik İşlemleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plan upgrade cell */}
                  <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-sm font-semibold text-white">Planı Yükselt</h4>
                    <p className="text-xs text-gray-400 flex-1">Daha fazla içeriğe erişmek için planınızı yükseltin.</p>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-medium text-sm"
                    >
                      Planı Yükselt
                    </button>
                  </div>

                  {/* Payment method cell */}
                  <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-indigo-400" size={16} />
                      <h4 className="text-sm font-semibold text-white">Ödeme Yöntemi</h4>
                    </div>
                    <p className="text-xs text-gray-400 flex-1">Kayıtlı ödeme kartınızı güncelleyin.</p>
                    <button
                      onClick={() => navigate('/payment-method')}
                      className="w-full px-4 py-2.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-medium hover:bg-indigo-600/40 transition-colors"
                    >
                      Ödeme Yöntemini Güncelle
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-red-600/10 rounded-xl shadow-sm border border-red-500/30 p-6 mt-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Aboneliği İptal Et</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Aboneliğinizi iptal ederseniz, mevcut fatura döneminin sonuna kadar
                      premium özelliklere erişmeye devam edeceksiniz.
                    </p>
                    <button
                      onClick={() => void handleCancelSubscription()}
                      disabled={isSubscriptionLoading || !status.isActive}
                      className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubscriptionLoading ? 'İptal ediliyor...' : 'Aboneliği İptal Et'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* ── İçerik Tercihleri ── */}
          <Tabs.Content value="preferences" className="h-full">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">İçerik Tercihleri</h2>
                <p className="text-gray-400 mt-1">Ana sayfada önerilecek konuları seçin — birden fazla konu seçebilirsiniz</p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                      <Sliders className="text-indigo-400" size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Favori Konular</h3>
                  </div>
                  {selectedCategories.length > 0 && (
                    <span className="text-sm text-indigo-400 font-medium">
                      {selectedCategories.length} konu seçildi
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {allTopics.map((topic) => {
                    const isSelected = selectedCategories.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        onClick={() =>
                          setSelectedCategories((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== topic.id)
                              : [...prev, topic.id],
                          )
                        }
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 text-white'
                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-gray-500'
                          }`}
                        >
                          {isSelected && (
                            <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-current">
                              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium text-sm">{topic.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      try {
                        await updateFavoriteCategory(selectedCategories.join(','));
                        toast.success('İçerik tercihleriniz kaydedildi');
                      } catch {
                        toast.error('Tercihler kaydedilemedi');
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-medium"
                  >
                    <Save size={18} />
                    Tercihleri Kaydet
                  </button>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="px-4 py-3 text-gray-400 hover:text-white border border-white/10 rounded-lg text-sm transition-colors"
                    >
                      Temizle
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>

          {/* ── Üretici Profili ── */}
          {user?.role === 'creator' && (
            <Tabs.Content value="creator-profile" className="h-full">
              <div className="max-w-4xl mx-auto p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-semibold text-white">Üretici Profili</h2>
                  <p className="text-gray-400 mt-1">
                    Profilinizi güncelleyin — bu bilgiler diğer kullanıcılara görünür
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-8 mb-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Üretici Bilgileri</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <div className="flex items-center gap-2"><BookOpen size={16} /> Uzmanlık / Meslek</div>
                      </label>
                      <input
                        type="text"
                        value={creatorType}
                        onChange={(e) => setCreatorType(e.target.value)}
                        placeholder="ör. editör, gazeteci, eğitimci, yazılım geliştirici..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        <div className="flex items-center gap-2"><User size={16} /> Biyografi</div>
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 1000))}
                        placeholder="Kendinizi ve ürettiğiniz içerikleri kısaca tanıtın..."
                        rows={5}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                      <p className="text-right text-xs text-gray-500 mt-1">{bio.length}/1000</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setBio(creatorData?.bio ?? '');
                      setCreatorType(creatorData?.type ?? '');
                    }}
                    className="px-6 py-3 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-colors font-medium"
                  >
                    İptal
                  </button>
                  <button
                    onClick={() => void handleCreatorProfileSave()}
                    disabled={isCreatorAppLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {isCreatorAppLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </div>
            </Tabs.Content>
          )}
        </div>
      </Tabs.Root>

      {/* ── Circular crop modal ── */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1a2332] rounded-2xl p-6 w-80 border border-white/10 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-1">Fotoğraf Kırp</h3>
            <p className="text-gray-400 text-sm mb-4">Dairesel alanı konumlandırmak için sürükleyin</p>

            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-indigo-500 bg-black select-none">
              <img
                ref={cropImgRef}
                src={cropSrc}
                alt=""
                draggable={false}
                className="absolute pointer-events-none select-none"
                style={{
                  width: `${256 * cropZoom}px`,
                  height: 'auto',
                  left: `${128 - 128 * cropZoom + cropOffset.x}px`,
                  top: `${128 - (cropImgDisplayHeight * cropZoom) / 2 + cropOffset.y}px`,
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setCropImgDisplayHeight(256 * img.naturalHeight / img.naturalWidth);
                  setCropOffset({ x: 0, y: 0 });
                }}
              />
              <div
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Yakınlaştır</label>
                <ZoomIn size={14} className="text-gray-500" />
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.02"
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCropCancel}
                className="flex-1 py-2.5 border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition-colors text-sm"
              >
                İptal
              </button>
              <button
                onClick={() => void handleCropConfirm()}
                disabled={isUploadingAvatar}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-medium text-sm disabled:opacity-60"
              >
                {isUploadingAvatar ? 'Yükleniyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
