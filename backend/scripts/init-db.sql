-- PostgreSQL Initialization Script
-- This script runs when the Docker container is first created

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- Set timezone
SET timezone = 'UTC';

-- Create custom types/enums (these will be recreated by Prisma, but good for reference)
-- Note: Prisma will manage these, so we keep this minimal

-- Create a schema for application (optional, Prisma uses public by default)
-- CREATE SCHEMA IF NOT EXISTS siwes;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'SIWES Management Database initialized successfully';
    RAISE NOTICE 'Database: siwes_management';
    RAISE NOTICE 'User: siwes_user';
    RAISE NOTICE 'Timestamp: %', NOW();
END $$;

-- Create a table to track migrations (if not using Prisma Migrate)
CREATE TABLE IF NOT EXISTS _migration_log (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- Log this initialization
INSERT INTO _migration_log (migration_name, notes) 
VALUES ('init-db', 'Initial database setup via Docker');
