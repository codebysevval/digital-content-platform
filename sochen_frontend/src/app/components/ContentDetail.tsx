import {
  Play,
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
import { useEffect, useMemo, useState } from 'react';
import {
  useContentStore,
  useCreatorStore,
  useOfflineStore,
} from '../../store';
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

// Map the display category string returned by the detail DTO back to the
// canonical ContentCategory union used by offline storage / filtering.
const toContentCategory = (
  display: string,
  fallback: ContentCategory = 'courses',
): ContentCategory => {
  const normalized = display.toLowerCase();
  if (normalized.includes('podcast')) return 'podcasts';
  if (normalized.includes('dergi')) return 'magazines';
  if (normalized.includes('gazete')) return 'newspapers';
  if (normalized.includes('kitap')) return 'magazines';
  if (normalized.includes('kurs') || normalized.includes('video')) return 'courses';
  return fallback;
};

export function ContentDetail({
  contentId,
  onBack,
  onContentClick,
}: ContentDetailProps) {
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

  const [content, setContent] = useState<ContentDetailDTO | null>(null);
  const [related, setRelated] = useState<RelatedContent[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchContentById(contentId).then((c) => {
      if (!cancelled) setContent(c);
    });
    void fetchRelatedContent(contentId).then((items) => {
      if (!cancelled) setRelated(items);
    });
    return () => {
      cancelled = true;
    };
  }, [contentId, fetchContentById, fetchRelatedContent]);

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

  // Newspapers and magazines are read, not played — derive from the
  // canonical category rather than the localized display string.
  const canonicalCategory =
    catalog.find((c) => c.id === contentId)?.category ??
    toContentCategory(content.category);
  const isReadable =
    canonicalCategory === 'newspapers' || canonicalCategory === 'magazines';

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
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
            {isReadable ? (
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-end">
                <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 hover:shadow-xl transition-all">
                  <BookOpen size={20} />
                  Hemen Oku
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                  <Play className="text-white ml-2" size={40} fill="white" />
                </button>
              </div>
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
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {content.creator
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{content.creator}</h4>
                  <p className="text-sm text-gray-400">{content.category}</p>
                </div>
              </div>
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
                      src={item.thumbnail}
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
