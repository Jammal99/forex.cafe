/**
 * Reset Articles - Forex Cafe
 * Deletes all existing articles and re-seeds with new content
 * Run with: node scripts/reset-articles.js
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function resetArticles() {
    console.log('🗑️ Deleting all existing articles...\n');
    
    try {
        // Delete all articles
        await sql`DELETE FROM articles`;
        console.log('✅ All articles deleted\n');
        
        // Reset articles count in subsections
        await sql`UPDATE subsections SET articles_count = 0`;
        await sql`UPDATE sections SET articles_count = 0`;
        console.log('✅ Article counts reset\n');
        
        console.log('🎉 Reset completed! Now run: node scripts/seed-articles.js');
        
    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
}

resetArticles();
