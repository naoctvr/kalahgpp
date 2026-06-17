/**
 * Migration: Add premium_since column to users table
 * Run this script once to add the premium_since timestamp column.
 * This column tracks when a user upgraded to Pro.
 * 
 * Usage: node server/migrations/add_premium_since.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');

async function migrate() {
    try {
        console.log('🔄 Running migration: add_premium_since...');

        // Add premium_since column if it doesn't exist
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS premium_since TIMESTAMP NULL
        `);
        console.log('✅ Column premium_since added (or already exists).');

        // Ensure is_premium column exists with proper default
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE
        `);
        console.log('✅ Column is_premium verified.');

        // For any existing premium users without premium_since, set to created_at
        await db.query(`
            UPDATE users 
            SET premium_since = created_at 
            WHERE is_premium = true AND premium_since IS NULL
        `);
        console.log('✅ Backfilled premium_since for existing Pro users.');

        console.log('\n🎉 Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
