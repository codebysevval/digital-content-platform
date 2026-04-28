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
import { useAdminStore, useAuthStore } from '../../store';

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

  useEffect(() => {
    if (userRole !== 'admin') return;
    void fetchPendingContent();
    void fetchFinancialData();
    void fetchRevenueData();
    void fetchManagedUsersDashboard();
    void fetchAdminStats();
  }, [
    userRole,
    fetchPendingContent,
    fetchFinancialData,
    fetchRevenueData,
    fetchManagedUsersDashboard,
    fetchAdminStats,
  ]);

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
            </Tabs.List>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Tabs.Content value="moderation" className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  İçerik Moderasyonu
                </h2>
                <p className="text-gray-600 mt-1">
                  İçerik ve finansal performansı izleyin
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Aylık Gelir
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.monthlyRevenue}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    {stats.monthlyRevenueChange}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="text-green-600" size={24} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Aktif Aboneler
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.activeSubscribers}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    {stats.activeSubscribersChange}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Toplam İçerik
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalContent}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    {stats.totalContentChange}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Clock className="text-orange-600" size={24} />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Bekleyen Onaylar
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingContent.length}
                  </p>
                  <p className="text-sm text-orange-600 mt-2">
                    İnceleme gerekiyor
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Bekleyen İçerik Onayları
                </h3>

                {pendingContent.length > 0 ? (
                  <div className="space-y-4">
                    {pendingContent.map((item) => (
                      <div key={item.id}>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-24 h-18 rounded-lg object-cover"
                          />

                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{item.creator} tarafından</span>
                              <span>•</span>
                              <span>{item.type}</span>
                              <span>•</span>
                              <span>{item.uploadDate} yüklendi</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
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

                        {rejectingId === item.id && (
                          <div className="mt-2 p-4 bg-red-50 rounded-lg border border-red-200">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Reddetme Sebebi
                            </label>
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="İçerik üreticisine reddetme sebebini açıklayın..."
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => void handleRejectSubmit(item.id)}
                                disabled={!rejectReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                Reddetmeyi Onayla
                              </button>
                              <button
                                onClick={handleRejectCancel}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
                      className="mx-auto text-green-600 mb-4"
                      size={48}
                    />
                    <p className="text-lg font-medium text-gray-900">
                      Hepsi tamamlandı!
                    </p>
                    <p className="text-gray-600">İncelenecek içerik yok</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Finansal Durum
                </h3>

                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={financialData}>
                    <CartesianGrid
                      key="grid-financial"
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      key="xaxis-financial"
                      dataKey="month"
                      stroke="#6b7280"
                    />
                    <YAxis
                      key="yaxis-left-financial"
                      yAxisId="left"
                      stroke="#3b82f6"
                    />
                    <YAxis
                      key="yaxis-right-financial"
                      yAxisId="right"
                      orientation="right"
                      stroke="#8b5cf6"
                    />
                    <Tooltip
                      key="tooltip-financial"
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 mt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">
                      Kullanıcı Başına Ortalama Gelir
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.arpu}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Büyüme Oranı</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.growthRate}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Kayıp Oranı</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stats.churnRate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="system" className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-900">
                  Sistem Yönetimi
                </h2>
                <p className="text-gray-600 mt-1">
                  Abonelik platformunuzu izleyin ve yönetin
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Toplam Kullanıcı
                    </p>
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stats.totalUsersChange}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Aylık Gelir
                    </p>
                    <DollarSign className="text-green-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.monthlyRevenue}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stats.monthlyRevenueChange}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Aktif Abonelikler
                    </p>
                    <CheckCircle className="text-blue-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.activeSubscribers}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {stats.activeSubscribersChange}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">
                      Kayıp Oranı
                    </p>
                    <AlertCircle className="text-orange-600" size={20} />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.churnRate}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {stats.churnRateChange}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                          stopOpacity={0.3}
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
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      key="xaxis-revenue"
                      dataKey="month"
                      stroke="#6b7280"
                    />
                    <YAxis key="yaxis-revenue" stroke="#6b7280" />
                    <Tooltip
                      key="tooltip-revenue"
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
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

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Kullanıcı Yönetimi
                  </h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <Filter size={18} />
                      Filtrele
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Kullanıcı
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          E-posta
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Plan
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Durum
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Aylık Gelir
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            {user.name}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                user.tier === 'Yıllık Premium' ||
                                user.tier === 'Aylık Premium'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {user.tier}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'Aktif'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {user.status === 'Aktif' && <CheckCircle size={12} />}
                              {user.status === 'İptal Edildi' && (
                                <XCircle size={12} />
                              )}
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            ₺{user.mrr}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}
