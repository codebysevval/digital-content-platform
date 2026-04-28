import {
  Play,
  Lock,
  TrendingUp,
  Users,
  FileText,
  Heart,
  Bell,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCreatorStore } from '../../store';
import { formatUploadDate } from '../../lib/formatters';
import type { Creator, CreatorContent as CreatorContentDTO } from '../../types';

interface CreatorProfileProps {
  creatorId: number;
  onContentClick?: (contentId: number) => void;
}

export function CreatorProfile({
  creatorId,
  onContentClick,
}: CreatorProfileProps) {
  const fetchCreatorById = useCreatorStore((s) => s.fetchCreatorById);
  const fetchCreatorContent = useCreatorStore((s) => s.fetchCreatorContent);
  const toggleFollow = useCreatorStore((s) => s.toggleFollow);
  const toggleNotifications = useCreatorStore((s) => s.toggleNotifications);
  const isFollowing = useCreatorStore((s) => s.isFollowing);
  const isNotified = useCreatorStore((s) => s.isNotified);
  const followingStatus = useCreatorStore((s) => s.followingStatus);
  const notificationStatus = useCreatorStore((s) => s.notificationStatus);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorContent, setCreatorContent] = useState<CreatorContentDTO[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>(
    'loading',
  );

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setCreator(null);
    void fetchCreatorById(creatorId).then((c) => {
      if (cancelled) return;
      setCreator(c);
      setStatus(c ? 'ready' : 'not-found');
    });
    void fetchCreatorContent(creatorId).then((items) => {
      if (!cancelled) setCreatorContent(items);
    });
    return () => {
      cancelled = true;
    };
  }, [creatorId, fetchCreatorById, fetchCreatorContent]);

  if (status === 'loading') {
    return (
      <div className="min-h-full bg-[#0F172A] flex items-center justify-center text-gray-400">
        Yükleniyor...
      </div>
    );
  }

  if (status === 'not-found' || !creator) {
    return (
      <div className="min-h-full bg-[#0F172A] flex items-center justify-center text-gray-400">
        Üretici bulunamadı.
      </div>
    );
  }

  const following = isFollowing(creator.id) || !!followingStatus[creator.id];
  const notificationsOn =
    isNotified(creator.id) || !!notificationStatus[creator.id];

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="relative bg-[#0F172A] border border-white/5 rounded-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>

          <div className="relative flex items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
              {creator.avatar}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {creator.name}
                  </h1>
                  <p className="text-indigo-300 mb-3">{creator.type}</p>
                  <p className="text-gray-300 max-w-2xl">{creator.bio}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => void toggleFollow(creator.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      following
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:shadow-lg'
                    }`}
                  >
                    {following ? (
                      <>
                        <CheckCircle size={20} />
                        Takip Ediliyor
                      </>
                    ) : (
                      <>
                        <Users size={20} />
                        Takip Et
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => void toggleNotifications(creator.id)}
                    className={`p-3 rounded-lg transition-all ${
                      notificationsOn
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    <Bell
                      size={20}
                      fill={notificationsOn ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 text-indigo-300 mb-2">
                    <Users size={18} />
                    <span className="text-sm">Takipçi</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {creator.followers.toLocaleString('tr-TR')}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 text-indigo-300 mb-2">
                    <FileText size={18} />
                    <span className="text-sm">İçerik</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {creator.totalContent}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-2 text-indigo-300 mb-2">
                    <TrendingUp size={18} />
                    <span className="text-sm">Toplam Görüntülenme</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {(creator.totalViews / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Son İçerikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorContent.map((item) => (
              <div
                key={item.id}
                onClick={() => onContentClick?.(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onContentClick?.(item.id);
                }}
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
                      <Play className="text-white ml-1" size={28} fill="white" />
                    </div>
                  </div>

                  {item.subscriberOnly && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                      <Lock size={12} />
                      Sadece Aboneler
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors flex-1">
                      {item.title}
                    </h3>
                    <button className="flex-shrink-0 p-1 hover:scale-110 transition-transform">
                      <Heart size={20} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
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
        </div>
      </div>
    </div>
  );
}
