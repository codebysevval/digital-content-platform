/**
 * Mock Data Layer
 *
 * Centralized static data that emulates the future Java Spring Boot REST API.
 * All UI components must consume this data ONLY through Zustand stores --
 * never import directly from this file.
 *
 * Once the backend is wired up, the stores' async actions will replace
 * `mockXxx` references with `fetch()` calls. The shape of every mock
 * matches a DTO defined in `src/types/index.ts`.
 */
import type {
  AdminStats,
  BillingHistoryItem,
  CheckoutPlan,
  Content,
  ContentDetailDTO,
  ContentTypeOption,
  Creator,
  CreatorContent,
  CreatorStudioStats,
  DistributionRegion,
  DistributionStats,
  FinancialDataPoint,
  FollowedCreator,
  LikedContentItem,
  ManagedUser,
  OfflineContentItem,
  PricingPlan,
  RevenueDataPoint,
  SubscriptionStatus,
  SystemModule,
  Topic,
  UsageQuota,
  User,
  UserMenuItem,
  WeeklyDeliveryDay,
  YearlyTogglePlan,
} from '../types';

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

export const mockCurrentUser: User = {
  id: 1,
  name: 'Ahmet Yılmaz',
  email: 'ahmet@sirket.com',
  avatarInitials: 'AY',
  role: 'admin',
};

export const mockUserMenuItems: UserMenuItem[] = [
  {
    id: 'pricing',
    label: 'Abonelik Planları',
    iconKey: 'creditCard',
    roles: ['user', 'creator', 'admin'],
  },
  {
    id: 'creator',
    label: 'İçerik Üretici Stüdyosu',
    iconKey: 'upload',
    roles: ['creator', 'admin'],
  },
  {
    id: 'admin',
    label: 'Yönetim Paneli',
    iconKey: 'shieldCheck',
    roles: ['admin'],
  },
];

/* ------------------------------------------------------------------ */
/*  Content Catalog                                                    */
/* ------------------------------------------------------------------ */

export const mockTopics: Topic[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'software', label: 'Yazılım' },
  { id: 'business', label: 'Girişimcilik' },
  { id: 'design', label: 'Tasarım' },
  { id: 'economy', label: 'Ekonomi' },
  { id: 'technology', label: 'Teknoloji' },
  { id: 'sports', label: 'Spor' },
  { id: 'science', label: 'Bilim' },
  { id: 'health', label: 'Sağlık' },
  { id: 'art', label: 'Sanat' },
  { id: 'music', label: 'Müzik' },
  { id: 'food', label: 'Yemek' },
  { id: 'travel', label: 'Seyahat' },
  { id: 'education', label: 'Eğitim' },
];

export const mockContentTypes: ContentTypeOption[] = [
  { id: 'podcasts', label: "Podcast'ler" },
  { id: 'magazines', label: 'Dergiler' },
  { id: 'newspapers', label: 'Gazeteler' },
  { id: 'courses', label: 'Video Kurslar' },
];

export const mockAllContent: Content[] = [
  {
    id: 1,
    title: 'İleri React Teknikleri',
    category: 'courses',
    topic: 'software',
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    duration: '8 saat',
    subscriberOnly: true,
    uploadDate: '2026-04-15',
    views: 1250,
    creator: 'Ayşe Demir',
    creatorId: 1,
    description:
      "Modern React uygulamaları için ileri seviye teknikler ve best practice'ler",
  },
  {
    id: 4,
    title: 'JavaScript Temelleri',
    category: 'courses',
    topic: 'software',
    thumbnail:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
    duration: '12 saat',
    subscriberOnly: true,
    uploadDate: '2026-04-10',
    views: 2150,
    creator: 'Mehmet Çelik',
    creatorId: 2,
    description: 'Sıfırdan ileri seviyeye JavaScript programlama eğitimi',
  },
  {
    id: 7,
    title: 'UI/UX Tasarım Uzmanlığı',
    category: 'courses',
    topic: 'design',
    thumbnail:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    duration: '10 saat',
    subscriberOnly: true,
    uploadDate: '2026-04-12',
    views: 1890,
    creator: 'Zeynep Kaya',
    creatorId: 3,
    description: 'Kullanıcı deneyimi ve arayüz tasarımı masterclass',
  },
  {
    id: 10,
    title: 'Node.js Backend Geliştirme',
    category: 'courses',
    topic: 'software',
    thumbnail:
      'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=400&h=300&fit=crop',
    duration: '15 saat',
    subscriberOnly: true,
    uploadDate: '2026-04-08',
    views: 3200,
    creator: 'Can Özdemir',
    creatorId: 4,
    description: 'Profesyonel backend uygulamaları geliştirme',
  },
  {
    id: 2,
    title: 'Haftalık Teknoloji Podcast',
    category: 'podcasts',
    topic: 'technology',
    thumbnail:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop',
    duration: '45 dk',
    subscriberOnly: false,
    uploadDate: '2026-04-18',
    views: 3420,
    creator: 'Can Özdemir',
    creatorId: 4,
    description: 'Teknoloji dünyasından haftalık haberler ve analizler',
  },
  {
    id: 5,
    title: 'Girişim Hikayeleri Podcast',
    category: 'podcasts',
    topic: 'business',
    thumbnail:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
    duration: '60 dk',
    subscriberOnly: false,
    uploadDate: '2026-04-19',
    views: 5670,
    creator: 'Ayşe Demir',
    creatorId: 1,
    description: 'Başarılı girişimcilerle ilham verici sohbetler',
  },
  {
    id: 8,
    title: 'Yaratıcı Fikirler Podcast',
    category: 'podcasts',
    topic: 'design',
    thumbnail:
      'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&h=300&fit=crop',
    duration: '50 dk',
    subscriberOnly: false,
    uploadDate: '2026-04-17',
    views: 4230,
    creator: 'Elif Yılmaz',
    creatorId: 5,
    description: 'Yaratıcılık ve inovasyon üzerine ilham verici konuşmalar',
  },
  {
    id: 11,
    title: 'İş Dünyası Sohbetleri',
    category: 'podcasts',
    topic: 'business',
    thumbnail:
      'https://images.unsplash.com/photo-1590650046871-92c887180603?w=400&h=300&fit=crop',
    duration: '40 dk',
    subscriberOnly: false,
    uploadDate: '2026-04-16',
    views: 2890,
    creator: 'Mehmet Çelik',
    creatorId: 2,
    description: 'CEO ve yöneticilerle iş dünyası üzerine',
  },
  {
    id: 3,
    title: 'Tasarım Dergisi - Nisan 2026',
    category: 'magazines',
    topic: 'design',
    thumbnail:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    duration: '120 sayfa',
    subscriberOnly: true,
    uploadDate: '2026-04-01',
    views: 890,
    creator: 'Zeynep Kaya',
    creatorId: 3,
    description: 'En yeni tasarım trendleri ve ilham kaynakları',
  },
  {
    id: 6,
    title: 'İş Dünyası Aylık - Nisan 2026',
    category: 'magazines',
    topic: 'economy',
    thumbnail:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop',
    duration: '95 sayfa',
    subscriberOnly: true,
    uploadDate: '2026-04-01',
    views: 780,
    creator: 'Mehmet Çelik',
    creatorId: 2,
    description: 'Ekonomi ve iş dünyasından haberler',
  },
  {
    id: 12,
    title: 'Teknoloji & İnovasyon - Mart 2026',
    category: 'magazines',
    topic: 'technology',
    thumbnail:
      'https://images.unsplash.com/photo-1553531087-e90c8d7e1ffa?w=400&h=300&fit=crop',
    duration: '110 sayfa',
    subscriberOnly: true,
    uploadDate: '2026-03-01',
    views: 1450,
    creator: 'Can Özdemir',
    creatorId: 4,
    description: 'Teknoloji sektöründen en güncel gelişmeler',
  },
  {
    id: 13,
    title: 'Güncel Ekonomi Gazetesi - 21 Nisan',
    category: 'newspapers',
    topic: 'economy',
    thumbnail:
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
    duration: '24 sayfa',
    subscriberOnly: false,
    uploadDate: '2026-04-21',
    views: 8920,
    creator: 'Zeynep Kaya',
    creatorId: 3,
    description: 'Günün ekonomi haberleri ve analizler',
  },
  {
    id: 14,
    title: 'Teknoloji Haberleri - 20 Nisan',
    category: 'newspapers',
    topic: 'technology',
    thumbnail:
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop',
    duration: '16 sayfa',
    subscriberOnly: false,
    uploadDate: '2026-04-20',
    views: 12500,
    creator: 'Can Özdemir',
    creatorId: 4,
    description: 'Teknoloji dünyasından güncel haberler',
  },
  {
    id: 15,
    title: 'Spor Dünyası - 21 Nisan',
    category: 'newspapers',
    topic: 'sports',
    thumbnail:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
    duration: '20 sayfa',
    subscriberOnly: false,
    uploadDate: '2026-04-21',
    views: 15600,
    creator: 'Elif Yılmaz',
    creatorId: 5,
    description: 'Spor haberleri ve müsabaka sonuçları',
  },
];

/* ------------------------------------------------------------------ */
/*  Content Detail (full document)                                     */
/* ------------------------------------------------------------------ */

export const mockContentDetails: Record<number, ContentDetailDTO> = {
  1: {
    id: 1,
    title: 'İleri React Teknikleri',
    category: 'Video Kurs',
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    duration: '8 saat',
    subscriberOnly: true,
    uploadDate: '15.04.2026',
    views: 1250,
    creator: 'Ayşe Demir',
    creatorId: 1,
    description:
      "Bu kapsamlı kursta, modern React uygulamaları geliştirmek için ileri seviye teknikler ve best practice'leri öğreneceksiniz. Context API, Custom Hooks, Performance Optimization ve daha fazlası...",
    modules: [
      { title: 'Giriş ve Temel Kavramlar', duration: '45 dk' },
      { title: 'Custom Hooks Geliştirme', duration: '90 dk' },
      { title: 'Context API ve State Management', duration: '120 dk' },
      { title: 'Performance Optimization', duration: '100 dk' },
      { title: 'Testing Best Practices', duration: '85 dk' },
    ],
  },
  4: {
    id: 4,
    title: 'JavaScript Temelleri',
    category: 'Video Kurs',
    thumbnail:
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop',
    duration: '12 saat',
    subscriberOnly: true,
    uploadDate: '10.04.2026',
    views: 2150,
    creator: 'Mehmet Çelik',
    creatorId: 2,
    description:
      'Sıfırdan ileri seviyeye JavaScript programlama eğitimi. Değişkenler, fonksiyonlar, async/await, ES6+ özellikleri ve modern JavaScript geliştirme teknikleri.',
    modules: [
      { title: 'JavaScript Temelleri', duration: '120 dk' },
      { title: 'DOM Manipülasyonu', duration: '90 dk' },
      { title: 'Async JavaScript & Promises', duration: '110 dk' },
      { title: 'ES6+ Özellikleri', duration: '95 dk' },
      { title: 'Modern JavaScript Patterns', duration: '105 dk' },
    ],
  },
  7: {
    id: 7,
    title: 'UI/UX Tasarım Uzmanlığı',
    category: 'Video Kurs',
    thumbnail:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    duration: '10 saat',
    subscriberOnly: true,
    uploadDate: '12.04.2026',
    views: 1890,
    creator: 'Zeynep Kaya',
    creatorId: 3,
    description:
      'Kullanıcı deneyimi ve arayüz tasarımı masterclass. Figma, tasarım sistemleri, kullanıcı araştırması ve prototipleme teknikleri.',
    modules: [
      { title: 'UX Araştırma Metodları', duration: '80 dk' },
      { title: 'Wireframe ve Prototipleme', duration: '100 dk' },
      { title: 'Tasarım Sistemleri', duration: '120 dk' },
      { title: 'Kullanıcı Testleri', duration: '90 dk' },
      { title: 'Advanced Figma Teknikleri', duration: '110 dk' },
    ],
  },
  10: {
    id: 10,
    title: 'Node.js Backend Geliştirme',
    category: 'Video Kurs',
    thumbnail:
      'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=800&h=450&fit=crop',
    duration: '15 saat',
    subscriberOnly: true,
    uploadDate: '08.04.2026',
    views: 3200,
    creator: 'Can Özdemir',
    creatorId: 4,
    description:
      'Profesyonel backend uygulamaları geliştirme. Express.js, MongoDB, Authentication, RESTful API tasarımı ve deployment.',
    modules: [
      { title: 'Node.js Temelleri', duration: '100 dk' },
      { title: 'Express.js Framework', duration: '140 dk' },
      { title: 'Database & MongoDB', duration: '160 dk' },
      { title: 'Authentication & Security', duration: '130 dk' },
      { title: 'API Design & Deployment', duration: '170 dk' },
    ],
  },
  2: {
    id: 2,
    title: 'Haftalık Teknoloji Podcast',
    category: 'Podcast',
    thumbnail:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&h=450&fit=crop',
    duration: '45 dk',
    subscriberOnly: false,
    uploadDate: '18.04.2026',
    views: 3420,
    creator: 'Can Özdemir',
    creatorId: 4,
    description:
      'Bu haftanın teknoloji dünyasından en önemli gelişmeleri konuşuyoruz. Yapay zeka, blockchain, startup ekosistemi ve daha fazlası...',
    topics: [
      "OpenAI'ın yeni modeli",
      "Türkiye'de startup yatırımları",
      'Web3 ve blockchain teknolojileri',
      'Yapay zeka etiği tartışmaları',
    ],
  },
  5: {
    id: 5,
    title: 'Girişim Hikayeleri Podcast',
    category: 'Podcast',
    thumbnail:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=450&fit=crop',
    duration: '60 dk',
    subscriberOnly: false,
    uploadDate: '19.04.2026',
    views: 5670,
    creator: 'Ayşe Demir',
    creatorId: 1,
    description:
      'Başarılı girişimcilerle ilham verici sohbetler. İş modelleri, büyüme hikayeleri, başarısızlıklar ve öğrenilen dersler.',
    topics: [
      'E-ticaret girişim hikayesi',
      'Yatırım alma süreci',
      'Ölçeklendirme zorlukları',
      'Girişimcilik ekosistemi',
    ],
  },
  8: {
    id: 8,
    title: 'Yaratıcı Fikirler Podcast',
    category: 'Podcast',
    thumbnail:
      'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800&h=450&fit=crop',
    duration: '50 dk',
    subscriberOnly: false,
    uploadDate: '17.04.2026',
    views: 4230,
    creator: 'Elif Yılmaz',
    creatorId: 5,
    description:
      'Yaratıcılık ve inovasyon üzerine ilham verici konuşmalar. Tasarım düşüncesi, problem çözme ve yaratıcı süreçler.',
    topics: [
      'Yaratıcı düşünme teknikleri',
      'İnovasyon stratejileri',
      'Tasarım düşüncesi (Design Thinking)',
      'Beyin fırtınası metodları',
    ],
  },
  11: {
    id: 11,
    title: 'İş Dünyası Sohbetleri',
    category: 'Podcast',
    thumbnail:
      'https://images.unsplash.com/photo-1590650046871-92c887180603?w=800&h=450&fit=crop',
    duration: '40 dk',
    subscriberOnly: false,
    uploadDate: '16.04.2026',
    views: 2890,
    creator: 'Mehmet Çelik',
    creatorId: 2,
    description:
      'CEO ve yöneticilerle iş dünyası üzerine derinlemesine sohbetler. Liderlik, strateji ve iş dünyası trendleri.',
    topics: [
      'Liderlik ve yönetim',
      'İş stratejisi geliştirme',
      'Kurumsal kültür oluşturma',
      'Gelecek trendleri',
    ],
  },
  3: {
    id: 3,
    title: 'Tasarım Dergisi - Nisan 2026',
    category: 'Dergi',
    thumbnail:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=450&fit=crop',
    duration: '120 sayfa',
    subscriberOnly: true,
    uploadDate: '01.04.2026',
    views: 890,
    creator: 'Zeynep Kaya',
    creatorId: 3,
    description:
      'En yeni tasarım trendleri ve ilham kaynakları. Mimari tasarım, grafik tasarım, ürün tasarımı ve yaratıcı projeler.',
    topics: [
      'Minimalist tasarım trendleri',
      'Sürdürülebilir tasarım',
      'Dijital sanat galerileri',
      'Tasarımcı röportajları',
      'Yeni malzemeler ve teknikler',
    ],
  },
  6: {
    id: 6,
    title: 'İş Dünyası Aylık - Nisan 2026',
    category: 'Dergi',
    thumbnail:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=450&fit=crop',
    duration: '95 sayfa',
    subscriberOnly: true,
    uploadDate: '01.04.2026',
    views: 780,
    creator: 'Mehmet Çelik',
    creatorId: 2,
    description:
      'Ekonomi ve iş dünyasından haberler, analizler ve uzman görüşleri. Piyasa trendleri, finans ve yatırım fırsatları.',
    topics: [
      'Türkiye ekonomisi analizi',
      'Yatırım stratejileri',
      'Girişim finansmanı',
      'Sektör raporları',
      'CEO röportajları',
    ],
  },
  12: {
    id: 12,
    title: 'Teknoloji & İnovasyon - Mart 2026',
    category: 'Dergi',
    thumbnail:
      'https://images.unsplash.com/photo-1553531087-e90c8d7e1ffa?w=800&h=450&fit=crop',
    duration: '110 sayfa',
    subscriberOnly: true,
    uploadDate: '01.03.2026',
    views: 1450,
    creator: 'Can Özdemir',
    creatorId: 4,
    description:
      'Teknoloji sektöründen en güncel gelişmeler. Yapay zeka, yazılım, donanım ve teknoloji trendleri.',
    topics: [
      'Yapay zeka gelişmeleri',
      'Cloud computing trendleri',
      'Cybersecurity stratejileri',
      'Yeni teknoloji ürünleri',
      'Teknoloji şirketleri analizi',
    ],
  },
  13: {
    id: 13,
    title: 'Güncel Ekonomi Gazetesi - 21 Nisan',
    category: 'Gazete',
    thumbnail:
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
    duration: '24 sayfa',
    subscriberOnly: false,
    uploadDate: '21.04.2026',
    views: 8920,
    creator: 'Zeynep Kaya',
    creatorId: 3,
    description:
      'Günün ekonomi haberleri ve analizler. Borsa, döviz kurları, ekonomi politikaları ve piyasa gelişmeleri.',
    topics: [
      'Borsa İstanbul günlük analiz',
      'Döviz kurları ve yorumları',
      'Merkez Bankası kararları',
      'Sektörel haberler',
      'Uluslararası piyasalar',
    ],
  },
  14: {
    id: 14,
    title: 'Teknoloji Haberleri - 20 Nisan',
    category: 'Gazete',
    thumbnail:
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&h=450&fit=crop',
    duration: '16 sayfa',
    subscriberOnly: false,
    uploadDate: '20.04.2026',
    views: 12500,
    creator: 'Can Özdemir',
    creatorId: 4,
    description:
      'Teknoloji dünyasından güncel haberler. Yeni ürün lansmanları, şirket haberleri ve teknoloji sektörü gelişmeleri.',
    topics: [
      'Yeni smartphone lansmanları',
      'Teknoloji şirketleri haberleri',
      'Yazılım güncellemeleri',
      'Siber güvenlik olayları',
      'Startup haberleri',
    ],
  },
  15: {
    id: 15,
    title: 'Spor Dünyası - 21 Nisan',
    category: 'Gazete',
    thumbnail:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop',
    duration: '20 sayfa',
    subscriberOnly: false,
    uploadDate: '21.04.2026',
    views: 15600,
    creator: 'Elif Yılmaz',
    creatorId: 5,
    description:
      'Spor haberleri ve müsabaka sonuçları. Futbol, basketbol, tenis ve diğer spor dallarından haberler.',
    topics: [
      'Süper Lig maç sonuçları',
      'Transfer haberleri',
      'Basketbol ligleri',
      'Uluslararası spor haberleri',
      'Spor analiz ve yorumları',
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Creators                                                           */
/* ------------------------------------------------------------------ */

export const mockCreators: Record<number, Creator> = {
  1: {
    id: 1,
    name: 'Ayşe Demir',
    avatar: 'AD',
    type: 'Video & Podcast Üreticisi',
    bio: 'Teknoloji ve girişimcilik konularında içerikler üretiyorum. 10 yıllık deneyimim ile sizlerle buluşuyorum.',
    followers: 12500,
    totalContent: 156,
    totalViews: 850000,
  },
  2: {
    id: 2,
    name: 'Mehmet Çelik',
    avatar: 'MÇ',
    type: 'Dergi Editörü',
    bio: 'Aylık teknoloji ve inovasyon dergisi yayınlıyorum. Sektördeki en güncel gelişmeleri takip edin.',
    followers: 8900,
    totalContent: 48,
    totalViews: 320000,
  },
  3: {
    id: 3,
    name: 'Zeynep Kaya',
    avatar: 'ZK',
    type: 'Gazete Köşe Yazarı',
    bio: 'Güncel haberler ve analizler ile her gün sizlerle. Ekonomi ve politika odaklı içerikler.',
    followers: 15200,
    totalContent: 234,
    totalViews: 1200000,
  },
  4: {
    id: 4,
    name: 'Can Özdemir',
    avatar: 'CÖ',
    type: 'Podcast & Video Üreticisi',
    bio: 'Teknoloji ve backend dünyasından haftalık podcast ve derinlemesine video kurslar.',
    followers: 15200,
    totalContent: 92,
    totalViews: 640000,
  },
  5: {
    id: 5,
    name: 'Elif Yılmaz',
    avatar: 'EY',
    type: 'Yazılım Eğitmeni',
    bio: 'Frontend ve mobil geliştirme üzerine pratik odaklı içerikler üretiyorum.',
    followers: 9100,
    totalContent: 64,
    totalViews: 410000,
  },
};

export const mockCreatorContent: CreatorContent[] = [
  {
    id: 1,
    title: 'İleri React Teknikleri',
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    duration: '8 saat',
    subscriberOnly: true,
    views: 1250,
    uploadDate: '2026-04-15',
  },
  {
    id: 2,
    title: 'Haftalık Teknoloji Podcast',
    thumbnail:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop',
    duration: '45 dk',
    subscriberOnly: false,
    views: 3420,
    uploadDate: '2026-04-18',
  },
  {
    id: 3,
    title: 'Girişimcilik Rehberi',
    thumbnail:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
    duration: '2 saat',
    subscriberOnly: true,
    views: 2100,
    uploadDate: '2026-04-10',
  },
];

export const mockFollowedCreators: FollowedCreator[] = [
  { id: 1, name: 'Ayşe Demir', avatar: 'AD', followers: '12.5B' },
  { id: 2, name: 'Mehmet Çelik', avatar: 'MÇ', followers: '8.3M' },
  { id: 3, name: 'Zeynep Kaya', avatar: 'ZK', followers: '5.7M' },
  { id: 4, name: 'Can Özdemir', avatar: 'CÖ', followers: '15.2M' },
  { id: 5, name: 'Elif Yılmaz', avatar: 'EY', followers: '9.1M' },
];

/* ------------------------------------------------------------------ */
/*  Liked & Offline                                                    */
/* ------------------------------------------------------------------ */

export const mockLikedContent: LikedContentItem[] = [
  {
    id: 2,
    title: 'Haftalık Teknoloji Podcast',
    category: 'podcasts',
    thumbnail:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop',
    duration: '45 dk',
    subscriberOnly: false,
    views: 3420,
    creator: 'Can Özdemir',
    uploadDate: '2026-04-18',
  },
  {
    id: 5,
    title: 'Girişim Hikayeleri Podcast',
    category: 'podcasts',
    thumbnail:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop',
    duration: '60 dk',
    subscriberOnly: false,
    views: 5670,
    creator: 'Ayşe Demir',
    uploadDate: '2026-04-19',
  },
];

export const mockOfflineContent: OfflineContentItem[] = [
  {
    id: 1,
    title: 'İleri React Teknikleri',
    category: 'courses',
    thumbnail:
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    size: '450 MB',
    downloadDate: '15.04.2026',
    duration: '8 saat',
    views: 1250,
    subscriberOnly: true,
    creator: 'Ayşe Demir',
  },
  {
    id: 2,
    title: 'Haftalık Teknoloji Podcast',
    category: 'podcasts',
    thumbnail:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop',
    size: '85 MB',
    downloadDate: '18.04.2026',
    duration: '45 dk',
    views: 3420,
    subscriberOnly: false,
    creator: 'Can Özdemir',
  },
  {
    id: 3,
    title: 'UI/UX Tasarım Uzmanlığı',
    category: 'courses',
    thumbnail:
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    size: '680 MB',
    downloadDate: '12.04.2026',
    duration: '10 saat',
    views: 1890,
    subscriberOnly: true,
    creator: 'Zeynep Kaya',
  },
];

export const OFFLINE_STORAGE_LIMIT_MB = 10240;

/* ------------------------------------------------------------------ */
/*  Subscription / Pricing                                             */
/* ------------------------------------------------------------------ */

export const mockPricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Ücretsiz',
    iconKey: 'zap',
    price: 0,
    period: 'ücretsiz',
    description: 'Platformu keşfetmek için başlangıç planı',
    features: [
      'Ücretsiz içeriklere sınırsız erişim',
      'Topluluk forumlarına erişim',
      'Temel içerik filtreleme',
    ],
    color: 'gray',
    isFree: true,
  },
  {
    id: 'monthly',
    name: 'Aylık Premium',
    iconKey: 'star',
    price: 99,
    period: 'ay',
    description: 'Tüm premium içeriklere erişim',
    features: [
      'Tüm premium içeriklere sınırsız erişim',
      'Yeni içeriklere erken erişim',
      'Offline içerik indirme',
      'HD kalitede video izleme',
      'Reklamsız deneyim',
      'Öncelikli müşteri desteği',
      'Özel içerik üretici etkinlikleri',
      'Aylık özel içerikler',
    ],
    recommended: true,
    color: 'blue',
  },
  {
    id: 'yearly',
    name: 'Yıllık Premium',
    iconKey: 'building2',
    price: 990,
    period: 'yıl',
    savings: '₺198 tasarruf',
    description: 'En avantajlı plan - 2 ay bedava',
    features: [
      'Tüm Aylık Premium özellikleri',
      '%17 indirimli fiyat',
      'Yıllık özel içerik paketi',
      'Öncelikli etkinlik kayıtları',
      'Özel rozet ve profil süslemeleri',
      'Hediye abonelik kuponu (1 ay)',
    ],
    color: 'purple',
  },
];

export const mockCheckoutPlans: CheckoutPlan[] = [
  {
    id: 'basic',
    name: 'Temel',
    price: 299,
    period: 'ay',
    features: [
      'Ücretsiz içeriklere erişim',
      'Ayda 5 indirme',
      'Temel destek',
      'Mobil uygulama erişimi',
    ],
  },
  {
    id: 'monthly-pro',
    name: 'Aylık Pro',
    price: 999,
    period: 'ay',
    popular: true,
    features: [
      'Tüm içeriklere sınırsız erişim',
      'Sınırsız indirme',
      'Öncelikli destek',
      'Mobil uygulama erişimi',
      'Çevrimdışı izleme',
      'Yeni içeriklere erken erişim',
    ],
  },
  {
    id: 'annual-elite',
    name: 'Yıllık Elite',
    price: 9999,
    period: 'yıl',
    savings: '₺2.000 tasarruf',
    features: [
      "Aylık Pro'daki her şey",
      'Özel topluluk erişimi',
      'Bire bir içerik üretici seansları',
      'Özel öğrenme yolları',
      'Tamamlama sertifikası',
      'Ömür boyu içerik güncellemeleri',
      'VIP etkinlik davetleri',
    ],
  },
];

export const mockYearlyTogglePlans: YearlyTogglePlan[] = [
  {
    name: 'Temel',
    iconKey: 'zap',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    description: 'Bireyler ve küçük projeler için mükemmel',
    features: [
      '5.000 API çağrısı/ay',
      '20 GB depolama',
      '5 ekip üyesi',
      'E-posta desteği',
      'Temel analitik',
      'Özel alan adı',
    ],
    color: 'gray',
  },
  {
    name: 'Pro',
    iconKey: 'star',
    monthlyPrice: 999,
    yearlyPrice: 9990,
    description: 'Büyüyen ekipler ve işletmeler için ideal',
    features: [
      '10.000 API çağrısı/ay',
      '100 GB depolama',
      '15 ekip üyesi',
      'Öncelikli destek',
      'Gelişmiş analitik',
      'Özel alan adı',
      'API erişimi',
      'Webhook entegrasyonları',
      'Özel markalama',
    ],
    recommended: true,
    color: 'blue',
  },
  {
    name: 'Kurumsal',
    iconKey: 'building2',
    monthlyPrice: 9999,
    yearlyPrice: 99990,
    description: 'Özel ihtiyaçları olan büyük organizasyonlar için',
    features: [
      'Sınırsız API çağrısı',
      'Sınırsız depolama',
      'Sınırsız ekip üyesi',
      '7/24 özel destek',
      'Kurumsal analitik',
      'Özel alan adı',
      'Tam API erişimi',
      'Gelişmiş entegrasyonlar',
      'Özel markalama',
      'SLA garantisi',
      'Özel hesap yöneticisi',
      'Özel sözleşmeler',
    ],
    color: 'purple',
  },
];

export const mockSubscriptionStatus: SubscriptionStatus = {
  planName: 'Pro',
  price: 1650,
  isActive: true,
  nextBillingDate: '19 Mayıs 2026',
  features: [
    'Tüm premium içeriklere sınırsız erişim',
    'Offline içerik indirme',
    'HD kalitede video izleme',
    'Öncelikli müşteri desteği',
  ],
};

export const mockBillingHistory: BillingHistoryItem[] = [
  { id: 1, date: '19.03.2026', amount: '₺1.650', plan: 'Pro Plan', status: 'Ödendi' },
  { id: 2, date: '19.02.2026', amount: '₺1.650', plan: 'Pro Plan', status: 'Ödendi' },
  { id: 3, date: '19.01.2026', amount: '₺1.650', plan: 'Pro Plan', status: 'Ödendi' },
  { id: 4, date: '19.12.2025', amount: '₺980', plan: 'Temel Plan', status: 'Ödendi' },
];

export const mockUsageQuota: UsageQuota = {
  apiCallsUsed: 7500,
  apiCallsLimit: 10000,
  storageUsedGb: 45,
  storageLimitGb: 100,
  teamMembersUsed: 8,
  teamMembersLimit: 15,
};

/* ------------------------------------------------------------------ */
/*  Admin                                                              */
/* ------------------------------------------------------------------ */

export const mockPendingContent = [
  {
    id: 1,
    title: 'İleri TypeScript Teknikleri',
    creator: 'Ayşe Demir',
    type: 'Video Kursu',
    uploadDate: '18.04.2026',
    thumbnail:
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200&h=150&fit=crop',
  },
  {
    id: 2,
    title: 'Pazarlama Stratejileri Podcast',
    creator: 'Mehmet Çelik',
    type: 'Podcast',
    uploadDate: '18.04.2026',
    thumbnail:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=150&fit=crop',
  },
  {
    id: 3,
    title: 'Tasarım Dergisi Nisan Sayısı',
    creator: 'Zeynep Kaya',
    type: 'Dergi',
    uploadDate: '19.04.2026',
    thumbnail:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop',
  },
];

export const mockFinancialData: FinancialDataPoint[] = [
  { month: 'Eki', mrr: 45200, subscribers: 1120 },
  { month: 'Kas', mrr: 52300, subscribers: 1285 },
  { month: 'Ara', mrr: 58700, subscribers: 1450 },
  { month: 'Oca', mrr: 63400, subscribers: 1580 },
  { month: 'Şub', mrr: 71200, subscribers: 1765 },
  { month: 'Mar', mrr: 78500, subscribers: 1920 },
  { month: 'Nis', mrr: 85420, subscribers: 2080 },
];

export const mockRevenueData: RevenueDataPoint[] = [
  { month: 'Eki', mrr: 45000 },
  { month: 'Kas', mrr: 52000 },
  { month: 'Ara', mrr: 58000 },
  { month: 'Oca', mrr: 63000 },
  { month: 'Şub', mrr: 71000 },
  { month: 'Mar', mrr: 78000 },
  { month: 'Nis', mrr: 85000 },
];

export const mockManagedUsersDashboard: ManagedUser[] = [
  { id: 1, name: 'Ayşe Demir', email: 'ayse@sirket.com', tier: 'Yıllık Premium', status: 'Aktif', mrr: 990 },
  { id: 2, name: 'Mehmet Yılmaz', email: 'mehmet@startup.io', tier: 'Aylık Premium', status: 'Aktif', mrr: 99 },
  { id: 3, name: 'Zeynep Kaya', email: 'zeynep@isletme.com', tier: 'Aylık Premium', status: 'Aktif', mrr: 99 },
  { id: 4, name: 'Can Özdemir', email: 'can@tech.com', tier: 'Ücretsiz', status: 'Aktif', mrr: 0 },
  { id: 5, name: 'Elif Çelik', email: 'elif@ajans.com', tier: 'Yıllık Premium', status: 'Aktif', mrr: 990 },
  { id: 6, name: 'Burak Arslan', email: 'burak@dev.com', tier: 'Aylık Premium', status: 'İptal Edildi', mrr: 0 },
];

export const mockManagedUsersAdminPanel: ManagedUser[] = [
  { id: 1, name: 'Ayşe Demir', email: 'ayse@sirket.com', tier: 'Kurumsal', status: 'Aktif', mrr: 9999 },
  { id: 2, name: 'Mehmet Yılmaz', email: 'mehmet@startup.io', tier: 'Pro', status: 'Aktif', mrr: 1650 },
  { id: 3, name: 'Zeynep Kaya', email: 'zeynep@isletme.com', tier: 'Pro', status: 'Aktif', mrr: 1650 },
  { id: 4, name: 'Can Özdemir', email: 'can@tech.com', tier: 'Temel', status: 'Deneme', mrr: 0 },
  { id: 5, name: 'Elif Çelik', email: 'elif@ajans.com', tier: 'Kurumsal', status: 'Aktif', mrr: 9999 },
  { id: 6, name: 'Burak Arslan', email: 'burak@dev.com', tier: 'Pro', status: 'İptal Edildi', mrr: 0 },
];

export const mockSystemModules: SystemModule[] = [
  { name: 'Ödeme Servisi', status: 'online', uptime: '%99,9', requests: '12,4B' },
  { name: 'E-posta Servisi', status: 'online', uptime: '%99,8', requests: '8,2B' },
  { name: 'Abonelik Motoru', status: 'online', uptime: '%100', requests: '15,7B' },
  { name: 'Analitik Servisi', status: 'degraded', uptime: '%97,2', requests: '5,1B' },
];

export const mockAdminStats: AdminStats = {
  monthlyRevenue: '₺85.420',
  monthlyRevenueChange: '↑ Geçen aydan %8,9',
  activeSubscribers: '2.080',
  activeSubscribersChange: '↑ Geçen aydan %8,3',
  totalContent: '1.247',
  totalContentChange: 'Bu ay 45 eklendi',
  totalUsers: '1.247',
  totalUsersChange: 'Geçen aydan +%12,5',
  churnRate: '%3,2',
  churnRateChange: 'Geçen aydan +%0,4',
  arpu: '₺41,07',
  growthRate: '+%8,9',
};

export const mockDistributionRegions: DistributionRegion[] = [
  {
    id: 1,
    region: 'İstanbul - Anadolu',
    distributionPoints: '45 Nokta',
    monthlyAmount: '3.250 Adet',
    lastDelivery: '19.04.2026',
    status: 'Aktif',
  },
  {
    id: 2,
    region: 'Ankara - Merkez',
    distributionPoints: '28 Nokta',
    monthlyAmount: '2.100 Adet',
    lastDelivery: '19.04.2026',
    status: 'Aktif',
  },
  {
    id: 3,
    region: 'İzmir - Karşıyaka',
    distributionPoints: '32 Nokta',
    monthlyAmount: '1.850 Adet',
    lastDelivery: '18.04.2026',
    status: 'Beklemede',
  },
];

export const mockDistributionStats: DistributionStats = {
  activeRegions: 47,
  newRegions: 7,
  monthlyDistribution: '12.450',
  pendingOrders: 234,
  deliveryRate: '%97.2',
};

export const mockWeeklyDelivery: WeeklyDeliveryDay[] = [
  { day: 'Pzt', deliveryCount: 38 },
  { day: 'Sal', deliveryCount: 42 },
  { day: 'Çar', deliveryCount: 35 },
  { day: 'Per', deliveryCount: 47 },
  { day: 'Cum', deliveryCount: 52 },
  { day: 'Cmt', deliveryCount: 28 },
  { day: 'Paz', deliveryCount: 18 },
];

/* ------------------------------------------------------------------ */
/*  Creator Studio                                                     */
/* ------------------------------------------------------------------ */

export const mockCreatorStudioStats: CreatorStudioStats = {
  totalContent: 47,
  totalViews: '12,4B',
  engagementRate: '%87',
  monthlyEarnings: '₺8.115',
};
