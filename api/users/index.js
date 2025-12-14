/**
 * Users API - Forex Cafe
 * Admin-only user management
 */

const jwt = require('jsonwebtoken');
const { getDb } = require('../../db');
const { users } = require('../../db/schema');
const { eq, desc } = require('drizzle-orm');

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
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
    
    const db = getDb();
    
    // GET - List all users
    if (req.method === 'GET') {
        try {
            const allUsers = await db.select({
                id: users.id,
                email: users.email,
                displayName: users.displayName,
                role: users.role,
                isActive: users.isActive,
                lastLogin: users.lastLogin,
                createdAt: users.createdAt
            }).from(users).orderBy(desc(users.createdAt));
            
            return res.status(200).json({
                success: true,
                data: allUsers,
                count: allUsers.length,
                maxUsers: 5
            });
        } catch (error) {
            console.error('Get users error:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'خطأ في جلب المستخدمين' 
            });
        }
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' });
};
