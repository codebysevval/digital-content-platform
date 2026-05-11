-- Remove misleading "HD/4K kalite" claims (no quality selector exists) and
-- update download quota wording to match actual enforcement (monthly=10, yearly=20).

UPDATE pricing_plans
SET features = 'Tüm premium içeriklere sınırsız erişim|Aylık 10 içerik indirme|Öncelikli müşteri desteği|Reklamsız deneyim'
WHERE id = 'monthly';

UPDATE pricing_plans
SET features = 'Tüm premium içeriklere sınırsız erişim|Aylık 20 içerik indirme|Öncelikli müşteri desteği|Reklamsız deneyim|Yıllık özel etkinlik davetleri'
WHERE id = 'yearly';

UPDATE checkout_plans
SET features = 'Ücretsiz içeriklere erişim|İndirme kotası yok|Topluluk desteği'
WHERE id = 'free';

UPDATE checkout_plans
SET features = 'Tüm premium içeriklere erişim|Aylık 10 içerik indirme|Öncelikli destek|Reklamsız deneyim'
WHERE id = 'monthly';

UPDATE checkout_plans
SET features = 'Tüm premium içeriklere erişim|Aylık 20 içerik indirme|7/24 öncelikli destek|Reklamsız deneyim|Etkinlik davetleri|Aile paylaşımı'
WHERE id = 'yearly';
