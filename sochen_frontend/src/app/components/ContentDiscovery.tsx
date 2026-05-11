import {
  Play,
  Lock,
  TrendingUp,
  Heart,
  Filter,
  Check,
  ChevronDown,
  Clock,
  Calendar,
  FileText,
  Users,
  Flame,
  Star,
  UserSearch,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import * as Popover from '@radix-ui/react-popover';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import { useContentStore, useSubscriptionStore, useAuthStore, useCreatorStore } from '../../store';
import { formatUploadDate } from '../../lib/formatters';
import { resolveMediaUrl } from '../../lib/api';
import { toast } from 'sonner';
import type {
  Content,
  ContentCategory,
  ContentSortBy,
  CreatorSearchResult,
} from '../../types';

interface ContentDiscoveryProps {
  activeCategory?: ContentCategory | 'all';
  onContentClick?: (contentId: number) => void;
  searchQuery?: string;
}

const ALL_CONTENT_TYPES: ContentCategory[] = [
  'courses',
  'podcasts',
  'magazines',
  'newspapers',
  'ebooks',
];

const categoryLabel = (category: string): string => {
  switch (category) {
    case 'courses':
      return 'Videolar';
    case 'podcasts':
      return "Podcast'ler";
    case 'magazines':
      return 'Dergiler';
    case 'newspapers':
      return 'Gazeteler';
    default:
      return 'İçerik';
  }
};

function ContentCard({
  item,
  liked,
  onCardClick,
  onLikeClick,
}: {
  item: Content;
  liked: boolean;
  onCardClick: () => void;
  onLikeClick: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onCardClick}
      className="group relative bg-[#1a2332] rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 cursor-pointer flex-shrink-0 w-56"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={resolveMediaUrl(item.thumbnail) ?? ''}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent" />

        {!item.subscriberOnly && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center shadow-xl">
              {item.category === 'magazines' || item.category === 'newspapers' || item.category === 'ebooks' ? (
                <FileText className="text-white" size={22} />
              ) : (
                <Play className="text-white ml-1" size={22} fill="white" />
              )}
            </div>
          </div>
        )}

        {item.subscriberOnly && (
          <>
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-semibold">
              <Lock size={10} />
              Premium
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center">
                <Lock className="text-white mx-auto mb-1" size={32} />
                <p className="text-white text-xs font-semibold">Sadece Aboneler</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="text-white text-sm font-semibold group-hover:text-indigo-400 transition-colors flex-1 line-clamp-2">
            {item.title}
          </h3>
          <button
            onClick={onLikeClick}
            className="flex-shrink-0 p-1 hover:scale-110 transition-transform"
          >
            <Heart
              size={16}
              className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
            />
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="capitalize">{categoryLabel(item.category)}</span>
          <span>{item.duration}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
            {item.creatorAvatarUrl ? (
              <img src={resolveMediaUrl(item.creatorAvatarUrl) ?? ''} alt="" className="w-full h-full object-cover" />
            ) : (
              item.creator.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-xs text-gray-500 truncate">{item.creator}</span>
        </div>
      </div>
    </div>
  );
}

function CreatorCard({
  creator,
}: {
  creator: CreatorSearchResult;
}) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => void navigate(`/creator/${creator.id}`)}
      className="group bg-[#1a2332] rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 cursor-pointer p-5 flex flex-col items-center gap-3"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden flex-shrink-0">
        {creator.avatarUrl ? (
          <img src={resolveMediaUrl(creator.avatarUrl) ?? ''} alt="" className="w-full h-full object-cover" />
        ) : (
          creator.avatar || creator.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="text-center">
        <h3 className="text-white font-semibold text-sm group-hover:text-indigo-400 transition-colors">
          {creator.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">{creator.type}</p>
        <p className="text-xs text-gray-500 mt-1">
          <Users size={10} className="inline mr-1" />
          {creator.followers.toLocaleString('tr-TR')} takipçi
        </p>
      </div>
    </div>
  );
}

function HorizontalRow({
  title,
  icon,
  items,
  likedSet,
  isLiked,
  onCardClick,
  onLikeClick,
  emptyMessage,
}: {
  title: string;
  icon: React.ReactNode;
  items: Content[];
  likedSet: Set<number>;
  isLiked: (id: number) => boolean;
  onCardClick: (item: Content) => void;
  onLikeClick: (e: React.MouseEvent, id: number) => void;
  emptyMessage?: string;
}) {
  if (items.length === 0 && emptyMessage) {
    return (
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          {icon}
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </section>
    );
  }
  if (items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            liked={likedSet.has(item.id) || isLiked(item.id)}
            onCardClick={() => onCardClick(item)}
            onLikeClick={(e) => onLikeClick(e, item.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function ContentDiscovery({
  activeCategory = 'all',
  onContentClick,
  searchQuery = '',
}: ContentDiscoveryProps) {
  const topics = useContentStore((s) => s.topics);
  const contentTypes = useContentStore((s) => s.contentTypes);
  const catalog = useContentStore((s) => s.catalog);
  const trendingFeed = useContentStore((s) => s.trendingFeed);
  const recommendedFeed = useContentStore((s) => s.recommendedFeed);
  const followingFeed = useContentStore((s) => s.followingFeed);
  const fetchCatalog = useContentStore((s) => s.fetchCatalog);
  const fetchTopics = useContentStore((s) => s.fetchTopics);
  const fetchContentTypes = useContentStore((s) => s.fetchContentTypes);
  const filterContent = useContentStore((s) => s.filterContent);
  const fetchTrendingFeed = useContentStore((s) => s.fetchTrendingFeed);
  const fetchRecommendedFeed = useContentStore((s) => s.fetchRecommendedFeed);
  const fetchFollowingFeed = useContentStore((s) => s.fetchFollowingFeed);
  const toggleLikeAction = useContentStore((s) => s.toggleLike);
  const isLiked = useContentStore((s) => s.isLiked);
  const likedContentIds = useContentStore((s) => s.likedContentIds);

  const isSubscribed = useSubscriptionStore((s) => s.status.isActive);
  const fetchSubscriptionStatus = useSubscriptionStore((s) => s.fetchSubscriptionStatus);
  const user = useAuthStore((s) => s.user);

  const searchCreators = useCreatorStore((s) => s.searchCreators);

  const [activeTopic, setActiveTopic] = useState('all');
  // Default: both access types checked = show all content
  const [showSubscriberOnly, setShowSubscriberOnly] = useState(true);
  const [showFreeContent, setShowFreeContent] = useState(true);
  const [sortBy, setSortBy] = useState<ContentSortBy>('newest');
  const [selectedContentTypes, setSelectedContentTypes] =
    useState<ContentCategory[]>(ALL_CONTENT_TYPES);
  const [includeUsers, setIncludeUsers] = useState(false);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [creatorResults, setCreatorResults] = useState<CreatorSearchResult[]>([]);

  // "both checked" = default "show all" state; deviating from it is a filter
  const isContentAccessFiltered = !(showFreeContent && showSubscriberOnly);

  const isFilterActive =
    searchQuery.trim() !== '' ||
    activeTopic !== 'all' ||
    activeCategory !== 'all' ||
    isContentAccessFiltered ||
    selectedContentTypes.length !== ALL_CONTENT_TYPES.length;

  useEffect(() => {
    void fetchCatalog();
    void fetchTopics();
    void fetchContentTypes();
    void fetchTrendingFeed();
    void fetchRecommendedFeed(user?.favoriteCategory ?? undefined);
    if (user) {
      void fetchFollowingFeed();
      void fetchSubscriptionStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!isFilterActive) {
      setFilteredContent([]);
      setCreatorResults([]);
      return;
    }
    let cancelled = false;
    void filterContent({
      category: activeCategory,
      topic: activeTopic,
      searchQuery,
      showSubscriberOnly,
      showFreeContent,
      selectedContentTypes,
      sortBy,
    }).then((items) => {
      if (!cancelled) setFilteredContent(items);
    });
    if (includeUsers && searchQuery.trim()) {
      void searchCreators(searchQuery.trim()).then((creators) => {
        if (!cancelled) setCreatorResults(creators);
      });
    } else {
      setCreatorResults([]);
    }
    return () => {
      cancelled = true;
    };
  }, [
    filterContent,
    searchCreators,
    isFilterActive,
    activeCategory,
    activeTopic,
    searchQuery,
    showSubscriberOnly,
    showFreeContent,
    selectedContentTypes,
    sortBy,
    includeUsers,
    catalog,
  ]);

  const toggleContentType = (typeId: ContentCategory) => {
    setSelectedContentTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId],
    );
  };

  const handleToggleLike = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await toggleLikeAction(id);
  };

  const handleContentClick = (item: Content) => {
    if (item.subscriberOnly && !isSubscribed) {
      if (!user) {
        toast.warning('Bu içeriği görüntülemek için giriş yapmanız gerekiyor');
      } else {
        toast.warning('Bu içerik yalnızca abonelere açıktır', {
          description: 'Premium plana geçerek tüm içeriklere erişebilirsiniz.',
        });
      }
      return;
    }
    onContentClick?.(item.id);
  };

  const likedSet = useMemo(() => new Set(likedContentIds), [likedContentIds]);

  // Feed deduplication: trending capped at 10, recommended excludes trending + following IDs
  const trendingSlice = useMemo(() => trendingFeed.slice(0, 10), [trendingFeed]);
  const followingIds = useMemo(() => new Set(followingFeed.map((c) => c.id)), [followingFeed]);
  const trendingIds = useMemo(() => new Set(trendingSlice.map((c) => c.id)), [trendingSlice]);
  const recommendedSlice = useMemo(
    () => recommendedFeed.filter((c) => !trendingIds.has(c.id) && !followingIds.has(c.id)),
    [recommendedFeed, trendingIds, followingIds],
  );

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Topic bar + filter ── */}
        <div className="sticky top-0 bg-[#0F172A] z-10 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Konular</span>
            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 text-sm">
                  <Filter size={16} />
                  <span className="hidden sm:inline">Gelişmiş Filtreleme</span>
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="bg-[#1E293B] rounded-lg shadow-xl border border-white/10 p-6 w-80 z-50"
                  sideOffset={5}
                  align="end"
                >
                  <h3 className="font-semibold text-white mb-4 text-lg">Filtreler</h3>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">İçerik Tipi</h4>
                    <div className="space-y-3">
                      {contentTypes.map((type) => (
                        <div key={type.id} className="flex items-center gap-3">
                          <Checkbox.Root
                            checked={selectedContentTypes.includes(type.id)}
                            onCheckedChange={() => toggleContentType(type.id)}
                            className="w-5 h-5 rounded border-2 border-gray-500 flex items-center justify-center data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                          >
                            <Checkbox.Indicator>
                              <Check size={14} className="text-white" />
                            </Checkbox.Indicator>
                          </Checkbox.Root>
                          <label className="text-sm text-gray-300">{type.label}</label>
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        <Checkbox.Root
                          checked={includeUsers}
                          onCheckedChange={(checked) => setIncludeUsers(checked as boolean)}
                          className="w-5 h-5 rounded border-2 border-gray-500 flex items-center justify-center data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        >
                          <Checkbox.Indicator>
                            <Check size={14} className="text-white" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label className="text-sm text-gray-300">Kullanıcılar</label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">İçerik Erişimi</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Checkbox.Root
                          checked={showFreeContent}
                          onCheckedChange={(checked) => setShowFreeContent(checked as boolean)}
                          className="w-5 h-5 rounded border-2 border-gray-500 flex items-center justify-center data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        >
                          <Checkbox.Indicator>
                            <Check size={14} className="text-white" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label className="text-sm text-gray-300">Ücretsiz İçerikler</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox.Root
                          checked={showSubscriberOnly}
                          onCheckedChange={(checked) => setShowSubscriberOnly(checked as boolean)}
                          className="w-5 h-5 rounded border-2 border-gray-500 flex items-center justify-center data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        >
                          <Checkbox.Indicator>
                            <Check size={14} className="text-white" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label className="text-sm text-gray-300">Sadece Aboneler</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Sıralama</h4>
                    <Select.Root value={sortBy} onValueChange={(v) => setSortBy(v as ContentSortBy)}>
                      <Select.Trigger className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10">
                        <Select.Value />
                        <Select.Icon>
                          <ChevronDown size={16} />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-[#1E293B] rounded-lg shadow-xl border border-white/10 overflow-hidden z-50">
                          <Select.Viewport className="p-2">
                            <Select.Item
                              value="newest"
                              className="flex items-center justify-between gap-2 px-4 py-2 rounded cursor-pointer hover:bg-white/10 outline-none text-gray-300"
                            >
                              <Select.ItemText>
                                <div className="flex items-center gap-2">
                                  <Clock size={16} />
                                  <span>En Yeni</span>
                                </div>
                              </Select.ItemText>
                              <Select.ItemIndicator>
                                <Check size={16} className="text-indigo-400" />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item
                              value="oldest"
                              className="flex items-center justify-between gap-2 px-4 py-2 rounded cursor-pointer hover:bg-white/10 outline-none text-gray-300"
                            >
                              <Select.ItemText>
                                <div className="flex items-center gap-2">
                                  <Calendar size={16} />
                                  <span>En Eski</span>
                                </div>
                              </Select.ItemText>
                              <Select.ItemIndicator>
                                <Check size={16} className="text-indigo-400" />
                              </Select.ItemIndicator>
                            </Select.Item>
                            <Select.Item
                              value="popular"
                              className="flex items-center justify-between gap-2 px-4 py-2 rounded cursor-pointer hover:bg-white/10 outline-none text-gray-300"
                            >
                              <Select.ItemText>
                                <div className="flex items-center gap-2">
                                  <TrendingUp size={16} />
                                  <span>En Popüler</span>
                                </div>
                              </Select.ItemText>
                              <Select.ItemIndicator>
                                <Check size={16} className="text-indigo-400" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
          {/* Wrapping topic chips — no horizontal scroll */}
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTopic === topic.id
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Algorithmic home sections (no active filter) ── */}
        {!isFilterActive && (
          <div className="py-8">
            <HorizontalRow
              title="Trendler"
              icon={<Flame className="text-orange-400" size={22} />}
              items={trendingSlice}
              likedSet={likedSet}
              isLiked={isLiked}
              onCardClick={handleContentClick}
              onLikeClick={(e, id) => void handleToggleLike(e, id)}
            />

            <HorizontalRow
              title="İlginizi Çekebilecekler"
              icon={<Star className="text-yellow-400" size={22} />}
              items={recommendedSlice}
              likedSet={likedSet}
              isLiked={isLiked}
              onCardClick={handleContentClick}
              onLikeClick={(e, id) => void handleToggleLike(e, id)}
            />

            {user && (
              <HorizontalRow
                title="Takip Ettikleriniz"
                icon={<Users className="text-indigo-400" size={22} />}
                items={followingFeed}
                likedSet={likedSet}
                isLiked={isLiked}
                onCardClick={handleContentClick}
                onLikeClick={(e, id) => void handleToggleLike(e, id)}
                emptyMessage="Henüz kimseyi takip etmiyorsunuz. İçerik üreticilerini takip etmeye başlayın!"
              />
            )}
          </div>
        )}

        {/* ── Filtered grid ── */}
        {isFilterActive && (
          <>
            {/* Creator search results */}
            {creatorResults.length > 0 && (
              <div className="pt-8 pb-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserSearch className="text-indigo-400" size={20} />
                  <h2 className="text-lg font-bold text-white">İçerik Üreticileri</h2>
                  <span className="text-xs text-gray-500">({creatorResults.length})</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                  {creatorResults.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                    />
                  ))}
                </div>
                <div className="border-b border-white/5 mb-6" />
              </div>
            )}
            <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredContent.map((item) => {
                const liked = likedSet.has(item.id) || isLiked(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleContentClick(item)}
                    className="group relative bg-[#1a2332] rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={resolveMediaUrl(item.thumbnail) ?? ''}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent" />

                      {!item.subscriberOnly && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center shadow-xl">
                            {item.category === 'magazines' || item.category === 'newspapers' || item.category === 'ebooks' ? (
                              <FileText className="text-white" size={28} />
                            ) : (
                              <Play className="text-white ml-1" size={28} fill="white" />
                            )}
                          </div>
                        </div>
                      )}

                      {item.subscriberOnly && (
                        <>
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-semibold">
                            <Lock size={12} />
                            Premium
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="text-white mx-auto mb-2" size={48} />
                              <p className="text-white text-sm font-semibold">Sadece Aboneler</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors flex-1">
                          {item.title}
                        </h3>
                        <button
                          onClick={(e) => void handleToggleLike(e, item.id)}
                          className="flex-shrink-0 p-1 hover:scale-110 transition-transform"
                        >
                          <Heart
                            size={20}
                            className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
                          />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span className="capitalize">{categoryLabel(item.category)}</span>
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
                );
              })}
            </div>

            {filteredContent.length === 0 && creatorResults.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Filter className="text-gray-600" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">İçerik bulunamadı</h3>
                <p className="text-gray-400">Arama veya filtreleri ayarlamayı deneyin</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
