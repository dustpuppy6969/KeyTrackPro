require('dotenv').config();
const { migrate } = require('drizzle-orm/postgres-js/migrator');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

const db_url = process.env.DATABASE_URL;
if (!db_url) {
  console.error('Database URL not provided. Please set DATABASE_URL environment variable.');
  process.exit(1);
}

async function main() {
  console.log('Connecting to database...');
  
  try {
    const client = postgres(db_url);
    const db = drizzle(client);
    
    console.log('Connected to database. Pushing schema changes...');
    
    try {
      // Automatically push schema changes to database
      await db.execute(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Create key_status enum if it doesn't exist
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'key_status') THEN
            CREATE TYPE key_status AS ENUM ('available', 'verified', 'missing');
          END IF;
        END $$;
        
        -- Create keys table if it doesn't exist
        CREATE TABLE IF NOT EXISTS keys (
          id SERIAL PRIMARY KEY,
          key_number TEXT NOT NULL UNIQUE,
          location_name TEXT NOT NULL,
          key_prefix TEXT NOT NULL,
          description TEXT,
          status key_status NOT NULL DEFAULT 'available',
          last_verified TIMESTAMP,
          device_id TEXT
        );
        
        -- Create verifications table if it doesn't exist
        CREATE TABLE IF NOT EXISTS verifications (
          id SERIAL PRIMARY KEY,
          key_id INTEGER NOT NULL REFERENCES keys(id),
          verified_at TIMESTAMP NOT NULL DEFAULT NOW(),
          status key_status NOT NULL,
          device_id TEXT
        );
        
        -- Create settings table if it doesn't exist
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          random_verification BOOLEAN NOT NULL DEFAULT TRUE,
          verification_frequency INTEGER NOT NULL DEFAULT 6,
          require_photo_evidence BOOLEAN NOT NULL DEFAULT FALSE,
          missing_key_alerts BOOLEAN NOT NULL DEFAULT TRUE,
          daily_summary BOOLEAN NOT NULL DEFAULT TRUE,
          alert_response_time INTEGER NOT NULL DEFAULT 30,
          auto_sync BOOLEAN NOT NULL DEFAULT TRUE,
          sync_frequency INTEGER NOT NULL DEFAULT 15,
          device_id TEXT
        );
        
        -- Create pending_verifications table if it doesn't exist
        CREATE TABLE IF NOT EXISTS pending_verifications (
          id SERIAL PRIMARY KEY,
          key_id INTEGER NOT NULL REFERENCES keys(id),
          requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
          completed_at TIMESTAMP,
          is_completed BOOLEAN NOT NULL DEFAULT FALSE
        );
      `);
      
      console.log('Schema pushed successfully!');
    } catch (error) {
      console.error('Error pushing schema:', error.message);
      process.exit(1);
    }
    
    await client.end();
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    process.exit(1);
  }
}

main();