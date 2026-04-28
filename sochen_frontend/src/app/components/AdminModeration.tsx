import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import { useAdminStore } from '../../store';

export function AdminModeration() {
  const pendingContent = useAdminStore((s) => s.pendingContent);
  const financialData = useAdminStore((s) => s.financialData);
  const stats = useAdminStore((s) => s.stats);
  const fetchPendingContent = useAdminStore((s) => s.fetchPendingContent);
  const fetchFinancialData = useAdminStore((s) => s.fetchFinancialData);
  const fetchAdminStats = useAdminStore((s) => s.fetchAdminStats);
  const approveContent = useAdminStore((s) => s.approveContent);
  const rejectContent = useAdminStore((s) => s.rejectContent);

  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    void fetchPendingContent();
    void fetchFinancialData();
    void fetchAdminStats();
  }, [fetchPendingContent, fetchFinancialData, fetchAdminStats]);

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
    <div className="flex h-full bg-gray-50">
      <aside className="w-72 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Yönetici Portalı</h1>
          <p className="text-sm text-gray-500 mt-1">İçerik & Finans Kontrolü</p>
        </div>

        <nav className="space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium"
          >
            <Eye size={20} />
            İçerik Moderasyonu
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <DollarSign size={20} />
            Finans Analizi
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Users size={20} />
            Kullanıcı Yönetimi
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <FileText size={20} />
            Sistem Ayarları
          </a>
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-blue-600" size={18} />
            <p className="text-sm font-semibold text-gray-900">
              Bekleyen İncelemeler
            </p>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {pendingContent.length}
          </p>
          <p className="text-xs text-gray-600 mt-1">Acil dikkat gerekiyor</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Panel Özeti</h2>
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
              <p className="text-sm text-orange-600 mt-2">İnceleme gerekiyor</p>
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
                <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
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

            <div className="mb-6">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
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
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">
                  Kullanıcı Başına Ortalama Gelir
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.arpu}</p>
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
      </main>
    </div>
  );
}
