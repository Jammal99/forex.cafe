/**
 * Auth API - Forex Cafe
 * Handles user authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../../db');
const { users } = require('../../db/schema');
const { eq } = require('drizzle-orm');

const JWT_SECRET = process.env.JWT_SECRET || 'forex-cafe-secret-key-2024';
const JWT_EXPIRES = '7d';

// Helper: Create JWT token
const createToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
};

// Helper: Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Helper: Parse request body
const parseBody = async (req) => {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch {
                resolve({});
            }
        });
    });
};

// Helper: Send JSON response
const sendResponse = (res, status, data) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end(JSON.stringify(data));
};

module.exports = async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return sendResponse(res, 200, {});
    }
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const action = url.pathname.split('/').pop();
    
    try {
        const db = getDb();
        
        // ==========================================
        // POST /api/auth/register
        // ==========================================
        if (req.method === 'POST' && action === 'register') {
            const { email, password, displayName } = await parseBody(req);
            
            if (!email || !password) {
                return sendResponse(res, 400, { 
                    success: false, 
                    error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
                });
            }
            
            // Check if user exists
            const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
            
            if (existingUser.length > 0) {
                return sendResponse(res, 400, { 
                    success: false, 
                    error: 'البريد الإلكتروني مستخدم بالفعل' 
                });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Check if this is the first user (make admin)
            const userCount = await db.select().from(users);
            const role = userCount.length === 0 ? 'admin' : 'subscriber';
            
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
            
            return sendResponse(res, 201, {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    role: user.role
                },
                token
            });
        }
        
        // ==========================================
        // POST /api/auth/login
        // ==========================================
        if (req.method === 'POST' && action === 'login') {
            const { email, password } = await parseBody(req);
            
            if (!email || !password) {
                return sendResponse(res, 400, { 
                    success: false, 
                    error: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
                });
            }
            
            // Find user
            const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
            
            if (result.length === 0) {
                return sendResponse(res, 401, { 
                    success: false, 
                    error: 'بيانات الدخول غير صحيحة' 
                });
            }
            
            const user = result[0];
            
            // Check if user is active
            if (!user.isActive) {
                return sendResponse(res, 401, { 
                    success: false, 
                    error: 'الحساب موقوف' 
                });
            }
            
            // Verify password
            const isValid = await bcrypt.compare(password, user.password);
            
            if (!isValid) {
                return sendResponse(res, 401, { 
                    success: false, 
                    error: 'بيانات الدخول غير صحيحة' 
                });
            }
            
            // Update last login
            await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
            
            const token = createToken(user);
            
            return sendResponse(res, 200, {
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
        }
        
        // ==========================================
        // GET /api/auth/me
        // ==========================================
        if (req.method === 'GET' && action === 'me') {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return sendResponse(res, 401, { 
                    success: false, 
                    error: 'غير مصرح' 
                });
            }
            
            const token = authHeader.split(' ')[1];
            const decoded = verifyToken(token);
            
            if (!decoded) {
                return sendResponse(res, 401, { 
                    success: false, 
                    error: 'رمز غير صالح' 
                });
            }
            
            const result = await db.select().from(users).where(eq(users.id, decoded.id)).limit(1);
            
            if (result.length === 0) {
                return sendResponse(res, 404, { 
                    success: false, 
                    error: 'المستخدم غير موجود' 
                });
            }
            
            const user = result[0];
            
            return sendResponse(res, 200, {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    role: user.role,
                    photoURL: user.photoURL
                }
            });
        }
        
        // Not found
        return sendResponse(res, 404, { 
            success: false, 
            error: 'المسار غير موجود' 
        });
        
    } catch (error) {
        console.error('Auth API Error:', error);
        return sendResponse(res, 500, { 
            success: false, 
            error: 'خطأ في الخادم' 
        });
    }
};
