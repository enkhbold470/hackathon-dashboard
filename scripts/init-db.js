/**
 * Database initialization script
 * Run with: pnpm node scripts/init-db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function initializeDatabase() {
  // Make sure we have a database URL
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.error('Please create a .env.local file with DATABASE_URL=postgresql://username:password@localhost:5432/hackathon_db');
    process.exit(1);
  }

  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // Test connection
    const connectionResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to database:', connectionResult.rows[0].now);

    // Read schema SQL file
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    console.log('Reading schema from:', schemaPath);
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Schema loaded, applying...');

    // Apply schema
    await pool.query(schemaSql);
    console.log('✅ Schema applied successfully');

    // Test that the table exists by counting rows
    const tableResult = await pool.query('SELECT COUNT(*) FROM applications');
    console.log('✅ Applications table created. Current row count:', tableResult.rows[0].count);

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase(); 