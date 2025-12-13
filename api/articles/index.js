/**
 * Articles API - Forex Cafe
 * CRUD operations for articles
 */

const { getDb } = require('../../db');
const { articles, sections, users } = require('../../db/schema');
const { eq, desc, asc, like, and, or } = require('drizzle-orm');

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
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-\u0600-\u06FF]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now().toString(36);
};

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return sendResponse(res, 200, {});
    }
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts[2]; // /api/articles/[id]
    
    try {
        const db = getDb();
        
        // ==========================================
        // GET /api/articles - Get all articles
        // ==========================================
        if (req.method === 'GET' && !id) {
            const status = url.searchParams.get('status');
            const sectionId = url.searchParams.get('section');
            const limit = parseInt(url.searchParams.get('limit')) || 50;
            const page = parseInt(url.searchParams.get('page')) || 1;
            const offset = (page - 1) * limit;
            
            let query = db.select({
                id: articles.id,
                title: articles.title,
                slug: articles.slug,
                excerpt: articles.excerpt,
                thumbnail: articles.thumbnail,
                sectionId: articles.sectionId,
                status: articles.status,
                views: articles.views,
                isFeatured: articles.isFeatured,
                publishedAt: articles.publishedAt,
                createdAt: articles.createdAt
            }).from(articles);
            
            // Apply filters
            const conditions = [];
            if (status) {
                conditions.push(eq(articles.status, status));
            }
            if (sectionId) {
                conditions.push(eq(articles.sectionId, parseInt(sectionId)));
            }
            
            if (conditions.length > 0) {
                query = query.where(and(...conditions));
            }
            
            const result = await query
                .orderBy(desc(articles.createdAt))
                .limit(limit)
                .offset(offset);
            
            return sendResponse(res, 200, {
                success: true,
                data: result,
                pagination: {
                    page,
                    limit,
                    total: result.length
                }
            });
        }
        
        // ==========================================
        // GET /api/articles/:id - Get single article
        // ==========================================
        if (req.method === 'GET' && id) {
            // Check if id is slug or numeric id
            const isNumeric = /^\d+$/.test(id);
            
            let result;
            if (isNumeric) {
                result = await db.select().from(articles).where(eq(articles.id, parseInt(id))).limit(1);
            } else {
                result = await db.select().from(articles).where(eq(articles.slug, id)).limit(1);
            }
            
            if (result.length === 0) {
                return sendResponse(res, 404, { 
                    success: false, 
                    error: 'المقال غير موجود' 
                });
            }
            
            // Increment views
            await db.update(articles)
                .set({ views: result[0].views + 1 })
                .where(eq(articles.id, result[0].id));
            
            return sendResponse(res, 200, {
                success: true,
                data: result[0]
            });
        }
        
        // ==========================================
        // POST /api/articles - Create article
        // ==========================================
        if (req.method === 'POST') {
            const body = await parseBody(req);
            const { 
                title, content, excerpt, thumbnail, sectionId, 
                subsectionId, authorId, status, tags, isFeatured,
                metaTitle, metaDescription 
            } = body;
            
            if (!title || !content) {
                return sendResponse(res, 400, { 
                    success: false, 
                    error: 'العنوان والمحتوى مطلوبان' 
                });
            }
            
            const slug = generateSlug(title);
            
            const result = await db.insert(articles).values({
                title,
                slug,
                content,
                excerpt: excerpt || content.substring(0, 200),
                thumbnail,
                sectionId,
                subsectionId,
                authorId,
                status: status || 'draft',
                tags,
                isFeatured: isFeatured || false,
                metaTitle: metaTitle || title,
                metaDescription: metaDescription || excerpt,
                publishedAt: status === 'published' ? new Date() : null
            }).returning();
            
            // Update section articles count
            if (sectionId) {
                await db.execute(`
                    UPDATE sections 
                    SET articles_count = articles_count + 1 
                    WHERE id = ${sectionId}
                `);
            }
            
            return sendResponse(res, 201, {
                success: true,
                data: result[0]
            });
        }
        
        // ==========================================
        // PUT /api/articles/:id - Update article
        // ==========================================
        if (req.method === 'PUT' && id) {
            const body = await parseBody(req);
            
            // If publishing for first time, set publishedAt
            if (body.status === 'published' && !body.publishedAt) {
                body.publishedAt = new Date();
            }
            
            const result = await db.update(articles)
                .set({
                    ...body,
                    updatedAt: new Date()
                })
                .where(eq(articles.id, parseInt(id)))
                .returning();
            
            if (result.length === 0) {
                return sendResponse(res, 404, { 
                    success: false, 
                    error: 'المقال غير موجود' 
                });
            }
            
            return sendResponse(res, 200, {
                success: true,
                data: result[0]
            });
        }
        
        // ==========================================
        // DELETE /api/articles/:id - Delete article
        // ==========================================
        if (req.method === 'DELETE' && id) {
            // Get article first to update section count
            const article = await db.select().from(articles).where(eq(articles.id, parseInt(id))).limit(1);
            
            if (article.length === 0) {
                return sendResponse(res, 404, { 
                    success: false, 
                    error: 'المقال غير موجود' 
                });
            }
            
            await db.delete(articles).where(eq(articles.id, parseInt(id)));
            
            // Update section articles count
            if (article[0].sectionId) {
                await db.execute(`
                    UPDATE sections 
                    SET articles_count = GREATEST(articles_count - 1, 0) 
                    WHERE id = ${article[0].sectionId}
                `);
            }
            
            return sendResponse(res, 200, {
                success: true,
                message: 'تم حذف المقال بنجاح'
            });
        }
        
        // Not found
        return sendResponse(res, 404, { 
            success: false, 
            error: 'المسار غير موجود' 
        });
        
    } catch (error) {
        console.error('Articles API Error:', error);
        return sendResponse(res, 500, { 
            success: false, 
            error: 'خطأ في الخادم' 
        });
    }
};
