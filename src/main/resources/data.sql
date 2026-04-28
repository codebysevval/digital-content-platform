INSERT INTO users (id, username, password, email, full_name, role) VALUES
    (1, 'hatice', '$2a$10$8xuQKpwfUcTgsxCIcqckweprzA4hEiA/y57e72bx95TR9O8WI.WQW', 'hatice@example.com', 'Hatice Yilmaz', 'USER'),
    (2, 'admin', '$2a$10$8xuQKpwfUcTgsxCIcqckweprzA4hEiA/y57e72bx95TR9O8WI.WQW', 'admin@example.com', 'Platform Admin', 'ADMIN'),
    (3, 'selin', '$2a$10$8xuQKpwfUcTgsxCIcqckweprzA4hEiA/y57e72bx95TR9O8WI.WQW', 'selin@example.com', 'Selin Aras', 'USER'),
    (4, 'mert', '$2a$10$8xuQKpwfUcTgsxCIcqckweprzA4hEiA/y57e72bx95TR9O8WI.WQW', 'mert@example.com', 'Mert Kaya', 'USER'),
    (5, 'zeynep', '$2a$10$8xuQKpwfUcTgsxCIcqckweprzA4hEiA/y57e72bx95TR9O8WI.WQW', 'zeynep@example.com', 'Zeynep Demir', 'USER');

INSERT INTO contents (id, title, category, thumbnail_url, duration_minutes, premium) VALUES
    (1, 'Spring Boot ile JWT Guvenligi', 'Yazilim', 'https://picsum.photos/seed/content1/600/400', 42, TRUE),
    (2, 'Flutter Dashboard UI Pratikleri', 'Mobil', 'https://picsum.photos/seed/content2/600/400', 35, TRUE),
    (3, 'PostgreSQL Performans Tuning', 'Veritabani', 'https://picsum.photos/seed/content3/600/400', 28, FALSE),
    (4, 'Abonelik Fiyatlandirma Stratejileri', 'Is Gelistirme', 'https://picsum.photos/seed/content4/600/400', 31, TRUE),
    (5, 'REST API Versiyonlama Rehberi', 'Backend', 'https://picsum.photos/seed/content5/600/400', 25, FALSE),
    (6, 'Role-Based Access Control Derinlemesine', 'Guvenlik', 'https://picsum.photos/seed/content6/600/400', 39, TRUE),
    (7, 'Microservice Monitoring Baslangic', 'DevOps', 'https://picsum.photos/seed/content7/600/400', 33, FALSE),
    (8, 'Temiz Mimari ile Spring Tasarimi', 'Yazilim', 'https://picsum.photos/seed/content8/600/400', 47, TRUE),
    (9, 'Figma to Flutter Tasarim Koprusu', 'UI/UX', 'https://picsum.photos/seed/content9/600/400', 29, FALSE),
    (10, 'Musteri Yasam Boyu Degeri Analizi', 'Analitik', 'https://picsum.photos/seed/content10/600/400', 26, TRUE);

INSERT INTO subscriptions (id, plan_name, price, currency, billing_cycle, start_date, end_date, active, user_id) VALUES
    (1, 'Premium', 499.90, 'TRY', 'YEARLY', '2026-01-01', '2026-12-31', TRUE, 1),
    (2, 'Basic', 99.90, 'TRY', 'MONTHLY', '2026-04-01', '2026-04-30', TRUE, 1),
    (3, 'Team', 899.90, 'TRY', 'MONTHLY', '2026-04-01', '2026-04-30', TRUE, 2),
    (4, 'Basic', 99.90, 'TRY', 'MONTHLY', '2026-03-01', '2026-03-31', FALSE, 3),
    (5, 'Premium', 499.90, 'TRY', 'YEARLY', '2026-01-15', '2027-01-14', TRUE, 4),
    (6, 'Basic', 99.90, 'TRY', 'MONTHLY', '2026-04-01', '2026-04-30', TRUE, 5);

INSERT INTO user_contents (user_id, content_id) VALUES
    (1, 1), (1, 2), (1, 4), (1, 8), (1, 10),
    (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
    (3, 3), (3, 5), (3, 9),
    (4, 1), (4, 6), (4, 8), (4, 10),
    (5, 2), (5, 4), (5, 7), (5, 9);
