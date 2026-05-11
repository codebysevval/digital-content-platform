-- V8__onboarding_and_simulation.sql
-- Phase 3: favorite_category for personalised feed
-- Phase 4: simulation_likes column for Admin Traffic Simulator

ALTER TABLE users   ADD COLUMN favorite_category VARCHAR(20);
ALTER TABLE content ADD COLUMN simulation_likes  BIGINT NOT NULL DEFAULT 0;
