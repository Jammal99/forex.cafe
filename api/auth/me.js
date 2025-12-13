/**
 * Me API - Forex Cafe
 * Get current user info
 */

const jwt = require('jsonwebtoken');
const { getDb } = require('../../db');
const { users } = require('../../db/schema');
const { eq } = require('drizzle-orm');

const JWT_SECRET = process.env.JWT_SECRET || 'forex-cafe-secret-key-2024';

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
};

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                error: 'غير مصرح' 
            });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                error: 'رمز غير صالح' 
            });
        }
        
        const db = getDb();
        const result = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
        
        if (result.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'المستخدم غير موجود' 
            });
        }
        
        const user = result[0];
        
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                photoURL: user.photoURL
            }
        });
        
    } catch (error) {
        console.error('Me Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'خطأ في الخادم' 
        });
    }
};
