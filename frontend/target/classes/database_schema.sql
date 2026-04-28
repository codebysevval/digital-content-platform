CREATE DATABASE Abonelik_Sistemi;
\c Abonelik_Sistemi;

-- =========================================================
-- DİJİTAL İÇERİK PLATFORMU VERİTABANI
-- =========================================================

-- =========================================================
-- 1) USERS
-- =========================================================
CREATE TABLE users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_photo_url VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- =========================================================
-- 2) ADMINS
-- =========================================================
CREATE TABLE admins (
    user_id INT PRIMARY KEY,
    department VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================================
-- 3) SUBSCRIBERS
-- =========================================================
CREATE TABLE subscribers (
    user_id INT PRIMARY KEY,
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    auto_renew BOOLEAN DEFAULT FALSE,
    favorite_category VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================================
-- 4) CONTENT_CREATORS
-- =========================================================
CREATE TABLE content_creators (
    user_id INT PRIMARY KEY,
    bio TEXT,
    creator_since DATE,
    verified BOOLEAN DEFAULT FALSE,
    total_earnings NUMERIC(12,2) DEFAULT 0.00,
    creator_rating DOUBLE PRECISION DEFAULT 0,
    follower_count INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================================================
-- 5) CONTENT_TYPES
-- =========================================================
CREATE TABLE content_types (
    type_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================================================
-- 6) PLANS
-- =========================================================
CREATE TABLE plans (
    plan_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    duration_days INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- =========================================================
-- 7) SUBSCRIPTIONS
-- =========================================================
CREATE TABLE subscriptions (
    subscription_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscriber_id INT NOT NULL,
    plan_id INT,
    start_date DATE NOT NULL,
    end_date DATE,
    price NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',

    FOREIGN KEY (subscriber_id) REFERENCES subscribers(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (plan_id) REFERENCES plans(plan_id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_subscription_subscriber
ON subscriptions(subscriber_id);

-- =========================================================
-- 8) CATEGORIES
-- =========================================================
CREATE TABLE categories (
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- =========================================================
-- 9) CREATOR_APPLICATIONS
-- =========================================================
CREATE TABLE creator_applications (
    application_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscriber_id INT NOT NULL,
    reviewed_by_admin_id INT,
    application_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    review_note TEXT,

    FOREIGN KEY (subscriber_id) REFERENCES subscribers(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (reviewed_by_admin_id) REFERENCES admins(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_application_subscriber
ON creator_applications(subscriber_id);

CREATE INDEX idx_application_admin
ON creator_applications(reviewed_by_admin_id);

-- =========================================================
-- 10) CONTENTS
-- =========================================================
CREATE TABLE contents (
    content_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    creator_id INT NOT NULL,
    type_id INT NOT NULL,
    category_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    upload_date DATE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by_admin_id INT,
    file_url VARCHAR(255),
    thumbnail_url VARCHAR(255),
    is_premium BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (creator_id) REFERENCES content_creators(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (type_id) REFERENCES content_types(type_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON DELETE SET NULL ON UPDATE CASCADE,

    FOREIGN KEY (reviewed_by_admin_id) REFERENCES admins(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_content_creator
ON contents(creator_id);

CREATE INDEX idx_content_type
ON contents(type_id);

CREATE INDEX idx_content_category
ON contents(category_id);

-- =========================================================
-- 11) COMMENTS
-- =========================================================
CREATE TABLE comments (
    comment_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscriber_id INT NOT NULL,
    content_id INT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (subscriber_id) REFERENCES subscribers(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (content_id) REFERENCES contents(content_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_comment_subscriber
ON comments(subscriber_id);

CREATE INDEX idx_comment_content
ON comments(content_id);

-- =========================================================
-- 12) LIKES
-- =========================================================
CREATE TABLE likes (
    like_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    subscriber_id INT NOT NULL,
    content_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (subscriber_id) REFERENCES subscribers(user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,

    FOREIGN KEY (content_id) REFERENCES contents(content_id)
    ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE (subscriber_id, content_id)
);

CREATE INDEX idx_like_subscriber
ON likes(subscriber_id);

CREATE INDEX idx_like_content
ON likes(content_id);