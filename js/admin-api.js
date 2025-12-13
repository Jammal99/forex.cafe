/**
 * Admin API Controller - Forex Cafe
 * Handles all API interactions for admin panel
 */

const AdminAPI = {
    // ==========================================
    // Initialize
    // ==========================================
    async init() {
        if (typeof API === 'undefined') {
            console.error('API Service not loaded');
            return;
        }
        
        console.log('Admin API initializing...');
        
        try {
            // Load sections first (needed for dropdowns)
            await this.loadSections();
            console.log('Sections loaded:', this.sections.length);
            
            // Then load articles
            await this.loadArticles();
            console.log('Articles loaded:', this.articles.length);
            
            // Update dashboard
            this.loadDashboardStats();
            
            console.log('Admin API initialized successfully!');
        } catch (error) {
            console.error('Admin API init error:', error);
        }
    },

    // ==========================================
    // Dashboard Stats
    // ==========================================
    async loadDashboardStats() {
        try {
            // Get articles count
            const articlesResult = await API.articles.getAll();
            const articles = articlesResult.data || [];
            
            // Get sections count
            const sectionsResult = await API.sections.getAll();
            const sections = sectionsResult.data || [];
            
            // Update dashboard stats
            this.updateStat('articles-count', articles.length);
            this.updateStat('sections-count', sections.length);
            this.updateStat('views-count', articles.reduce((sum, a) => sum + (a.views || 0), 0));
            
            // Update recent articles
            this.renderRecentArticles(articles.slice(0, 5));
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },

    updateStat(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    },

    renderRecentArticles(articles) {
        const container = document.getElementById('recent-articles');
        if (!container) return;
        
        if (articles.length === 0) {
            container.innerHTML = '<li style="text-align:center;padding:20px;color:#888;">لا توجد مقالات حالياً</li>';
            return;
        }
        
        container.innerHTML = articles.map(article => {
            const date = new Date(article.createdAt);
            const timeAgo = this.getTimeAgo(date);
            return `
                <li>
                    <span class="article-title">${article.title}</span>
                    <span class="article-date">${timeAgo}</span>
                </li>
            `;
        }).join('');
    },
    
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 30) return `منذ ${days} يوم`;
        return date.toLocaleDateString('ar');
    },

    // ==========================================
    // Sections Management
    // ==========================================
    sections: [],
    subsections: [],
    
    async loadSections() {
        try {
            console.log('Loading sections from API...');
            const result = await API.sections.getAll();
            console.log('Sections API response:', result);
            this.sections = result.data || [];
            console.log('Loaded sections count:', this.sections.length);
            this.renderSectionsTable();
            this.populateSectionDropdowns();
            // Also load all subsections
            await this.loadAllSubsections();
        } catch (error) {
            console.error('Error loading sections:', error);
            showNotification('خطأ في تحميل الأقسام', 'error');
        }
    },

    renderSectionsTable() {
        const tbody = document.getElementById('sectionsTableBody');
        if (!tbody) return;
        
        if (this.sections.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:40px;">
                        <i class="fas fa-layer-group" style="font-size:48px;color:#666;margin-bottom:15px;display:block;"></i>
                        <p>لا توجد أقسام</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.sections.map((section, index) => `
            <tr data-id="${section.id}">
                <td>${index + 1}</td>
                <td><i class="fas ${section.icon || 'fa-folder'} text-gold"></i> ${section.name}</td>
                <td>${section.slug || '-'}</td>
                <td>${section.articlesCount || 0}</td>
                <td><span class="status ${section.isActive ? 'active' : 'inactive'}">${section.isActive ? 'نشط' : 'معطل'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="AdminAPI.editSection(${section.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon danger" onclick="AdminAPI.deleteSection(${section.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    populateSectionDropdowns() {
        const selects = document.querySelectorAll('.section-select, #articleSection, #articlesFilterSection');
        console.log('Populating dropdowns with sections:', this.sections.length);
        
        selects.forEach(select => {
            const currentValue = select.value;
            const options = this.sections
                .filter(s => s.isActive !== false) // Only active sections
                .map(s => `<option value="${s.id}">${s.name}</option>`)
                .join('');
            select.innerHTML = '<option value="">اختر القسم</option>' + options;
            if (currentValue) select.value = currentValue;
        });
    },

    async saveSection(data) {
        const name = document.getElementById('sectionName')?.value?.trim();
        const description = document.getElementById('sectionDescription')?.value?.trim();
        const icon = document.getElementById('sectionIcon')?.value;
        const isActive = document.getElementById('sectionStatus')?.value === 'true';
        
        if (!name) {
            showNotification('يرجى إدخال اسم القسم', 'error');
            return;
        }
        
        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^\w\s-\u0600-\u06FF]/g, '')
            .replace(/\s+/g, '-')
            .trim();
        
        try {
            const result = await API.sections.create({
                name,
                slug,
                description: description || null,
                icon: icon || 'fa-folder',
                isActive
            });
            
            if (result.success) {
                showNotification('تم إضافة القسم بنجاح', 'success');
                this.loadSections();
                closeModal('addSectionModal');
                // Clear form
                document.getElementById('sectionName').value = '';
                document.getElementById('sectionDescription').value = '';
            } else {
                showNotification(result.error || 'خطأ في إضافة القسم', 'error');
            }
        } catch (error) {
            showNotification('خطأ: ' + error.message, 'error');
        }
    },

    async deleteSection(id) {
        if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
        
        try {
            const result = await API.sections.delete(id);
            if (result.success) {
                showNotification('تم حذف القسم', 'success');
                this.loadSections();
            } else {
                showNotification(result.error || 'خطأ في الحذف', 'error');
            }
        } catch (error) {
            showNotification('خطأ: ' + error.message, 'error');
        }
    },

    // ==========================================
    // Subsections Management
    // ==========================================
    async loadAllSubsections() {
        try {
            const result = await API.subsections.getAll();
            this.subsections = result.data || [];
            console.log('Loaded subsections:', this.subsections);
        } catch (error) {
            console.error('Error loading subsections:', error);
        }
    },
    
    async loadSubsectionsForArticle(sectionId) {
        const subsectionRow = document.getElementById('subsectionRow');
        const subsectionSelect = document.getElementById('articleSubsection');
        
        if (!sectionId) {
            if (subsectionRow) subsectionRow.style.display = 'none';
            return;
        }
        
        try {
            const result = await API.subsections.getBySection(sectionId);
            const subs = result.data || [];
            
            if (subs.length > 0) {
                subsectionSelect.innerHTML = '<option value="">اختر القسم الفرعي (اختياري)</option>' +
                    subs.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
                subsectionRow.style.display = 'flex';
            } else {
                subsectionRow.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading subsections:', error);
            subsectionRow.style.display = 'none';
        }
    },

    // ==========================================
    // Articles Management
    // ==========================================
    articles: [],
    
    async loadArticles() {
        try {
            const result = await API.articles.getAll();
            this.articles = result.data || [];
            this.renderArticlesTable();
        } catch (error) {
            console.error('Error loading articles:', error);
            showNotification('خطأ في تحميل المقالات', 'error');
        }
    },

    renderArticlesTable() {
        const tbody = document.getElementById('articlesTableBody');
        if (!tbody) return;
        
        if (this.articles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;padding:40px;">
                        <i class="fas fa-newspaper" style="font-size:48px;color:#666;margin-bottom:15px;display:block;"></i>
                        <p>لا توجد مقالات حالياً</p>
                        <button class="btn btn-primary" onclick="openModal('addArticleModal')" style="margin-top:15px;">
                            <i class="fas fa-plus"></i> إضافة مقال جديد
                        </button>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.articles.map(article => {
            const section = this.sections.find(s => s.id === article.sectionId);
            return `
                <tr data-id="${article.id}">
                    <td><input type="checkbox"></td>
                    <td>
                        <div class="article-title">
                            ${article.thumbnail ? `<img src="${article.thumbnail}" alt="" style="width:50px;height:35px;object-fit:cover;border-radius:4px;">` : ''}
                            <span>${article.title}</span>
                        </div>
                    </td>
                    <td>${section ? `<span class="tag">${section.name}</span>` : '-'}</td>
                    <td>
                        <span class="status ${article.status === 'published' ? 'active' : 'draft'}">
                            ${article.status === 'published' ? 'منشور' : 'مسودة'}
                        </span>
                    </td>
                    <td>${article.views || 0}</td>
                    <td class="actions">
                        <button class="btn-icon edit" onclick="AdminAPI.editArticle(${article.id})" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete" onclick="AdminAPI.deleteArticle(${article.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    async saveArticle() {
        console.log('AdminAPI.saveArticle() started');
        
        const title = document.getElementById('articleTitle')?.value?.trim();
        const content = document.getElementById('articleContent')?.value?.trim();
        const sectionId = document.getElementById('articleSection')?.value;
        const subsectionId = document.getElementById('articleSubsection')?.value;
        const status = document.getElementById('articleStatus')?.value || 'draft';
        const tags = document.getElementById('articleTags')?.value?.trim();
        const thumbnail = document.getElementById('articleThumbnail')?.value;
        
        console.log('Article data:', { title, content: content?.substring(0, 50), sectionId, status });
        
        if (!title) {
            showNotification('يرجى إدخال عنوان المقال', 'error');
            return;
        }
        
        if (!content) {
            showNotification('يرجى إدخال محتوى المقال', 'error');
            return;
        }
        
        try {
            console.log('Sending to API...');
            const result = await API.articles.create({
                title,
                content,
                sectionId: sectionId ? parseInt(sectionId) : null,
                subsectionId: subsectionId ? parseInt(subsectionId) : null,
                status,
                tags: tags || null,
                thumbnail: thumbnail || null
            });
            
            if (result.success) {
                showNotification('تم إضافة المقال بنجاح', 'success');
                closeModal('addArticleModal');
                // Clear form
                document.getElementById('articleTitle').value = '';
                document.getElementById('articleContent').value = '';
                document.getElementById('articleSection').value = '';
                document.getElementById('articleSubsection').value = '';
                document.getElementById('subsectionRow').style.display = 'none';
                document.getElementById('articleStatus').value = 'draft';
                document.getElementById('articleTags').value = '';
                this.loadArticles();
                this.loadDashboardStats();
            } else {
                showNotification(result.error || 'خطأ في إضافة المقال', 'error');
            }
        } catch (error) {
            console.error('Save article error:', error);
            showNotification('خطأ: ' + error.message, 'error');
        }
    },

    async editArticle(id) {
        const article = this.articles.find(a => a.id === id);
        if (!article) return;
        
        // For now, show info
        showNotification('تعديل المقال: ' + article.title, 'info');
        // TODO: Open edit modal with article data
    },

    async deleteArticle(id) {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
        
        try {
            const result = await API.articles.delete(id);
            if (result.success) {
                showNotification('تم حذف المقال', 'success');
                this.loadArticles();
                this.loadDashboardStats();
            } else {
                showNotification(result.error || 'خطأ في الحذف', 'error');
            }
        } catch (error) {
            showNotification('خطأ: ' + error.message, 'error');
        }
    },

    // ==========================================
    // Settings Management
    // ==========================================
    async loadSettings() {
        try {
            const result = await API.settings.getAll();
            if (result.success && result.data) {
                this.populateSettings(result.data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    },

    populateSettings(settings) {
        if (settings.siteName) {
            const el = document.getElementById('siteName');
            if (el) el.value = settings.siteName;
        }
        if (settings.siteDescription) {
            const el = document.getElementById('siteDescription');
            if (el) el.value = settings.siteDescription;
        }
    },

    async saveSettings() {
        const siteName = document.getElementById('siteName')?.value;
        const siteDescription = document.getElementById('siteDescription')?.value;
        
        try {
            const result = await API.settings.update({
                siteName,
                siteDescription
            });
            
            if (result.success) {
                showNotification('تم حفظ الإعدادات', 'success');
            } else {
                showNotification(result.error || 'خطأ في الحفظ', 'error');
            }
        } catch (error) {
            showNotification('خطأ: ' + error.message, 'error');
        }
    }
};

// Global function for save article button
function saveArticle() {
    console.log('saveArticle() called');
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.saveArticle();
    } else {
        console.error('AdminAPI not defined');
        alert('خطأ: AdminAPI غير معرف');
    }
}

// Global function for save section button
function saveSection() {
    console.log('saveSection() called');
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.saveSection();
    } else {
        console.error('AdminAPI not defined');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing AdminAPI...');
    // Wait for API service to load
    setTimeout(async () => {
        try {
            if (typeof API === 'undefined') {
                console.error('API service not loaded!');
                return;
            }
            await AdminAPI.init();
        } catch (error) {
            console.error('AdminAPI init error:', error);
        }
    }, 300);
});

// Make globally available
window.AdminAPI = AdminAPI;
window.saveArticle = saveArticle;
window.saveSection = saveSection;

console.log('admin-api.js loaded');
