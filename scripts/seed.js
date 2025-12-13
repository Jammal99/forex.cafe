/**
 * Database Seeder - Forex Cafe
 * Seeds initial data to Neon PostgreSQL
 * Run with: npm run db:seed
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seed() {
    console.log('🌱 Starting database seeding...\n');
    
    try {
        // ==========================================
        // Create Tables
        // ==========================================
        console.log('📦 Creating tables...');
        
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                display_name VARCHAR(100),
                photo_url TEXT,
                role VARCHAR(20) DEFAULT 'subscriber',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS sections (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                name_en VARCHAR(100),
                slug VARCHAR(100) UNIQUE NOT NULL,
                icon VARCHAR(50),
                description TEXT,
                show_in_filter BOOLEAN DEFAULT true,
                is_active BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                articles_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS subsections (
                id SERIAL PRIMARY KEY,
                section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                name_en VARCHAR(100),
                slug VARCHAR(100),
                description TEXT,
                is_active BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                articles_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE,
                content TEXT,
                excerpt TEXT,
                thumbnail TEXT,
                section_id INTEGER REFERENCES sections(id),
                subsection_id INTEGER REFERENCES subsections(id),
                author_id INTEGER REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'draft',
                views INTEGER DEFAULT 0,
                likes INTEGER DEFAULT 0,
                is_featured BOOLEAN DEFAULT false,
                tags TEXT,
                meta_title VARCHAR(255),
                meta_description TEXT,
                published_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS filters (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                value VARCHAR(50) NOT NULL,
                section_id INTEGER REFERENCES sections(id),
                icon VARCHAR(50),
                is_active BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS homepage_sections (
                id SERIAL PRIMARY KEY,
                section_key VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(50),
                is_visible BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                settings JSONB,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        await sql`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                key VARCHAR(50) UNIQUE NOT NULL,
                value JSONB,
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        
        console.log('✅ Tables created\n');
        
        // ==========================================
        // Seed Sections
        // ==========================================
        console.log('📂 Seeding sections...');
        
        const sectionsData = [
            { name: 'ما هو الفوركس', name_en: 'What is Forex', slug: 'what-is-forex', icon: 'fas fa-chart-line', order: 1 },
            { name: 'الاستراتيجيات', name_en: 'Strategies', slug: 'strategies', icon: 'fas fa-chess', order: 2 },
            { name: 'التحليل الفني', name_en: 'Technical Analysis', slug: 'technical-analysis', icon: 'fas fa-chart-bar', order: 3 },
            { name: 'التحليل الأساسي', name_en: 'Fundamental Analysis', slug: 'fundamental-analysis', icon: 'fas fa-newspaper', order: 4 },
            { name: 'إدارة المخاطر', name_en: 'Risk Management', slug: 'risk-management', icon: 'fas fa-shield-alt', order: 5 },
            { name: 'علم النفس', name_en: 'Trading Psychology', slug: 'trading-psychology', icon: 'fas fa-brain', order: 6 },
            { name: 'أخبار السوق', name_en: 'Market News', slug: 'market-news', icon: 'fas fa-globe', order: 7 },
            { name: 'الدورات التدريبية', name_en: 'Courses', slug: 'courses', icon: 'fas fa-graduation-cap', order: 8 }
        ];
        
        for (const section of sectionsData) {
            await sql`
                INSERT INTO sections (name, name_en, slug, icon, sort_order, show_in_filter, is_active)
                VALUES (${section.name}, ${section.name_en}, ${section.slug}, ${section.icon}, ${section.order}, true, true)
                ON CONFLICT (slug) DO NOTHING
            `;
        }
        
        console.log('✅ Sections seeded\n');
        
        // ==========================================
        // Seed Homepage Sections
        // ==========================================
        console.log('🏠 Seeding homepage sections...');
        
        const homepageSections = [
            { key: 'hero', name: 'القسم الرئيسي (Hero)', icon: 'fas fa-star', order: 1 },
            { key: 'ticker', name: 'شريط الأسعار', icon: 'fas fa-chart-line', order: 2 },
            { key: 'articles', name: 'آخر المقالات', icon: 'fas fa-newspaper', order: 3 },
            { key: 'analysis', name: 'التحليلات اليومية', icon: 'fas fa-chart-bar', order: 4 },
            { key: 'calendar', name: 'المفكرة الاقتصادية', icon: 'fas fa-calendar-alt', order: 5 },
            { key: 'courses', name: 'الدورات التدريبية', icon: 'fas fa-graduation-cap', order: 6 },
            { key: 'newsletter', name: 'النشرة البريدية', icon: 'fas fa-envelope', order: 7 }
        ];
        
        for (const section of homepageSections) {
            await sql`
                INSERT INTO homepage_sections (section_key, name, icon, sort_order, is_visible)
                VALUES (${section.key}, ${section.name}, ${section.icon}, ${section.order}, true)
                ON CONFLICT (section_key) DO NOTHING
            `;
        }
        
        console.log('✅ Homepage sections seeded\n');
        
        // ==========================================
        // Seed Default Settings
        // ==========================================
        console.log('⚙️ Seeding settings...');
        
        const defaultSettings = {
            siteName: 'فوركس كافيه',
            siteNameEn: 'Forex.Cafe',
            siteDescription: 'منصة عربية متخصصة في تعليم وتحليل أسواق الفوركس',
            siteEmail: 'info@forex.cafe'
        };
        
        await sql`
            INSERT INTO settings (key, value)
            VALUES ('general', ${JSON.stringify(defaultSettings)})
            ON CONFLICT (key) DO NOTHING
        `;
        
        console.log('✅ Settings seeded\n');
        
        // ==========================================
        // Seed Default Filters
        // ==========================================
        console.log('🔍 Seeding filters...');
        
        const filtersData = [
            { name: 'الكل', value: 'all', order: 1 },
            { name: 'الأحدث', value: 'latest', order: 2 },
            { name: 'الأكثر مشاهدة', value: 'popular', order: 3 }
        ];
        
        for (const filter of filtersData) {
            await sql`
                INSERT INTO filters (name, value, sort_order, is_active)
                VALUES (${filter.name}, ${filter.value}, ${filter.order}, true)
                ON CONFLICT DO NOTHING
            `;
        }
        
        console.log('✅ Filters seeded\n');
        
        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📌 Next steps:');
        console.log('   1. Create your admin account at /login.html');
        console.log('   2. Deploy to Vercel: vercel deploy');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
