/**
 * Register API - Forex Cafe
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
        const { email, password, displayName } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
            });
        }
        
        const db = getDb();
        
        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'البريد الإلكتروني مستخدم بالفعل' 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if first user (make admin)
        const allUsers = await db.select().from(users);
        const role = allUsers.length === 0 ? 'admin' : 'subscriber';
        
        // Create user
        const newUser = await db.insert(users).values({
            email,
            password: hashedPassword,
            displayName: displayName || email.split('@')[0],
            role,
            isActive: true,
            lastLogin: new Date()
        }).returning();
        
        const user = newUser[0];
        const token = createToken(user);
        
        return res.status(201).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.displayName,
                role: user.role
            },
            token
        });
        
    } catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'خطأ في الخادم: ' + error.message 
        });
    }
};
