import { Heart, Play, Lock, TrendingUp, FileText, Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { useContentStore } from '../../store';
import { formatUploadDate } from '../../lib/formatters';

interface LikedContentProps {
  onContentClick: (contentId: number) => void;
}

export function LikedContent({ onContentClick }: LikedContentProps) {
  const likedItems = useContentStore((s) => s.likedContentList);
  const fetchLikedContent = useContentStore((s) => s.fetchLikedContent);

  useEffect(() => {
    void fetchLikedContent();
  }, [fetchLikedContent]);

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Beğenilen İçerikler</h1>
          <p className="text-gray-400">Beğendiğiniz {likedItems.length} içerik</p>
        </div>

        {likedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {likedItems.map((item) => (
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
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-xl">
                      {item.category === 'magazines' ||
                      item.category === 'newspapers' ? (
                        <FileText className="text-white" size={28} />
                      ) : (
                        <Play className="text-white ml-1" size={28} fill="white" />
                      )}
                    </div>
                  </div>

                  {item.subscriberOnly && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                      <Lock size={12} />
                      Sadece Aboneler
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <Heart size={20} className="fill-red-500 text-red-500" />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">{item.creator}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} />
                      <span>{item.views.toLocaleString('tr-TR')} görüntülenme</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatUploadDate(item.uploadDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="mx-auto text-gray-600 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Henüz beğenilen içerik yok
            </h3>
            <p className="text-gray-400">İçerikleri beğenmeye başlayın</p>
          </div>
        )}
      </div>
    </div>
  );
}
