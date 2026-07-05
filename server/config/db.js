const { Pool } = require('pg');

// Parse DATABASE_URL manually untuk handle username dengan titik (Supabase pooler)
let poolConfig;
if (process.env.DATABASE_URL) {
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };
} else {
    poolConfig = {
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        ssl: false,
    };
}

const pool = new Pool(poolConfig);

pool.connect((err, client, release) => {
    if (err) {
        console.error('Database Connection Failed:', err.message);
        console.error('DATABASE_URL set:', !!process.env.DATABASE_URL);
    } else {
        console.log('✅ Connected to PostgreSQL Database');
        release();
    }
});

// Wrap pool.query to match the mysql2 promise API shape: returns [rows, fields]
const db = {
    query: async (text, params) => {
        try {
            const result = await pool.query(text, params);
            return [result.rows, result.fields];
        } catch (err) {
            console.error('DB Query Error:', err.message);
            console.error('Query:', text);
            throw err;
        }
    },
    pool
};

module.exports = db;
