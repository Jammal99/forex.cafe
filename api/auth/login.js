/**
 * Login API - Forex Cafe
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../../db');
const { users } = require('../../db/schema');
const { eq } = require('drizzle-orm');

const JWT_SECRET = process.env.JWT_SECRET || 'forex-cafe-secret-key-2024';

const createToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
            });
        }
        
        const db = getDb();
        
        // Find user
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (result.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'بيانات الدخول غير صحيحة' 
            });
        }
        
        const user = result[0];
        
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false, 
                error: 'الحساب موقوف' 
            });
        }
        
        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                error: 'بيانات الدخول غير صحيحة' 
            });
        }
        
        // Update last login
        await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
        
        const token = createToken(user);
        
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                photoURL: user.photoURL
            },
            token
        });
        
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'خطأ في الخادم: ' + error.message 
        });
    }
};
