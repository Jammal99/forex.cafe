/**
 * Single Article API - Forex Cafe
 * Get single article by ID
 */

const { getDb } = require('../../db');
const { articles } = require('../../db/schema');
const { eq } = require('drizzle-orm');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const db = getDb();
        
        // Extract ID from URL - Vercel passes it in req.query.id
        let id;
        if (req.query && req.query.id) {
            id = parseInt(req.query.id);
        } else {
            // Fallback: extract from URL path
            const urlParts = req.url.split('/');
            id = parseInt(urlParts[urlParts.length - 1].split('?')[0]);
        }
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'معرف المقال غير صحيح' });
        }
        
        // ==========================================
        // GET - Get single article
        // ==========================================
        if (req.method === 'GET') {
            const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
            
            if (result.length === 0) {
                return res.status(404).json({ success: false, error: 'المقال غير موجود' });
            }
            
            return res.status(200).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // POST - Increment view count
        // ==========================================
        if (req.method === 'POST') {
            // Check if this is a view increment request
            if (req.url.includes('/view')) {
                const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
                
                if (result.length === 0) {
                    return res.status(404).json({ success: false, error: 'المقال غير موجود' });
                }
                
                await db.update(articles)
                    .set({ views: result[0].views + 1 })
                    .where(eq(articles.id, id));
                
                return res.status(200).json({ success: true, message: 'تم تحديث المشاهدات' });
            }
        }
        
        return res.status(405).json({ success: false, error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Single Article API Error:', error);
        return res.status(500).json({ success: false, error: 'خطأ في الخادم: ' + error.message });
    }
};
