/**
 * API Service - Forex Cafe
 * Frontend API client for Neon + Vercel backend
 */

const API = {
    // Base URL - will be relative in production
    baseUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : '/api',
    
    // Token management
    token: localStorage.getItem('forex_cafe_token'),
    
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('forex_cafe_token', token);
        } else {
            localStorage.removeItem('forex_cafe_token');
        }
    },
    
    getToken() {
        return this.token || localStorage.getItem('forex_cafe_token');
    },
    
    // Headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth && this.getToken()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        return headers;
    },
    
    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: this.getHeaders(options.auth !== false),
            ...options
        };
        
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'حدث خطأ في الطلب');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // ==========================================
    // Auth Methods
    // ==========================================
    auth: {
        async login(email, password) {
            const result = await API.request('/auth/login', {
                method: 'POST',
                body: { email, password },
                auth: false
            });
            
            if (result.success && result.token) {
                API.setToken(result.token);
            }
            
            return result;
        },
        
        async register(email, password, displayName) {
            const result = await API.request('/auth/register', {
                method: 'POST',
                body: { email, password, displayName },
                auth: false
            });
            
            if (result.success && result.token) {
                API.setToken(result.token);
            }
            
            return result;
        },
        
        async me() {
            return API.request('/auth/me');
        },
        
        logout() {
            API.setToken(null);
            window.location.href = '/login.html';
        },
        
        isLoggedIn() {
            return !!API.getToken();
        }
    },
    
    // ==========================================
    // Sections Methods
    // ==========================================
    sections: {
        async getAll() {
            const result = await API.request('/sections', { auth: false });
            return result;
        },
        
        async getById(id) {
            const result = await API.request(`/sections?id=${id}`, { auth: false });
            return result;
        },
        
        async create(data) {
            return API.request('/sections', {
                method: 'POST',
                body: data
            });
        },
        
        async update(id, data) {
            return API.request(`/sections?id=${id}`, {
                method: 'PUT',
                body: data
            });
        },
        
        async delete(id) {
            return API.request(`/sections?id=${id}`, {
                method: 'DELETE'
            });
        }
    },
    
    // ==========================================
    // Subsections Methods
    // ==========================================
    subsections: {
        async getAll() {
            return API.request('/subsections', { auth: false });
        },
        
        async getBySection(sectionId) {
            return API.request(`/subsections?sectionId=${sectionId}`, { auth: false });
        },
        
        async getById(id) {
            return API.request(`/subsections?id=${id}`, { auth: false });
        },
        
        async create(data) {
            return API.request('/subsections', {
                method: 'POST',
                body: data
            });
        },
        
        async update(id, data) {
            return API.request(`/subsections?id=${id}`, {
                method: 'PUT',
                body: data
            });
        },
        
        async delete(id) {
            return API.request(`/subsections?id=${id}`, {
                method: 'DELETE'
            });
        }
    },
    
    // ==========================================
    // Articles Methods
    // ==========================================
    articles: {
        async getAll(params = {}) {
            const query = new URLSearchParams(params).toString();
            const endpoint = query ? `/articles?${query}` : '/articles';
            return API.request(endpoint, { auth: false });
        },
        
        // Get article by ID with cache support
        async getById(id, useCache = true) {
            // Try cache first if available
            if (useCache && window.ArticleCache) {
                const cached = await window.ArticleCache.getArticle(id);
                if (cached) {
                    // Return cached data and revalidate in background
                    API.articles._revalidateInBackground(id);
                    return { success: true, data: cached, fromCache: true };
                }
            }
            
            // Fetch from API
            const result = await API.request(`/articles/${id}`, { auth: false });
            
            // Cache the result
            if (result.success && result.data && window.ArticleCache) {
                window.ArticleCache.setArticle(result.data);
            }
            
            return result;
        },
        
        // Background revalidation helper
        async _revalidateInBackground(id) {
            try {
                const result = await API.request(`/articles/${id}`, { auth: false });
                if (result.success && result.data && window.ArticleCache) {
                    window.ArticleCache.setArticle(result.data);
                }
            } catch (e) {
                // Silent fail for background revalidation
            }
        },
        
        async create(data) {
            return API.request('/articles', {
                method: 'POST',
                body: data
            });
        },
        
        async update(id, data) {
            return API.request(`/articles?id=${id}`, {
                method: 'PUT',
                body: data
            });
        },
        
        async delete(id) {
            return API.request(`/articles?id=${id}`, {
                method: 'DELETE'
            });
        }
    },
    
    // ==========================================
    // Homepage Sections Methods
    // ==========================================
    homepageSections: {
        async getAll() {
            return API.request('/homepage-sections', { auth: false });
        },
        
        async create(data) {
            return API.request('/homepage-sections', {
                method: 'POST',
                body: data
            });
        },
        
        async update(data) {
            return API.request('/homepage-sections', {
                method: 'PUT',
                body: data
            });
        },
        
        async bulkUpdate(sections) {
            return API.request('/homepage-sections', {
                method: 'PUT',
                body: { sections }
            });
        },
        
        async delete(id, sectionKey) {
            const param = id ? `id=${id}` : `sectionKey=${sectionKey}`;
            return API.request(`/homepage-sections?${param}`, {
                method: 'DELETE'
            });
        }
    },
    
    // ==========================================
    // Settings Methods
    // ==========================================
    settings: {
        async getAll() {
            return API.request('/settings', { auth: false });
        },
        
        async update(data) {
            return API.request('/settings', {
                method: 'POST',
                body: data
            });
        }
    },
    
    // ==========================================
    // Users Methods (Admin only)
    // ==========================================
    users: {
        async getAll() {
            return API.request('/users');
        },
        
        async create(data) {
            return API.request('/auth/register', {
                method: 'POST',
                body: data
            });
        },
        
        async delete(id) {
            return API.request(`/users/${id}`, {
                method: 'DELETE'
            });
        },
        
        async toggleActive(id, isActive) {
            return API.request(`/users/${id}`, {
                method: 'PATCH',
                body: { isActive }
            });
        }
    },
    
    // ==========================================
    // Stats Methods
    // ==========================================
    stats: {
        async get() {
            return API.request('/stats', { auth: false });
        }
    }
};

// Make globally available
window.API = API;
