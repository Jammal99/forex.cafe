/**
 * Settings API - Forex Cafe
 * Site settings and homepage configuration
 */

const { getDb } = require('../../db');
const { settings, homepageSections } = require('../../db/schema');
const { eq, asc } = require('drizzle-orm');

// Helper: Send JSON response
const sendResponse = (res, status, data) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end(JSON.stringify(data));
};

// Helper: Parse request body
const parseBody = async (req) => {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch {
                resolve({});
            }
        });
    });
};

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return sendResponse(res, 200, {});
    }
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const key = pathParts[2]; // /api/settings/[key]
    
    try {
        const db = getDb();
        
        // ==========================================
        // GET /api/settings - Get all settings
        // ==========================================
        if (req.method === 'GET' && !key) {
            const result = await db.select().from(settings);
            
            // Convert to object
            const settingsObj = {};
            result.forEach(item => {
                settingsObj[item.key] = item.value;
            });
            
            return sendResponse(res, 200, {
                success: true,
                data: settingsObj
            });
        }
        
        // ==========================================
        // GET /api/settings/:key - Get specific setting
        // ==========================================
        if (req.method === 'GET' && key) {
            if (key === 'homepage') {
                // Get homepage sections
                const result = await db.select()
                    .from(homepageSections)
                    .orderBy(asc(homepageSections.sortOrder));
                
                return sendResponse(res, 200, {
                    success: true,
                    data: result
                });
            }
            
            const result = await db.select()
                .from(settings)
                .where(eq(settings.key, key))
                .limit(1);
            
            if (result.length === 0) {
                return sendResponse(res, 404, { 
                    success: false, 
                    error: 'الإعداد غير موجود' 
                });
            }
            
            return sendResponse(res, 200, {
                success: true,
                data: result[0].value
            });
        }
        
        // ==========================================
        // PUT /api/settings/:key - Update setting
        // ==========================================
        if (req.method === 'PUT' && key) {
            const body = await parseBody(req);
            
            if (key === 'homepage') {
                // Update homepage sections
                const { sections: sectionsData } = body;
                
                if (sectionsData && Array.isArray(sectionsData)) {
                    for (const section of sectionsData) {
                        await db.update(homepageSections)
                            .set({
                                isVisible: section.isVisible,
                                sortOrder: section.sortOrder,
                                settings: section.settings,
                                updatedAt: new Date()
                            })
                            .where(eq(homepageSections.sectionKey, section.sectionKey));
                    }
                }
                
                return sendResponse(res, 200, {
                    success: true,
                    message: 'تم تحديث أقسام الصفحة الرئيسية'
                });
            }
            
            // Upsert setting
            const existing = await db.select()
                .from(settings)
                .where(eq(settings.key, key))
                .limit(1);
            
            if (existing.length > 0) {
                await db.update(settings)
                    .set({ value: body, updatedAt: new Date() })
                    .where(eq(settings.key, key));
            } else {
                await db.insert(settings).values({
                    key,
                    value: body
                });
            }
            
            return sendResponse(res, 200, {
                success: true,
                message: 'تم حفظ الإعدادات'
            });
        }
        
        // Not found
        return sendResponse(res, 404, { 
            success: false, 
            error: 'المسار غير موجود' 
        });
        
    } catch (error) {
        console.error('Settings API Error:', error);
        return sendResponse(res, 500, { 
            success: false, 
            error: 'خطأ في الخادم' 
        });
    }
};
