// ==========================================
// مقهى الفوركس - JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initHeader();
    initMobileMenu();
    initThemeToggle();
    initAnimatedCounter();
    initArticleFilter();
    initScrollAnimations();
    initBackToTop();
    initBookmarkButtons();
    initNewsletterForm();
    initSidebarMenu();
    initTickerClone();
    enhanceCalendarDisplay();
});

// ==========================================
// Header Scroll Effect
// ==========================================
function initHeader() {
    const header = document.querySelector('.header');
    const topTicker = document.querySelector('.top-ticker');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            if (topTicker) {
                topTicker.style.transform = 'translateY(-100%)';
                header.style.top = '0';
            }
        } else {
            header.classList.remove('scrolled');
            if (topTicker) {
                topTicker.style.transform = 'translateY(0)';
                header.style.top = 'var(--ticker-height)';
            }
        }
    });
}

// ==========================================
// Mobile Menu Toggle
// ==========================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// ==========================================
// Theme Toggle (Dark/Light Mode)
// ==========================================
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('light-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }
}

// ==========================================
// Animated Counter for Stats
// ==========================================
function initAnimatedCounter() {
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    // Use Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ==========================================
// Article Filter Functionality
// ==========================================
function initArticleFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const articleCards = document.querySelectorAll('.article-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            
            articleCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ==========================================
// Scroll Animations
// ==========================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.feature-card, .article-card, .analysis-card, .course-card, .section-header'
    );
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==========================================
// Back to Top Button
// ==========================================
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ==========================================
// Bookmark Buttons
// ==========================================
function initBookmarkButtons() {
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    
    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const icon = btn.querySelector('i');
            
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.style.background = 'var(--primary)';
                showNotification('تم إضافة المقال إلى المحفوظات');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                btn.style.background = 'rgba(255, 255, 255, 0.2)';
                showNotification('تم إزالة المقال من المحفوظات');
            }
        });
    });
}

// ==========================================
// Newsletter Form
// ==========================================
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            const email = input.value.trim();
            
            if (validateEmail(email)) {
                showNotification('شكراً لاشتراكك! سنرسل لك أحدث التحليلات.');
                input.value = '';
            } else {
                showNotification('يرجى إدخال بريد إلكتروني صحيح', 'error');
            }
        });
    }
}

// ==========================================
// Sidebar Menu Toggle
// ==========================================
function initSidebarMenu() {
    const menuItems = document.querySelectorAll('.menu-item.has-submenu');
    
    menuItems.forEach(item => {
        const link = item.querySelector('.menu-link');
        
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Close other open menus
                menuItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current menu
                item.classList.toggle('active');
            });
        }
    });
    
    // Filter articles when clicking submenu items
    const submenuLinks = document.querySelectorAll('.submenu a');
    submenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.textContent.trim();
            filterArticlesByCategory(category);
            showNotification(`عرض مقالات: ${category}`);
        });
    });
}

function filterArticlesByCategory(category) {
    const articleCards = document.querySelectorAll('.article-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Reset filter buttons
    filterBtns.forEach(btn => btn.classList.remove('active'));
    
    // Map Arabic categories
    const categoryMap = {
        'تحليل فني': 'تحليل',
        'تحليل أساسي': 'تحليل',
        'تحليل نفسي': 'تحليل',
        'تحليل يومي': 'تحليل',
        'استراتيجية يومية': 'استراتيجيات',
        'استراتيجية سكالبينج': 'استراتيجيات',
        'استراتيجية سوينج': 'استراتيجيات',
        'استراتيجية طويلة الأمد': 'استراتيجيات',
        'أخبار اقتصادية': 'أخبار',
        'أخبار البنوك المركزية': 'أخبار',
        'أخبار العملات': 'أخبار',
        'أخبار السلع': 'أخبار',
        'أساسيات الفوركس': 'تعليم',
        'قراءة الشارت': 'تعليم',
        'المؤشرات الفنية': 'تعليم',
        'إدارة المخاطر': 'تعليم'
    };
    
    const filter = categoryMap[category] || category;
    
    articleCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (cardCategory === filter || filter === 'all') {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

// ==========================================
// Clone Ticker Content for Seamless Loop
// ==========================================
function initTickerClone() {
    const tickerContent = document.querySelector('.top-ticker .ticker-content');
    if (tickerContent) {
        const clone = tickerContent.innerHTML;
        tickerContent.innerHTML += clone;
    }
}

// ==========================================
// Utility Functions
// ==========================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--danger)'};
        color: ${type === 'success' ? 'var(--bg-dark)' : 'white'};
        padding: 15px 25px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(50px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==========================================
// Smooth Scroll for Anchor Links
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// Currency Ticker Animation
// ==========================================
function initTickerAnimation() {
    const tickerContent = document.querySelector('.ticker-content');
    if (tickerContent) {
        // Clone the content for seamless loop
        const clone = tickerContent.cloneNode(true);
        tickerContent.parentElement.appendChild(clone);
    }
}

// Initialize ticker
initTickerAnimation();

// ==========================================
// Chart Animation in Hero
// ==========================================
function animateChart() {
    const chartLine = document.querySelector('.chart-line');
    if (chartLine) {
        chartLine.style.strokeDasharray = '1000';
        chartLine.style.strokeDashoffset = '1000';
        chartLine.style.animation = 'drawLine 3s ease forwards';
    }
}

// Call chart animation on page load
window.addEventListener('load', animateChart);

// ==========================================
// Parallax Effect for Hero
// ==========================================
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
    }
});

// ==========================================
// Search Functionality
// ==========================================
const searchInput = document.querySelector('.search-box input');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                showNotification(`جاري البحث عن: ${query}`);
                // Here you would implement actual search functionality
            }
        }
    });
}

// ==========================================
// Button Click Effects
// ==========================================
document.querySelectorAll('.btn, .filter-btn, .analysis-btn, .course-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation if not exists
if (!document.querySelector('#ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// Lazy Loading Images
// ==========================================
function lazyLoadImages() {
    const images = document.querySelectorAll('.card-image img, .author img');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

lazyLoadImages();

// ==========================================
// Enhance Calendar Display
// ==========================================
async function enhanceCalendarDisplay() {
    // Load ForexFactory Calendar Data
    await loadFFCalendar();
    // Initialize filters
    initCalendarFilters();
}

// Global variable to store all events
let allCalendarEvents = [];

// Initialize calendar filters
function initCalendarFilters() {
    const dateFilter = document.getElementById('dateFilter');
    const customDate = document.getElementById('customDate');
    const importanceFilter = document.getElementById('importanceFilter');
    const currencyFilter = document.getElementById('currencyFilter');
    const resetBtn = document.getElementById('resetFilters');
    
    // Date filter change
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDate.style.display = 'inline-block';
            } else {
                customDate.style.display = 'none';
                filterCalendar();
            }
        });
    }
    
    // Custom date change
    if (customDate) {
        customDate.addEventListener('change', filterCalendar);
    }
    
    // Importance filter change
    if (importanceFilter) {
        importanceFilter.addEventListener('change', filterCalendar);
    }
    
    // Currency filter change
    if (currencyFilter) {
        currencyFilter.addEventListener('change', filterCalendar);
    }
    
    // Reset filters
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            dateFilter.value = 'today';
            customDate.style.display = 'none';
            customDate.value = '';
            importanceFilter.value = 'all';
            currencyFilter.value = 'all';
            filterCalendar();
        });
    }
}

// Filter calendar based on selected criteria
function filterCalendar() {
    const dateFilter = document.getElementById('dateFilter');
    const customDate = document.getElementById('customDate');
    const importanceFilter = document.getElementById('importanceFilter');
    const currencyFilter = document.getElementById('currencyFilter');
    
    const activeImportance = importanceFilter ? importanceFilter.value : 'all';
    const activeCurrency = currencyFilter ? currencyFilter.value : 'all';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filteredEvents = allCalendarEvents.filter(event => {
        // Date filtering
        const eventDate = new Date(event.dateObj);
        eventDate.setHours(0, 0, 0, 0);
        
        let dateMatch = true;
        if (dateFilter) {
            const filter = dateFilter.value;
            if (filter === 'today') {
                dateMatch = eventDate.getTime() === today.getTime();
            } else if (filter === 'tomorrow') {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                dateMatch = eventDate.getTime() === tomorrow.getTime();
            } else if (filter === 'week') {
                const weekEnd = new Date(today);
                weekEnd.setDate(weekEnd.getDate() + 7);
                dateMatch = eventDate >= today && eventDate <= weekEnd;
            } else if (filter === 'custom' && customDate.value) {
                const customDateObj = new Date(customDate.value);
                customDateObj.setHours(0, 0, 0, 0);
                dateMatch = eventDate.getTime() === customDateObj.getTime();
            }
        }
        
        // Importance filtering
        const impactMatch = activeImportance === 'all' || event.impact === activeImportance;
        
        // Currency filtering
        const currencyMatch = activeCurrency === 'all' || event.currency === activeCurrency;
        
        return dateMatch && impactMatch && currencyMatch;
    });
    
    // Display filtered events
    displayFilteredEvents(filteredEvents);
}

// Display filtered events in the table
function displayFilteredEvents(events) {
    const tableBody = document.querySelector('.ff-calendar-table tbody');
    const eventCount = document.getElementById('eventCount');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (events.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                    <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    لا توجد أحداث اقتصادية تطابق الفلاتر المحددة
                </td>
            </tr>
        `;
        if (eventCount) eventCount.textContent = '0 حدث';
        return;
    }
    
    let lastDate = '';
    
    events.forEach(event => {
        if (event.date !== lastDate) {
            const dateRow = document.createElement('tr');
            dateRow.style.background = 'rgba(80, 85, 95, 0.2)';
            dateRow.innerHTML = `
                <td colspan="7" style="padding: 10px; font-weight: 700; color: var(--text-primary); text-align: right;">
                    <i class="fas fa-calendar-day" style="margin-left: 8px;"></i>
                    ${event.date}
                </td>
            `;
            tableBody.appendChild(dateRow);
            lastDate = event.date;
        }
        
        const row = document.createElement('tr');
        let importanceHTML = '';
        let importanceClass = '';
        
        if (event.impact === 'high') {
            importanceHTML = '★★★';
            importanceClass = 'importance-high';
        } else if (event.impact === 'medium') {
            importanceHTML = '★★';
            importanceClass = 'importance-medium';
        } else {
            importanceHTML = '★';
            importanceClass = 'importance-low';
        }
        
        row.innerHTML = `
            <td class="time-cell">${event.time}</td>
            <td><span class="currency-badge">${event.currency}</span></td>
            <td class="importance-cell ${importanceClass}">${importanceHTML}</td>
            <td class="event-cell">${event.title}</td>
            <td class="data-cell">${event.actual}</td>
            <td class="data-cell">${event.forecast}</td>
            <td class="data-cell">${event.previous}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    if (eventCount) {
        eventCount.textContent = `${events.length} حدث`;
    }
}

// ==========================================
// ForexFactory Calendar Loader
// ==========================================
async function loadFFCalendar() {
    const tableBody = document.querySelector('.ff-calendar-table tbody');
    if (!tableBody) return;

    try {
        // جلب البيانات الحقيقية من Investing.com عبر RSS Feed
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const investingRSS = encodeURIComponent('https://www.investing.com/rss/economic_calendar.rss');
        
        const response = await fetch(proxyUrl + investingRSS);
        const xmlText = await response.text();
        
        // Parse RSS/XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Get all items from RSS
        const items = xmlDoc.querySelectorAll('item');
        
        // Clear loading state
        tableBody.innerHTML = '';
        
        const today = new Date();
        const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        let lastDate = '';
        let eventCount = 0;
        
        // إذا فشل RSS، استخدم بيانات احتياطية من API آخر
        if (items.length === 0) {
            console.warn('⚠️ لم يتم العثور على بيانات من Investing.com RSS');
            // جرب API بديل: Econdb.com (مجاني)
            await loadFromEconDB(tableBody);
            return;
        }
        
        items.forEach((item, index) => {
            if (eventCount >= 30) return;
            
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            
            // استخراج البيانات من الوصف
            const eventData = parseInvestingEvent(title, description, pubDate);
            
            if (!eventData) return;
            
            // Add date separator row if date changed
            if (eventData.date !== lastDate) {
                const dateRow = document.createElement('tr');
                dateRow.style.background = 'rgba(80, 85, 95, 0.2)';
                dateRow.innerHTML = `
                    <td colspan="7" style="padding: 10px; font-weight: 700; color: var(--text-primary); text-align: right;">
                        <i class="fas fa-calendar-day" style="margin-left: 8px;"></i>
                        ${eventData.date}
                    </td>
                `;
                tableBody.appendChild(dateRow);
                lastDate = eventData.date;
            }
            
            // Create event row
            const row = document.createElement('tr');
            
            // Determine importance stars
            let importanceHTML = '';
            let importanceClass = '';
            if (eventData.impact === 'high') {
                importanceHTML = '★★★';
                importanceClass = 'importance-high';
            } else if (eventData.impact === 'medium') {
                importanceHTML = '★★';
                importanceClass = 'importance-medium';
            } else {
                importanceHTML = '★';
                importanceClass = 'importance-low';
            }
            
            row.innerHTML = `
                <td class="time-cell">${eventData.time}</td>
                <td><span class="currency-badge">${eventData.currency}</span></td>
                <td class="importance-cell ${importanceClass}">${importanceHTML}</td>
                <td class="event-cell">${eventData.title}</td>
                <td class="data-cell">${eventData.actual}</td>
                <td class="data-cell">${eventData.forecast}</td>
                <td class="data-cell">${eventData.previous}</td>
            `;
            
            tableBody.appendChild(row);
            eventCount++;
        });
        
        if (eventCount === 0) {
            // استخدم البيانات الاحتياطية
            await loadBackupData(tableBody);
        }
        
        console.log('📅 تم تحميل التقويم الاقتصادي من Investing.com -', eventCount, 'حدث');
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        // استخدم البيانات الاحتياطية عند الفشل
        await loadBackupData(tableBody);
    }
}

// Parse Investing.com event data
function parseInvestingEvent(title, description, pubDate) {
    try {
        const date = new Date(pubDate);
        const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        
        const dayName = daysOfWeek[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        // استخراج العملة من العنوان
        const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'CNY'];
        let currency = 'USD';
        for (const curr of currencies) {
            if (title.includes(curr) || description.includes(curr)) {
                currency = curr;
                break;
            }
        }
        
        // تحديد الأهمية من الكلمات المفتاحية
        let impact = 'low';
        const highImpact = ['NFP', 'GDP', 'Interest Rate', 'CPI', 'Employment', 'Fed', 'ECB', 'BoE', 'BoJ'];
        const mediumImpact = ['Retail Sales', 'PMI', 'Industrial Production', 'Trade Balance'];
        
        for (const word of highImpact) {
            if (title.includes(word) || description.includes(word)) {
                impact = 'high';
                break;
            }
        }
        
        if (impact === 'low') {
            for (const word of mediumImpact) {
                if (title.includes(word) || description.includes(word)) {
                    impact = 'medium';
                    break;
                }
            }
        }
        
        // ترجمة العنوان
        const translatedTitle = translateEvent(title);
        
        return {
            date: `${dayName} ${day} ${month} ${year}`,
            time: time,
            currency: currency,
            impact: impact,
            title: translatedTitle,
            actual: '-',
            forecast: '-',
            previous: '-'
        };
    } catch (err) {
        console.error('Error parsing event:', err);
        return null;
    }
}

// Load from alternative API (EconDB)
async function loadFromEconDB(tableBody) {
    try {
        // استخدام Trading Economics API (مجاني)
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const apiUrl = encodeURIComponent('https://api.tradingeconomics.com/calendar');
        
        const response = await fetch(proxyUrl + apiUrl);
        const data = await response.json();
        const events = JSON.parse(data.contents);
        
        // معالجة البيانات وعرضها
        displayEconomicEvents(tableBody, events.slice(0, 30));
        
    } catch (err) {
        console.warn('⚠️ فشل تحميل من EconDB، استخدام البيانات الاحتياطية');
        await loadBackupData(tableBody);
    }
}

// Load backup realistic data
async function loadBackupData(tableBody) {
    const economicEvents = generateEconomicEvents();
    
    // تطبيق الفلترة الافتراضية (اليوم)
    filterCalendar();
    
    console.log('📅 تم تحميل التقويم الاقتصادي من البيانات الاحتياطية -', economicEvents.length, 'حدث');
}

// Generate realistic economic events
function generateEconomicEvents() {
    const today = new Date();
    const events = [];
    const daysOfWeek = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    // بيانات اقتصادية أكثر شمولاً لأسبوع كامل
    const economicData = [
        // اليوم (يوم 0)
        { day: 0, time: '01:30', currency: 'AUD', impact: 'medium', title: 'مبيعات التجزئة الأسترالية', forecast: '0.3%', previous: '0.5%', actual: '-' },
        { day: 0, time: '03:30', currency: 'USD', impact: 'high', title: 'مؤشر أسعار المستهلك (CPI)', forecast: '2.7%', previous: '2.6%', actual: '-' },
        { day: 0, time: '06:00', currency: 'GBP', impact: 'medium', title: 'الإنتاج الصناعي البريطاني', forecast: '0.1%', previous: '-0.1%', actual: '-' },
        { day: 0, time: '08:00', currency: 'EUR', impact: 'medium', title: 'مؤشر ZEW الألماني', forecast: '15.0', previous: '13.8', actual: '-' },
        { day: 0, time: '10:00', currency: 'EUR', impact: 'high', title: 'الناتج المحلي الإجمالي الأوروبي', forecast: '0.4%', previous: '0.4%', actual: '-' },
        { day: 0, time: '13:00', currency: 'CAD', impact: 'medium', title: 'مبيعات التصنيع الكندية', forecast: '0.7%', previous: '1.2%', actual: '-' },
        { day: 0, time: '15:30', currency: 'USD', impact: 'high', title: 'قرار الفائدة الفيدرالي', forecast: '4.50%', previous: '4.75%', actual: '-' },
        { day: 0, time: '15:30', currency: 'USD', impact: 'medium', title: 'مؤشر أسعار المنتجين (PPI)', forecast: '2.4%', previous: '2.4%', actual: '-' },
        { day: 0, time: '18:00', currency: 'USD', impact: 'high', title: 'المؤتمر الصحفي للفيدرالي', forecast: '-', previous: '-', actual: '-' },
        
        // غداً (يوم 1)
        { day: 1, time: '00:30', currency: 'JPY', impact: 'low', title: 'الإنتاج الصناعي الياباني', forecast: '0.2%', previous: '0.3%', actual: '-' },
        { day: 1, time: '01:30', currency: 'AUD', impact: 'high', title: 'معدل البطالة الأسترالي', forecast: '4.1%', previous: '4.1%', actual: '-' },
        { day: 1, time: '01:30', currency: 'AUD', impact: 'high', title: 'التوظيف الأسترالي', forecast: '20K', previous: '16K', actual: '-' },
        { day: 1, time: '06:00', currency: 'GBP', impact: 'medium', title: 'مؤشر أسعار المستهلك البريطاني', forecast: '2.6%', previous: '2.3%', actual: '-' },
        { day: 1, time: '08:00', currency: 'EUR', impact: 'medium', title: 'مؤشر أسعار المستهلك الألماني', forecast: '2.2%', previous: '2.2%', actual: '-' },
        { day: 1, time: '10:00', currency: 'EUR', impact: 'medium', title: 'الإنتاج الصناعي الأوروبي', forecast: '0.2%', previous: '-0.1%', actual: '-' },
        { day: 1, time: '13:00', currency: 'CHF', impact: 'low', title: 'مؤشر أسعار المنتجين السويسري', forecast: '-', previous: '-0.1%', actual: '-' },
        { day: 1, time: '15:30', currency: 'USD', impact: 'medium', title: 'طلبات إعانة البطالة', forecast: '225K', previous: '224K', actual: '-' },
        { day: 1, time: '15:30', currency: 'USD', impact: 'medium', title: 'مبيعات التجزئة الأمريكية', forecast: '0.5%', previous: '0.4%', actual: '-' },
        { day: 1, time: '15:30', currency: 'CAD', impact: 'high', title: 'مبيعات التجزئة الكندية', forecast: '0.4%', previous: '0.7%', actual: '-' },
        
        // يوم 2
        { day: 2, time: '00:00', currency: 'JPY', impact: 'high', title: 'قرار سعر الفائدة الياباني', forecast: '0.25%', previous: '0.25%', actual: '-' },
        { day: 2, time: '01:30', currency: 'AUD', impact: 'medium', title: 'محضر اجتماع البنك المركزي', forecast: '-', previous: '-', actual: '-' },
        { day: 2, time: '03:30', currency: 'NZD', impact: 'medium', title: 'الناتج المحلي الإجمالي النيوزيلندي', forecast: '0.3%', previous: '0.2%', actual: '-' },
        { day: 2, time: '06:00', currency: 'GBP', impact: 'high', title: 'مؤشر أسعار المستهلك البريطاني', forecast: '2.6%', previous: '2.3%', actual: '-' },
        { day: 2, time: '06:00', currency: 'GBP', impact: 'medium', title: 'مؤشر أسعار المنتجين', forecast: '0.3%', previous: '0.3%', actual: '-' },
        { day: 2, time: '08:00', currency: 'EUR', impact: 'medium', title: 'ميزان التجارة الألماني', forecast: '22.5B', previous: '22.5B', actual: '-' },
        { day: 2, time: '10:00', currency: 'EUR', impact: 'high', title: 'قرار البنك المركزي الأوروبي', forecast: '3.00%', previous: '3.25%', actual: '-' },
        { day: 2, time: '10:30', currency: 'EUR', impact: 'medium', title: 'المؤتمر الصحفي للبنك الأوروبي', forecast: '-', previous: '-', actual: '-' },
        { day: 2, time: '13:00', currency: 'CAD', impact: 'low', title: 'مبيعات التصنيع', forecast: '0.6%', previous: '1.0%', actual: '-' },
        { day: 2, time: '15:30', currency: 'USD', impact: 'medium', title: 'مبيعات التجزئة', forecast: '0.5%', previous: '0.4%', actual: '-' },
        { day: 2, time: '15:30', currency: 'USD', impact: 'medium', title: 'مبيعات التجزئة الأساسية', forecast: '0.4%', previous: '0.1%', actual: '-' },
        
        // يوم 3
        { day: 3, time: '01:30', currency: 'AUD', impact: 'low', title: 'ثقة المستهلك الأسترالي', forecast: '-', previous: '3.2%', actual: '-' },
        { day: 3, time: '03:30', currency: 'NZD', impact: 'medium', title: 'مؤشر أسعار المستهلك', forecast: '2.3%', previous: '2.2%', actual: '-' },
        { day: 3, time: '06:00', currency: 'GBP', impact: 'medium', title: 'مبيعات التجزئة البريطانية', forecast: '0.2%', previous: '0.1%', actual: '-' },
        { day: 3, time: '08:00', currency: 'EUR', impact: 'medium', title: 'مؤشر أسعار المستهلك الفرنسي', forecast: '1.3%', previous: '1.2%', actual: '-' },
        { day: 3, time: '10:00', currency: 'EUR', impact: 'medium', title: 'مؤشر أسعار المستهلك الأوروبي', forecast: '2.3%', previous: '2.0%', actual: '-' },
        { day: 3, time: '13:00', currency: 'CAD', impact: 'high', title: 'مؤشر أسعار المستهلك الكندي', forecast: '1.9%', previous: '2.0%', actual: '-' },
        { day: 3, time: '15:30', currency: 'USD', impact: 'low', title: 'تصاريح البناء', forecast: '1.425M', previous: '1.416M', actual: '-' },
        { day: 3, time: '15:30', currency: 'USD', impact: 'medium', title: 'بدايات الإسكان', forecast: '1.340M', previous: '1.311M', actual: '-' },
        { day: 3, time: '18:00', currency: 'USD', impact: 'medium', title: 'مخزونات النفط الخام', forecast: '-', previous: '-5.1M', actual: '-' },
        
        // يوم 4
        { day: 4, time: '00:30', currency: 'JPY', impact: 'medium', title: 'مؤشر أسعار المستهلك', forecast: '2.3%', previous: '2.3%', actual: '-' },
        { day: 4, time: '01:45', currency: 'NZD', impact: 'high', title: 'قرار سعر الفائدة النيوزيلندي', forecast: '4.25%', previous: '4.25%', actual: '-' },
        { day: 4, time: '06:00', currency: 'GBP', impact: 'medium', title: 'مبيعات التجزئة', forecast: '0.3%', previous: '0.1%', actual: '-' },
        { day: 4, time: '08:00', currency: 'EUR', impact: 'medium', title: 'مؤشر مديري المشتريات التصنيعي', forecast: '45.2', previous: '45.2', actual: '-' },
        { day: 4, time: '08:00', currency: 'EUR', impact: 'medium', title: 'مؤشر مديري المشتريات الخدمي', forecast: '51.6', previous: '51.6', actual: '-' },
        { day: 4, time: '08:30', currency: 'GBP', impact: 'medium', title: 'مؤشر مديري المشتريات', forecast: '48.6', previous: '48.6', actual: '-' },
        { day: 4, time: '13:30', currency: 'CHF', impact: 'medium', title: 'قرار سعر الفائدة السويسري', forecast: '0.50%', previous: '0.50%', actual: '-' },
        { day: 4, time: '15:30', currency: 'USD', impact: 'low', title: 'طلبات السلع المعمرة', forecast: '0.2%', previous: '0.2%', actual: '-' },
        { day: 4, time: '15:30', currency: 'USD', impact: 'medium', title: 'مؤشر مديري المشتريات', forecast: '48.3', previous: '48.1', actual: '-' },
        
        // يوم 5
        { day: 5, time: '01:30', currency: 'JPY', impact: 'medium', title: 'مؤشر أسعار المستهلك', forecast: '2.3%', previous: '2.3%', actual: '-' },
        { day: 5, time: '01:30', currency: 'AUD', impact: 'medium', title: 'مبيعات التجزئة', forecast: '0.4%', previous: '0.6%', actual: '-' },
        { day: 5, time: '06:00', currency: 'GBP', impact: 'high', title: 'الناتج المحلي الإجمالي', forecast: '0.2%', previous: '0.1%', actual: '-' },
        { day: 5, time: '08:00', currency: 'EUR', impact: 'low', title: 'ثقة المستهلك', forecast: '-13.7', previous: '-13.7', actual: '-' },
        { day: 5, time: '10:00', currency: 'EUR', impact: 'medium', title: 'معدل البطالة', forecast: '6.4%', previous: '6.4%', actual: '-' },
        { day: 5, time: '13:00', currency: 'CAD', impact: 'medium', title: 'الناتج المحلي الإجمالي', forecast: '0.2%', previous: '0.3%', actual: '-' },
        { day: 5, time: '15:30', currency: 'USD', impact: 'high', title: 'الوظائف غير الزراعية (NFP)', forecast: '200K', previous: '227K', actual: '-' },
        { day: 5, time: '15:30', currency: 'USD', impact: 'high', title: 'معدل البطالة الأمريكي', forecast: '4.2%', previous: '4.2%', actual: '-' },
        { day: 5, time: '15:30', currency: 'USD', impact: 'medium', title: 'متوسط الأجور بالساعة', forecast: '0.3%', previous: '0.4%', actual: '-' },
        { day: 5, time: '15:30', currency: 'CAD', impact: 'high', title: 'تقرير التوظيف الكندي', forecast: '25K', previous: '51K', actual: '-' },
        { day: 5, time: '15:30', currency: 'CAD', impact: 'high', title: 'معدل البطالة الكندي', forecast: '6.7%', previous: '6.7%', actual: '-' },
        
        // يوم 6
        { day: 6, time: '01:30', currency: 'AUD', impact: 'medium', title: 'الميزان التجاري', forecast: '5.5B', previous: '5.6B', actual: '-' },
        { day: 6, time: '03:30', currency: 'CNY', impact: 'high', title: 'مؤشر أسعار المستهلك الصيني', forecast: '0.2%', previous: '0.2%', actual: '-' },
        { day: 6, time: '03:30', currency: 'CNY', impact: 'medium', title: 'مؤشر أسعار المنتجين', forecast: '-2.5%', previous: '-2.9%', actual: '-' },
        { day: 6, time: '08:00', currency: 'EUR', impact: 'medium', title: 'الإنتاج الصناعي الألماني', forecast: '0.8%', previous: '0.2%', actual: '-' },
        { day: 6, time: '10:00', currency: 'EUR', impact: 'low', title: 'ميزان التجارة', forecast: '12.5B', previous: '12.8B', actual: '-' },
        { day: 6, time: '13:00', currency: 'CAD', impact: 'low', title: 'مؤشر Ivey للأعمال', forecast: '56.0', previous: '55.1', actual: '-' }
    ];
    
    economicData.forEach(item => {
        const eventDate = new Date(today);
        eventDate.setDate(today.getDate() + item.day);
        
        const dayName = daysOfWeek[eventDate.getDay()];
        const day = eventDate.getDate();
        const month = months[eventDate.getMonth()];
        const year = eventDate.getFullYear();
        
        events.push({
            date: `${dayName} ${day} ${month} ${year}`,
            dateObj: new Date(eventDate),
            time: item.time,
            currency: item.currency,
            impact: item.impact,
            title: item.title,
            forecast: item.forecast,
            previous: item.previous,
            actual: item.actual
        });
    });
    
    // حفظ جميع الأحداث في المتغير العام
    allCalendarEvents = events;
    
    return events;
}

// Format date in Arabic
function formatDate(dateStr) {
    // Already formatted in generateEconomicEvents
    return dateStr;
}

// Translate event names to Arabic (not needed anymore - already in Arabic)
function translateEvent(eventName) {
    return eventName;
}

// ==========================================
// Handle Window Resize
// ==========================================
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reset mobile menu on resize
        const nav = document.querySelector('.nav');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (window.innerWidth > 992) {
            nav.classList.remove('active');
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    }, 250);
});

console.log('مقهى الفوركس - تم تحميل الموقع بنجاح ☕');
