/**
 * Subsections API - Forex Cafe
 */

const { getDb } = require('../../db');
const { subsections, sections } = require('../../db/schema');
const { eq, asc, and } = require('drizzle-orm');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const db = getDb();
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.searchParams.get('id');
        const sectionId = url.searchParams.get('sectionId');
        
        // ==========================================
        // GET - Get subsections
        // ==========================================
        if (req.method === 'GET') {
            // Single subsection
            if (id) {
                const result = await db.select().from(subsections).where(eq(subsections.id, parseInt(id))).limit(1);
                if (result.length === 0) {
                    return res.status(404).json({ success: false, error: 'القسم الفرعي غير موجود' });
                }
                return res.status(200).json({ success: true, data: result[0] });
            }
            
            // Subsections by section
            if (sectionId) {
                const result = await db.select()
                    .from(subsections)
                    .where(eq(subsections.sectionId, parseInt(sectionId)))
                    .orderBy(asc(subsections.sortOrder));
                return res.status(200).json({ success: true, data: result });
            }
            
            // All subsections with section info
            const result = await db.select({
                id: subsections.id,
                name: subsections.name,
                slug: subsections.slug,
                sectionId: subsections.sectionId,
                sectionName: sections.name,
                description: subsections.description,
                isActive: subsections.isActive,
                sortOrder: subsections.sortOrder,
                articlesCount: subsections.articlesCount
            })
            .from(subsections)
            .leftJoin(sections, eq(subsections.sectionId, sections.id))
            .orderBy(asc(subsections.sectionId), asc(subsections.sortOrder));
            
            return res.status(200).json({ success: true, data: result });
        }
        
        // ==========================================
        // POST - Create subsection
        // ==========================================
        if (req.method === 'POST') {
            const body = req.body;
            
            if (!body.name || !body.sectionId) {
                return res.status(400).json({ success: false, error: 'اسم القسم الفرعي والقسم الرئيسي مطلوبان' });
            }
            
            const slug = body.name.toLowerCase()
                .replace(/[^\w\s-\u0600-\u06FF]/g, '')
                .replace(/\s+/g, '-');
            
            const result = await db.insert(subsections).values({
                name: body.name,
                sectionId: parseInt(body.sectionId),
                slug,
                description: body.description,
                isActive: body.isActive !== false,
                sortOrder: body.sortOrder || 0
            }).returning();
            
            return res.status(201).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // PUT - Update subsection
        // ==========================================
        if (req.method === 'PUT') {
            if (!id) {
                return res.status(400).json({ success: false, error: 'معرف القسم الفرعي مطلوب' });
            }
            
            const body = req.body;
            const result = await db.update(subsections)
                .set({ ...body, updatedAt: new Date() })
                .where(eq(subsections.id, parseInt(id)))
                .returning();
            
            if (result.length === 0) {
                return res.status(404).json({ success: false, error: 'القسم الفرعي غير موجود' });
            }
            
            return res.status(200).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // DELETE - Delete subsection
        // ==========================================
        if (req.method === 'DELETE') {
            if (!id) {
                return res.status(400).json({ success: false, error: 'معرف القسم الفرعي مطلوب' });
            }
            
            await db.delete(subsections).where(eq(subsections.id, parseInt(id)));
            
            return res.status(200).json({ success: true, message: 'تم حذف القسم الفرعي' });
        }
        
        return res.status(405).json({ success: false, error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Subsections API Error:', error);
        return res.status(500).json({ success: false, error: 'خطأ في الخادم: ' + error.message });
    }
};
