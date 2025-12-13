/**
 * Settings API - Forex Cafe
 */

const { getDb } = require('../../db');
const { settings } = require('../../db/schema');
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
        
        // ==========================================
        // GET - Get settings
        // ==========================================
        if (req.method === 'GET') {
            const result = await db.select().from(settings).limit(1);
            
            if (result.length === 0) {
                // Return default settings
                return res.status(200).json({ 
                    success: true, 
                    data: {
                        siteName: 'فوركس كافيه',
                        siteDescription: 'منصة تعليم وتحليل الفوركس',
                        logo: null,
                        favicon: null,
                        primaryColor: '#d97706',
                        secondaryColor: '#1a1a24'
                    }
                });
            }
            
            return res.status(200).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // POST - Update settings
        // ==========================================
        if (req.method === 'POST') {
            const body = req.body;
            
            // Check if settings exist
            const existing = await db.select().from(settings).limit(1);
            
            if (existing.length === 0) {
                // Create new settings
                const result = await db.insert(settings).values(body).returning();
                return res.status(201).json({ success: true, data: result[0] });
            }
            
            // Update existing settings
            const result = await db.update(settings)
                .set(body)
                .where(eq(settings.id, existing[0].id))
                .returning();
            
            return res.status(200).json({ success: true, data: result[0] });
        }
        
        return res.status(405).json({ success: false, error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Settings API Error:', error);
        return res.status(500).json({ success: false, error: 'خطأ في الخادم: ' + error.message });
    }
};
