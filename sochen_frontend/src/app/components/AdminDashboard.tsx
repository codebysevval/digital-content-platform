import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  Search,
  Filter,
  UserPlus,
  Eye,
  EyeOff,
  Play,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { toast } from 'sonner';
import { useAdminStore, useAuthStore, useCreatorApplicationStore } from '../../store';
import { resolveMediaUrl } from '../../lib/api';

export function AdminDashboard() {
  const userRole = useAuthStore((s) => s.user?.role);

  const pendingContent = useAdminStore((s) => s.pendingContent);
  const financialData = useAdminStore((s) => s.financialData);
  const revenueData = useAdminStore((s) => s.revenueData);
  const users = useAdminStore((s) => s.managedUsersDashboard);
  const stats = useAdminStore((s) => s.stats);

  const fetchPendingContent = useAdminStore((s) => s.fetchPendingContent);
  const fetchFinancialData = useAdminStore((s) => s.fetchFinancialData);
  const fetchRevenueData = useAdminStore((s) => s.fetchRevenueData);
  const fetchManagedUsersDashboard = useAdminStore(
    (s) => s.fetchManagedUsersDashboard,
  );
  const fetchAdminStats = useAdminStore((s) => s.fetchAdminStats);
  const approveContent = useAdminStore((s) => s.approveContent);
  const rejectContent = useAdminStore((s) => s.rejectContent);

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [previewId, setPreviewId] = useState<number | null>(null);

  const applications = useCreatorApplicationStore((s) => s.applications);
  const fetchApplications = useCreatorApplicationStore((s) => s.fetchApplications);
  const approveApplication = useCreatorApplicationStore((s) => s.approveApplication);
  const rejectApplication = useCreatorApplicationStore((s) => s.rejectApplication);
  const [rejectingAppId, setRejectingAppId] = useState<number | null>(null);
  const [rejectAppReason, setRejectAppReason] = useState('');

  const allUsers = useAdminStore((s) => s.allUsers);
  const fetchAllUsers = useAdminStore((s) => s.fetchAllUsers);
  const changeUserRole = useAdminStore((s) => s.changeUserRole);
  const grantSubscription = useAdminStore((s) => s.grantSubscription);
  const simulateTraffic = useAdminStore((s) => s.simulateTraffic);
  const deleteUser = useAdminStore((s) => s.deleteUser);
  const deleteContent = useAdminStore((s) => s.deleteContent);

  const [devUserSearch, setDevUserSearch] = useState('');
  const [systemUserSearch, setSystemUserSearch] = useState('');
  const [grantingUserId, setGrantingUserId] = useState<number | null>(null);
  const [grantPlanId, setGrantPlanId] = useState('monthly');
  const [grantMonths, setGrantMonths] = useState(1);
  const [simContentId, setSimContentId] = useState('');
  const [simViews, setSimViews] = useState('');
  const [simLikes, setSimLikes] = useState('');
  const [simResult, setSimResult] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deleteContentId, setDeleteContentId] = useState('');
  const [deleteContentResult, setDeleteContentResult] = useState<string | null>(null);

  useEffect(() => {
    if (userRole !== 'admin') return;
    void fetchPendingContent();
    void fetchFinancialData();
    void fetchRevenueData();
    void fetchManagedUsersDashboard();
    void fetchAdminStats();
    void fetchApplications();
    void fetchAllUsers();
  }, [
    userRole,
    fetchPendingContent,
    fetchFinancialData,
    fetchRevenueData,
    fetchManagedUsersDashboard,
    fetchAdminStats,
    fetchApplications,
    fetchAllUsers,
  ]);

  // Poll for new creator applications every 30 s so the admin sees them
  // without having to re-login or manually refresh.
  useEffect(() => {
    if (userRole !== 'admin') return;
    const id = setInterval(() => {
      void fetchApplications();
      void fetchPendingContent();
    }, 30_000);
    return () => clearInterval(id);
  }, [userRole, fetchApplications, fetchPendingContent]);

  // Component-level admin guard so the dashboard refuses to render under any
  // route that bypasses the App-level redirect.
  if (userRole !== 'admin') {
    return (
      <div className="h-full bg-[#0F172A] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[#1a2332] border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400" size={28} />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Erişim Reddedildi
          </h2>
          <p className="text-sm text-gray-400">
            Bu sayfayı görüntülemek için yönetici yetkisine sahip olmanız
            gerekiyor.
          </p>
        </div>
      </div>
    );
  }

  const handleApprove = (id: number) => {
    void approveContent(id);
  };

  const handleRejectClick = (id: number) => {
    setRejectingId(id);
    setRejectReason('');
  };

  const handleRejectSubmit = async (id: number) => {
    if (rejectReason.trim()) {
      await rejectContent({ contentId: id, reason: rejectReason });
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const handleRejectCancel = () => {
    setRejectingId(null);
    setRejectReason('');
  };

  const handleApproveApp = (id: number) => {
    void approveApplication(id);
  };

  const handleRejectAppClick = (id: number) => {
    setRejectingAppId(id);
    setRejectAppReason('');
  };

  const handleRejectAppSubmit = async (id: number) => {
    if (rejectAppReason.trim()) {
      await rejectApplication(id, rejectAppReason);
      setRejectingAppId(null);
      setRejectAppReason('');
    }
  };

  return (
    <div className="h-full bg-[#0F172A]">
      <Tabs.Root defaultValue="moderation" className="h-full flex flex-col">
        <div className="bg-[#1a2332] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-8">
            <Tabs.List className="flex gap-4 pt-6">
              <Tabs.Trigger
                value="moderation"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                İçerik Moderasyonu
              </Tabs.Trigger>
              <Tabs.Trigger
                value="system"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Sistem Yönetimi
              </Tabs.Trigger>
              <Tabs.Trigger
                value="applications"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white flex items-center gap-1.5"
              >
                İçerik Üreticisi Başvuruları
                {applications.length > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-semibold">
                    {applications.length}
                  </span>
                )}
              </Tabs.Trigger>
              <Tabs.Trigger
                value="devtools"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Geliştirici Araçları
              </Tabs.Trigger>
            </Tabs.List>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Tabs.Content value="moderation" className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white">
                  İçerik Moderasyonu
                </h2>
                <p className="text-gray-400 mt-1">
                  İçerik ve finansal performansı izleyin
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <TrendingUp className="text-blue-400" size={24} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Aylık Gelir
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.monthlyRevenue || '—'}
                  </p>
                  <p className="text-sm text-green-400 mt-2">
                    {stats.monthlyRevenueChange}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Users className="text-green-400" size={24} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Aktif Aboneler
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.activeSubscribers || '0'}
                  </p>
                  <p className="text-sm text-green-400 mt-2">
                    {stats.activeSubscribersChange}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <FileText className="text-blue-400" size={24} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Toplam İçerik
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalContent || '0'}
                  </p>
                  <p className="text-sm text-blue-400 mt-2">
                    {stats.totalContentChange}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Clock className="text-orange-400" size={24} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-400 mb-1">
                    Bekleyen Onaylar
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {pendingContent.length}
                  </p>
                  {pendingContent.length > 0 && (
                    <p className="text-sm text-orange-400 mt-2">
                      İnceleme gerekiyor
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  Bekleyen İçerik Onayları
                </h3>

                {pendingContent.length > 0 ? (
                  <div className="space-y-4">
                    {pendingContent.map((item) => (
                      <div key={item.id}>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors">
                          <img
                            src={resolveMediaUrl(item.thumbnail) ?? item.thumbnail}
                            alt={item.title}
                            className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white mb-1 truncate">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
                              <span>{item.creator} tarafından</span>
                              <span>•</span>
                              <span>{item.type}</span>
                              <span>•</span>
                              <span>{item.uploadDate} yüklendi</span>
                              {item.subscriberOnly && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium">Premium</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            {item.mediaUrl && (
                              <button
                                onClick={() => setPreviewId(previewId === item.id ? null : item.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors font-medium text-sm"
                                title="Medyayı önizle"
                              >
                                {previewId === item.id ? <EyeOff size={16} /> : <Eye size={16} />}
                                Önizle
                              </button>
                            )}
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <CheckCircle size={18} />
                              Onayla
                            </button>
                            <button
                              onClick={() => handleRejectClick(item.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                              <XCircle size={18} />
                              Reddet
                            </button>
                          </div>
                        </div>

                        {/* Media preview panel */}
                        {previewId === item.id && item.mediaUrl && (
                          <div className="mt-2 p-4 bg-black/40 rounded-lg border border-white/10">
                            {item.category === 'ebooks' || item.category === 'magazines' || item.category === 'newspapers' ? (
                              <object
                                data={resolveMediaUrl(item.mediaUrl) ?? item.mediaUrl}
                                type="application/pdf"
                                className="w-full h-[480px] rounded"
                              >
                                <div className="text-gray-400 text-sm p-4">
                                  PDF görüntüleyici desteklenmiyor.{' '}
                                  <a href={resolveMediaUrl(item.mediaUrl) ?? item.mediaUrl} target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                                    İndir
                                  </a>
                                </div>
                              </object>
                            ) : (
                              <video
                                src={resolveMediaUrl(item.mediaUrl) ?? item.mediaUrl}
                                controls
                                className="w-full max-h-[480px] rounded bg-black"
                              />
                            )}
                          </div>
                        )}

                        {rejectingId === item.id && (
                          <div className="mt-2 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                            <label className="block text-sm font-medium text-gray-200 mb-2">
                              Reddetme Sebebi
                            </label>
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="İçerik üreticisine reddetme sebebini açıklayın..."
                              rows={3}
                              className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => void handleRejectSubmit(item.id)}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Reddetmeyi Onayla
                              </button>
                              <button
                                onClick={handleRejectCancel}
                                className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors font-medium"
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle
                      className="mx-auto text-green-400 mb-4"
                      size={48}
                    />
                    <p className="text-lg font-medium text-white">
                      Hepsi tamamlandı!
                    </p>
                    <p className="text-gray-400">İncelenecek içerik yok</p>
                  </div>
                )}
              </div>

              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Finansal Durum
                </h3>

                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={financialData}>
                    <CartesianGrid
                      key="grid-financial"
                      strokeDasharray="3 3"
                      stroke="#1e3a5f"
                    />
                    <XAxis
                      key="xaxis-financial"
                      dataKey="month"
                      stroke="#6b7280"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                      key="yaxis-left-financial"
                      yAxisId="left"
                      stroke="#3b82f6"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                      key="yaxis-right-financial"
                      yAxisId="right"
                      orientation="right"
                      stroke="#8b5cf6"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <Tooltip
                      key="tooltip-financial"
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend key="legend-financial" />
                    <Line
                      key="mrr-line"
                      yAxisId="left"
                      type="monotone"
                      dataKey="mrr"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Aylık Gelir (₺)"
                      dot={{ fill: '#3b82f6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      key="subscribers-line"
                      yAxisId="right"
                      type="monotone"
                      dataKey="subscribers"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      name="Aktif Aboneler"
                      dot={{ fill: '#8b5cf6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 mt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">
                      Kullanıcı Başına Ortalama Gelir
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stats.arpu || '—'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Büyüme Oranı</p>
                    <p className="text-2xl font-bold text-green-400">
                      {stats.growthRate || '—'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Kayıp Oranı</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {stats.churnRate || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="system" className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">
                  Sistem Yönetimi
                </h2>
                <p className="text-gray-400 mt-1">
                  Abonelik platformunuzu izleyin ve yönetin
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#1a2332] rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-400">
                      Toplam Kullanıcı
                    </p>
                    <Users className="text-blue-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {stats.totalUsers || '0'}
                  </p>
                  <p className="text-sm text-green-400 mt-1">
                    {stats.totalUsersChange}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-400">
                      Aylık Gelir
                    </p>
                    <DollarSign className="text-green-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {stats.monthlyRevenue || '—'}
                  </p>
                  <p className="text-sm text-green-400 mt-1">
                    {stats.monthlyRevenueChange}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-400">
                      Aktif Abonelikler
                    </p>
                    <CheckCircle className="text-blue-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {stats.activeSubscribers || '0'}
                  </p>
                  <p className="text-sm text-green-400 mt-1">
                    {stats.activeSubscribersChange}
                  </p>
                </div>

                <div className="bg-[#1a2332] rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-400">
                      Kayıp Oranı
                    </p>
                    <AlertCircle className="text-orange-400" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {stats.churnRate || '—'}
                  </p>
                  <p className="text-sm text-red-400 mt-1">
                    {stats.churnRateChange}
                  </p>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-lg border border-white/10 p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Aylık Tekrarlayan Gelir (MRR)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          key="stop-1"
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.4}
                        />
                        <stop
                          key="stop-2"
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      key="grid-revenue"
                      strokeDasharray="3 3"
                      stroke="#1e3a5f"
                    />
                    <XAxis
                      key="xaxis-revenue"
                      dataKey="month"
                      stroke="#4b5563"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis key="yaxis-revenue" stroke="#4b5563" tick={{ fill: '#9ca3af' }} />
                    <Tooltip
                      key="tooltip-revenue"
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      formatter={(value) => [
                        `₺${value.toLocaleString('tr-TR')}`,
                        'MRR',
                      ]}
                    />
                    <Area
                      key="mrr-area"
                      type="monotone"
                      dataKey="mrr"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMrr)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#1a2332] rounded-lg border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Kullanıcı Yönetimi
                  </h3>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <input
                      type="text"
                      value={systemUserSearch}
                      onChange={(e) => setSystemUserSearch(e.target.value)}
                      placeholder="Ad veya e-posta ara..."
                      className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="text-left py-3 px-4 font-semibold">Kullanıcı</th>
                        <th className="text-left py-3 px-4 font-semibold">E-posta</th>
                        <th className="text-left py-3 px-4 font-semibold">Plan</th>
                        <th className="text-left py-3 px-4 font-semibold">Durum</th>
                        <th className="text-left py-3 px-4 font-semibold">Aylık Gelir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((u) => {
                          const q = systemUserSearch.toLowerCase();
                          return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                        })
                        .map((user) => (
                          <tr
                            key={user.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-white">{user.name}</td>
                            <td className="py-3 px-4 text-gray-400">{user.email}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  user.tier === 'Yıllık Premium' || user.tier === 'Aylık Premium'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-white/10 text-gray-400'
                                }`}
                              >
                                {user.tier}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                  user.status === 'Aktif'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/10 text-gray-500'
                                }`}
                              >
                                {user.status === 'Aktif' && <CheckCircle size={11} />}
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-white">
                              ₺{Number(user.mrr).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <p className="text-center text-gray-500 py-8 text-sm">Kullanıcı yükleniyor...</p>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="applications" className="h-full">
            <div className="max-w-5xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">
                  İçerik Üreticisi Başvuruları
                </h2>
                <p className="text-gray-400 mt-1">
                  Bekleyen başvuruları inceleyin ve karara bağlayın
                </p>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="bg-[#1a2332] rounded-xl border border-white/10 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-400 font-semibold text-sm">
                                {app.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-white">{app.username}</p>
                              <p className="text-xs text-gray-500">{app.createdAt} tarihinde başvurdu</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <p className="text-sm font-medium text-gray-400 mb-1">Gerekçe</p>
                            <p className="text-gray-300 text-sm leading-relaxed">{app.rationale}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleApproveApp(app.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                          >
                            <CheckCircle size={16} />
                            Onayla
                          </button>
                          <button
                            onClick={() => handleRejectAppClick(app.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                          >
                            <XCircle size={16} />
                            Reddet
                          </button>
                        </div>
                      </div>

                      {rejectingAppId === app.id && (
                        <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                          <label className="block text-sm font-medium text-gray-200 mb-2">
                            Reddetme Sebebi <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            value={rejectAppReason}
                            onChange={(e) => setRejectAppReason(e.target.value)}
                            placeholder="Başvurucu'ya reddetme sebebini açıklayın..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-red-500 resize-none text-sm"
                          />
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => void handleRejectAppSubmit(app.id)}
                              disabled={!rejectAppReason.trim()}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Reddi Onayla
                            </button>
                            <button
                              onClick={() => { setRejectingAppId(null); setRejectAppReason(''); }}
                              className="px-4 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors font-medium text-sm"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <UserPlus className="mx-auto text-gray-600 mb-4" size={56} />
                  <p className="text-lg font-medium text-gray-400">
                    Bekleyen başvuru yok
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Yeni başvurular burada görünecek
                  </p>
                </div>
              )}
            </div>
          </Tabs.Content>
          {/* ── Geliştirici Araçları ── */}
          <Tabs.Content value="devtools" className="h-full">
            <div className="max-w-5xl mx-auto p-8 space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-white">Geliştirici Araçları</h2>
                <p className="text-gray-400 mt-1">Rol yönetimi, abonelik verme ve trafik simülasyonu</p>
              </div>

              {/* Role Management */}
              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Rol Yönetimi</h3>
                <div className="mb-4">
                  <input
                    type="text"
                    value={devUserSearch}
                    onChange={(e) => setDevUserSearch(e.target.value)}
                    placeholder="Kullanıcı ara (ad veya e-posta)..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="text-left py-2 px-3">Kullanıcı</th>
                        <th className="text-left py-2 px-3">E-posta</th>
                        <th className="text-left py-2 px-3">Mevcut Rol</th>
                        <th className="text-left py-2 px-3">Abonelik</th>
                        <th className="text-left py-2 px-3">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers
                        .filter((u) => {
                          const q = devUserSearch.toLowerCase();
                          return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
                        })
                        .map((u) => (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-3 text-white font-medium">{u.name}</td>
                            <td className="py-3 px-3 text-gray-400">{u.email}</td>
                            <td className="py-3 px-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                                u.role === 'CREATOR' ? 'bg-indigo-500/20 text-indigo-400' :
                                'bg-white/10 text-gray-300'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {u.hasSubscription ? (
                                <span className="text-green-400 text-xs">Aktif</span>
                              ) : (
                                <span className="text-gray-500 text-xs">Yok</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex gap-1">
                                {(['USER', 'CREATOR', 'ADMIN'] as const).map((role) => (
                                  <button
                                    key={role}
                                    disabled={u.role === role}
                                    onClick={async () => {
                                      try {
                                        await changeUserRole(u.id, role);
                                        toast.success(`${u.name} rolü ${role} olarak güncellendi`);
                                      } catch {
                                        toast.error('Rol güncellenemedi');
                                      }
                                    }}
                                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                      u.role === role
                                        ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                        : 'bg-white/10 text-gray-300 hover:bg-indigo-500/20 hover:text-indigo-300'
                                    }`}
                                  >
                                    {role}
                                  </button>
                                ))}
                                <button
                                  onClick={() => { setGrantingUserId(grantingUserId === u.id ? null : u.id); }}
                                  className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 transition-colors"
                                >
                                  Abonelik Ver
                                </button>
                                {u.role !== 'ADMIN' && (
                                  <button
                                    onClick={() => setDeletingUserId(deletingUserId === u.id ? null : u.id)}
                                    className="px-2 py-1 rounded text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                                  >
                                    Sil
                                  </button>
                                )}
                              </div>
                              {grantingUserId === u.id && (
                                <div className="mt-2 p-3 bg-[#0F172A] rounded-lg border border-white/10 flex gap-2 items-end">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Plan</label>
                                    <select
                                      value={grantPlanId}
                                      onChange={(e) => setGrantPlanId(e.target.value)}
                                      className="px-2 py-1.5 bg-white/5 border border-white/10 text-white rounded text-xs outline-none"
                                    >
                                      <option value="monthly">Aylık</option>
                                      <option value="yearly">Yıllık</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Ay</label>
                                    <input
                                      type="number"
                                      min={1}
                                      max={24}
                                      value={grantMonths}
                                      onChange={(e) => setGrantMonths(Number(e.target.value))}
                                      className="w-16 px-2 py-1.5 bg-white/5 border border-white/10 text-white rounded text-xs outline-none"
                                    />
                                  </div>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await grantSubscription(u.id, grantPlanId, grantMonths);
                                        setGrantingUserId(null);
                                        toast.success(`${u.name} kullanıcısına ${grantMonths} aylık abonelik verildi`);
                                      } catch {
                                        toast.error('Abonelik verilemedi');
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 transition-colors"
                                  >
                                    Onayla
                                  </button>
                                  <button
                                    onClick={() => setGrantingUserId(null)}
                                    className="px-3 py-1.5 bg-white/10 text-gray-300 rounded text-xs hover:bg-white/20 transition-colors"
                                  >
                                    İptal
                                  </button>
                                </div>
                              )}
                              {deletingUserId === u.id && (
                                <div className="mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30 flex gap-2 items-center">
                                  <p className="text-red-300 text-xs flex-1">
                                    <strong>{u.name}</strong> kalıcı olarak silinecek. Bu işlem geri alınamaz.
                                  </p>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await deleteUser(u.id);
                                        setDeletingUserId(null);
                                        toast.success(`${u.name} kullanıcısı silindi`);
                                      } catch {
                                        toast.error('Kullanıcı silinemedi');
                                      }
                                    }}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex-shrink-0"
                                  >
                                    Onayla
                                  </button>
                                  <button
                                    onClick={() => setDeletingUserId(null)}
                                    className="px-3 py-1.5 bg-white/10 text-gray-300 rounded text-xs hover:bg-white/20 transition-colors flex-shrink-0"
                                  >
                                    İptal
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {allUsers.length === 0 && (
                    <p className="text-center text-gray-500 py-6 text-sm">Kullanıcı yükleniyor...</p>
                  )}
                </div>
              </div>

              {/* Traffic Simulator */}
              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-1">Trafik Simülatörü</h3>
                <p className="text-gray-500 text-sm mb-5">Belirtilen içeriğe sahte görüntülenme ve beğeni ekler (trending sıralamasını etkiler)</p>
                <div className="flex gap-3 items-end flex-wrap">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">İçerik ID</label>
                    <input
                      type="number"
                      min={1}
                      value={simContentId}
                      onChange={(e) => setSimContentId(e.target.value)}
                      placeholder="örn. 42"
                      className="w-32 px-3 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Görüntülenme</label>
                    <input
                      type="number"
                      min={0}
                      value={simViews}
                      onChange={(e) => setSimViews(e.target.value)}
                      placeholder="0"
                      className="w-32 px-3 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Beğeni</label>
                    <input
                      type="number"
                      min={0}
                      value={simLikes}
                      onChange={(e) => setSimLikes(e.target.value)}
                      placeholder="0"
                      className="w-32 px-3 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <button
                    disabled={!simContentId}
                    onClick={async () => {
                      try {
                        await simulateTraffic(
                          Number(simContentId),
                          Number(simViews) || 0,
                          Number(simLikes) || 0,
                        );
                        setSimResult(`İçerik #${simContentId} → +${simViews || 0} görüntülenme, +${simLikes || 0} beğeni eklendi`);
                        setSimContentId('');
                        setSimViews('');
                        setSimLikes('');
                        toast.success('Trafik simülasyonu uygulandı');
                      } catch {
                        toast.error('Simülasyon başarısız');
                      }
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Uygula
                  </button>
                </div>
                {simResult && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    {simResult}
                  </div>
                )}
              </div>

              {/* Content Delete */}
              <div className="bg-[#1a2332] rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-1">İçerik Sil</h3>
                <p className="text-gray-500 text-sm mb-5">İçeriği ID ile kalıcı olarak siler — beğeniler, indirmeler, kazançlar ve kalp atışları da silinir.</p>
                <div className="flex gap-3 items-end flex-wrap">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">İçerik ID</label>
                    <input
                      type="number"
                      min={1}
                      value={deleteContentId}
                      onChange={(e) => { setDeleteContentId(e.target.value); setDeleteContentResult(null); }}
                      placeholder="örn. 42"
                      className="w-36 px-3 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <button
                    disabled={!deleteContentId}
                    onClick={async () => {
                      try {
                        await deleteContent(Number(deleteContentId));
                        setDeleteContentResult(`İçerik #${deleteContentId} silindi.`);
                        setDeleteContentId('');
                        toast.success('İçerik silindi');
                      } catch {
                        toast.error('İçerik silinemedi');
                      }
                    }}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sil
                  </button>
                </div>
                {deleteContentResult && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {deleteContentResult}
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
