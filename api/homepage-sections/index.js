/**
 * Homepage Sections API - Forex Cafe
 * Manage homepage sections visibility and order
 */

const { getDb } = require('../../db');
const { homepageSections } = require('../../db/schema');
const { eq, asc } = require('drizzle-orm');

// Default homepage sections
const defaultSections = [
    { sectionKey: 'hero', name: 'البانر الرئيسي', icon: 'fa-image', isVisible: true, sortOrder: 1 },
    { sectionKey: 'ticker', name: 'شريط الأسعار المباشر', icon: 'fa-chart-line', isVisible: true, sortOrder: 2 },
    { sectionKey: 'articles', name: 'المقالات والأخبار', icon: 'fa-newspaper', isVisible: true, sortOrder: 3 },
    { sectionKey: 'analysis', name: 'التحليلات اليومية', icon: 'fa-chart-bar', isVisible: true, sortOrder: 4 },
    { sectionKey: 'economic-calendar-ff', name: 'المفكرة الاقتصادية (ForexFactory)', icon: 'fa-calendar-alt', isVisible: true, sortOrder: 5 },
    { sectionKey: 'courses', name: 'الدورات التدريبية', icon: 'fa-graduation-cap', isVisible: true, sortOrder: 6 },
    { sectionKey: 'newsletter', name: 'النشرة البريدية', icon: 'fa-envelope', isVisible: true, sortOrder: 7 },
    { sectionKey: 'economic-calendar-inv', name: 'التقويم الاقتصادي (Investing)', icon: 'fa-calendar-check', isVisible: false, sortOrder: 8 }
];

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
        
        // ==========================================
        // GET - Get all homepage sections
        // ==========================================
        if (req.method === 'GET') {
            let result = await db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder));
            
            // If no sections exist, create defaults
            if (result.length === 0) {
                for (const section of defaultSections) {
                    await db.insert(homepageSections).values(section);
                }
                result = await db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder));
            }
            
            return res.status(200).json({ success: true, data: result });
        }
        
        // ==========================================
        // POST - Create new homepage section
        // ==========================================
        if (req.method === 'POST') {
            const body = req.body;
            
            if (!body.sectionKey || !body.name) {
                return res.status(400).json({ success: false, error: 'اسم القسم ومفتاحه مطلوبان' });
            }
            
            // Get max sort order
            const maxOrder = await db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder));
            const newOrder = maxOrder.length > 0 ? Math.max(...maxOrder.map(s => s.sortOrder)) + 1 : 1;
            
            const result = await db.insert(homepageSections).values({
                sectionKey: body.sectionKey,
                name: body.name,
                icon: body.icon || 'fa-cube',
                isVisible: body.isVisible !== false,
                sortOrder: body.sortOrder || newOrder,
                settings: body.settings || null
            }).returning();
            
            return res.status(201).json({ success: true, data: result[0] });
        }
        
        // ==========================================
        // PUT - Update homepage sections (bulk update)
        // ==========================================
        if (req.method === 'PUT') {
            const body = req.body;
            
            // Handle bulk update
            if (Array.isArray(body.sections)) {
                for (const section of body.sections) {
                    if (section.id) {
                        await db.update(homepageSections)
                            .set({
                                isVisible: section.isVisible,
                                sortOrder: section.sortOrder,
                                settings: section.settings,
                                updatedAt: new Date()
                            })
                            .where(eq(homepageSections.id, section.id));
                    } else if (section.sectionKey) {
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
                
                const result = await db.select().from(homepageSections).orderBy(asc(homepageSections.sortOrder));
                return res.status(200).json({ success: true, data: result });
            }
            
            // Handle single update
            if (body.id || body.sectionKey) {
                const condition = body.id 
                    ? eq(homepageSections.id, body.id)
                    : eq(homepageSections.sectionKey, body.sectionKey);
                
                const result = await db.update(homepageSections)
                    .set({
                        name: body.name,
                        icon: body.icon,
                        isVisible: body.isVisible,
                        sortOrder: body.sortOrder,
                        settings: body.settings,
                        updatedAt: new Date()
                    })
                    .where(condition)
                    .returning();
                
                return res.status(200).json({ success: true, data: result[0] });
            }
            
            return res.status(400).json({ success: false, error: 'معرف القسم مطلوب' });
        }
        
        // ==========================================
        // DELETE - Delete homepage section
        // ==========================================
        if (req.method === 'DELETE') {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const id = url.searchParams.get('id');
            const sectionKey = url.searchParams.get('sectionKey');
            
            if (!id && !sectionKey) {
                return res.status(400).json({ success: false, error: 'معرف القسم مطلوب' });
            }
            
            const condition = id 
                ? eq(homepageSections.id, parseInt(id))
                : eq(homepageSections.sectionKey, sectionKey);
            
            await db.delete(homepageSections).where(condition);
            
            return res.status(200).json({ success: true, message: 'تم حذف القسم بنجاح' });
        }
        
        return res.status(405).json({ success: false, error: 'Method not allowed' });
        
    } catch (error) {
        console.error('Homepage Sections API Error:', error);
        return res.status(500).json({ success: false, error: 'خطأ في الخادم: ' + error.message });
    }
};
