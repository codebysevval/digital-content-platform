import {
  Play,
  Pause,
  Heart,
  Download,
  Share2,
  Eye,
  Clock,
  Calendar,
  Lock,
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  useContentStore,
  useCreatorStore,
  useOfflineStore,
  useSubscriptionStore,
  useAuthStore,
} from '../../store';
import { api, resolveMediaUrl } from '../../lib/api';
import type {
  ContentCategory,
  ContentDetailDTO,
  RelatedContent,
} from '../../types';

interface ContentDetailProps {
  contentId: number;
  onBack: () => void;
  onContentClick?: (contentId: number) => void;
}

const categoryLabel = (category: string): string => {
  switch (category) {
    case 'courses': return 'Videolar';
    case 'podcasts': return "Podcast'ler";
    case 'magazines': return 'Dergiler';
    case 'newspapers': return 'Gazeteler';
    case 'ebooks': return 'E-kitaplar';
    default: return 'İçerik';
  }
};

// Map a category string (canonical enum value or legacy localized label) to ContentCategory.
const toContentCategory = (
  display: string,
  fallback: ContentCategory = 'courses',
): ContentCategory => {
  const normalized = display.toLowerCase();
  if (normalized === 'courses') return 'courses';
  if (normalized === 'podcasts') return 'podcasts';
  if (normalized === 'ebooks') return 'ebooks';
  if (normalized === 'magazines') return 'magazines';
  if (normalized === 'newspapers') return 'newspapers';
  if (normalized.includes('podcast')) return 'podcasts';
  if (normalized.includes('kitap') || normalized.includes('ebook')) return 'ebooks';
  if (normalized.includes('dergi') || normalized.includes('magazine')) return 'magazines';
  if (normalized.includes('gazete') || normalized.includes('newspaper')) return 'newspapers';
  if (normalized.includes('kurs') || normalized.includes('video') || normalized.includes('course')) return 'courses';
  return fallback;
};

export function ContentDetail({
  contentId,
  onBack,
  onContentClick,
}: ContentDetailProps) {
  const navigate = useNavigate();
  const fetchContentById = useContentStore((s) => s.fetchContentById);
  const fetchRelatedContent = useContentStore((s) => s.fetchRelatedContent);
  const catalog = useContentStore((s) => s.catalog);
  const toggleLikeAction = useContentStore((s) => s.toggleLike);
  const isLiked = useContentStore((s) => s.isLiked);
  const likedContentIds = useContentStore((s) => s.likedContentIds);

  const toggleFollow = useCreatorStore((s) => s.toggleFollow);
  const isFollowing = useCreatorStore((s) => s.isFollowing);
  const followingStatus = useCreatorStore((s) => s.followingStatus);

  const offlineHasItem = useOfflineStore((s) => s.hasItem);
  const addOfflineItem = useOfflineStore((s) => s.addOfflineItem);
  const offlineItems = useOfflineStore((s) => s.items);

  const isSubscribed = useSubscriptionStore((s) => s.status.isActive);
  const statusFetched = useSubscriptionStore((s) => s.statusFetched);
  const fetchSubscriptionStatus = useSubscriptionStore((s) => s.fetchSubscriptionStatus);
  const user = useAuthStore((s) => s.user);

  const [content, setContent] = useState<ContentDetailDTO | null>(null);
  const [related, setRelated] = useState<RelatedContent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const viewFiredRef = useRef(false);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchContentById(contentId).then((c) => {
      if (!cancelled) setContent(c);
    });
    void fetchRelatedContent(contentId).then((items) => {
      if (!cancelled) setRelated(items);
    });
    if (user) void fetchSubscriptionStatus();
    return () => {
      cancelled = true;
    };
  }, [contentId, fetchContentById, fetchRelatedContent, fetchSubscriptionStatus, user]);

  useEffect(() => {
    if (isPlaying && user) {
      if (!viewFiredRef.current) {
        viewTimerRef.current = setTimeout(() => {
          viewFiredRef.current = true;
          void api.post(`/api/content/${contentId}/view`);
        }, 5000);
      }
      heartbeatIntervalRef.current = setInterval(() => {
        void api.post(`/api/content/${contentId}/heartbeat`);
      }, 15000);
    } else {
      if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    }
    return () => {
      if (viewTimerRef.current) clearTimeout(viewTimerRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [isPlaying, contentId, user]);

  useEffect(() => {
    viewFiredRef.current = false;
    setIsPlaying(false);
  }, [contentId]);

  const isDownloaded = useMemo(
    () => offlineHasItem(contentId),
    [offlineHasItem, contentId, offlineItems],
  );

  if (!content) {
    return (
      <div className="min-h-full bg-[#0F172A] flex items-center justify-center text-gray-400">
        Yükleniyor...
      </div>
    );
  }

  const liked = isLiked(contentId) || likedContentIds.includes(contentId);
  const following = isFollowing(content.creatorId) || !!followingStatus[content.creatorId];

  // Show a paywall for subscriber-only content when the user is not subscribed.
  // Wait for the subscription fetch to complete before deciding (avoids flash).
  if (content.subscriberOnly) {
    if (!user) {
      return (
        <div className="min-h-full bg-[#0F172A] overflow-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <Lock size={16} /> Geri dön
            </button>
            <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="text-indigo-400" size={36} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Bu İçerik Abonelere Özeldir</h2>
              <p className="text-gray-400 mb-2">{content.title}</p>
              <p className="text-indigo-400 text-sm mt-4">Lütfen giriş yapın veya bir plan seçin.</p>
            </div>
          </div>
        </div>
      );
    }
    if (!statusFetched) {
      return (
        <div className="min-h-full bg-[#0F172A] flex items-center justify-center text-gray-400">
          Yükleniyor...
        </div>
      );
    }
  }
  if (content.subscriberOnly && !isSubscribed) {
    return (
      <div className="min-h-full bg-[#0F172A] overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Lock size={16} /> Geri dön
          </button>
          <div className="bg-[#1a2332] border border-white/10 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="text-indigo-400" size={36} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Bu İçerik Abonelere Özeldir
            </h2>
            <p className="text-gray-400 mb-2">{content.title}</p>
            <p className="text-gray-400 text-sm mb-8">
              Bu içeriğe erişmek için premium plana geçmeniz gerekmektedir.
            </p>
            {!user && (
              <p className="text-indigo-400 text-sm">
                Lütfen giriş yapın veya bir plan seçin.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Newspapers and magazines are read, not played — derive from the
  // canonical category rather than the localized display string.
  const canonicalCategory =
    catalog.find((c) => c.id === contentId)?.category ??
    toContentCategory(content.category);
  const isReadable =
    canonicalCategory === 'newspapers' || canonicalCategory === 'magazines' || canonicalCategory === 'ebooks';

  const handleToggleLike = () => {
    void toggleLikeAction(contentId);
  };

  const handleToggleFollow = () => {
    void toggleFollow(content.creatorId);
  };

  const handleDownload = async () => {
    if (isDownloaded) return;
    const catalogItem = catalog.find((c) => c.id === contentId);
    const category = catalogItem?.category ?? toContentCategory(content.category);
    await addOfflineItem({
      id: content.id,
      title: content.title,
      category,
      thumbnail: content.thumbnail,
      duration: content.duration,
      views: content.views,
      subscriberOnly: content.subscriberOnly,
      creator: content.creator,
    });
  };

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 5L7.5 10L12.5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Geri Dön
        </button>

        <div className="mb-8">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
            {isReadable && isPlaying && content.mediaUrl ? (
              <object
                data={resolveMediaUrl(content.mediaUrl)}
                type="application/pdf"
                className="absolute inset-0 w-full h-full border-0"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0F172A]">
                  <p className="text-gray-400 text-sm">PDF görüntüleyici bu tarayıcıda desteklenmiyor.</p>
                  <a
                    href={resolveMediaUrl(content.mediaUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                  >
                    Yeni Sekmede Aç
                  </a>
                </div>
              </object>
            ) : (
              <>
                <img
                  src={resolveMediaUrl(content.thumbnail) ?? ''}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                {isReadable ? (
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-end">
                    <button
                      onClick={() => setIsPlaying((p) => !p)}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 hover:shadow-xl transition-all"
                    >
                      <BookOpen size={20} />
                      {isPlaying ? 'Okuyorsunuz...' : 'Hemen Oku'}
                    </button>
                  </div>
                ) : content.mediaUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <video
                      src={resolveMediaUrl(content.mediaUrl)}
                      controls
                      className="absolute inset-0 w-full h-full object-contain bg-black"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying((p) => !p)}
                      className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                    >
                      {isPlaying
                        ? <Pause className="text-white" size={40} fill="white" />
                        : <Play className="text-white ml-2" size={40} fill="white" />
                      }
                    </button>
                  </div>
                )}
              </>
            )}
            {content.subscriberOnly && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold">
                <Lock size={16} />
                Sadece Aboneler
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-[#1a2332] rounded-2xl border border-white/5 p-8">
              <h1 className="text-4xl font-bold text-white mb-4">{content.title}</h1>

              <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Eye size={18} />
                  <span>{content.views.toLocaleString('tr-TR')} görüntülenme</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{content.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{content.uploadDate}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    liked
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                  {liked ? 'Beğenildi' : 'Beğen'}
                  {(content.likeCount ?? 0) > 0 && (
                    <span className="ml-1 text-sm opacity-80">
                      {(content.likeCount ?? 0).toLocaleString('tr-TR')}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => void handleDownload()}
                  disabled={isDownloaded}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all disabled:cursor-default ${
                    isDownloaded
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {isDownloaded ? (
                    <>
                      <CheckCircle size={20} />
                      İndirildi
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      İndir
                    </>
                  )}
                </button>

                <button className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 font-medium transition-all">
                  <Share2 size={20} />
                  Paylaş
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Açıklama</h2>
                <p className="text-gray-300 leading-relaxed">{content.description}</p>
              </div>

              {content.modules && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Kurs İçeriği</h2>
                  <div className="space-y-3">
                    {content.modules.map((module, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{module.title}</span>
                        </div>
                        <span className="text-gray-400">{module.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {content.topics && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Konular</h2>
                  <div className="space-y-2">
                    {content.topics.map((topic, index) => (
                      <div key={index} className="flex items-start gap-3 text-gray-300">
                        <CheckCircle
                          className="text-green-500 mt-1 flex-shrink-0"
                          size={18}
                        />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#1a2332] rounded-2xl border border-white/5 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                İçerik Üreticisi
              </h3>
              <button
                onClick={() => navigate(`/creator/${content.creatorId}`)}
                className="flex items-center gap-4 mb-4 hover:opacity-80 transition-opacity w-full text-left"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
                  {content.creatorAvatarUrl ? (
                    <img
                      src={resolveMediaUrl(content.creatorAvatarUrl) ?? ''}
                      alt={content.creator}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        el.parentElement!.textContent = content.creator.split(' ').map((n) => n[0]).join('');
                      }}
                    />
                  ) : (
                    content.creator.split(' ').map((n) => n[0]).join('')
                  )}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{content.creator}</h4>
                  <p className="text-sm text-gray-400">{categoryLabel(toContentCategory(content.category))}</p>
                </div>
              </button>
              {user?.id !== content.creatorId && (
                <button
                  onClick={handleToggleFollow}
                  className={`w-full text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all ${
                    following
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600'
                  }`}
                >
                  {following ? 'Takip Ediliyor' : 'Takip Et'}
                </button>
              )}
            </div>

            <div className="bg-[#1a2332] rounded-2xl border border-white/5 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Benzer İçerikler
              </h3>
              <div className="space-y-4">
                {related.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onContentClick?.(item.id)}
                    className="w-full text-left flex gap-3 cursor-pointer hover:bg-gray-700/50 rounded-lg p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <img
                      src={resolveMediaUrl(item.thumbnail) ?? ''}
                      alt={item.title}
                      className="w-24 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400">{item.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
