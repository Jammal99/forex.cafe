/**
 * Sections API - Forex Cafe
 */

const { getDb } = require('../../db');
const { sections, homepageSections } = require('../../db/schema');
const { eq, asc } = require('drizzle-orm');

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
        const type = url.searchParams.get('type'); // 'homepage' for homepage sections
        
        // ==========================================
        // GET - Get sections
        // ==========================================
        if (req.method === 'GET') {
            // Homepage sections
            if (type === 'homepage') {
                const result = await db.select().from(homepageSections).orderBy(asc(homepageSections.order));
                return res.status(200).json({ success: true, data: result });
            }
            
            // Single section
            if (id) {
                const result = await db.select().from(sections).where(eq(sections.id, parseInt(id))).limit(1);
                if (result.length === 0) {
                    return res.status(404).json({ success: false, error: 'القسم غير موجود' });
                }
                return res.status(200).json({ success: true, data: result[0] });
            }
            
            // All sections
            const result = await db.select().from(sections).orderBy(asc(sections.order));
            return res.status(200).json({ success: true, data: result });
        }
        
        // ==========================================
        // POST - Create section
        // ==========================================
        if (req.method === 'POST') {
            const body = req.body;
            
            if (!body.name) {
                return res.status(400).json({ success: false, error: 'اسم القسم مطلوب' });
            }
            
            // Homepage section
            if (type === 'homepage') {
                const result = await db.insert(homepageSections).values({
                    name: body.name,
                    title: body.title || body.name,
                    type: body.type || 'articles',
                    sectionId: body.sectionId,
                    itemsCount: body.itemsCount || 6,
                    order: body.order || 0,
                    isActive: body.isActive !== false
                }).returning();
                return res.status(201).json({ success: true, data: result[0] });
            }
            
            const slug = body.name.toLowerCase()
                .replace(/[^\w\s-\u0600-\u06FF]/g, '')
                .replace(/\s+/g, '-');
            
            const result = await db.insert(sections).values({
                name: body.name,
                slug,
                description: body.description,
                icon: body.icon,
                color: body.color,
                order: body.order || 0,
                isActive: body.isActive !== false
            }).returning();
            
            return res.status(201).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // PUT - Update section
        // ==========================================
        if (req.method === 'PUT') {
            if (!id) {
                return res.status(400).json({ success: false, error: 'معرف القسم مطلوب' });
            }
            
            const body = req.body;
            
            // Homepage section
            if (type === 'homepage') {
                const result = await db.update(homepageSections)
                    .set(body)
                    .where(eq(homepageSections.id, parseInt(id)))
                    .returning();
                return res.status(200).json({ success: true, data: result[0] });
            }
            
            const result = await db.update(sections)
                .set(body)
                .where(eq(sections.id, parseInt(id)))
                .returning();
            
            if (result.length === 0) {
                return res.status(404).json({ success: false, error: 'القسم غير موجود' });
            }
            
            return res.status(200).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // DELETE - Delete section
        // ==========================================
        if (req.method === 'DELETE') {
            if (!id) {
                return res.status(400).json({ success: false, error: 'معرف القسم مطلوب' });
            }
            
            // Homepage section
            if (type === 'homepage') {
                await db.delete(homepageSections).where(eq(homepageSections.id, parseInt(id)));
                return res.status(200).json({ success: true, message: 'تم الحذف' });
            }
            
            await db.delete(sections).where(eq(sections.id, parseInt(id)));
            return res.status(200).json({ success: true, message: 'تم حذف القسم' });
        }
        
        return res.status(405).json({ success: false, error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Sections API Error:', error);
        return res.status(500).json({ success: false, error: 'خطأ في الخادم: ' + error.message });
    }
};
