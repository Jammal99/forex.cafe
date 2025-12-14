// ==========================================
// Admin Panel JavaScript - Forex Cafe
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin JS loaded');
    initNavigation();
    initSidebar();
    initModals();
    initTableSelects();
});

// ==========================================
// Navigation
// ==========================================

function initNavigation() {
    console.log('initNavigation called');
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    console.log('Found nav items:', navItems.length);
    
    navItems.forEach(item => {
        const section = item.dataset.section;
        console.log('Adding listener for section:', section);
        
        item.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Nav item clicked:', section);
            if (section) {
                showSection(section);
            }
            return false;
        };
        
        // Also handle clicks on the anchor inside
        const link = item.querySelector('a');
        if (link) {
            link.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Link clicked for section:', section);
                if (section) {
                    showSection(section);
                }
                return false;
            };
        }
    });
    
    // Handle hash in URL
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        showSection(hash);
    }
}

// Make showSection globally accessible
window.showSection = function(sectionId) {
    console.log('showSection called with:', sectionId);
    
    if (!sectionId) {
        console.error('No sectionId provided');
        return;
    }
    
    // Update active nav item
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        console.log('Section activated:', sectionId);
    } else {
        console.error('Section not found:', sectionId);
    }
    
    // Update URL hash
    window.location.hash = sectionId;
    
    // Load section-specific data
    if (sectionId === 'homepage' && typeof loadHomepageSections === 'function') {
        loadHomepageSections();
    }
    
    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
        }
    }
};
}

// ==========================================
// Sidebar Toggle
// ==========================================

function initSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// ==========================================
// Modals
// ==========================================

function initModals() {
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==========================================
// Table Functions
// ==========================================

function initTableSelects() {
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
        selectAll.addEventListener('change', function() {
            const checkboxes = this.closest('table').querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
    }
}

// ==========================================
// Notifications
// ==========================================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    
    // Add notification styles if not exists
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 1rem 1.5rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                animation: slideDown 0.3s ease;
                z-index: 3000;
            }
            .notification.success {
                background: #10b981;
                color: white;
            }
            .notification.error {
                background: #ef4444;
                color: white;
            }
            .notification.info {
                background: #3b82f6;
                color: white;
            }
            .notification button {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                margin-right: -0.5rem;
            }
            @keyframes slideDown {
                from { transform: translate(-50%, -100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ==========================================
// Form Handling
// ==========================================

// Note: Real form handling is done in specific functions like saveArticle()
// No global preventDefault - each form handles its own submission

// ==========================================
// Delete Confirmation
// ==========================================

document.querySelectorAll('.btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', function() {
        if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
            showNotification('تم الحذف بنجاح', 'success');
            // In real app, handle the deletion here
        }
    });
});

// ==========================================
// Edit Buttons
// ==========================================

document.querySelectorAll('.btn-icon.edit').forEach(btn => {
    btn.addEventListener('click', function() {
        // In real app, open edit modal with data
        showNotification('تم فتح نافذة التعديل', 'info');
    });
});

// ==========================================
// View Buttons
// ==========================================

document.querySelectorAll('.btn-icon.view').forEach(btn => {
    btn.addEventListener('click', function() {
        // In real app, open preview
        showNotification('عرض المقال', 'info');
    });
});

// ==========================================
// Theme & Color Options
// ==========================================

document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        
        const theme = this.querySelector('input').value;
        // In real app, apply theme changes
        showNotification(`تم تغيير الوضع إلى ${theme === 'dark' ? 'الداكن' : 'الفاتح'}`, 'success');
    });
});

document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        
        // In real app, apply color changes
        showNotification('تم تغيير اللون الرئيسي', 'success');
    });
});

// ==========================================
// Search Functionality
// ==========================================

document.querySelectorAll('.search-input').forEach(input => {
    input.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const table = this.closest('.card').querySelector('.data-table');
        
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
    });
});

// ==========================================
// Filter Functionality
// ==========================================

document.querySelectorAll('.filter-select').forEach(select => {
    select.addEventListener('change', function() {
        const filterValue = this.value.toLowerCase();
        const table = this.closest('.card').querySelector('.data-table');
        
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                if (!filterValue) {
                    row.style.display = '';
                } else {
                    const tags = row.querySelectorAll('.tag');
                    let match = false;
                    tags.forEach(tag => {
                        if (tag.textContent.toLowerCase().includes(filterValue)) {
                            match = true;
                        }
                    });
                    row.style.display = match ? '' : 'none';
                }
            });
        }
    });
});

// ==========================================
// Drag and Drop Upload
// ==========================================

document.querySelectorAll('.upload-zone, .upload-area').forEach(zone => {
    zone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d97706';
        this.style.background = 'rgba(217, 119, 6, 0.1)';
    });
    
    zone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
    });
    
    zone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            showNotification(`تم استلام ${files.length} ملف(ات)`, 'success');
            // In real app, handle file upload
        }
    });
    
    zone.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                showNotification(`تم اختيار ${this.files.length} ملف(ات)`, 'success');
                // In real app, handle file upload
            }
        });
        input.click();
    });
});

// ==========================================
// Responsive Handling
// ==========================================

window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('active');
    }
});

// ==========================================
// Sub-Sections Management
// ==========================================

// Toggle section group expand/collapse
function toggleSectionGroup(header) {
    const group = header.closest('.section-group');
    group.classList.toggle('collapsed');
}

// Expand all section groups
function expandAllSections() {
    document.querySelectorAll('.section-group').forEach(group => {
        group.classList.remove('collapsed');
    });
}

// Collapse all section groups
function collapseAllSections() {
    document.querySelectorAll('.section-group').forEach(group => {
        group.classList.add('collapsed');
    });
}

// Open add sub-section modal with pre-selected parent
function openAddSubSection(parentSection) {
    openModal('addSubSectionModal');
    const select = document.getElementById('parentSectionSelect');
    if (select && parentSection) {
        select.value = parentSection;
    }
}

// Save new sub-section
function saveSubSection() {
    const form = document.getElementById('addSubSectionForm');
    const parentSection = document.getElementById('parentSectionSelect').value;
    const name = form.querySelector('input[type="text"]').value;
    
    if (!parentSection || !name) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    showNotification('تم إضافة القسم الفرعي بنجاح', 'success');
    closeModal('addSubSectionModal');
    form.reset();
}

// Update existing sub-section
function updateSubSection() {
    showNotification('تم تحديث القسم الفرعي بنجاح', 'success');
    closeModal('editSubSectionModal');
}

// Icon picker functionality
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.icon-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Initialize drag and drop for sub-sections
    initSubSectionDragDrop();
    
    // Initialize move buttons
    initMoveButtons();
    
    // Main section filter
    const mainSectionFilter = document.getElementById('mainSectionFilter');
    if (mainSectionFilter) {
        mainSectionFilter.addEventListener('change', function() {
            const value = this.value;
            document.querySelectorAll('.section-group').forEach(group => {
                if (!value || group.dataset.section === value) {
                    group.style.display = '';
                } else {
                    group.style.display = 'none';
                }
            });
        });
    }
});

// Initialize drag and drop for sub-sections
function initSubSectionDragDrop() {
    const rows = document.querySelectorAll('.subsection-table tbody tr');
    
    rows.forEach(row => {
        row.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        row.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });
        
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            const dragging = document.querySelector('.dragging');
            if (dragging && dragging !== this) {
                this.classList.add('drag-over');
            }
        });
        
        row.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            const dragging = document.querySelector('.dragging');
            if (dragging && dragging !== this) {
                const tbody = this.closest('tbody');
                tbody.insertBefore(dragging, this);
                updateRowNumbers(tbody);
                showNotification('تم تغيير الترتيب بنجاح', 'success');
            }
        });
    });
}

// Initialize move up/down buttons
function initMoveButtons() {
    document.querySelectorAll('.btn-icon.move-up').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('tr');
            const prevRow = row.previousElementSibling;
            if (prevRow) {
                row.parentNode.insertBefore(row, prevRow);
                updateRowNumbers(row.closest('tbody'));
                showNotification('تم نقل القسم للأعلى', 'info');
            }
        });
    });
    
    document.querySelectorAll('.btn-icon.move-down').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('tr');
            const nextRow = row.nextElementSibling;
            if (nextRow) {
                row.parentNode.insertBefore(nextRow, row);
                updateRowNumbers(row.closest('tbody'));
                showNotification('تم نقل القسم للأسفل', 'info');
            }
        });
    });
}

// Update row numbers after reorder
function updateRowNumbers(tbody) {
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        const firstCell = row.querySelector('td:first-child');
        if (firstCell) {
            const icon = firstCell.querySelector('i');
            firstCell.innerHTML = '';
            if (icon) firstCell.appendChild(icon);
            firstCell.appendChild(document.createTextNode(' ' + (index + 1)));
        }
    });
}

// Edit sub-section
document.addEventListener('click', function(e) {
    if (e.target.closest('.subsection-table .btn-icon.edit')) {
        const row = e.target.closest('tr');
        const name = row.querySelector('td:nth-child(2)').textContent;
        const desc = row.querySelector('td:nth-child(3)').textContent;
        const order = row.querySelector('td:first-child').textContent.trim().split(' ').pop();
        const status = row.querySelector('.status').classList.contains('active');
        
        document.getElementById('editSubSectionName').value = name;
        document.getElementById('editSubSectionDesc').value = desc;
        document.getElementById('editSubSectionOrder').value = order;
        document.getElementById('editSubSectionStatus').checked = status;
        
        openModal('editSubSectionModal');
    }
});

// ==========================================
// Filter Buttons Management
// ==========================================

// Filter data storage
let filterButtons = [
    { id: 1, name: 'الكل', value: 'all', icon: 'fa-th-large', color: '#d97706', active: true, locked: true },
    { id: 2, name: 'تحليل', value: 'تحليل', icon: 'fa-chart-line', color: '#3b82f6', active: true },
    { id: 3, name: 'استراتيجيات', value: 'استراتيجيات', icon: 'fa-chess', color: '#10b981', active: true },
    { id: 4, name: 'أخبار', value: 'أخبار', icon: 'fa-newspaper', color: '#ef4444', active: true },
    { id: 5, name: 'تعليم', value: 'تعليم', icon: 'fa-graduation-cap', color: '#8b5cf6', active: true }
];

// Initialize filter management
document.addEventListener('DOMContentLoaded', function() {
    initFilterManagement();
    initFilterSettings();
});

function initFilterManagement() {
    // Initialize drag and drop for filters table
    initFiltersDragDrop();
    
    // Initialize filter table actions
    initFilterTableActions();
    
    // Update preview
    updateFiltersPreview();
}

// Initialize drag and drop for filters
function initFiltersDragDrop() {
    const tableBody = document.getElementById('filtersTableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        row.addEventListener('dragstart', handleFilterDragStart);
        row.addEventListener('dragend', handleFilterDragEnd);
        row.addEventListener('dragover', handleFilterDragOver);
        row.addEventListener('dragleave', handleFilterDragLeave);
        row.addEventListener('drop', handleFilterDrop);
    });
}

function handleFilterDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleFilterDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function handleFilterDragOver(e) {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    if (dragging && dragging !== this) {
        this.classList.add('drag-over');
    }
}

function handleFilterDragLeave() {
    this.classList.remove('drag-over');
}

function handleFilterDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    const dragging = document.querySelector('.dragging');
    if (dragging && dragging !== this) {
        const tbody = this.closest('tbody');
        tbody.insertBefore(dragging, this);
        updateFilterRowNumbers();
        updateFiltersPreview();
        markUnsavedChanges();
        showNotification('تم تغيير الترتيب', 'info');
    }
}

// Initialize filter table actions
function initFilterTableActions() {
    const table = document.getElementById('filtersTable');
    if (!table) return;
    
    table.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-icon');
        if (!btn) return;
        
        const row = btn.closest('tr');
        const filterId = row.dataset.filterId;
        
        if (btn.classList.contains('move-up')) {
            moveFilterUp(row);
        } else if (btn.classList.contains('move-down')) {
            moveFilterDown(row);
        } else if (btn.classList.contains('edit')) {
            openEditFilterModal(filterId, row);
        } else if (btn.classList.contains('delete')) {
            deleteFilter(filterId, row);
        }
    });
}

function moveFilterUp(row) {
    const prevRow = row.previousElementSibling;
    if (prevRow) {
        row.parentNode.insertBefore(row, prevRow);
        updateFilterRowNumbers();
        updateFiltersPreview();
        markUnsavedChanges();
    }
}

function moveFilterDown(row) {
    const nextRow = row.nextElementSibling;
    if (nextRow) {
        row.parentNode.insertBefore(nextRow, row);
        updateFilterRowNumbers();
        updateFiltersPreview();
        markUnsavedChanges();
    }
}

function updateFilterRowNumbers() {
    const rows = document.querySelectorAll('#filtersTableBody tr');
    rows.forEach((row, index) => {
        const firstCell = row.querySelector('td:first-child');
        if (firstCell) {
            const icon = firstCell.querySelector('i');
            firstCell.innerHTML = '';
            if (icon) firstCell.appendChild(icon);
            firstCell.appendChild(document.createTextNode(' ' + (index + 1)));
        }
    });
}

// Update filters preview
function updateFiltersPreview() {
    const preview = document.getElementById('filtersPreview');
    if (!preview) return;
    
    const rows = document.querySelectorAll('#filtersTableBody tr');
    let html = '';
    
    rows.forEach((row, index) => {
        const name = row.querySelector('td:nth-child(2)').textContent;
        const isActive = row.querySelector('.status').classList.contains('active');
        
        if (isActive) {
            html += `<button class="filter-btn-preview ${index === 0 ? 'active' : ''}">${name}</button>`;
        }
    });
    
    preview.innerHTML = html;
}

// Open edit filter modal
function openEditFilterModal(filterId, row) {
    const name = row.querySelector('td:nth-child(2)').textContent;
    const value = row.querySelector('td:nth-child(4) code').textContent;
    const iconClass = row.querySelector('td:nth-child(5) i').className.split(' ').find(c => c.startsWith('fa-'));
    const colorStyle = row.querySelector('td:nth-child(6) .color-dot').style.background;
    const isActive = row.querySelector('.status').classList.contains('active');
    
    document.getElementById('editFilterId').value = filterId;
    document.getElementById('editFilterName').value = name;
    document.getElementById('editFilterValue').value = value;
    document.getElementById('editFilterStatus').checked = isActive;
    
    // Select icon
    document.querySelectorAll('#editFilterIconPicker .icon-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.icon === iconClass) {
            opt.classList.add('selected');
        }
    });
    
    // Select color
    document.querySelectorAll('#editFilterColorPicker input').forEach(input => {
        if (input.value === colorStyle || rgbToHex(colorStyle) === input.value) {
            input.checked = true;
        }
    });
    
    openModal('editFilterModal');
}

// Helper function to convert rgb to hex
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    return '#' + result.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Delete filter
function deleteFilter(filterId, row) {
    if (row.querySelector('.btn-icon[disabled]')) {
        showNotification('لا يمكن حذف هذا الزر', 'error');
        return;
    }
    
    if (confirm('هل أنت متأكد من حذف هذا الزر؟')) {
        row.remove();
        updateFilterRowNumbers();
        updateFiltersPreview();
        markUnsavedChanges();
        showNotification('تم حذف الزر بنجاح', 'success');
    }
}

// Save new filter
function saveNewFilter() {
    const name = document.getElementById('filterName').value;
    const value = document.getElementById('filterValue').value || name;
    const selectedIcon = document.querySelector('#addFilterForm .icon-option.selected');
    const selectedColor = document.querySelector('#addFilterForm input[name="filterColor"]:checked');
    const isActive = document.getElementById('filterStatus').checked;
    const filterType = document.querySelector('input[name="filterType"]:checked');
    const sectionSelect = document.getElementById('filterSectionSelect');
    
    if (!name) {
        showNotification('يرجى إدخال اسم الزر', 'error');
        return;
    }
    
    const icon = selectedIcon ? selectedIcon.dataset.icon : 'fa-tag';
    const color = selectedColor ? selectedColor.value : '#d97706';
    const colorName = selectedColor ? selectedColor.parentElement.querySelector('small').textContent : 'ذهبي';
    
    // Get section info if linked
    let sectionId = '0';
    let sectionBadge = '<span class="badge badge-custom"><i class="fas fa-edit"></i> مخصص</span>';
    
    if (filterType && filterType.value === 'section' && sectionSelect.value) {
        sectionId = sectionSelect.value;
        const sectionOption = sectionSelect.options[sectionSelect.selectedIndex];
        const sectionName = sectionOption.dataset.name;
        const sectionIcon = sectionOption.dataset.icon;
        sectionBadge = `<span class="badge badge-section"><i class="fas ${sectionIcon}"></i> ${sectionName}</span>`;
    }
    
    // Get next ID
    const lastRow = document.querySelector('#filtersTableBody tr:last-child');
    const lastId = lastRow ? parseInt(lastRow.dataset.filterId) : 0;
    const newId = lastId + 1;
    
    // Create new row
    const newRow = document.createElement('tr');
    newRow.draggable = true;
    newRow.dataset.filterId = newId;
    newRow.dataset.sectionId = sectionId;
    
    const rowCount = document.querySelectorAll('#filtersTableBody tr').length + 1;
    
    newRow.innerHTML = `
        <td><i class="fas fa-grip-vertical drag-handle"></i> ${rowCount}</td>
        <td>${name}</td>
        <td>${sectionBadge}</td>
        <td><code>${value}</code></td>
        <td><i class="fas ${icon} text-gold"></i></td>
        <td><span class="color-dot" style="background: ${color};"></span> ${colorName}</td>
        <td><span class="status ${isActive ? 'active' : 'inactive'}">${isActive ? 'نشط' : 'معطل'}</span></td>
        <td class="actions">
            <button class="btn-icon move-up" title="نقل لأعلى"><i class="fas fa-arrow-up"></i></button>
            <button class="btn-icon move-down" title="نقل لأسفل"><i class="fas fa-arrow-down"></i></button>
            <button class="btn-icon edit" title="تعديل"><i class="fas fa-edit"></i></button>
            <button class="btn-icon delete" title="حذف"><i class="fas fa-trash"></i></button>
        </td>
    `;
    
    // Add drag events
    newRow.addEventListener('dragstart', handleFilterDragStart);
    newRow.addEventListener('dragend', handleFilterDragEnd);
    newRow.addEventListener('dragover', handleFilterDragOver);
    newRow.addEventListener('dragleave', handleFilterDragLeave);
    newRow.addEventListener('drop', handleFilterDrop);
    
    document.getElementById('filtersTableBody').appendChild(newRow);
    
    updateFiltersPreview();
    markUnsavedChanges();
    closeModal('addFilterModal');
    document.getElementById('addFilterForm').reset();
    document.querySelectorAll('#addFilterForm .icon-option').forEach(o => o.classList.remove('selected'));
    
    showNotification('تم إضافة الزر بنجاح', 'success');
}

// Update existing filter
function updateFilter() {
    const filterId = document.getElementById('editFilterId').value;
    const name = document.getElementById('editFilterName').value;
    const value = document.getElementById('editFilterValue').value;
    const selectedIcon = document.querySelector('#editFilterIconPicker .icon-option.selected');
    const selectedColor = document.querySelector('#editFilterColorPicker input[name="editFilterColor"]:checked');
    const isActive = document.getElementById('editFilterStatus').checked;
    
    const row = document.querySelector(`tr[data-filter-id="${filterId}"]`);
    if (!row) return;
    
    const icon = selectedIcon ? selectedIcon.dataset.icon : 'fa-tag';
    const color = selectedColor ? selectedColor.value : '#d97706';
    const colorName = selectedColor ? selectedColor.parentElement.querySelector('small').textContent : 'ذهبي';
    
    row.querySelector('td:nth-child(2)').textContent = name;
    // Check if there's a section badge (column 3 is now linked section)
    row.querySelector('td:nth-child(4) code').textContent = value;
    row.querySelector('td:nth-child(5)').innerHTML = `<i class="fas ${icon} text-gold"></i>`;
    row.querySelector('td:nth-child(6)').innerHTML = `<span class="color-dot" style="background: ${color};"></span> ${colorName}`;
    row.querySelector('td:nth-child(7)').innerHTML = `<span class="status ${isActive ? 'active' : 'inactive'}">${isActive ? 'نشط' : 'معطل'}</span>`;
    
    updateFiltersPreview();
    markUnsavedChanges();
    closeModal('editFilterModal');
    
    showNotification('تم تحديث الزر بنجاح', 'success');
}

// Mark unsaved changes
function markUnsavedChanges() {
    const indicator = document.getElementById('unsavedChanges');
    if (indicator) {
        indicator.style.display = 'flex';
    }
}

// Save filter changes
function saveFilterChanges() {
    const indicator = document.getElementById('unsavedChanges');
    if (indicator) {
        indicator.style.display = 'none';
    }
    showNotification('تم حفظ التغييرات بنجاح', 'success');
    
    // Here you would normally save to backend/localStorage
    // For demo, we'll just show the notification
}

// Reset filters to default
function resetFiltersToDefault() {
    if (confirm('هل أنت متأكد من إعادة تعيين الأزرار للافتراضي؟')) {
        location.reload();
        showNotification('تم إعادة التعيين للافتراضي', 'success');
    }
}

// ==========================================
// Section Filter Toggle
// ==========================================

// Toggle section visibility in filters
function toggleSectionFilter(toggle) {
    const row = toggle.closest('tr');
    const sectionId = row.dataset.sectionId;
    const sectionName = row.querySelector('td:nth-child(2)').textContent.trim();
    const sectionIcon = row.dataset.sectionIcon;
    const isEnabled = toggle.checked;
    
    // Update filters preview
    updateFiltersPreview();
    
    // Update filters table
    const filtersTableBody = document.getElementById('filtersTableBody');
    const existingFilter = document.querySelector(`#filtersTableBody tr[data-section-id="${sectionId}"]`);
    
    if (isEnabled && !existingFilter) {
        // Add filter button for this section
        showNotification(`تمت إضافة "${sectionName}" لأزرار الفلترة`, 'success');
    } else if (!isEnabled && existingFilter) {
        // Mark as disabled or remove from preview
        showNotification(`تم إخفاء "${sectionName}" من أزرار الفلترة`, 'info');
    }
    
    // Mark changes
    markUnsavedChanges();
}

// Sync filters from sections
function syncFiltersFromSections() {
    const sectionsTable = document.getElementById('sectionsTableBody');
    if (!sectionsTable) {
        showNotification('لا يمكن الوصول لجدول الأقسام', 'error');
        return;
    }
    
    const sections = sectionsTable.querySelectorAll('tr');
    const enabledSections = [];
    
    sections.forEach(row => {
        const filterToggle = row.querySelector('.filter-toggle');
        if (filterToggle && filterToggle.checked) {
            enabledSections.push({
                id: row.dataset.sectionId,
                name: row.querySelector('td:nth-child(2)').textContent.trim(),
                icon: row.dataset.sectionIcon,
                slug: row.dataset.sectionSlug
            });
        }
    });
    
    // Update preview
    const preview = document.getElementById('filtersPreview');
    if (preview) {
        let html = '<button class="filter-btn-preview active">الكل</button>';
        enabledSections.forEach(section => {
            html += `<button class="filter-btn-preview">${section.name}</button>`;
        });
        preview.innerHTML = html;
    }
    
    showNotification(`تمت مزامنة ${enabledSections.length} قسم مع أزرار الفلترة`, 'success');
    markUnsavedChanges();
}

// Navigate to another section
function navigateTo(sectionId) {
    showSection(sectionId);
    return false;
}

// Initialize filter settings
function initFilterSettings() {
    // Style options
    document.querySelectorAll('.style-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.style-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Align options
    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.align-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Filter settings form
    const filterSettingsForm = document.getElementById('filterSettingsForm');
    if (filterSettingsForm) {
        filterSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('تم حفظ إعدادات الفلترة', 'success');
        });
    }
    
    // Icon picker in modals
    document.querySelectorAll('#addFilterForm .icon-option, #editFilterForm .icon-option').forEach(option => {
        option.addEventListener('click', function() {
            const picker = this.closest('.icon-picker');
            picker.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    
    // Filter type options click handling
    document.querySelectorAll('.filter-type-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.filter-type-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Toggle filter type fields
function toggleFilterTypeFields(radio) {
    const sectionSelect = document.querySelector('.section-select-group');
    if (radio.value === 'section') {
        sectionSelect.classList.remove('hidden');
    } else {
        sectionSelect.classList.add('hidden');
        // Clear section selection
        document.getElementById('filterSectionSelect').value = '';
    }
}

// Populate filter fields from section selection
function populateFilterFromSection(select) {
    const option = select.options[select.selectedIndex];
    if (!option || !option.value) return;
    
    const name = option.dataset.name;
    const icon = option.dataset.icon;
    const slug = option.dataset.slug;
    
    // Set filter name
    document.getElementById('filterName').value = name;
    
    // Set filter value (slug)
    document.getElementById('filterValue').value = slug;
    
    // Select icon
    const iconPicker = document.getElementById('filterIconPicker');
    iconPicker.querySelectorAll('.icon-option').forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.icon === icon) {
            opt.classList.add('selected');
        }
    });
    
    showNotification(`تم تعبئة البيانات من قسم "${name}"`, 'info');
}

// ==========================================
// Homepage Sections Management
// ==========================================

// Store loaded homepage sections
let loadedHomepageSections = [];

// Load homepage sections from API
async function loadHomepageSections() {
    try {
        const result = await API.homepageSections.getAll();
        if (result.success) {
            loadedHomepageSections = result.data || [];
            renderHomepageSectionsTable(loadedHomepageSections);
            updateHomepagePreview();
        }
    } catch (error) {
        console.error('Error loading homepage sections:', error);
        showNotification('خطأ في تحميل أقسام الصفحة الرئيسية', 'error');
    }
}

// Render homepage sections in table
function renderHomepageSectionsTable(sections) {
    const tbody = document.getElementById('homepageSectionsBody');
    if (!tbody) return;
    
    const sectionTypes = {
        'hero': { type: 'أساسي', badge: 'badge-core' },
        'ticker': { type: 'أساسي', badge: 'badge-core' },
        'articles': { type: 'أساسي', badge: 'badge-core' },
        'analysis': { type: 'أساسي', badge: 'badge-core' },
        'economic-calendar-ff': { type: 'ودجت', badge: 'badge-widget' },
        'courses': { type: 'أساسي', badge: 'badge-core' },
        'newsletter': { type: 'أساسي', badge: 'badge-core' },
        'economic-calendar-inv': { type: 'ودجت', badge: 'badge-widget' }
    };
    
    const sectionDescriptions = {
        'hero': 'عنوان رئيسي وصور متحركة',
        'ticker': 'أسعار العملات والمعادن المباشرة',
        'articles': 'آخر المقالات والأخبار',
        'analysis': 'تحليلات يومية للأسواق',
        'economic-calendar-ff': 'مفكرة ForexFactory',
        'courses': 'دورات تعليمية متاحة',
        'newsletter': 'الاشتراك في النشرة البريدية',
        'economic-calendar-inv': 'تقويم من Investing.com'
    };
    
    tbody.innerHTML = sections.map((section, index) => {
        const typeInfo = sectionTypes[section.sectionKey] || { type: 'مخصص', badge: 'badge-custom' };
        const description = sectionDescriptions[section.sectionKey] || section.settings?.description || 'قسم مخصص';
        
        return `
            <tr draggable="true" data-section-id="${section.sectionKey}" data-id="${section.id}">
                <td><i class="fas fa-grip-vertical drag-handle"></i> ${index + 1}</td>
                <td><i class="fas ${section.icon || 'fa-cube'} text-gold"></i> ${section.name}</td>
                <td><span class="badge ${typeInfo.badge}">${typeInfo.type}</span></td>
                <td>${description}</td>
                <td>
                    <button class="btn-icon settings" onclick="openHomepageSectionSettings('${section.sectionKey}')" title="إعدادات">
                        <i class="fas fa-cog"></i>
                    </button>
                </td>
                <td>
                    <label class="toggle-switch mini">
                        <input type="checkbox" ${section.isVisible ? 'checked' : ''} onchange="toggleHomepageSection(this)">
                        <span class="toggle-slider"></span>
                    </label>
                </td>
                <td class="actions">
                    <button class="btn-icon move-up" onclick="moveHomepageSection(this, 'up')" title="نقل لأعلى"><i class="fas fa-arrow-up"></i></button>
                    <button class="btn-icon move-down" onclick="moveHomepageSection(this, 'down')" title="نقل لأسفل"><i class="fas fa-arrow-down"></i></button>
                    ${!['hero', 'ticker', 'articles'].includes(section.sectionKey) ? 
                        `<button class="btn-icon delete" title="حذف" onclick="deleteHomepageSection(this)"><i class="fas fa-trash"></i></button>` : 
                        ''}
                </td>
            </tr>
        `;
    }).join('');
    
    // Initialize drag and drop
    initHomepageSectionsDragDrop();
}

// Initialize drag and drop for homepage sections
function initHomepageSectionsDragDrop() {
    const tbody = document.getElementById('homepageSectionsBody');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('drop', handleDrop);
        row.addEventListener('dragend', handleDragEnd);
    });
}

let draggedRow = null;

function handleDragStart(e) {
    draggedRow = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const tbody = document.getElementById('homepageSectionsBody');
    const afterElement = getDragAfterElement(tbody, e.clientY);
    
    if (afterElement == null) {
        tbody.appendChild(draggedRow);
    } else {
        tbody.insertBefore(draggedRow, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('tr:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function handleDrop(e) {
    e.preventDefault();
}

function handleDragEnd() {
    this.classList.remove('dragging');
    draggedRow = null;
    updateHomepageSectionNumbers();
    markHomepageUnsavedChanges();
}

// Move homepage section up or down
function moveHomepageSection(btn, direction) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;
    
    if (direction === 'up' && row.previousElementSibling) {
        tbody.insertBefore(row, row.previousElementSibling);
    } else if (direction === 'down' && row.nextElementSibling) {
        tbody.insertBefore(row.nextElementSibling, row);
    }
    
    updateHomepageSectionNumbers();
    updateHomepagePreview();
    markHomepageUnsavedChanges();
}

// Toggle homepage section visibility
function toggleHomepageSection(toggle) {
    const row = toggle.closest('tr');
    const sectionId = row.dataset.sectionId;
    const isEnabled = toggle.checked;
    
    // Update preview
    updateHomepagePreview();
    
    // Mark unsaved changes
    markHomepageUnsavedChanges();
    
    const sectionName = row.querySelector('td:nth-child(2)').textContent.trim();
    if (isEnabled) {
        showNotification(`تم تفعيل قسم "${sectionName}"`, 'success');
    } else {
        showNotification(`تم إخفاء قسم "${sectionName}"`, 'info');
    }
}

// Update homepage preview
function updateHomepagePreview() {
    const preview = document.getElementById('homepagePreview');
    if (!preview) return;
    
    const rows = document.querySelectorAll('#homepageSectionsBody tr');
    let html = '';
    
    rows.forEach(row => {
        const isEnabled = row.querySelector('.toggle-switch input').checked;
        const sectionId = row.dataset.sectionId;
        const icon = row.querySelector('td:nth-child(2) i').className;
        const name = row.querySelector('td:nth-child(2)').textContent.trim();
        
        html += `<div class="preview-section ${isEnabled ? 'active' : ''}" data-section="${sectionId}">
            <i class="${icon}"></i> ${name}
        </div>`;
    });
    
    preview.innerHTML = html;
}

// Open homepage section settings modal
function openHomepageSectionSettings(sectionId) {
    // Create dynamic modal for section settings
    const sectionNames = {
        'hero': 'البانر الرئيسي',
        'ticker': 'شريط الأسعار المباشر',
        'articles': 'المقالات والأخبار',
        'analysis': 'التحليلات اليومية',
        'economic-calendar-ff': 'المفكرة الاقتصادية (ForexFactory)',
        'courses': 'الدورات التدريبية',
        'newsletter': 'النشرة البريدية',
        'economic-calendar-inv': 'التقويم الاقتصادي (Investing)'
    };
    
    showNotification(`فتح إعدادات قسم "${sectionNames[sectionId] || sectionId}"`, 'info');
    // Here you would open a modal with specific settings for each section
}

// Add new homepage section
async function addHomepageSection(widgetType) {
    const widgetNames = {
        'tradingview-widget': 'ودجت TradingView',
        'broker-comparison': 'مقارنة الوسطاء',
        'calculator': 'حاسبة التداول',
        'signals': 'إشارات التداول',
        'testimonials': 'آراء العملاء',
        'faq': 'الأسئلة الشائعة',
        'custom-html': 'كود HTML مخصص',
        'video-section': 'قسم الفيديو'
    };

    const widgetIcons = {
        'tradingview-widget': 'fa-chart-candlestick',
        'broker-comparison': 'fa-balance-scale',
        'calculator': 'fa-calculator',
        'signals': 'fa-bell',
        'testimonials': 'fa-quote-right',
        'faq': 'fa-question-circle',
        'custom-html': 'fa-code',
        'video-section': 'fa-video'
    };

    try {
        const sectionKey = widgetType + '-' + Date.now();
        const result = await API.homepageSections.create({
            sectionKey: sectionKey,
            name: widgetNames[widgetType] || 'قسم جديد',
            icon: widgetIcons[widgetType] || 'fa-cube',
            isVisible: true
        });
        
        if (result.success) {
            // Reload sections to get updated list
            await loadHomepageSections();
            showNotification(`تمت إضافة قسم "${widgetNames[widgetType]}" بنجاح`, 'success');
        } else {
            showNotification(result.error || 'خطأ في إضافة القسم', 'error');
        }
    } catch (error) {
        console.error('Error adding homepage section:', error);
        showNotification('خطأ في إضافة القسم: ' + error.message, 'error');
    }
}

// Delete homepage section
async function deleteHomepageSection(btn) {
    const row = btn.closest('tr');
    const sectionName = row.querySelector('td:nth-child(2)').textContent.trim();
    const sectionId = row.dataset.id;
    const sectionKey = row.dataset.sectionId;
    
    if (confirm(`هل أنت متأكد من حذف قسم "${sectionName}"؟`)) {
        try {
            const result = await API.homepageSections.delete(sectionId, sectionKey);
            
            if (result.success) {
                row.remove();
                updateHomepageSectionNumbers();
                updateHomepagePreview();
                showNotification('تم حذف القسم بنجاح', 'success');
            } else {
                showNotification(result.error || 'خطأ في حذف القسم', 'error');
            }
        } catch (error) {
            console.error('Error deleting homepage section:', error);
            showNotification('خطأ في حذف القسم: ' + error.message, 'error');
        }
}

// Update homepage section numbers after reorder
function updateHomepageSectionNumbers() {
    const rows = document.querySelectorAll('#homepageSectionsBody tr');
    rows.forEach((row, index) => {
        const firstCell = row.querySelector('td:first-child');
        const icon = firstCell.querySelector('i');
        if (icon) {
            firstCell.innerHTML = '';
            firstCell.appendChild(icon);
            firstCell.appendChild(document.createTextNode(' ' + (index + 1)));
        }
    });
}

// Mark homepage unsaved changes
function markHomepageUnsavedChanges() {
    const indicator = document.getElementById('homepageUnsavedChanges');
    if (indicator) {
        indicator.style.display = 'flex';
    }
}

// Save homepage changes to API
async function saveHomepageChanges() {
    try {
        const rows = document.querySelectorAll('#homepageSectionsBody tr');
        const sections = [];
        
        rows.forEach((row, index) => {
            const sectionKey = row.dataset.sectionId;
            const id = row.dataset.id ? parseInt(row.dataset.id) : null;
            const isVisible = row.querySelector('.toggle-switch input').checked;
            
            sections.push({
                id: id,
                sectionKey: sectionKey,
                isVisible: isVisible,
                sortOrder: index + 1
            });
        });
        
        const result = await API.homepageSections.bulkUpdate(sections);
        
        if (result.success) {
            const indicator = document.getElementById('homepageUnsavedChanges');
            if (indicator) {
                indicator.style.display = 'none';
            }
            loadedHomepageSections = result.data || [];
            showNotification('تم حفظ تغييرات الصفحة الرئيسية بنجاح', 'success');
        } else {
            showNotification(result.error || 'خطأ في حفظ التغييرات', 'error');
        }
    } catch (error) {
        console.error('Error saving homepage changes:', error);
        showNotification('خطأ في حفظ التغييرات: ' + error.message, 'error');
    }
}

// Reset homepage sections to default
async function resetHomepageSections() {
    if (confirm('هل أنت متأكد من إعادة تعيين أقسام الصفحة الرئيسية للافتراضي؟')) {
        try {
            // Delete all sections then reload (API will recreate defaults)
            for (const section of loadedHomepageSections) {
                await API.homepageSections.delete(section.id, null);
            }
            
            // Reload sections
            await loadHomepageSections();
            
            const indicator = document.getElementById('homepageUnsavedChanges');
            if (indicator) {
                indicator.style.display = 'none';
            }
            
            showNotification('تم إعادة التعيين للافتراضي', 'success');
        } catch (error) {
            console.error('Error resetting homepage sections:', error);
            showNotification('خطأ في إعادة التعيين', 'error');
        }
    }
}

// ==========================================
// Articles API Functions
// ==========================================

// Load articles from API
async function loadArticles() {
    try {
        const result = await API.articles.getAll();
        if (result.success) {
            renderArticlesTable(result.data);
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        showNotification('خطأ في تحميل المقالات', 'error');
    }
}

// Render articles in table
function renderArticlesTable(articles) {
    const tbody = document.getElementById('articlesTableBody');
    if (!tbody) return;
    
    if (articles.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <i class="fas fa-newspaper" style="font-size: 48px; color: #666; margin-bottom: 15px; display: block;"></i>
                    <p>لا توجد مقالات حالياً</p>
                    <button class="btn btn-primary" onclick="openModal('addArticleModal')" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> إضافة مقال جديد
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = articles.map(article => `
        <tr data-id="${article.id}">
            <td><input type="checkbox"></td>
            <td>
                <div class="article-title">
                    <img src="${article.thumbnail || 'assets/placeholder.jpg'}" alt="" class="article-thumb">
                    <span>${article.title}</span>
                </div>
            </td>
            <td>${article.sectionId || '-'}</td>
            <td><span class="status-badge ${article.status}">${article.status === 'published' ? 'منشور' : 'مسودة'}</span></td>
            <td>${article.views || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editArticle(${article.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteArticle(${article.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Save article - delegates to AdminAPI (which handles both create and update)
async function saveArticle() {
    console.log('saveArticle called - delegating to AdminAPI');
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.saveArticle();
    } else {
        console.error('AdminAPI not defined');
        showNotification('خطأ: AdminAPI غير متوفر', 'error');
    }
}

// Load articles - delegates to AdminAPI
async function loadArticles() {
    console.log('loadArticles called - delegating to AdminAPI');
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.loadArticles();
    }
}

// Delete article - delegates to AdminAPI
async function deleteArticle(id) {
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.deleteArticle(id);
    }
}

// Edit article - delegates to AdminAPI  
async function editArticle(id) {
    console.log('editArticle called for id:', id);
    if (typeof AdminAPI !== 'undefined') {
        AdminAPI.editArticle(id);
    }
}
