-- Remove monthly podcast episode limit and standard video quality rows from the free plan
UPDATE pricing_plans
SET features = 'Ücretsiz içeriklere sınırsız erişim|Topluluk forumlarına erişim'
WHERE id = 'free';
