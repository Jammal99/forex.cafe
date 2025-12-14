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
            
            // Load subsections (needed for article display)
            await this.loadAllSubsections();
            console.log('Subsections loaded:', this.subsections.length);
            
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
            // Get articles count using count parameter
            const articlesResult = await API.articles.getAll({ count: true, limit: 1 });
            const articlesCount = articlesResult.total || 0;
            
            // Get all articles for views calculation (limit to reasonable number)
            const allArticlesResult = await API.articles.getAll({ limit: 1000 });
            const articles = allArticlesResult.data || [];
            
            // Get sections count
            const sectionsResult = await API.sections.getAll();
            const sections = sectionsResult.data || [];
            
            // Update dashboard stats
            this.updateStat('articles-count', articlesCount);
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
    articlesCurrentPage: 1,
    articlesPerPage: 15,
    articlesTotalCount: 0,
    articlesTotalPages: 0,
    
    async loadArticles(page = 1) {
        try {
            const offset = (page - 1) * this.articlesPerPage;
            const result = await API.articles.getAll({
                limit: this.articlesPerPage,
                offset: offset,
                count: true
            });
            
            this.articles = result.data || [];
            this.articlesTotalCount = result.total || 0;
            this.articlesTotalPages = result.totalPages || Math.ceil(this.articlesTotalCount / this.articlesPerPage);
            this.articlesCurrentPage = page;
            
            this.renderArticlesTable();
            this.renderArticlesPagination();
            this.updateArticlesCount();
        } catch (error) {
            console.error('Error loading articles:', error);
            showNotification('خطأ في تحميل المقالات', 'error');
        }
    },
    
    updateArticlesCount() {
        const countEl = document.getElementById('articlesCount');
        if (countEl) {
            countEl.textContent = `إجمالي المقالات: ${this.articlesTotalCount}`;
        }
    },
    
    renderArticlesPagination() {
        const paginationContainer = document.getElementById('articlesPagination');
        if (!paginationContainer) return;
        
        if (this.articlesTotalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination-wrapper">';
        
        // Previous button
        paginationHTML += `
            <button class="pagination-btn ${this.articlesCurrentPage === 1 ? 'disabled' : ''}" 
                    onclick="AdminAPI.goToArticlesPage(${this.articlesCurrentPage - 1})"
                    ${this.articlesCurrentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i> السابق
            </button>
        `;
        
        // Page numbers
        paginationHTML += '<div class="pagination-numbers">';
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.articlesCurrentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(this.articlesTotalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page
        if (startPage > 1) {
            paginationHTML += `<button class="pagination-num" onclick="AdminAPI.goToArticlesPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-num ${i === this.articlesCurrentPage ? 'active' : ''}" 
                        onclick="AdminAPI.goToArticlesPage(${i})">${i}</button>
            `;
        }
        
        // Last page
        if (endPage < this.articlesTotalPages) {
            if (endPage < this.articlesTotalPages - 1) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
            paginationHTML += `<button class="pagination-num" onclick="AdminAPI.goToArticlesPage(${this.articlesTotalPages})">${this.articlesTotalPages}</button>`;
        }
        
        paginationHTML += '</div>';
        
        // Next button
        paginationHTML += `
            <button class="pagination-btn ${this.articlesCurrentPage === this.articlesTotalPages ? 'disabled' : ''}" 
                    onclick="AdminAPI.goToArticlesPage(${this.articlesCurrentPage + 1})"
                    ${this.articlesCurrentPage === this.articlesTotalPages ? 'disabled' : ''}>
                التالي <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        paginationHTML += '</div>';
        
        // Page info
        const startArticle = (this.articlesCurrentPage - 1) * this.articlesPerPage + 1;
        const endArticle = Math.min(this.articlesCurrentPage * this.articlesPerPage, this.articlesTotalCount);
        paginationHTML += `
            <div class="pagination-info">
                عرض ${startArticle} - ${endArticle} من ${this.articlesTotalCount} مقال
            </div>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    },
    
    goToArticlesPage(page) {
        if (page < 1 || page > this.articlesTotalPages || page === this.articlesCurrentPage) return;
        this.loadArticles(page);
        
        // Scroll to articles section
        const articlesSection = document.getElementById('articles');
        if (articlesSection) {
            articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            // Get section and subsection names
            const section = this.sections.find(s => s.id === article.sectionId);
            const subsection = this.subsections.find(s => s.id === article.subsectionId);
            
            // Build category display
            let categoryDisplay = '-';
            if (section) {
                categoryDisplay = `<span class="tag">${section.name}</span>`;
                if (subsection) {
                    categoryDisplay += ` <span class="tag tag-sub" style="background:#444;margin-right:4px;">${subsection.name}</span>`;
                }
            }
            
            return `
                <tr data-id="${article.id}">
                    <td><input type="checkbox"></td>
                    <td>
                        <div class="article-title">
                            ${article.thumbnail ? `<img src="${article.thumbnail}" alt="" style="width:50px;height:35px;object-fit:cover;border-radius:4px;">` : ''}
                            <span>${article.title}</span>
                        </div>
                    </td>
                    <td>${categoryDisplay}</td>
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
        
        // Check if we're editing an existing article
        if (this.editingArticleId) {
            return this.updateArticle();
        }
        
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
                this.resetArticleForm();
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

    // Currently editing article ID
    editingArticleId: null,
    
    async editArticle(id) {
        console.log('AdminAPI.editArticle called for id:', id);
        
        // Find article in cache or fetch from API
        let article = this.articles.find(a => a.id === id);
        
        if (!article) {
            try {
                const result = await API.articles.getById(id);
                if (result.success) {
                    article = result.data;
                } else {
                    showNotification('المقال غير موجود', 'error');
                    return;
                }
            } catch (error) {
                console.error('Error fetching article:', error);
                showNotification('خطأ في جلب المقال', 'error');
                return;
            }
        }
        
        console.log('Editing article:', article);
        
        // Store the ID we're editing
        this.editingArticleId = id;
        
        // Populate the modal with article data
        document.getElementById('articleTitle').value = article.title || '';
        document.getElementById('articleContent').value = article.content || '';
        document.getElementById('articleStatus').value = article.status || 'draft';
        document.getElementById('articleTags').value = article.tags || '';
        document.getElementById('articleThumbnail').value = article.thumbnail || '';
        
        // Set section
        const sectionSelect = document.getElementById('articleSection');
        if (sectionSelect && article.sectionId) {
            sectionSelect.value = article.sectionId;
            // Load subsections for this section
            await this.loadSubsectionsForArticle(article.sectionId);
        }
        
        // Set subsection if exists
        if (article.subsectionId) {
            const subsectionSelect = document.getElementById('articleSubsection');
            if (subsectionSelect) {
                subsectionSelect.value = article.subsectionId;
            }
        }
        
        // Change modal title and button text to indicate editing
        const modalTitle = document.querySelector('#addArticleModal .modal-header h2');
        if (modalTitle) modalTitle.textContent = 'تعديل المقال';
        
        const saveBtn = document.querySelector('#addArticleModal .modal-footer .btn-primary');
        if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
        
        // Open the modal
        openModal('addArticleModal');
    },
    
    async updateArticle() {
        if (!this.editingArticleId) {
            console.error('No article ID set for update');
            return;
        }
        
        console.log('Updating article ID:', this.editingArticleId);
        
        const title = document.getElementById('articleTitle')?.value?.trim();
        const content = document.getElementById('articleContent')?.value?.trim();
        const sectionId = document.getElementById('articleSection')?.value;
        const subsectionId = document.getElementById('articleSubsection')?.value;
        const status = document.getElementById('articleStatus')?.value || 'draft';
        const tags = document.getElementById('articleTags')?.value?.trim();
        const thumbnail = document.getElementById('articleThumbnail')?.value;
        
        if (!title) {
            showNotification('يرجى إدخال عنوان المقال', 'error');
            return;
        }
        
        if (!content) {
            showNotification('يرجى إدخال محتوى المقال', 'error');
            return;
        }
        
        const updateData = {
            title,
            content,
            sectionId: sectionId ? parseInt(sectionId) : null,
            subsectionId: subsectionId ? parseInt(subsectionId) : null,
            status,
            tags: tags || null,
            thumbnail: thumbnail || null
        };
        
        // Set publishedAt if changing to published
        if (status === 'published') {
            const existingArticle = this.articles.find(a => a.id === this.editingArticleId);
            if (!existingArticle?.publishedAt) {
                updateData.publishedAt = new Date().toISOString();
            }
        }
        
        console.log('Update data:', updateData);
        
        try {
            const result = await API.articles.update(this.editingArticleId, updateData);
            
            if (result.success) {
                showNotification('تم تحديث المقال بنجاح', 'success');
                closeModal('addArticleModal');
                this.resetArticleForm();
                this.loadArticles();
                this.loadDashboardStats();
            } else {
                showNotification(result.error || 'خطأ في تحديث المقال', 'error');
            }
        } catch (error) {
            console.error('Update article error:', error);
            showNotification('خطأ: ' + error.message, 'error');
        }
    },
    
    resetArticleForm() {
        this.editingArticleId = null;
        
        // Reset form fields
        document.getElementById('articleTitle').value = '';
        document.getElementById('articleContent').value = '';
        document.getElementById('articleSection').value = '';
        document.getElementById('articleSubsection').value = '';
        document.getElementById('subsectionRow').style.display = 'none';
        document.getElementById('articleStatus').value = 'draft';
        document.getElementById('articleTags').value = '';
        
        // Reset modal title and button
        const modalTitle = document.querySelector('#addArticleModal .modal-header h2');
        if (modalTitle) modalTitle.textContent = 'إضافة مقال جديد';
        
        const saveBtn = document.querySelector('#addArticleModal .modal-footer .btn-primary');
        if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ المقال';
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
    },

    // ==========================================
    // Users Management
    // ==========================================
    currentUser: null,
    usersData: [],

    async loadUsers() {
        try {
            const result = await API.users.getAll();
            if (result.success) {
                this.usersData = result.data || [];
                this.renderUsersTable(this.usersData, result.count, result.maxUsers);
            } else {
                showNotification(result.error || 'خطأ في تحميل المستخدمين', 'error');
            }
        } catch (error) {
            console.error('Load users error:', error);
            showNotification('خطأ في الاتصال بالخادم', 'error');
        }
    },

    renderUsersTable(users, count, maxUsers) {
        const tbody = document.getElementById('usersTableBody');
        const countText = document.getElementById('userCountText');
        const addBtn = document.getElementById('addUserBtn');
        
        if (countText) {
            countText.textContent = `${count} / ${maxUsers} مستخدمين`;
        }
        
        if (addBtn) {
            addBtn.disabled = count >= maxUsers;
            if (count >= maxUsers) {
                addBtn.title = 'تم الوصول للحد الأقصى';
            }
        }
        
        if (!tbody) return;
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-users" style="font-size: 48px; color: #666; margin-bottom: 15px; display: block;"></i>
                        <p>لا يوجد مستخدمين</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Get current user ID from token
        const token = API.getToken();
        let currentUserId = null;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                currentUserId = payload.id;
            } catch (e) {}
        }
        
        tbody.innerHTML = users.map(user => {
            const isCurrentUser = user.id === currentUserId;
            const initials = (user.displayName || user.email).substring(0, 2);
            const bgColor = user.role === 'admin' ? 'd97706' : '10b981';
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل دخول';
            
            return `
                <tr data-user-id="${user.id}">
                    <td>
                        <div class="user-cell">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bgColor}&color=fff" alt="">
                            <span>${user.displayName || user.email.split('@')[0]}${isCurrentUser ? ' (أنت)' : ''}</span>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="role admin">مدير</span></td>
                    <td>${lastLogin}</td>
                    <td>
                        <span class="status ${user.isActive ? 'active' : 'inactive'}">
                            ${user.isActive ? 'نشط' : 'معطل'}
                        </span>
                    </td>
                    <td class="actions">
                        ${!isCurrentUser ? `
                            <button class="btn-icon ${user.isActive ? 'warning' : 'success'}" 
                                    onclick="toggleUserStatus(${user.id}, ${!user.isActive})" 
                                    title="${user.isActive ? 'تعطيل' : 'تفعيل'}">
                                <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
                            </button>
                            <button class="btn-icon delete" onclick="deleteUser(${user.id})" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : `
                            <span style="color: #666; font-size: 12px;">حسابك</span>
                        `}
                    </td>
                </tr>
            `;
        }).join('');
    },

    async createUser() {
        const name = document.getElementById('newUserName').value.trim();
        const email = document.getElementById('newUserEmail').value.trim();
        const password = document.getElementById('newUserPassword').value;
        
        if (!name || !email || !password) {
            showNotification('جميع الحقول مطلوبة', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }
        
        try {
            const result = await API.users.create({
                displayName: name,
                email,
                password,
                role: 'admin'
            });
            
            if (result.success) {
                showNotification('تم إضافة المستخدم بنجاح', 'success');
                closeModal('addUserModal');
                document.getElementById('addUserForm').reset();
                await this.loadUsers();
            } else {
                showNotification(result.error || 'خطأ في إضافة المستخدم', 'error');
            }
        } catch (error) {
            showNotification('خطأ: ' + error.message, 'error');
        }
    },

    async deleteUser(id) {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            return;
        }
        
        try {
            const result = await API.users.delete(id);
            
            if (result.success) {
                showNotification('تم حذف المستخدم بنجاح', 'success');
                await this.loadUsers();
            } else {
                showNotification(result.error || 'خطأ في حذف المستخدم', 'error');
            }
        } catch (error) {
            showNotification('خطأ: ' + error.message, 'error');
        }
    },

    async toggleUserStatus(id, isActive) {
        try {
            const result = await API.users.toggleActive(id, isActive);
            
            if (result.success) {
                showNotification(result.message, 'success');
                await this.loadUsers();
            } else {
                showNotification(result.error || 'خطأ في تحديث الحالة', 'error');
            }
        } catch (error) {
            showNotification('خطأ: ' + error.message, 'error');
        }
    }
};

// Global functions for user management
function openAddUserModal() {
    if (typeof openModal === 'function') {
        openModal('addUserModal');
    }
}

function createNewUser() {
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.createUser();
    }
}

function deleteUser(id) {
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.deleteUser(id);
    }
}

function toggleUserStatus(id, isActive) {
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.toggleUserStatus(id, isActive);
    }
}

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
            
            // Load users if on users section
            await AdminAPI.loadUsers();
        } catch (error) {
            console.error('AdminAPI init error:', error);
        }
    }, 300);
});

// Make globally available
window.AdminAPI = AdminAPI;
window.saveArticle = saveArticle;
window.saveSection = saveSection;
window.openAddUserModal = openAddUserModal;
window.createNewUser = createNewUser;
window.deleteUser = deleteUser;
window.toggleUserStatus = toggleUserStatus;

console.log('admin-api.js loaded');
