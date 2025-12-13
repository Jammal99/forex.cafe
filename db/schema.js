/**
 * Database Schema - Forex Cafe
 * Using Drizzle ORM with Neon PostgreSQL
 */

const { pgTable, serial, text, varchar, integer, boolean, timestamp, jsonb } = require('drizzle-orm/pg-core');

// ==========================================
// Users Table
// ==========================================
const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 100 }),
    photoURL: text('photo_url'),
    role: varchar('role', { length: 20 }).default('subscriber'), // admin, editor, author, subscriber
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    lastLogin: timestamp('last_login'),
    updatedAt: timestamp('updated_at').defaultNow()
});

// ==========================================
// Sections Table
// ==========================================
const sections = pgTable('sections', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    nameEn: varchar('name_en', { length: 100 }),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    icon: varchar('icon', { length: 50 }),
    description: text('description'),
    showInFilter: boolean('show_in_filter').default(true),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    articlesCount: integer('articles_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// ==========================================
// Subsections Table
// ==========================================
const subsections = pgTable('subsections', {
    id: serial('id').primaryKey(),
    sectionId: integer('section_id').references(() => sections.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    nameEn: varchar('name_en', { length: 100 }),
    slug: varchar('slug', { length: 100 }),
    description: text('description'),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    articlesCount: integer('articles_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// ==========================================
// Articles Table
// ==========================================
const articles = pgTable('articles', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique(),
    content: text('content'),
    excerpt: text('excerpt'),
    thumbnail: text('thumbnail'),
    sectionId: integer('section_id').references(() => sections.id),
    subsectionId: integer('subsection_id').references(() => subsections.id),
    authorId: integer('author_id').references(() => users.id),
    status: varchar('status', { length: 20 }).default('draft'), // draft, published, archived
    views: integer('views').default(0),
    likes: integer('likes').default(0),
    isFeatured: boolean('is_featured').default(false),
    tags: text('tags'), // comma separated
    metaTitle: varchar('meta_title', { length: 255 }),
    metaDescription: text('meta_description'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow()
});

// ==========================================
// Filters Table
// ==========================================
const filters = pgTable('filters', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 50 }).notNull(),
    value: varchar('value', { length: 50 }).notNull(),
    sectionId: integer('section_id').references(() => sections.id),
    icon: varchar('icon', { length: 50 }),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    createdAt: timestamp('created_at').defaultNow()
});

// ==========================================
// Homepage Sections Table
// ==========================================
const homepageSections = pgTable('homepage_sections', {
    id: serial('id').primaryKey(),
    sectionKey: varchar('section_key', { length: 50 }).unique().notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    icon: varchar('icon', { length: 50 }),
    isVisible: boolean('is_visible').default(true),
    sortOrder: integer('sort_order').default(0),
    settings: jsonb('settings'), // JSON settings for each section
    updatedAt: timestamp('updated_at').defaultNow()
});

// ==========================================
// Settings Table
// ==========================================
const settings = pgTable('settings', {
    id: serial('id').primaryKey(),
    key: varchar('key', { length: 50 }).unique().notNull(),
    value: jsonb('value'),
    updatedAt: timestamp('updated_at').defaultNow()
});

// ==========================================
// Media Table
// ==========================================
const media = pgTable('media', {
    id: serial('id').primaryKey(),
    filename: varchar('filename', { length: 255 }).notNull(),
    originalName: varchar('original_name', { length: 255 }),
    url: text('url').notNull(),
    type: varchar('type', { length: 50 }), // image, video, document
    size: integer('size'),
    uploadedBy: integer('uploaded_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow()
});

// ==========================================
// Stats Table
// ==========================================
const stats = pgTable('stats', {
    id: serial('id').primaryKey(),
    date: timestamp('date').defaultNow(),
    totalViews: integer('total_views').default(0),
    totalUsers: integer('total_users').default(0),
    totalArticles: integer('total_articles').default(0),
    totalSections: integer('total_sections').default(0)
});

module.exports = {
    users,
    sections,
    subsections,
    articles,
    filters,
    homepageSections,
    settings,
    media,
    stats
};
