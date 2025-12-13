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
            return result.data || [];
        },
        
        async getById(id) {
            const result = await API.request(`/sections/${id}`, { auth: false });
            return result.data;
        },
        
        async create(data) {
            return API.request('/sections', {
                method: 'POST',
                body: data
            });
        },
        
        async update(id, data) {
            return API.request(`/sections/${id}`, {
                method: 'PUT',
                body: data
            });
        },
        
        async delete(id) {
            return API.request(`/sections/${id}`, {
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
            const result = await API.request(endpoint, { auth: false });
            return result.data || [];
        },
        
        async getById(id) {
            const result = await API.request(`/articles/${id}`, { auth: false });
            return result.data;
        },
        
        async getBySlug(slug) {
            const result = await API.request(`/articles/${slug}`, { auth: false });
            return result.data;
        },
        
        async create(data) {
            return API.request('/articles', {
                method: 'POST',
                body: data
            });
        },
        
        async update(id, data) {
            return API.request(`/articles/${id}`, {
                method: 'PUT',
                body: data
            });
        },
        
        async delete(id) {
            return API.request(`/articles/${id}`, {
                method: 'DELETE'
            });
        },
        
        async search(query) {
            return API.request(`/articles?search=${encodeURIComponent(query)}`, { auth: false });
        }
    },
    
    // ==========================================
    // Settings Methods
    // ==========================================
    settings: {
        async getAll() {
            const result = await API.request('/settings', { auth: false });
            return result.data || {};
        },
        
        async get(key) {
            const result = await API.request(`/settings/${key}`, { auth: false });
            return result.data;
        },
        
        async update(key, data) {
            return API.request(`/settings/${key}`, {
                method: 'PUT',
                body: data
            });
        },
        
        async getHomepage() {
            const result = await API.request('/settings/homepage', { auth: false });
            return result.data || [];
        },
        
        async updateHomepage(sections) {
            return API.request('/settings/homepage', {
                method: 'PUT',
                body: { sections }
            });
        }
    },
    
    // ==========================================
    // Stats Methods
    // ==========================================
    stats: {
        async get() {
            const result = await API.request('/stats', { auth: false });
            return result.data || {};
        }
    }
};

// Make globally available
window.API = API;
