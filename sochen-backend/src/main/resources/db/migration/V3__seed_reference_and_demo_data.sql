-- =========================================================================
-- V3__seed_reference_and_demo_data.sql
-- Seeds reference data and a runnable demo dataset:
--   * 1 admin user (placeholder password hash, replaced on startup by
--     AdminPasswordSeeder so login with demo123 always works)
--   * 5 creators
--   * 15 content items + module/topic decoration rows for relevant ids
--   * Pending content for the moderation queue
--   * System modules, distribution regions, weekly delivery counts
--   * 7 monthly metrics (Eki..Nis)
--   * 6 + 6 managed user views (dashboard / panel projection)
--   * Subscription, billing history, and usage quota for the admin user
--
-- This migration intentionally avoids inserting a real BCrypt hash since the
-- generation has to use the configured BCryptPasswordEncoder strength (12).
-- See com.sochen.config.AdminPasswordSeeder for the runtime replacement.
-- =========================================================================

-- ------------------------------------------------------------------ Users
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES
    (1, 'Ahmet Yılmaz', 'ahmet@sirket.com', '__SEEDED_PASSWORD_PLACEHOLDER__', 'ADMIN', NOW(), NOW());
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));

-- --------------------------------------------------------------- Creators
INSERT INTO creators (id, name, avatar, type, bio, followers, total_content, total_views) VALUES
    (1, 'Ayşe Demir',    'AD', 'Yazar / Eğitmen',
     '10+ yıl React deneyimi olan, eğitim odaklı bir yazılımcı. İçeriklerinde modern web teknolojilerini ve uygulamalı projeleri buluşturuyor.',
     12500, 47, 1240000),
    (2, 'Mehmet Çelik',  'MÇ', 'Podcaster',
     'Türkiye''nin önde gelen teknoloji podcasterlarından biri. Ekonomi, teknoloji ve girişimcilik konuk söyleşilerinin altına imza atıyor.',
     8300000, 132, 9800000),
    (3, 'Zeynep Kaya',   'ZK', 'UI/UX Tasarımcı',
     'Tasarım sistemleri ve erişilebilirlik üzerine derinlemesine içerikler hazırlıyor. Lokal tasarım topluluğunun aktif üyesi.',
     5400, 28, 410000),
    (4, 'Can Özdemir',   'CÖ', 'Gazeteci',
     'Ekonomi muhabirliği yıllarının ardından bağımsız analizler kaleme alıyor; haftalık gazete köşesi mevcut.',
     22000, 65, 750000),
    (5, 'Elif Şahin',    'EŞ', 'Editör',
     'Edebiyat ve kültür dergileri editörü. Dosya konuları ve dosya kapaklarıyla tanınıyor.',
     3100, 19, 220000);

-- --------------------------------------------------------------- Content
INSERT INTO content (id, title, category, topic, thumbnail, duration, subscriber_only, upload_date, views, creator, creator_id, description) VALUES
    (1,  'İleri React Teknikleri',
         'COURSES',     'software',  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&fit=crop',
         '8 saat',  TRUE,  DATE '2026-04-15', 1250, 'Ayşe Demir',    1,
         'Modern React uygulamaları için ileri seviye teknikler: hooks, context, performans optimizasyonu ve Suspense.'),
    (2,  'Haftalık Teknoloji Podcast',
         'PODCASTS',    'technology','https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&fit=crop',
         '45 dk',   FALSE, DATE '2026-04-18', 3420, 'Mehmet Çelik',  2,
         'Bu hafta gündemi belirleyen teknoloji haberleri ve kısa analizler.'),
    (3,  'Aylık Ekonomi Dergisi',
         'MAGAZINES',   'economy',   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&fit=crop',
         '120 sayfa', TRUE, DATE '2026-04-01', 890, 'Can Özdemir',  4,
         'Türk ve global ekonomide nisan ayı dosyası: enflasyon, faiz patikası ve sektörel görünüm.'),
    (4,  'JavaScript Temelleri',
         'COURSES',     'software',  'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&fit=crop',
         '12 saat', FALSE, DATE '2026-03-28', 2310, 'Ayşe Demir',    1,
         'Sıfırdan ileri seviyeye JavaScript: dil temelleri, asenkron programlama ve modern ES özellikleri.'),
    (5,  'Günlük Haberler',
         'NEWSPAPERS',  'politics',  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&fit=crop',
         '10 dk',   FALSE, DATE '2026-04-19', 5420, 'Can Özdemir',   4,
         'Gün içi en önemli politika ve ekonomi başlıkları, hızlı okunabilir özet halinde.'),
    (6,  'Girişimcilik Söyleşileri',
         'PODCASTS',    'business',  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&fit=crop',
         '60 dk',   TRUE,  DATE '2026-04-12', 1820, 'Mehmet Çelik',  2,
         'Türkiye''nin lider girişimcileriyle yapılmış uzun formatlı röportajlar.'),
    (7,  'UI/UX Tasarım Uzmanlığı',
         'COURSES',     'design',    'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=800&fit=crop',
         '10 saat', TRUE,  DATE '2026-04-08', 1890, 'Zeynep Kaya',   3,
         'Kullanıcı araştırmasından arayüz tasarım sistemine ürün tasarımının tüm aşamaları.'),
    (8,  'Kültür Sanat Dergisi',
         'MAGAZINES',   'culture',   'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&fit=crop',
         '80 sayfa', FALSE, DATE '2026-04-05', 640, 'Elif Şahin',    5,
         'Edebiyat, sinema ve sahne dünyasından öne çıkan yazılar ve dosyalar.'),
    (9,  'Bilim Haberleri',
         'NEWSPAPERS',  'science',   'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&fit=crop',
         '15 dk',   FALSE, DATE '2026-04-17', 2210, 'Can Özdemir',   4,
         'Haftalık bilim manşetleri: uzay, biyoloji ve yapay zekâ alanından öne çıkanlar.'),
    (10, 'Python ile Veri Bilimi',
         'COURSES',     'software',  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&fit=crop',
         '14 saat', TRUE,  DATE '2026-03-15', 3140, 'Ayşe Demir',    1,
         'Pandas, NumPy ve scikit-learn ile uygulamalı veri bilimi atölyesi.'),
    (11, 'Sağlık Bültenleri',
         'PODCASTS',    'health',    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&fit=crop',
         '30 dk',   FALSE, DATE '2026-04-14', 1110, 'Mehmet Çelik',  2,
         'Uzman doktorların katılımıyla güncel sağlık konuları üzerine kısa söyleşiler.'),
    (12, 'Tasarım Trendleri',
         'MAGAZINES',   'design',    'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&fit=crop',
         '60 sayfa', TRUE, DATE '2026-04-02', 980, 'Zeynep Kaya',    3,
         'Bu yılın grafik ve ürün tasarımı trendleri, vaka analizleriyle birlikte.'),
    (13, 'Spor Haberleri',
         'NEWSPAPERS',  'sports',    'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&fit=crop',
         '8 dk',    FALSE, DATE '2026-04-19', 7820, 'Can Özdemir',   4,
         'Hafta sonu spor sonuçları ve değerlendirme yazıları.'),
    (14, 'Tarih Sohbetleri',
         'PODCASTS',    'history',   'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=800&fit=crop',
         '55 dk',   TRUE,  DATE '2026-04-10', 2150, 'Mehmet Çelik',  2,
         'Modern Türkiye tarihinden çarpıcı kesitler, akademisyen konuklarla.'),
    (15, 'Edebiyat Dergisi',
         'MAGAZINES',   'literature','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&fit=crop',
         '100 sayfa', FALSE, DATE '2026-04-03', 540, 'Elif Şahin',  5,
         'Hikâye, şiir ve eleştiri seçkisi; ayın yazarları dosyasıyla.');
SELECT setval(pg_get_serial_sequence('content', 'id'), (SELECT MAX(id) FROM content));

-- ------------------------------------------------- Content modules (course ids)
INSERT INTO content_modules (content_id, title, duration, sort_order) VALUES
    (1,  'Hooks Derinlemesine',                '1 saat 20 dk', 1),
    (1,  'Context API ve State Yönetimi',     '1 saat 45 dk', 2),
    (1,  'Performans Optimizasyonu',           '1 saat 30 dk', 3),
    (1,  'Suspense ve Concurrent Mode',        '2 saat',       4),
    (1,  'Gerçek Dünya Vakaları',              '1 saat 25 dk', 5),
    (4,  'Diller ve Söz Dizimi',               '2 saat',       1),
    (4,  'Asenkron JavaScript',                '2 saat 30 dk', 2),
    (4,  'Modüller ve Build Araçları',         '2 saat',       3),
    (4,  'ES2024 Yenilikleri',                 '2 saat 30 dk', 4),
    (4,  'Kapsamlı Proje',                     '3 saat',       5),
    (7,  'Kullanıcı Araştırması',              '1 saat 30 dk', 1),
    (7,  'Wireframe ve Prototipleme',          '2 saat',       2),
    (7,  'Design System Kurma',                '2 saat 15 dk', 3),
    (7,  'Erişilebilirlik (A11y)',             '1 saat 45 dk', 4),
    (7,  'Portföy Projesi',                    '2 saat 30 dk', 5),
    (10, 'Pandas Temelleri',                   '2 saat 15 dk', 1),
    (10, 'NumPy ve Vektör İşlemleri',          '2 saat',       2),
    (10, 'Görselleştirme',                     '2 saat',       3),
    (10, 'scikit-learn Modelleri',             '3 saat',       4),
    (10, 'Bitirme Projesi',                    '4 saat 45 dk', 5);

-- ------------------------------------------------- Content topic labels (for ids 2,3,5,6,8,11,12,13,14,15)
INSERT INTO content_topics (content_id, label, sort_order) VALUES
    (2,  'Teknoloji', 1), (2,  'Yapay Zekâ', 2), (2,  'Girişim', 3),
    (3,  'Ekonomi',   1), (3,  'Faiz',       2), (3,  'Sektör', 3),
    (5,  'Politika',  1), (5,  'Gündem',     2),
    (6,  'Girişim',   1), (6,  'Yatırım',    2), (6,  'Mentorluk', 3),
    (8,  'Sinema',    1), (8,  'Edebiyat',   2),
    (11, 'Sağlık',    1), (11, 'Beslenme',   2),
    (12, 'Tasarım',   1), (12, 'UX',         2), (12, 'Trend', 3),
    (13, 'Futbol',    1), (13, 'Basketbol',  2),
    (14, 'Tarih',     1), (14, 'Modern Türkiye', 2),
    (15, 'Edebiyat',  1), (15, 'Şiir',       2);

-- ----------------------------------------------------- Pending content (3 items)
INSERT INTO pending_content (title, creator, creator_id, category, topic, duration, description, subscriber_only, upload_date, thumbnail, status) VALUES
    ('İleri TypeScript Teknikleri', 'Ayşe Demir',   1, 'COURSES',
     'software',  '6 saat',  'Generic''ler, conditional types ve daha fazlası.', TRUE,
     DATE '2026-04-18', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&fit=crop', 'PENDING'),
    ('Yapay Zekâ Söyleşileri',     'Mehmet Çelik', 2, 'PODCASTS',
     'technology','40 dk',   'YZ alanında çalışan akademisyenlerle uzun röportaj serisi.', FALSE,
     DATE '2026-04-17', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&fit=crop', 'PENDING'),
    ('Aylık Tasarım Bülteni',      'Zeynep Kaya',  3, 'MAGAZINES',
     'design',    '50 sayfa','Bu ayın trendleri, vaka analizleri ve okuma listesi.', TRUE,
     DATE '2026-04-16', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&fit=crop', 'PENDING');

-- ------------------------------------------------------------- System modules
INSERT INTO system_modules (name, status, uptime_percent, request_count, sort_order) VALUES
    ('Ödeme Servisi',     'ONLINE',   99.9, 12400, 1),
    ('E-posta Servisi',   'ONLINE',   99.8,  8200, 2),
    ('Abonelik Motoru',   'ONLINE',  100.0, 15700, 3),
    ('Analitik Servisi',  'DEGRADED', 97.2,  5100, 4);

-- ---------------------------------------------------------- Distribution regions
INSERT INTO distribution_regions (region, distribution_points, monthly_amount, last_delivery, status) VALUES
    ('İstanbul - Anadolu', '45 Nokta', '3.250 Adet', DATE '2026-04-19', 'AKTIF'),
    ('Ankara - Çankaya',   '38 Nokta', '2.450 Adet', DATE '2026-04-19', 'AKTIF'),
    ('İzmir - Karşıyaka',  '32 Nokta', '1.850 Adet', DATE '2026-04-18', 'BEKLEMEDE');

-- ------------------------------------------------------------- Weekly deliveries
INSERT INTO weekly_deliveries (day_of_week, day_label, delivery_count) VALUES
    (1, 'Pzt', 38),
    (2, 'Sal', 42),
    (3, 'Çar', 35),
    (4, 'Per', 47),
    (5, 'Cum', 52),
    (6, 'Cmt', 28),
    (7, 'Paz', 18);

-- -------------------------------------- Monthly metrics (financial + revenue series)
INSERT INTO monthly_metrics (month_index, month_label, mrr, subscribers) VALUES
    (1, 'Eki', 45200, 1120),
    (2, 'Kas', 52300, 1285),
    (3, 'Ara', 58700, 1450),
    (4, 'Oca', 64500, 1620),
    (5, 'Şub', 71200, 1780),
    (6, 'Mar', 78900, 1925),
    (7, 'Nis', 85420, 2080);

-- ------------------------------ Managed users (dashboard projection — consumer tiers)
INSERT INTO managed_user_views (context, external_user_id, name, email, tier, status, mrr, sort_order) VALUES
    ('dashboard', 1, 'Ayşe Demir',     'ayse@sirket.com',    'Yıllık Premium', 'Aktif',         990, 1),
    ('dashboard', 2, 'Mehmet Yılmaz',  'mehmet@startup.io',  'Aylık Premium',  'Aktif',          99, 2),
    ('dashboard', 3, 'Zeynep Kaya',    'zeynep@studio.co',   'Aylık Premium',  'Aktif',          99, 3),
    ('dashboard', 4, 'Can Özdemir',    'can@tech.com',       'Ücretsiz',       'Deneme',          0, 4),
    ('dashboard', 5, 'Elif Şahin',     'elif@medya.org',     'Yıllık Premium', 'Aktif',         990, 5),
    ('dashboard', 6, 'Burak Arslan',   'burak@dev.com',      'Aylık Premium',  'İptal Edildi',    0, 6);

-- ---------------------------------- Managed users (panel projection — enterprise tiers)
INSERT INTO managed_user_views (context, external_user_id, name, email, tier, status, mrr, sort_order) VALUES
    ('panel', 1, 'Ayşe Demir',     'ayse@sirket.com',   'Kurumsal', 'Aktif',         9999, 1),
    ('panel', 2, 'Mehmet Yılmaz',  'mehmet@startup.io', 'Pro',      'Aktif',          999, 2),
    ('panel', 3, 'Zeynep Kaya',    'zeynep@studio.co',  'Pro',      'Aktif',          999, 3),
    ('panel', 4, 'Can Özdemir',    'can@tech.com',      'Temel',    'Deneme',           0, 4),
    ('panel', 5, 'Elif Şahin',     'elif@medya.org',    'Kurumsal', 'Aktif',         9999, 5),
    ('panel', 6, 'Burak Arslan',   'burak@dev.com',     'Pro',      'İptal Edildi',     0, 6);

-- -------------------------------------------- Subscription / billing for the admin
INSERT INTO subscriptions (user_id, plan_id, plan_name, price, active, next_billing_date) VALUES
    (1, 'pro', 'Pro', 1650, TRUE, DATE '2026-05-19');

INSERT INTO billing_records (user_id, billing_date, amount, plan_label, status) VALUES
    (1, DATE '2026-03-19', 1650, 'Pro Plan',   'Ödendi'),
    (1, DATE '2026-02-19', 1650, 'Pro Plan',   'Ödendi'),
    (1, DATE '2026-01-19', 1650, 'Pro Plan',   'Ödendi'),
    (1, DATE '2025-12-19',  980, 'Temel Plan', 'Ödendi');

INSERT INTO usage_quotas (user_id, api_calls_used, api_calls_limit, storage_used_gb, storage_limit_gb, team_members_used, team_members_limit) VALUES
    (1, 7500, 10000, 45, 100, 8, 15);

-- -------------------------------------- Pre-existing follow / like for the admin
INSERT INTO user_follows (user_id, creator_id) VALUES
    (1, 1), (1, 2), (1, 3);

INSERT INTO user_likes (user_id, content_id) VALUES
    (1, 2), (1, 5);
