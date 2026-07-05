const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

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
