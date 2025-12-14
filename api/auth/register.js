/**
 * Register API - Forex Cafe
 * Registration is CLOSED - Only admins can add new users
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
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
    
    try {
        const db = getDb();
        
        // Check if this is the first user (allow registration)
        const allUsers = await db.select().from(users);
        const isFirstUser = allUsers.length === 0;
        
        // If not first user, require admin authentication
        if (!isFirstUser) {
            const admin = verifyAdmin(req.headers.authorization);
            if (!admin) {
                return res.status(403).json({ 
                    success: false, 
                    error: 'التسجيل مغلق - يمكن للمدير فقط إضافة مستخدمين جدد' 
                });
            }
            
            // Check max users limit (5 admins max)
            if (allUsers.length >= 5) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'تم الوصول للحد الأقصى من المستخدمين (5)' 
                });
            }
        }
        
        const { email, password, displayName, role: requestedRole } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
            });
        }
        
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
        
        // First user is admin, others are admin by default (closed system)
        const role = isFirstUser ? 'admin' : (requestedRole || 'admin');
        
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
