const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Database Connection Failed:', err.message);
    } else {
        console.log('Connected to PostgreSQL Database');
        release();
    }
});

// Wrap pool.query to match the mysql2 promise API shape: returns [rows, fields]
const db = {
    query: async (text, params) => {
        const result = await pool.query(text, params);
        return [result.rows, result.fields];
    },
    pool
};

module.exports = db;
