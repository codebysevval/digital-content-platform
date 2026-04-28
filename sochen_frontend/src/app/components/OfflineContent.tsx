import {
  Download,
  Trash2,
  Play,
  CheckCircle,
  TrendingUp,
  Lock,
  FileText,
} from 'lucide-react';
import { useEffect } from 'react';
import { useOfflineStore } from '../../store';

interface OfflineContentProps {
  onContentClick: (contentId: number) => void;
}

export function OfflineContent({ onContentClick }: OfflineContentProps) {
  const offlineItems = useOfflineStore((s) => s.items);
  const storageLimitMb = useOfflineStore((s) => s.storageLimitMb);
  const fetchOfflineContent = useOfflineStore((s) => s.fetchOfflineContent);
  const deleteOfflineItem = useOfflineStore((s) => s.deleteOfflineItem);
  const getTotalSizeMb = useOfflineStore((s) => s.getTotalSizeMb);

  const totalSize = getTotalSizeMb();

  useEffect(() => {
    void fetchOfflineContent();
  }, [fetchOfflineContent]);

  const handleDelete = (id: number) => {
    void deleteOfflineItem(id);
  };

  const storageGbLabel =
    storageLimitMb >= 1024
      ? `${Math.round(storageLimitMb / 1024)} GB`
      : `${storageLimitMb} MB`;

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Çevrimdışı İçerikler</h1>
          <p className="text-gray-400">
            İndirilen içeriklerinizi internet bağlantısı olmadan izleyebilirsiniz
          </p>
        </div>

        <div className="bg-[#1a2332] rounded-xl border border-white/5 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Depolama Kullanımı</h3>
              <p className="text-sm text-gray-400">{offlineItems.length} içerik indirildi</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                {totalSize.toFixed(0)} MB
              </p>
              <p className="text-sm text-gray-400">/ {storageGbLabel}</p>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full"
              style={{ width: `${(totalSize / storageLimitMb) * 100}%` }}
            ></div>
          </div>
        </div>

        {offlineItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offlineItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onContentClick(item.id)}
                className="group relative bg-[#1a2332] rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent"></div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-xl cursor-pointer">
                      {item.category === 'magazines' ||
                      item.category === 'newspapers' ? (
                        <FileText className="text-white" size={28} />
                      ) : (
                        <Play className="text-white ml-1" size={28} fill="white" />
                      )}
                    </div>
                  </div>

                  <div className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                    <CheckCircle size={12} />
                    İndirildi
                  </div>

                  {item.subscriberOnly && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                      <Lock size={12} />
                      Premium
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors flex-1">
                      {item.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="flex-shrink-0 p-1 hover:scale-110 transition-transform text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <p className="text-sm text-gray-400 mb-2">{item.creator}</p>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                    <span className="capitalize">
                      {item.category === 'courses'
                        ? 'Kurslar'
                        : item.category === 'podcasts'
                          ? "Podcast'ler"
                          : item.category === 'magazines'
                            ? 'Dergiler'
                            : item.category === 'newspapers'
                              ? 'Gazeteler'
                              : 'İçerik'}
                    </span>
                    <span>{item.duration}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Download size={12} />
                      <span>{item.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={12} />
                      <span>{item.views.toLocaleString('tr-TR')} görüntülenme</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    İndirilme: {item.downloadDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Download className="text-gray-600" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Henüz indirilen içerik yok
            </h3>
            <p className="text-gray-400">
              İçerikleri indirerek çevrimdışı izleyebilirsiniz
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
