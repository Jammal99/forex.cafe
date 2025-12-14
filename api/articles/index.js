/**
 * Articles API - Forex Cafe
 * CRUD operations for articles
 */

const { getDb } = require('../../db');
const { articles } = require('../../db/schema');
const { eq, desc, and } = require('drizzle-orm');

// Generate slug
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^\w\s-\u0600-\u06FF]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + '-' + Date.now().toString(36);
};

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Cache headers for GET requests - articles list and details
    if (req.method === 'GET') {
        // Cache for 5 minutes, stale-while-revalidate for 1 hour
        res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
        res.setHeader('Vary', 'Accept-Encoding');
    }
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const db = getDb();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get('id');
        
        // ==========================================
        // GET - Get articles
        // ==========================================
        if (req.method === 'GET') {
            // Single article
            if (id) {
                const result = await db.select().from(articles).where(eq(articles.id, parseInt(id))).limit(1);
                
                if (result.length === 0) {
                    return res.status(404).json({ success: false, error: 'المقال غير موجود' });
                }
                
                // Increment views
                await db.update(articles)
                    .set({ views: result[0].views + 1 })
                    .where(eq(articles.id, result[0].id));
                
                return res.status(200).json({ success: true, data: result[0] });
            }
            
            // All articles with filters
            const status = url.searchParams.get('status');
            const sectionId = url.searchParams.get('section');
            const limit = parseInt(url.searchParams.get('limit')) || 50;
            const offset = parseInt(url.searchParams.get('offset')) || 0;
            const withCount = url.searchParams.get('count') === 'true';
            
            const conditions = [];
            if (status) conditions.push(eq(articles.status, status));
            if (sectionId) conditions.push(eq(articles.sectionId, parseInt(sectionId)));
            
            // Get total count if requested
            let total = 0;
            if (withCount) {
                let countQuery = db.select().from(articles);
                if (conditions.length > 0) {
                    countQuery = countQuery.where(and(...conditions));
                }
                const countResult = await countQuery;
                total = countResult.length;
            }
            
            // Get paginated results
            let query = db.select().from(articles);
            if (conditions.length > 0) {
                query = query.where(and(...conditions));
            }
            
            const result = await query.orderBy(desc(articles.createdAt)).limit(limit).offset(offset);
            
            const response = { success: true, data: result };
            if (withCount) {
                response.total = total;
                response.page = Math.floor(offset / limit) + 1;
                response.totalPages = Math.ceil(total / limit);
            }
            
            return res.status(200).json(response);
        }
        
        // ==========================================
        // POST - Create article
        // ==========================================
        if (req.method === 'POST') {
            const body = req.body;
            
            if (!body.title || !body.content) {
                return res.status(400).json({ success: false, error: 'العنوان والمحتوى مطلوبان' });
            }
            
            const slug = generateSlug(body.title);
            
            const result = await db.insert(articles).values({
                title: body.title,
                slug,
                content: body.content,
                excerpt: body.excerpt || body.content.substring(0, 200),
                thumbnail: body.thumbnail,
                sectionId: body.sectionId,
                subsectionId: body.subsectionId,
                authorId: body.authorId,
                status: body.status || 'draft',
                tags: body.tags,
                isFeatured: body.isFeatured || false,
                metaTitle: body.metaTitle || body.title,
                metaDescription: body.metaDescription || body.excerpt,
                publishedAt: body.status === 'published' ? new Date() : null
            }).returning();
            
            return res.status(201).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // PUT - Update article
        // ==========================================
        if (req.method === 'PUT') {
            if (!id) {
                return res.status(400).json({ success: false, error: 'معرف المقال مطلوب' });
            }
            
            const body = req.body;
            if (body.status === 'published' && !body.publishedAt) {
                body.publishedAt = new Date();
            }
            
            const result = await db.update(articles)
                .set({ ...body, updatedAt: new Date() })
                .where(eq(articles.id, parseInt(id)))
                .returning();
            
            if (result.length === 0) {
                return res.status(404).json({ success: false, error: 'المقال غير موجود' });
            }
            
            return res.status(200).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // DELETE - Delete article
        // ==========================================
        if (req.method === 'DELETE') {
            if (!id) {
                return res.status(400).json({ success: false, error: 'معرف المقال مطلوب' });
            }
            
            await db.delete(articles).where(eq(articles.id, parseInt(id)));
            
            return res.status(200).json({ success: true, message: 'تم حذف المقال' });
        }
        
        return res.status(405).json({ success: false, error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Articles API Error:', error);
        return res.status(500).json({ success: false, error: 'خطأ في الخادم: ' + error.message });
    }
};
