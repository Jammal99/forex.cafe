/**
 * Article Cache Service - Forex Cafe
 * Client-side caching for instant article loading
 * 
 * Strategy:
 * 1. Show cached content immediately if available
 * 2. Revalidate in background (stale-while-revalidate pattern)
 * 3. Preload linked articles on hover
 * 4. Use IndexedDB for large content, localStorage for metadata
 */

const ArticleCache = {
    // Cache configuration
    config: {
        dbName: 'ForexCafeArticles',
        dbVersion: 1,
        storeName: 'articles',
        metaStoreName: 'metadata',
        // Cache TTL in milliseconds
        articleTTL: 60 * 60 * 1000, // 1 hour for individual articles
        listTTL: 5 * 60 * 1000,     // 5 minutes for article lists
        categoryTTL: 24 * 60 * 60 * 1000, // 24 hours for sections/subsections
    },
    
    db: null,
    
    // Initialize IndexedDB
    async init() {
        if (this.db) return this.db;
        
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.config.dbName, this.config.dbVersion);
            
            request.onerror = () => {
                console.warn('IndexedDB not available, falling back to localStorage');
                resolve(null);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Articles store
                if (!db.objectStoreNames.contains(this.config.storeName)) {
                    const store = db.createObjectStore(this.config.storeName, { keyPath: 'id' });
                    store.createIndex('slug', 'slug', { unique: true });
                    store.createIndex('cachedAt', 'cachedAt', { unique: false });
                }
                
                // Metadata store for lists and categories
                if (!db.objectStoreNames.contains(this.config.metaStoreName)) {
                    db.createObjectStore(this.config.metaStoreName, { keyPath: 'key' });
                }
            };
        });
    },
    
    // Get article from cache
    async getArticle(id) {
        await this.init();
        
        // Try IndexedDB first
        if (this.db) {
            try {
                return await new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([this.config.storeName], 'readonly');
                    const store = transaction.objectStore(this.config.storeName);
                    const request = store.get(parseInt(id));
                    
                    request.onsuccess = () => {
                        const result = request.result;
                        if (result && !this.isExpired(result.cachedAt, this.config.articleTTL)) {
                            resolve(result);
                        } else {
                            resolve(null);
                        }
                    };
                    
                    request.onerror = () => resolve(null);
                });
            } catch (e) {
                console.warn('IndexedDB read error:', e);
            }
        }
        
        // Fallback to localStorage
        try {
            const cached = localStorage.getItem(`article_${id}`);
            if (cached) {
                const data = JSON.parse(cached);
                if (!this.isExpired(data.cachedAt, this.config.articleTTL)) {
                    return data;
                }
            }
        } catch (e) {}
        
        return null;
    },
    
    // Save article to cache
    async setArticle(article) {
        if (!article || !article.id) return;
        
        const cacheEntry = {
            ...article,
            cachedAt: Date.now()
        };
        
        await this.init();
        
        // Save to IndexedDB
        if (this.db) {
            try {
                await new Promise((resolve, reject) => {
                    const transaction = this.db.transaction([this.config.storeName], 'readwrite');
                    const store = transaction.objectStore(this.config.storeName);
                    const request = store.put(cacheEntry);
                    
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            } catch (e) {
                console.warn('IndexedDB write error:', e);
            }
        }
        
        // Also save to localStorage as backup (without full content to save space)
        try {
            const metaEntry = {
                id: article.id,
                title: article.title,
                thumbnail: article.thumbnail,
                sectionId: article.sectionId,
                subsectionId: article.subsectionId,
                excerpt: article.excerpt,
                cachedAt: Date.now()
            };
            localStorage.setItem(`article_meta_${article.id}`, JSON.stringify(metaEntry));
        } catch (e) {}
    },
    
    // Get metadata (sections, subsections, article lists)
    async getMetadata(key) {
        await this.init();
        
        // Try IndexedDB
        if (this.db) {
            try {
                return await new Promise((resolve) => {
                    const transaction = this.db.transaction([this.config.metaStoreName], 'readonly');
                    const store = transaction.objectStore(this.config.metaStoreName);
                    const request = store.get(key);
                    
                    request.onsuccess = () => {
                        const result = request.result;
                        const ttl = key.includes('section') ? this.config.categoryTTL : this.config.listTTL;
                        if (result && !this.isExpired(result.cachedAt, ttl)) {
                            resolve(result.data);
                        } else {
                            resolve(null);
                        }
                    };
                    
                    request.onerror = () => resolve(null);
                });
            } catch (e) {}
        }
        
        // Fallback to localStorage
        try {
            const cached = localStorage.getItem(`meta_${key}`);
            if (cached) {
                const data = JSON.parse(cached);
                const ttl = key.includes('section') ? this.config.categoryTTL : this.config.listTTL;
                if (!this.isExpired(data.cachedAt, ttl)) {
                    return data.data;
                }
            }
        } catch (e) {}
        
        return null;
    },
    
    // Save metadata
    async setMetadata(key, data) {
        const cacheEntry = {
            key,
            data,
            cachedAt: Date.now()
        };
        
        await this.init();
        
        // Save to IndexedDB
        if (this.db) {
            try {
                await new Promise((resolve) => {
                    const transaction = this.db.transaction([this.config.metaStoreName], 'readwrite');
                    const store = transaction.objectStore(this.config.metaStoreName);
                    store.put(cacheEntry);
                    transaction.oncomplete = () => resolve();
                });
            } catch (e) {}
        }
        
        // Save to localStorage
        try {
            localStorage.setItem(`meta_${key}`, JSON.stringify(cacheEntry));
        } catch (e) {}
    },
    
    // Check if cache entry is expired
    isExpired(cachedAt, ttl) {
        return Date.now() - cachedAt > ttl;
    },
    
    // Preload article on hover (for link prefetching)
    preloadQueue: new Set(),
    
    async preloadArticle(id) {
        if (!id || this.preloadQueue.has(id)) return;
        
        // Check if already cached
        const cached = await this.getArticle(id);
        if (cached) return;
        
        this.preloadQueue.add(id);
        
        try {
            const response = await fetch(`/api/articles/${id}`);
            const result = await response.json();
            if (result.success && result.data) {
                await this.setArticle(result.data);
            }
        } catch (e) {
            console.warn('Preload failed for article:', id);
        } finally {
            this.preloadQueue.delete(id);
        }
    },
    
    // Initialize hover preloading
    initPreloading() {
        // Preload articles when hovering over links
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href*="article.html?id="]');
            if (link) {
                const url = new URL(link.href, window.location.origin);
                const id = url.searchParams.get('id');
                if (id) {
                    // Delay preload slightly to avoid unnecessary fetches
                    setTimeout(() => {
                        if (link.matches(':hover')) {
                            this.preloadArticle(id);
                        }
                    }, 100);
                }
            }
        }, { passive: true });
    },
    
    // Clear expired cache entries
    async cleanup() {
        await this.init();
        
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction([this.config.storeName], 'readwrite');
            const store = transaction.objectStore(this.config.storeName);
            const index = store.index('cachedAt');
            const cutoff = Date.now() - this.config.articleTTL * 24; // Keep for 24x TTL before cleanup
            
            const request = index.openCursor(IDBKeyRange.upperBound(cutoff));
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                }
            };
        } catch (e) {
            console.warn('Cache cleanup error:', e);
        }
    }
};

// Initialize cache and preloading
ArticleCache.init().then(() => {
    ArticleCache.initPreloading();
    // Run cleanup on page load
    ArticleCache.cleanup();
});

// Export for use in other scripts
window.ArticleCache = ArticleCache;
