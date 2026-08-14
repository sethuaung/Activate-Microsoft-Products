/**
 * Grimoire - Application JavaScript
 * =================================
 * Part of the Grimoire static site generator
 * https://github.com/TristanInSec/Grimoire
 * 
 * AJAX-powered navigation for seamless page transitions without full reloads.
 * Uses the History API to maintain browser navigation while fetching content dynamically.
 * 
 * Features:
 *   - AJAX page loading with fade transitions
 *   - Browser history integration (back/forward support)
 *   - Dynamic breadcrumb updates
 *   - Persistent bookmarks and recent items via localStorage
 *   - Collapsible category navigation with state persistence
 *   - Real-time search with result highlighting
 *   - Dark/light theme switching
 *   - Code block copy-to-clipboard functionality
 *   - Mobile-responsive sidebar
 * 
 * Storage Keys (localStorage):
 *   - doc-platform-bookmarks: Array of bookmarked page IDs
 *   - doc-platform-recent: Array of recently viewed page IDs
 *   - doc-platform-category-states: Object mapping category IDs to expanded state
 *   - doc-platform-theme: Current theme ('dark' or 'light')
 *   - doc-platform-recent-collapsed: Boolean for Recent section collapse state
 *   - doc-platform-bookmarks-collapsed: Boolean for Bookmarks section collapse state
 */
(function() {
    'use strict';

    // State management
    let bookmarks = JSON.parse(localStorage.getItem('doc-platform-bookmarks') || '[]');
    let recentItems = JSON.parse(localStorage.getItem('doc-platform-recent') || '[]');
    let categoryStates = JSON.parse(localStorage.getItem('doc-platform-category-states') || '{}');
    
    // Store INITIAL base path (calculated once at page load)
    // This is the directory containing index.html
    const INITIAL_BASE_PATH = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    function initializeApp() {
        // 1. Setup AJAX navigation
        setupAjaxNavigation();
        
        // 2. Category collapse/expand
        setupCategoryNavigation();
        
        // 3. Subcategory collapse/expand
        setupSubcategoryNavigation();
        
        // 4. Deep level (3+) collapse/expand
        setupDeepNavigation();
        
        // 5. Current page highlighting
        highlightCurrentPage();
        
        // 6. Bookmark functionality
        setupBookmarks();
        
        // 7. Recent items
        addToRecent(window.currentPageId);
        updateRecentItems();
        
        // 8. Clear buttons
        setupClearButtons();
        
        // 9. Collapse buttons for sections
        setupCollapseSections();
        
        // 10. Mobile menu
        setupMobileMenu();
        
        // 11. Theme toggle
        setupTheme();
        
        // 12. Search functionality
        setupSearch();
        
        // 13. Export button
        setupExportButton();
        
        // 14. Copy buttons for code blocks
        addCopyButtons();
        
        // 15. Restore states
        restoreStates();
        
        // 16. Syntax highlighting
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }

        // 17. Scroll to top button
        setupScrollToTop();

        // 18. Table of Contents with Scroll Spy
        setupTableOfContents();
    }

    // ============================================
    // AJAX Navigation for Smooth Transitions
    // ============================================
    
    function setupAjaxNavigation() {
        // Intercept all nav-item clicks
        document.addEventListener('click', function(e) {
            const navItem = e.target.closest('.nav-item');
            if (navItem && navItem.href) {
                e.preventDefault();
                
                // Get the href attribute directly (relative path)
                const href = navItem.getAttribute('href');
                
                // Resolve relative to INITIAL BASE PATH (never changes)
                // This prevents path stacking issues
                const absoluteUrl = new URL(href, window.location.origin + INITIAL_BASE_PATH).href;
                
                loadPage(absoluteUrl, navItem.dataset.page);
            }
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', function(e) {
            if (e.state && e.state.pageId) {
                loadPage(e.state.url, e.state.pageId, false);
            }
        });
        
        // Logo click - navigate to index using the href (updated after each AJAX nav)
        document.addEventListener('click', function(e) {
            const logo = e.target.closest('.logo');
            if (logo) {
                e.preventDefault();
                window.location.href = logo.getAttribute('href');
            }
        });
        
        // Save initial state
        if (window.currentPageId) {
            history.replaceState({
                pageId: window.currentPageId,
                url: window.location.href
            }, '', window.location.href);
        }
    }

    function loadPage(url, pageId, pushState = true) {
        // Show loading indicator
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) {
            console.error('[AJAX] Main content container not found');
            return;
        }
        
        mainContent.style.opacity = '0.5';
        mainContent.style.transition = 'opacity 0.2s';
        
        
        // Fetch new page
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            })
            .then(html => {
                // Parse HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract new content
                const newMain = doc.querySelector('.main-content');
                const newTitle = doc.querySelector('title');
                const newLogo = doc.querySelector('.logo');
                
                if (!newMain) {
                    console.error('[AJAX] No .main-content found in fetched page');
                    throw new Error('Invalid page structure');
                }
                
                // Replace ENTIRE main content
                mainContent.innerHTML = newMain.innerHTML;
                
                // Update page title
                if (newTitle) {
                    document.title = newTitle.textContent;
                }
                
                // Update logo href to match new page's depth
                if (newLogo) {
                    const currentLogo = document.querySelector('.logo');
                    if (currentLogo) {
                        currentLogo.setAttribute('href', newLogo.getAttribute('href'));
                    }
                }
                
                // Update current page ID
                window.currentPageId = pageId;
                
                // Update URL in browser
                if (pushState) {
                    history.pushState({
                        pageId: pageId,
                        url: url
                    }, '', url);
                }
                
                // Update UI
                highlightCurrentPage();
                updateBreadcrumb(pageId);
                addToRecent(pageId);
                updateRecentItems();
                updateBookmarkButtons();
                
                // Re-apply syntax highlighting
                if (typeof Prism !== 'undefined') {
                    Prism.highlightAll();
                }
                
                // Add copy buttons to code blocks
                addCopyButtons();
                
                // Regenerate Table of Contents
                setupTableOfContents();

                // Update footer sibling links for new page depth
                const newAbout = doc.querySelector('.footer-column a[href*="about.html"]');
                if (newAbout) {
                    const base = newAbout.getAttribute('href').replace('about.html', '');
                    document.querySelectorAll('.footer-sibling').forEach(function(a) {
                        a.href = base + a.dataset.page;
                    });
                }

                // Scroll to top
                window.scrollTo(0, 0);
                
                // Fade in
                mainContent.style.opacity = '1';
                
            })
            .catch(error => {
                console.error('[AJAX] Failed to load page:', error);
                mainContent.style.opacity = '1';
                // Fallback to standard navigation on fetch failure
                window.location.href = url;
            });
    }

    // ============================================
    // Breadcrumb Updates
    // ============================================
    
    function updateBreadcrumb(pageId) {
        const breadcrumbCategory = document.getElementById('breadcrumbCategory');
        const breadcrumbPage = document.getElementById('breadcrumbPage');
        const breadcrumbSeparator2 = document.getElementById('breadcrumbSeparator2');
        const readingTimeDisplay = document.getElementById('readingTimeDisplay');
        
        if (!breadcrumbCategory) return;
        
        // Handle welcome page
        if (pageId === 'welcome' || !pageId) {
            breadcrumbCategory.textContent = 'Welcome';
            if (breadcrumbPage) breadcrumbPage.style.display = 'none';
            if (breadcrumbSeparator2) breadcrumbSeparator2.style.display = 'none';
            if (readingTimeDisplay) readingTimeDisplay.textContent = '5 min read';
            return;
        }
        
        // Get page data
        const pageData = window.pageData ? window.pageData[pageId] : null;
        
        if (pageData) {
            if (pageData.level3) {
                // Three-level breadcrumb: Category > Subcategory > Sub-subcategory
                breadcrumbCategory.textContent = pageData.level1;
                if (breadcrumbPage) {
                    breadcrumbPage.textContent = `${pageData.level2} › ${pageData.level3}`;
                    breadcrumbPage.style.display = 'inline';
                }
                if (breadcrumbSeparator2) breadcrumbSeparator2.style.display = 'inline';
            } else if (pageData.level2) {
                // Two-level breadcrumb: Category > Subcategory
                breadcrumbCategory.textContent = pageData.level1;
                if (breadcrumbPage) {
                    breadcrumbPage.textContent = pageData.level2;
                    breadcrumbPage.style.display = 'inline';
                }
                if (breadcrumbSeparator2) breadcrumbSeparator2.style.display = 'inline';
            } else {
                // Single-level breadcrumb: Just category
                breadcrumbCategory.textContent = pageData.level1 || pageData.category || 'Article';
                if (breadcrumbPage) breadcrumbPage.style.display = 'none';
                if (breadcrumbSeparator2) breadcrumbSeparator2.style.display = 'none';
            }
            
            // Update reading time
            if (readingTimeDisplay && pageData.reading_time) {
                readingTimeDisplay.textContent = `${pageData.reading_time} min read`;
            }
        }
    }

    // ============================================
    // Category & Subcategory Navigation
    // ============================================
    
    function setupCategoryNavigation() {
        document.querySelectorAll('.category-header').forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                const items = document.getElementById(category);
                const chevron = this.querySelector('.category-chevron');
                
                if (items) {
                    const isExpanded = items.classList.contains('expanded');
                    
                    if (isExpanded) {
                        items.classList.remove('expanded');
                        chevron.style.transform = 'rotate(0deg)';
                        categoryStates[category] = false;
                    } else {
                        items.classList.add('expanded');
                        chevron.style.transform = 'rotate(90deg)';
                        categoryStates[category] = true;
                    }
                    
                    // Save state
                    localStorage.setItem('doc-platform-category-states', JSON.stringify(categoryStates));
                }
            });
        });
    }

    function setupSubcategoryNavigation() {
        document.querySelectorAll('.subcategory-header').forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                const items = document.getElementById(category);
                const chevron = this.querySelector('.subcategory-chevron');
                
                if (items) {
                    const isExpanded = items.classList.contains('expanded');
                    
                    if (isExpanded) {
                        items.classList.remove('expanded');
                        chevron.style.transform = 'rotate(0deg)';
                        categoryStates[category] = false;
                    } else {
                        items.classList.add('expanded');
                        chevron.style.transform = 'rotate(90deg)';
                        categoryStates[category] = true;
                    }
                    
                    localStorage.setItem('doc-platform-category-states', JSON.stringify(categoryStates));
                }
            });
        });
    }

    function setupDeepNavigation() {
        // Handle deep level (3+) folder expand/collapse
        document.querySelectorAll('.deep-header').forEach(button => {
            button.addEventListener('click', function() {
                const category = this.dataset.category;
                const items = document.getElementById(category);
                const chevron = this.querySelector('.deep-chevron');
                
                if (items) {
                    const isExpanded = items.classList.contains('expanded');
                    
                    if (isExpanded) {
                        items.classList.remove('expanded');
                        this.classList.remove('active');
                        categoryStates[category] = false;
                    } else {
                        items.classList.add('expanded');
                        this.classList.add('active');
                        categoryStates[category] = true;
                    }
                    
                    localStorage.setItem('doc-platform-category-states', JSON.stringify(categoryStates));
                }
            });
        });
    }

    function highlightCurrentPage() {
        // Remove all active states from nav items only
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Highlight current page
        if (window.currentPageId) {
            // Find the nav-item link with this page ID
            const currentItem = document.querySelector(`a.nav-item[data-page="${window.currentPageId}"]`);
            if (currentItem) {
                currentItem.classList.add('active');
                
                // Expand all parent containers up the tree
                let element = currentItem;
                while (element) {
                    // Check for deep-items
                    let deepParent = element.closest('.deep-items');
                    if (deepParent) {
                        deepParent.classList.add('expanded');
                        const header = deepParent.previousElementSibling;
                        if (header && header.classList.contains('deep-header')) {
                            header.classList.add('active');
                        }
                        element = deepParent.parentElement;
                        continue;
                    }
                    
                    // Check for subcategory-items
                    let subParent = element.closest('.subcategory-items');
                    if (subParent) {
                        subParent.classList.add('expanded');
                        const header = subParent.previousElementSibling;
                        if (header) {
                            const chevron = header.querySelector('.subcategory-chevron');
                            if (chevron) chevron.style.transform = 'rotate(90deg)';
                        }
                        element = subParent.parentElement;
                        continue;
                    }
                    
                    // Check for category-items
                    let catParent = element.closest('.category-items');
                    if (catParent) {
                        catParent.classList.add('expanded');
                        const header = catParent.previousElementSibling;
                        if (header) {
                            const chevron = header.querySelector('.category-chevron');
                            if (chevron) chevron.style.transform = 'rotate(90deg)';
                        }
                        element = catParent.parentElement;
                        continue;
                    }
                    
                    break;
                }
            }
        }
    }

    // ============================================
    // Bookmarks
    // ============================================
    
    function setupBookmarks() {
        updateBookmarkButtons();
        updateBookmarks();
        
        // Add click handlers to bookmark buttons
        document.addEventListener('click', function(e) {
            const bookmarkBtn = e.target.closest('.bookmark-btn');
            if (bookmarkBtn) {
                e.preventDefault();
                e.stopPropagation();
                const pageId = bookmarkBtn.dataset.page;
                if (pageId) {
                    toggleBookmark(pageId);
                }
            }
        });
    }

    function toggleBookmark(pageId) {
        const index = bookmarks.indexOf(pageId);
        if (index > -1) {
            bookmarks.splice(index, 1);
        } else {
            bookmarks.push(pageId);
        }
        localStorage.setItem('doc-platform-bookmarks', JSON.stringify(bookmarks));
        updateBookmarkButtons();
        updateBookmarks();
    }

    function updateBookmarkButtons() {
        document.querySelectorAll('.bookmark-btn').forEach(btn => {
            const pageId = btn.dataset.page;
            const icon = btn.querySelector('i');
            if (icon) {
                if (bookmarks.includes(pageId)) {
                    icon.className = 'fas fa-bookmark';
                } else {
                    icon.className = 'far fa-bookmark';
                }
            }
        });
    }

    function updateBookmarks() {
        const container = document.getElementById('bookmarkedItems');
        if (!container) return;
        
        if (bookmarks.length === 0) {
            container.innerHTML = '<div class="empty-state">No bookmarks yet</div>';
            return;
        }
        
        container.innerHTML = bookmarks.map(pageId => {
            const pageData = window.pageData ? window.pageData[pageId] : null;
            if (!pageData) return '';
            
            return `
                <div class="quick-access-item" data-page="${pageId}">
                    <div class="item-content">
                        <div class="item-title">${pageData.page}</div>
                        <div class="item-category">${pageData.category}</div>
                    </div>
                    <button class="remove-item" data-page="${pageId}">
                        <i class="fas fa-xmark"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        // Add click handlers for navigation
        container.querySelectorAll('.quick-access-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.closest('.remove-item')) {
                    e.stopPropagation();
                    const removeBtn = e.target.closest('.remove-item');
                    const pageId = removeBtn.dataset.page;
                    toggleBookmark(pageId);
                    return;
                }
                const pageId = this.dataset.page;
                const link = document.querySelector(`.nav-item[data-page="${pageId}"]`);
                if (link && link.href) {
                    // Use INITIAL base path to prevent path stacking
                    const href = link.getAttribute('href');
                    const absoluteUrl = new URL(href, window.location.origin + INITIAL_BASE_PATH).href;
                    loadPage(absoluteUrl, pageId);
                }
            });
        });
    }

    // ============================================
    // Recent Items
    // ============================================
    
    function addToRecent(pageId) {
        if (!pageId || pageId === 'welcome') return;
        
        const index = recentItems.indexOf(pageId);
        if (index > -1) {
            recentItems.splice(index, 1);
        }
        recentItems.unshift(pageId);
        recentItems = recentItems.slice(0, 10);
        localStorage.setItem('doc-platform-recent', JSON.stringify(recentItems));
    }

    function updateRecentItems() {
        const container = document.getElementById('recentItems');
        if (!container) return;
        
        if (recentItems.length === 0) {
            container.innerHTML = '<div class="empty-state">No recent pages</div>';
            return;
        }
        
        container.innerHTML = recentItems.map(pageId => {
            const pageData = window.pageData ? window.pageData[pageId] : null;
            if (!pageData) return '';
            
            return `
                <div class="quick-access-item" data-page="${pageId}">
                    <div class="item-content">
                        <div class="item-title">${pageData.page}</div>
                        <div class="item-category">${pageData.category}</div>
                    </div>
                    <button class="remove-item" data-page="${pageId}">
                        <i class="fas fa-xmark"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        // Add click handlers for navigation
        container.querySelectorAll('.quick-access-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.closest('.remove-item')) {
                    e.stopPropagation();
                    const removeBtn = e.target.closest('.remove-item');
                    const pageId = removeBtn.dataset.page;
                    removeFromRecent(pageId);
                    return;
                }
                const pageId = this.dataset.page;
                const link = document.querySelector(`.nav-item[data-page="${pageId}"]`);
                if (link && link.href) {
                    // Use INITIAL base path to prevent path stacking
                    const href = link.getAttribute('href');
                    const absoluteUrl = new URL(href, window.location.origin + INITIAL_BASE_PATH).href;
                    loadPage(absoluteUrl, pageId);
                }
            });
        });
    }

    function removeFromRecent(pageId) {
        const index = recentItems.indexOf(pageId);
        if (index > -1) {
            recentItems.splice(index, 1);
            localStorage.setItem('doc-platform-recent', JSON.stringify(recentItems));
            updateRecentItems();
        }
    }

    // ============================================
    // Clear Buttons & Collapse
    // ============================================
    
    function setupClearButtons() {
        const clearRecent = document.getElementById('clearRecent');
        const clearBookmarks = document.getElementById('clearBookmarks');
        
        if (clearRecent) {
            clearRecent.addEventListener('click', function(e) {
                e.stopPropagation();
                recentItems = [];
                localStorage.setItem('doc-platform-recent', JSON.stringify(recentItems));
                updateRecentItems();
            });
        }
        
        if (clearBookmarks) {
            clearBookmarks.addEventListener('click', function(e) {
                e.stopPropagation();
                bookmarks = [];
                localStorage.setItem('doc-platform-bookmarks', JSON.stringify(bookmarks));
                updateBookmarkButtons();
                updateBookmarks();
            });
        }
    }

    function setupCollapseSections() {
        const recentTitle = document.getElementById('recentTitle');
        const bookmarksTitle = document.getElementById('bookmarksTitle');
        
        if (recentTitle) {
            recentTitle.addEventListener('click', function(e) {
                if (!e.target.closest('.clear-btn')) {
                    toggleCollapse('recent');
                }
            });
        }
        
        if (bookmarksTitle) {
            bookmarksTitle.addEventListener('click', function(e) {
                if (!e.target.closest('.clear-btn')) {
                    toggleCollapse('bookmarks');
                }
            });
        }
    }

    function toggleCollapse(section) {
        const button = document.getElementById(`collapse${section.charAt(0).toUpperCase() + section.slice(1)}`);
        const content = document.getElementById(`${section}Content`);
        const icon = button?.querySelector('i');
        
        if (!content || !icon) return;
        
        const isCollapsed = content.classList.contains('collapsed');
        
        if (isCollapsed) {
            content.classList.remove('collapsed');
            button.classList.remove('collapsed');
            icon.className = 'fas fa-chevron-down';
            localStorage.setItem(`doc-platform-${section}-collapsed`, 'false');
        } else {
            content.classList.add('collapsed');
            button.classList.add('collapsed');
            icon.className = 'fas fa-chevron-right';
            localStorage.setItem(`doc-platform-${section}-collapsed`, 'true');
        }
    }

    // ============================================
    // Mobile Menu
    // ============================================
    
    function setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (mobileMenuBtn && sidebar) {
            mobileMenuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('visible');
                if (overlay) overlay.classList.toggle('visible');
            });
        }
        
        if (overlay) {
            overlay.addEventListener('click', function() {
                sidebar.classList.remove('visible');
                overlay.classList.remove('visible');
            });
        }
    }

    // ============================================
    // Theme
    // ============================================
    
    function setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const savedTheme = localStorage.getItem('doc-platform-theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        
        themeToggle.addEventListener('click', function() {
            const current = document.body.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('doc-platform-theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ============================================
    // Search
    // ============================================
    
    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        let debounceTimer;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                filterNavigation(e.target.value.toLowerCase().trim());
            }, 150);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === searchInput) {
                searchInput.value = '';
                filterNavigation('');
                searchInput.blur();
            }
        });
    }

    function filterNavigation(query) {
        const navItems = document.querySelectorAll('.nav-item');
        const categories = document.querySelectorAll('.nav-category');
        const subcategories = document.querySelectorAll('.nav-subcategory');
        
        if (!query) {
            // Show all items
            navItems.forEach(item => {
                item.style.display = '';
                item.classList.remove('search-highlight');
            });
            categories.forEach(cat => cat.style.display = '');
            subcategories.forEach(subcat => subcat.style.display = '');
            return;
        }
        
        // Filter items
        navItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = text.includes(query);
            item.style.display = matches ? '' : 'none';
            item.classList.toggle('search-highlight', matches);
        });
        
        // Hide empty subcategories
        subcategories.forEach(subcat => {
            const items = subcat.querySelectorAll('.nav-item');
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            subcat.style.display = visibleItems.length === 0 ? 'none' : '';
            
            // Expand visible subcategories
            if (visibleItems.length > 0) {
                const content = subcat.querySelector('.subcategory-items');
                if (content) content.classList.add('expanded');
            }
        });
        
        // Hide empty categories
        categories.forEach(cat => {
            const items = cat.querySelectorAll('.nav-item');
            const visibleItems = Array.from(items).filter(item => item.style.display !== 'none');
            cat.style.display = visibleItems.length === 0 ? 'none' : '';
            
            // Expand visible categories
            if (visibleItems.length > 0) {
                const content = cat.querySelector('.category-items');
                if (content) content.classList.add('expanded');
            }
        });
    }

    // ============================================
    // Restore States
    // ============================================
    
    function restoreStates() {
        // Restore category states
        Object.entries(categoryStates).forEach(([category, isExpanded]) => {
            const items = document.getElementById(category);
            const header = items?.previousElementSibling;
            const chevron = header?.querySelector('.category-chevron, .subcategory-chevron');
            
            if (items && isExpanded) {
                items.classList.add('expanded');
                if (chevron) chevron.style.transform = 'rotate(90deg)';
            }
        });
        
        // Restore collapse states
        ['recent', 'bookmarks'].forEach(section => {
            const isCollapsed = localStorage.getItem(`doc-platform-${section}-collapsed`) === 'true';
            if (isCollapsed) {
                const content = document.getElementById(`${section}Content`);
                const button = document.getElementById(`collapse${section.charAt(0).toUpperCase() + section.slice(1)}`);
                const icon = button?.querySelector('i');
                
                if (content) {
                    content.classList.add('collapsed');
                    if (button) button.classList.add('collapsed');
                    if (icon) icon.className = 'fas fa-chevron-right';
                }
            }
        });
    }

    // ============================================
    // Export Button - HTML Export
    // ============================================
    
    function setupExportButton() {
        const exportBtn = document.getElementById('exportBtn');
        const footerExportBtn = document.getElementById('footerExportBtn');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                exportCurrentPage();
            });
        }
        
        if (footerExportBtn) {
            footerExportBtn.addEventListener('click', function(e) {
                e.preventDefault();
                exportCurrentPage();
            });
        }
        
        // Discord link obfuscation - prevents bot scraping
        const discordLink = document.getElementById('discordLink');
        if (discordLink) {
            discordLink.addEventListener('click', function(e) {
                e.preventDefault();
                const d = this.getAttribute('data-d');
                if (d) {
                    const base = ['dis','cord','.gg/'].join('');
                    window.open('https://' + base + d, '_blank', 'noopener');
                }
            });
        }
    }
    
    function exportCurrentPage() {
        try {
            // Get current page content
            const contentElement = document.querySelector('.article-content');
            
            if (!contentElement) {
                alert('No content found to export');
                return;
            }
            
            // Get page title from multiple sources
            let pageTitle = 'Page';
            
            // Try window.pageData first
            if (window.currentPageId && window.pageData?.[window.currentPageId]) {
                pageTitle = window.pageData[window.currentPageId].page || pageTitle;
            } else {
                // Fallback: get title from h1 or document title
                const h1 = contentElement.querySelector('h1');
                if (h1) {
                    pageTitle = h1.textContent.trim();
                } else if (document.title) {
                    pageTitle = document.title.split('|')[0].split('-')[0].trim();
                }
            }
            
            const pageData = { page: pageTitle };
            
            // Create export HTML
            const exportContent = createExportHTML(pageData, contentElement);
            
            // Create download
            const blob = new Blob([exportContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('[Export] Failed:', error);
            alert('Export failed: ' + error.message);
        }
    }
    
    function createExportHTML(pageData, contentElement) {
        // Print-friendly neutral styles (no accent colors)
        const printStyles = `
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
                line-height: 1.6; 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 2rem; 
                color: #1a1a1a; 
                background: #fff;
            }
            h1, h2, h3, h4, h5, h6 { 
                color: #1a1a1a; 
                margin-top: 2rem; 
                margin-bottom: 1rem; 
            }
            h1 { font-size: 2rem; border-bottom: 2px solid #333; padding-bottom: 0.5rem; }
            h2 { font-size: 1.5rem; border-bottom: 1px solid #ccc; padding-bottom: 0.3rem; }
            h3 { font-size: 1.25rem; }
            pre { 
                background: #f5f5f5; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 1rem; 
                overflow-x: auto; 
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 0.9rem;
            }
            code { 
                background: #f5f5f5; 
                padding: 0.15rem 0.3rem; 
                border-radius: 3px; 
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 0.9rem;
            }
            pre code {
                background: none;
                padding: 0;
            }
            blockquote { 
                border-left: 3px solid #666; 
                margin: 1rem 0; 
                padding: 0.5rem 1rem; 
                background: #f9f9f9;
                color: #555;
            }
            table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
            th, td { border: 1px solid #ccc; padding: 0.5rem 0.75rem; text-align: left; }
            th { background: #f5f5f5; font-weight: 600; }
            img { max-width: 100%; height: auto; }
            a { color: #333; text-decoration: underline; }
            .copy-btn, .bookmark-btn { display: none; }
            @media print {
                body { padding: 0; }
                pre { white-space: pre-wrap; word-wrap: break-word; }
            }
        `;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageData.page || 'Page'}</title>
    <style>${printStyles}</style>
</head>
<body>
    ${contentElement.innerHTML}
</body>
</html>`;
    }

    // ============================================
    // Copy Code Buttons
    // ============================================
    
    function addCopyButtons() {
        // Find all code blocks that don't already have copy buttons
        const codeBlocks = document.querySelectorAll('pre:not([data-copy-added])');
        
        codeBlocks.forEach(pre => {
            // Mark as processed
            pre.setAttribute('data-copy-added', 'true');
            
            // Get the code content
            const code = pre.querySelector('code');
            const codeText = code ? code.textContent : pre.textContent;
            
            // Create copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.setAttribute('data-copy', codeText);
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.title = 'Copy code to clipboard';
            
            // Add click handler
            copyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                copyToClipboard(codeText, copyBtn);
            });
            
            // Create wrapper if pre doesn't have one
            if (!pre.parentElement.classList.contains('code-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'code-wrapper';
                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);
                wrapper.appendChild(copyBtn);
            } else {
                pre.parentElement.appendChild(copyBtn);
            }
        });
    }
    
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(() => {
            console.error('Failed to copy to clipboard');
            button.innerHTML = '<i class="fas fa-xmark"></i> Failed';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        });
    }

    // ============================================
    // Scroll to Top Button
    // ============================================

    function setupScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTop');
        if (!scrollBtn) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        // Scroll to top on click
        scrollBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // Table of Contents with Scroll Spy
    // ============================================

    function setupTableOfContents() {
        const tocList = document.getElementById('tocList');
        const tocContainer = document.getElementById('tocContainer');
        
        // Always remove has-toc class first (will re-add if TOC is visible)
        document.body.classList.remove('has-toc');
        
        if (!tocList || !tocContainer) return;

        // Only show TOC if page has h2 headings (articles have h2, welcome page doesn't)
        const h2Headings = document.querySelectorAll('.article-content > h2');
        
        if (h2Headings.length === 0) {
            tocContainer.style.display = 'none';
            return;
        }
        
        // Get all h2 and h3 headings for TOC (direct children only to avoid nested elements)
        const headings = document.querySelectorAll('.article-content > h2, .article-content > h3');
        
        if (headings.length === 0) {
            tocContainer.style.display = 'none';
            return;
        }
        
        // Add class to body to enable margin on main content
        document.body.classList.add('has-toc');

        // Configuration
        const CONFIG = {
            rootMargin: '-80px 0px -80% 0px',
            scrollOffset: 100
        };

        let activeId = null;
        let tocObserver = null;

        // Generate TOC from headings (h2 and h3)
        function generateTOC() {
            tocList.innerHTML = '';
            let currentH2Item = null;
            let currentSublist = null;

            headings.forEach(heading => {
                // Ensure heading has an ID
                if (!heading.id) {
                    heading.id = heading.textContent
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                }

                const id = heading.id;
                const text = heading.textContent;
                const level = heading.tagName.toLowerCase();

                if (level === 'h2') {
                    const li = document.createElement('li');
                    li.className = 'toc-item';
                    li.innerHTML = `<a href="#${id}" class="toc-link" data-id="${id}">${text}</a>`;
                    
                    currentSublist = document.createElement('ul');
                    currentSublist.className = 'toc-sublist'; // collapsed by default
                    li.appendChild(currentSublist);
                    
                    tocList.appendChild(li);
                    currentH2Item = li;
                } else if (level === 'h3' && currentSublist) {
                    const li = document.createElement('li');
                    li.className = 'toc-item';
                    li.innerHTML = `<a href="#${id}" class="toc-link" data-id="${id}">${text}</a>`;
                    currentSublist.appendChild(li);
                }
            });
        }

        // Set active link and expand/collapse sublists
        function setActiveLink(id) {
            if (activeId === id) return;
            activeId = id;

            // Remove all active states
            tocList.querySelectorAll('.toc-link').forEach(link => {
                link.classList.remove('active');
            });

            // Collapse all sublists
            tocList.querySelectorAll('.toc-sublist').forEach(sublist => {
                sublist.classList.remove('expanded');
            });

            // Find and activate the current link
            const activeLink = tocList.querySelector(`.toc-link[data-id="${id}"]`);
            if (!activeLink) return;

            activeLink.classList.add('active');

            // If this is an h3, expand its parent sublist (but don't highlight parent h2)
            const parentSublist = activeLink.closest('.toc-sublist');
            if (parentSublist) {
                parentSublist.classList.add('expanded');
            }

            // If this is an h2, expand its sublist
            const siblingSublist = activeLink.nextElementSibling;
            if (siblingSublist?.classList.contains('toc-sublist')) {
                siblingSublist.classList.add('expanded');
            }
        }

        // Setup Intersection Observer for scroll spy
        function setupScrollSpy() {
            if (tocObserver) {
                tocObserver.disconnect();
            }

            tocObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setActiveLink(entry.target.id);
                        }
                    });
                },
                {
                    rootMargin: CONFIG.rootMargin,
                    threshold: 0
                }
            );

            headings.forEach(heading => {
                if (heading.id) {
                    tocObserver.observe(heading);
                }
            });
        }

        // Smooth scroll on TOC click
        function setupSmoothScroll() {
            tocList.addEventListener('click', (e) => {
                const link = e.target.closest('.toc-link');
                if (!link) return;

                e.preventDefault();
                const targetId = link.getAttribute('data-id');
                const target = document.getElementById(targetId);

                if (target) {
                    const top = target.offsetTop - CONFIG.scrollOffset;
                    window.scrollTo({
                        top: top,
                        behavior: 'smooth'
                    });

                    history.pushState(null, '', `#${targetId}`);
                    setActiveLink(targetId);
                }
            });
        }

        // Initialize
        generateTOC();
        
        // Show TOC container if we have content (CSS media query will still control visibility on small screens)
        if (tocList.children.length > 0) {
            tocContainer.style.display = '';  // Remove inline style, let CSS take over
            setupScrollSpy();
            setupSmoothScroll();

            // Set initial active state
            const hash = window.location.hash.slice(1);
            if (hash && document.getElementById(hash)) {
                setActiveLink(hash);
            } else if (headings[0]?.id) {
                setActiveLink(headings[0].id);
            }
        } else {
            tocContainer.style.display = 'none';
        }
    }

    // ============================================
    // Global Functions
    // ============================================
    
    window.toggleBookmark = toggleBookmark;
    window.removeFromRecent = removeFromRecent;
    
})();
