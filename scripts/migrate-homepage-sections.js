/**
 * Migration Script - Create Homepage Sections Table
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const createHomepageSectionsTable = async () => {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔄 Creating homepage_sections table...');
    
    try {
        // Create table
        await sql`
            CREATE TABLE IF NOT EXISTS homepage_sections (
                id SERIAL PRIMARY KEY,
                section_key VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                icon VARCHAR(50),
                is_visible BOOLEAN DEFAULT true,
                sort_order INTEGER DEFAULT 0,
                settings JSONB,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        console.log('✅ homepage_sections table created successfully!');
        
        // Check if table is empty
        const existing = await sql`SELECT COUNT(*) as count FROM homepage_sections`;
        
        if (existing[0].count === '0' || existing[0].count === 0) {
            console.log('🔄 Inserting default sections...');
            
            // Insert default sections
            const defaultSections = [
                { sectionKey: 'hero', name: 'البانر الرئيسي', icon: 'fa-image', sortOrder: 1 },
                { sectionKey: 'ticker', name: 'شريط الأسعار المباشر', icon: 'fa-chart-line', sortOrder: 2 },
                { sectionKey: 'articles', name: 'المقالات والأخبار', icon: 'fa-newspaper', sortOrder: 3 },
                { sectionKey: 'analysis', name: 'التحليلات اليومية', icon: 'fa-chart-bar', sortOrder: 4 },
                { sectionKey: 'economic-calendar-ff', name: 'المفكرة الاقتصادية (ForexFactory)', icon: 'fa-calendar-alt', sortOrder: 5 },
                { sectionKey: 'courses', name: 'الدورات التدريبية', icon: 'fa-graduation-cap', sortOrder: 6 },
                { sectionKey: 'newsletter', name: 'النشرة البريدية', icon: 'fa-envelope', sortOrder: 7 },
                { sectionKey: 'economic-calendar-inv', name: 'التقويم الاقتصادي (Investing)', icon: 'fa-calendar-check', sortOrder: 8, isVisible: false }
            ];
            
            for (const section of defaultSections) {
                await sql`
                    INSERT INTO homepage_sections (section_key, name, icon, is_visible, sort_order)
                    VALUES (${section.sectionKey}, ${section.name}, ${section.icon}, ${section.isVisible !== false}, ${section.sortOrder})
                `;
            }
            
            console.log('✅ Default sections inserted!');
        } else {
            console.log('ℹ️ Table already has data, skipping default insert.');
        }
        
        // Show current data
        const sections = await sql`SELECT * FROM homepage_sections ORDER BY sort_order`;
        console.log('\n📋 Current homepage sections:');
        sections.forEach(s => {
            console.log(`  - ${s.name} (${s.section_key}) - Visible: ${s.is_visible}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

createHomepageSectionsTable();
