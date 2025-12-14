/**
 * User by ID API - Forex Cafe
 * Admin-only user management
 */

const jwt = require('jsonwebtoken');
const { getDb } = require('../../db');
const { users } = require('../../db/schema');
const { eq } = require('drizzle-orm');

const JWT_SECRET = process.env.JWT_SECRET || 'forex-cafe-secret-key-2024';

// Verify admin token
const verifyAdmin = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.role === 'admin' ? decoded : null;
    } catch {
        return null;
    }
};

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Verify admin
    const admin = verifyAdmin(req.headers.authorization);
    if (!admin) {
        return res.status(401).json({ 
            success: false, 
            error: 'غير مصرح - يجب تسجيل الدخول كمدير' 
        });
    }
    
    const { id } = req.query;
    const userId = parseInt(id);
    
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'معرف المستخدم مطلوب' 
        });
    }
    
    const db = getDb();
    
    // DELETE - Remove user
    if (req.method === 'DELETE') {
        try {
            // Prevent deleting self
            if (userId === admin.id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'لا يمكنك حذف حسابك الخاص' 
                });
            }
            
            // Check if user exists
            const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (existingUser.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'المستخدم غير موجود' 
                });
            }
            
            await db.delete(users).where(eq(users.id, userId));
            
            return res.status(200).json({
                success: true,
                message: 'تم حذف المستخدم بنجاح'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'خطأ في حذف المستخدم' 
            });
        }
    }
    
    // PATCH - Update user (toggle active status)
    if (req.method === 'PATCH') {
        try {
            const { isActive } = req.body;
            
            // Prevent deactivating self
            if (userId === admin.id && isActive === false) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'لا يمكنك تعطيل حسابك الخاص' 
                });
            }
            
            const updated = await db.update(users)
                .set({ isActive })
                .where(eq(users.id, userId))
                .returning();
            
            if (updated.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'المستخدم غير موجود' 
                });
            }
            
            return res.status(200).json({
                success: true,
                message: isActive ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم',
                user: updated[0]
            });
        } catch (error) {
            console.error('Update user error:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'خطأ في تحديث المستخدم' 
            });
        }
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' });
};
