-- Remove "Reklamsız deneyim" from all plan feature lists
UPDATE pricing_plans
SET features = 'Tüm premium içeriklere sınırsız erişim|Offline içerik indirme|HD kalitede video izleme|Öncelikli müşteri desteği'
WHERE id = 'monthly';

UPDATE pricing_plans
SET features = 'Tüm premium içeriklere sınırsız erişim|Offline içerik indirme|HD kalitede video izleme|Öncelikli müşteri desteği|Yıllık özel etkinlik davetleri'
WHERE id = 'yearly';

UPDATE checkout_plans
SET features = 'Tüm premium içeriklere erişim|Sınırsız indirme|HD kalite|Öncelikli destek'
WHERE id = 'monthly-pro';

UPDATE checkout_plans
SET features = 'Tüm premium içeriklere erişim|Sınırsız indirme|4K kalite|7/24 öncelikli destek|Etkinlik davetleri|Aile paylaşımı'
WHERE id = 'annual-elite';
