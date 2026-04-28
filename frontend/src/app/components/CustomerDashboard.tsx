import { Download, CheckCircle2 } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import * as Tabs from '@radix-ui/react-tabs';
import { useEffect } from 'react';
import { useSubscriptionStore } from '../../store';

const pct = (used: number, limit: number) =>
  limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

export function CustomerDashboard() {
  const billingHistory = useSubscriptionStore((s) => s.billingHistory);
  const status = useSubscriptionStore((s) => s.status);
  const usageQuota = useSubscriptionStore((s) => s.usageQuota);
  const fetchBillingHistory = useSubscriptionStore((s) => s.fetchBillingHistory);
  const fetchSubscriptionStatus = useSubscriptionStore(
    (s) => s.fetchSubscriptionStatus,
  );
  const fetchUsageQuota = useSubscriptionStore((s) => s.fetchUsageQuota);
  const cancelSubscription = useSubscriptionStore((s) => s.cancelSubscription);

  useEffect(() => {
    void fetchBillingHistory();
    void fetchSubscriptionStatus();
    void fetchUsageQuota();
  }, [fetchBillingHistory, fetchSubscriptionStatus, fetchUsageQuota]);

  const apiPct = pct(usageQuota.apiCallsUsed, usageQuota.apiCallsLimit);
  const storagePct = pct(usageQuota.storageUsedGb, usageQuota.storageLimitGb);
  const teamPct = pct(usageQuota.teamMembersUsed, usageQuota.teamMembersLimit);

  return (
    <div className="h-full bg-[#0F172A]">
      <Tabs.Root defaultValue="dashboard" className="h-full flex flex-col">
        <div className="bg-[#1a2332] border-b border-white/10">
          <div className="max-w-7xl mx-auto px-8">
            <Tabs.List className="flex gap-4 pt-6">
              <Tabs.Trigger
                value="dashboard"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Gösterge Paneli
              </Tabs.Trigger>
              <Tabs.Trigger
                value="billing"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Faturalama
              </Tabs.Trigger>
              <Tabs.Trigger
                value="usage"
                className="pb-4 px-2 text-sm font-medium border-b-2 transition-colors data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-400 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-400 hover:text-white"
              >
                Kullanım
              </Tabs.Trigger>
            </Tabs.List>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Tabs.Content value="dashboard" className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">
                  Gösterge Paneli
                </h2>
                <p className="text-gray-400 mt-1">
                  Aboneliğinizi ve kullanımınızı görüntüleyin
                </p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        Mevcut Plan: {status.planName}
                      </h3>
                      {status.isActive && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-600/20 text-green-400 text-sm">
                          <CheckCircle2 size={14} />
                          Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">
                      Sonraki fatura tarihi: {status.nextBillingDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      ₺{status.price.toLocaleString('tr-TR')}
                    </p>
                    <p className="text-gray-400">/ay</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">
                        Kullanılan API Çağrısı
                      </span>
                      <span className="text-sm font-medium text-white">
                        {usageQuota.apiCallsUsed.toLocaleString('tr-TR')} /{' '}
                        {usageQuota.apiCallsLimit.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <Progress.Root className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <Progress.Indicator
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${apiPct}%` }}
                      />
                    </Progress.Root>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">
                        Kullanılan Depolama
                      </span>
                      <span className="text-sm font-medium text-white">
                        {usageQuota.storageUsedGb} GB / {usageQuota.storageLimitGb}{' '}
                        GB
                      </span>
                    </div>
                    <Progress.Root className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <Progress.Indicator
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${storagePct}%` }}
                      />
                    </Progress.Root>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">
                        Ekip Üyeleri
                      </span>
                      <span className="text-sm font-medium text-white">
                        {usageQuota.teamMembersUsed} /{' '}
                        {usageQuota.teamMembersLimit}
                      </span>
                    </div>
                    <Progress.Root className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <Progress.Indicator
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${teamPct}%` }}
                      />
                    </Progress.Root>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Hızlı İşlemler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-medium">
                    Planı Yükselt
                  </button>
                  <button className="px-6 py-3 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors font-medium">
                    Ödeme Yöntemi Ekle
                  </button>
                  <button
                    onClick={() => void cancelSubscription()}
                    className="px-6 py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors font-medium"
                  >
                    Aboneliği İptal Et
                  </button>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="billing" className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">Faturalama</h2>
                <p className="text-gray-400 mt-1">
                  Fatura geçmişinizi görüntüleyin
                </p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Fatura Geçmişi
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Tarih
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Plan
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Tutar
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Durum
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
                          Fatura
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 px-4 text-sm text-white">
                            {item.date}
                          </td>
                          <td className="py-4 px-4 text-sm text-white">
                            {item.plan}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-white">
                            {item.amount}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-600/20 text-green-400 text-xs font-medium">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                              <Download size={16} />
                              İndir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="usage" className="h-full">
            <div className="max-w-7xl mx-auto p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold text-white">Kullanım</h2>
                <p className="text-gray-400 mt-1">
                  Kaynak kullanımınızı görüntüleyin
                </p>
              </div>

              <div className="bg-[#1a2332] rounded-xl shadow-sm border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">
                  Kaynak Kullanımı
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">
                        API Çağrıları
                      </span>
                      <span className="text-sm font-medium text-white">
                        {usageQuota.apiCallsUsed.toLocaleString('tr-TR')} /{' '}
                        {usageQuota.apiCallsLimit.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <Progress.Root className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <Progress.Indicator
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${apiPct}%` }}
                      />
                    </Progress.Root>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">
                        Depolama
                      </span>
                      <span className="text-sm font-medium text-white">
                        {usageQuota.storageUsedGb} GB / {usageQuota.storageLimitGb}{' '}
                        GB
                      </span>
                    </div>
                    <Progress.Root className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <Progress.Indicator
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${storagePct}%` }}
                      />
                    </Progress.Root>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-400">
                        Ekip Üyeleri
                      </span>
                      <span className="text-sm font-medium text-white">
                        {usageQuota.teamMembersUsed} /{' '}
                        {usageQuota.teamMembersLimit}
                      </span>
                    </div>
                    <Progress.Root className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <Progress.Indicator
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${teamPct}%` }}
                      />
                    </Progress.Root>
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
