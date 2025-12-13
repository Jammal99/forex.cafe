/**
 * Sections API - Forex Cafe
 * CRUD operations for sections
 */

const { getDb } = require('../../db');
const { sections } = require('../../db/schema');
const { eq, asc, desc } = require('drizzle-orm');

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

// Helper: Generate slug
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return sendResponse(res, 200, {});
    }
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts[2]; // /api/sections/[id]
    
    try {
        const db = getDb();
        
        // ==========================================
        // GET /api/sections - Get all sections
        // ==========================================
        if (req.method === 'GET' && !id) {
            const result = await db.select().from(sections).orderBy(asc(sections.sortOrder));
            
            return sendResponse(res, 200, {
                success: true,
                data: result
            });
        }
        
        // ==========================================
        // GET /api/sections/:id - Get single section
        // ==========================================
        if (req.method === 'GET' && id) {
            const result = await db.select().from(sections).where(eq(sections.id, parseInt(id))).limit(1);
            
            if (result.length === 0) {
                return sendResponse(res, 404, { 
                    success: false, 
                    error: 'القسم غير موجود' 
                });
            }
            
            return sendResponse(res, 200, {
                success: true,
                data: result[0]
            });
        }
        
        // ==========================================
        // POST /api/sections - Create section
        // ==========================================
        if (req.method === 'POST') {
            const body = await parseBody(req);
            const { name, nameEn, icon, description, showInFilter, isActive, sortOrder } = body;
            
            if (!name) {
                return sendResponse(res, 400, { 
                    success: false, 
                    error: 'اسم القسم مطلوب' 
                });
            }
            
            const slug = generateSlug(nameEn || name);
            
            const result = await db.insert(sections).values({
                name,
                nameEn,
                slug,
                icon: icon || 'fas fa-folder',
                description,
                showInFilter: showInFilter ?? true,
                isActive: isActive ?? true,
                sortOrder: sortOrder || 0
            }).returning();
            
            return sendResponse(res, 201, {
                success: true,
                data: result[0]
            });
        }
        
        // ==========================================
        // PUT /api/sections/:id - Update section
        // ==========================================
        if (req.method === 'PUT' && id) {
            const body = await parseBody(req);
            
            const result = await db.update(sections)
                .set({
                    ...body,
                    updatedAt: new Date()
                })
                .where(eq(sections.id, parseInt(id)))
                .returning();
            
            if (result.length === 0) {
                return sendResponse(res, 404, { 
                    success: false, 
                    error: 'القسم غير موجود' 
                });
            }
            
            return sendResponse(res, 200, {
                success: true,
                data: result[0]
            });
        }
        
        // ==========================================
        // DELETE /api/sections/:id - Delete section
        // ==========================================
        if (req.method === 'DELETE' && id) {
            const result = await db.delete(sections)
                .where(eq(sections.id, parseInt(id)))
                .returning();
            
            if (result.length === 0) {
                return sendResponse(res, 404, { 
                    success: false, 
                    error: 'القسم غير موجود' 
                });
            }
            
            return sendResponse(res, 200, {
                success: true,
                message: 'تم حذف القسم بنجاح'
            });
        }
        
        // Not found
        return sendResponse(res, 404, { 
            success: false, 
            error: 'المسار غير موجود' 
        });
        
    } catch (error) {
        console.error('Sections API Error:', error);
        return sendResponse(res, 500, { 
            success: false, 
            error: 'خطأ في الخادم' 
        });
    }
};
