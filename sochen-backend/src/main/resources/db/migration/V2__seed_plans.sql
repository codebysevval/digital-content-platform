-- =========================================================================
-- V2__seed_plans.sql
-- Seeds the three plan reference tables. Feature lists are stored as a
-- pipe-delimited string ("|") and split client-side by the service layer to
-- keep the schema simple while letting Flyway own the catalog.
-- =========================================================================

INSERT INTO pricing_plans (id, name, icon_key, price, period, description, features, color, is_free, recommended, savings, sort_order) VALUES
    ('free', 'Ücretsiz', 'zap', 0, 'ücretsiz',
     'Platformu keşfetmek için başlangıç planı',
     'Ücretsiz içeriklere sınırsız erişim|Topluluk forumlarına erişim|Aylık 5 podcast bölümü|Standart kalitede video',
     'gray', TRUE, FALSE, NULL, 1),
    ('monthly', 'Aylık Premium', 'star', 99, 'ay',
     'Tüm premium içeriklere erişim',
     'Tüm premium içeriklere sınırsız erişim|Offline içerik indirme|HD kalitede video izleme|Öncelikli müşteri desteği|Reklamsız deneyim',
     'blue', FALSE, TRUE, NULL, 2),
    ('yearly', 'Yıllık Premium', 'building2', 990, 'yıl',
     'En avantajlı plan - 2 ay bedava',
     'Tüm premium içeriklere sınırsız erişim|Offline içerik indirme|HD kalitede video izleme|Öncelikli müşteri desteği|Reklamsız deneyim|Yıllık özel etkinlik davetleri',
     'purple', FALSE, FALSE, '₺198 tasarruf', 3);

INSERT INTO checkout_plans (id, name, price, period, popular, savings, features, sort_order) VALUES
    ('basic', 'Temel', 299, 'ay', FALSE, NULL,
     'Ücretsiz içeriklere erişim|Ayda 5 indirme|Standart kalite|Topluluk desteği', 1),
    ('monthly-pro', 'Aylık Pro', 999, 'ay', TRUE, NULL,
     'Tüm premium içeriklere erişim|Sınırsız indirme|HD kalite|Öncelikli destek|Reklamsız deneyim', 2),
    ('annual-elite', 'Yıllık Elite', 9999, 'yıl', FALSE, '₺2.000 tasarruf',
     'Tüm premium içeriklere erişim|Sınırsız indirme|4K kalite|7/24 öncelikli destek|Reklamsız deneyim|Etkinlik davetleri|Aile paylaşımı', 3);

INSERT INTO marketing_plans (id, name, icon_key, monthly_price, yearly_price, description, features, color, recommended, sort_order) VALUES
    ('temel', 'Temel', 'zap', 299, 2990,
     'Bireyler ve küçük projeler için mükemmel',
     '5.000 API çağrısı/ay|20 GB depolama|3 takım üyesi|E-posta desteği',
     'gray', FALSE, 1),
    ('pro', 'Pro', 'star', 999, 9990,
     'Büyüyen ekipler ve işletmeler için',
     '50.000 API çağrısı/ay|100 GB depolama|10 takım üyesi|Öncelikli destek|Gelişmiş analitik',
     'blue', TRUE, 2),
    ('kurumsal', 'Kurumsal', 'building2', 2999, 29990,
     'Büyük kuruluşlar için özel çözüm',
     'Sınırsız API çağrısı|Sınırsız depolama|Sınırsız takım üyesi|7/24 özel destek|SLA garantisi|Özel entegrasyonlar',
     'purple', FALSE, 3);
