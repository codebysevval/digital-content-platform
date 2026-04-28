import {
  Users,
  DollarSign,
  Server,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect } from 'react';
import { useAdminStore } from '../../store';

export function AdminPanel() {
  const revenueData = useAdminStore((s) => s.revenueData);
  const users = useAdminStore((s) => s.managedUsersAdminPanel);
  const modules = useAdminStore((s) => s.systemModules);
  const stats = useAdminStore((s) => s.stats);
  const fetchRevenueData = useAdminStore((s) => s.fetchRevenueData);
  const fetchManagedUsersAdminPanel = useAdminStore(
    (s) => s.fetchManagedUsersAdminPanel,
  );
  const fetchSystemModules = useAdminStore((s) => s.fetchSystemModules);
  const fetchAdminStats = useAdminStore((s) => s.fetchAdminStats);

  useEffect(() => {
    void fetchRevenueData();
    void fetchManagedUsersAdminPanel();
    void fetchSystemModules();
    void fetchAdminStats();
  }, [
    fetchRevenueData,
    fetchManagedUsersAdminPanel,
    fetchSystemModules,
    fetchAdminStats,
  ]);

  return (
    <div className="flex h-full bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900">
            Yönetici Portalı
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sistem Kontrolü</p>
        </div>

        <nav className="flex-1 space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700"
          >
            <Activity size={20} />
            <span>Panel</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Users size={20} />
            <span>Kullanıcılar</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Server size={20} />
            <span>Servisler</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <DollarSign size={20} />
            <span>Gelir</span>
          </a>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">
              Sistem Özeti
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
                <p className="text-sm font-medium text-gray-600">Aylık Gelir</p>
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
                <CheckCircle2 className="text-blue-600" size={20} />
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
                <p className="text-sm font-medium text-gray-600">Kayıp Oranı</p>
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
              Modüler Sistem Sağlığı
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modules.map((module, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {module.status === 'online' ? (
                        <CheckCircle2 className="text-green-500" size={18} />
                      ) : (
                        <AlertCircle className="text-orange-500" size={18} />
                      )}
                      <span
                        className={`text-xs font-semibold uppercase ${
                          module.status === 'online'
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {module.status === 'online'
                          ? 'Çevrimiçi'
                          : 'Düşük Performans'}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {module.name}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Çalışma Süresi: {module.uptime}</p>
                    <p>İstekler: {module.requests}/saat</p>
                  </div>
                </div>
              ))}
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
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [
                    `₺${value.toLocaleString('tr-TR')}`,
                    'MRR',
                  ]}
                />
                <Area
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
                      Abonelik Seviyesi
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Durum
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      MRR
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
                            user.tier === 'Kurumsal'
                              ? 'bg-blue-100 text-blue-700'
                              : user.tier === 'Pro'
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
                              : user.status === 'Deneme'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.status === 'Aktif' && <CheckCircle2 size={12} />}
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
      </main>
    </div>
  );
}
