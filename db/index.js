/**
 * Database Connection - Neon PostgreSQL
 */

const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const schema = require('./schema');

// Get database URL from environment
const getDatabaseUrl = () => {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('❌ DATABASE_URL is not set!');
        return null;
    }
    return url;
};

// Create database connection
let db = null;

const getDb = () => {
    if (db) return db;
    
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
        throw new Error('Database URL not configured');
    }
    
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
    
    return db;
};

// Test connection
const testConnection = async () => {
    try {
        const database = getDb();
        const result = await database.execute('SELECT 1 as test');
        console.log('✅ Database connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

module.exports = {
    getDb,
    testConnection,
    schema
};
