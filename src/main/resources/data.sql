DELETE FROM user_contents;
DELETE FROM subscriptions;
DELETE FROM contents;
DELETE FROM users;

INSERT INTO users (id, username, password, email, full_name, role) VALUES
    (1, 'hatice', '$2a$10$8xuQKpwfUcTgsxCIcqckweprzA4hEiA/y57e72bx95TR9O8WI.WQW', 'hatice@example.com', 'Hatice Yilmaz', 'SUBSCRIBER'),
    (2, 'admin', '$2a$10$8xuQKpwfUcTgsxCIcqckweprzA4hEiA/y57e72bx95TR9O8WI.WQW', 'admin@example.com', 'Platform Admin', 'ADMIN');

INSERT INTO contents (id, title, category, premium) VALUES
    (1, 'Spring Boot 101', 'Software', TRUE),
    (2, 'PostgreSQL Temelleri', 'Database', FALSE),
    (3, 'Abonelik Is Modelleri', 'Business', TRUE);

INSERT INTO subscriptions (id, plan_name, start_date, end_date, active, user_id) VALUES
    (1, 'Premium Yillik', '2026-01-01', '2026-12-31', TRUE, 1),
    (2, 'Deneme Paketi', '2025-11-01', '2025-11-30', FALSE, 1);

INSERT INTO user_contents (user_id, content_id) VALUES
    (1, 1),
    (1, 2),
    (2, 3);
