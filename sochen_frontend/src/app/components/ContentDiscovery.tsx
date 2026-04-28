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
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import { useContentStore } from '../../store';
import { formatUploadDate } from '../../lib/formatters';
import type {
  Content,
  ContentCategory,
  ContentSortBy,
} from '../../types';

interface ContentDiscoveryProps {
  activeCategory?: ContentCategory | 'all';
  onContentClick?: (contentId: number) => void;
  searchQuery?: string;
}

const ALL_CONTENT_TYPES: ContentCategory[] = [
  'podcasts',
  'magazines',
  'newspapers',
  'courses',
];

const categoryLabel = (category: string): string => {
  switch (category) {
    case 'courses':
      return 'Kurslar';
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

export function ContentDiscovery({
  activeCategory = 'all',
  onContentClick,
  searchQuery = '',
}: ContentDiscoveryProps) {
  const topics = useContentStore((s) => s.topics);
  const contentTypes = useContentStore((s) => s.contentTypes);
  const catalog = useContentStore((s) => s.catalog);
  const fetchCatalog = useContentStore((s) => s.fetchCatalog);
  const fetchTopics = useContentStore((s) => s.fetchTopics);
  const fetchContentTypes = useContentStore((s) => s.fetchContentTypes);
  const filterContent = useContentStore((s) => s.filterContent);
  const toggleLikeAction = useContentStore((s) => s.toggleLike);
  const isLiked = useContentStore((s) => s.isLiked);
  const likedContentIds = useContentStore((s) => s.likedContentIds);

  const [activeTopic, setActiveTopic] = useState('all');
  const [showSubscriberOnly, setShowSubscriberOnly] = useState(false);
  const [showFreeContent, setShowFreeContent] = useState(true);
  const [sortBy, setSortBy] = useState<ContentSortBy>('newest');
  const [selectedContentTypes, setSelectedContentTypes] =
    useState<ContentCategory[]>(ALL_CONTENT_TYPES);
  const [includeUsers, setIncludeUsers] = useState(false);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);

  useEffect(() => {
    void fetchCatalog();
    void fetchTopics();
    void fetchContentTypes();
  }, [fetchCatalog, fetchTopics, fetchContentTypes]);

  useEffect(() => {
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
    return () => {
      cancelled = true;
    };
  }, [
    filterContent,
    activeCategory,
    activeTopic,
    searchQuery,
    showSubscriberOnly,
    showFreeContent,
    selectedContentTypes,
    sortBy,
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

  const likedSet = useMemo(() => new Set(likedContentIds), [likedContentIds]);

  return (
    <div className="min-h-full bg-[#0F172A] overflow-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="sticky top-0 bg-[#0F172A] z-10 py-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 pb-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setActiveTopic(topic.id)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all ${
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
              <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-[#0F172A] to-transparent pointer-events-none"></div>
            </div>

            <div className="h-8 w-px bg-white/10"></div>

            <Popover.Root>
              <Popover.Trigger asChild>
                <button className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10">
                  <Filter size={18} />
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
                          onCheckedChange={(checked) =>
                            setIncludeUsers(checked as boolean)
                          }
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
                          onCheckedChange={(checked) =>
                            setShowFreeContent(checked as boolean)
                          }
                          className="w-5 h-5 rounded border-2 border-gray-500 flex items-center justify-center data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                        >
                          <Checkbox.Indicator>
                            <Check size={14} className="text-white" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <label className="text-sm text-gray-300">
                          Ücretsiz İçerikler
                        </label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox.Root
                          checked={showSubscriberOnly}
                          onCheckedChange={(checked) =>
                            setShowSubscriberOnly(checked as boolean)
                          }
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
                    <Select.Root
                      value={sortBy}
                      onValueChange={(v) => setSortBy(v as ContentSortBy)}
                    >
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
        </div>

        <div className="py-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredContent.map((item) => {
            const liked = likedSet.has(item.id) || isLiked(item.id);
            return (
              <div
                key={item.id}
                onClick={() => onContentClick?.(item.id)}
                className="group relative bg-[#1a2332] rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all hover:scale-105 cursor-pointer"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent"></div>

                  {!item.subscriberOnly && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center shadow-xl">
                        {item.category === 'magazines' ||
                        item.category === 'newspapers' ? (
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
                          <p className="text-white text-sm font-semibold">
                            Sadece Aboneler
                          </p>
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
                        className={`${
                          liked
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
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

        {filteredContent.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Filter className="text-gray-600" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              İçerik bulunamadı
            </h3>
            <p className="text-gray-400">Arama veya filtreleri ayarlamayı deneyin</p>
          </div>
        )}
      </div>
    </div>
  );
}
