// Initialize FAQ with loaded data
function initializeFAQ() {
    if (!faqData) {
        console.error('FAQ 데이터가 로드되지 않았습니다.');
        return;
    }
    
    // Generate category tabs
    generateCategoryTabs();
    
    // Generate FAQ content
    generateFAQContent();
    
    // Show first category by default
    const firstTab = document.querySelector('.category-tab');
    if (firstTab) {
        firstTab.click();
    }
    
    // Initialize search functionality
    initializeSearch();
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('faq-search');
    const searchClear = document.getElementById('search-clear');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            handleSearch();
            searchInput.focus();
        });
    }
}

// Handle search input
function handleSearch() {
    const searchInput = document.getElementById('faq-search');
    const searchClear = document.getElementById('search-clear');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Show/hide clear button
    if (searchTerm.length > 0) {
        searchClear.style.display = 'block';
    } else {
        searchClear.style.display = 'none';
    }
    
    // If search is empty, show all items in current category
    if (searchTerm.length === 0) {
        showAllFAQs();
        return;
    }
    
    // Search through all FAQs
    let hasResults = false;
    const allCategories = document.querySelectorAll('.faq-category');
    
    allCategories.forEach(category => {
        const faqItems = category.querySelectorAll('.faq-item');
        let categoryHasResults = false;
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h5');
            const answer = item.querySelector('.faq-answer-content');
            const questionText = question.textContent.toLowerCase();
            const answerText = answer.textContent.toLowerCase();
            
            // Check if search term is in question or answer
            if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                item.classList.remove('hidden');
                categoryHasResults = true;
                hasResults = true;
                
                // Highlight search term
                highlightSearchTerm(question, searchTerm);
            } else {
                item.classList.add('hidden');
            }
        });
        
        // Show category if it has matching results
        if (categoryHasResults) {
            category.classList.add('active');
        } else {
            category.classList.remove('active');
        }
    });
    
    // Hide category tabs during search
    const categoryTabsContainer = document.querySelector('.category-tabs');
    if (searchTerm.length > 0) {
        categoryTabsContainer.style.display = 'none';
    } else {
        categoryTabsContainer.style.display = 'flex';
    }
    
    // Show "no results" message if needed
    showNoResultsMessage(!hasResults && searchTerm.length > 0);
}

// Highlight search term in text
function highlightSearchTerm(element, searchTerm) {
    const originalText = element.getAttribute('data-original-text') || element.textContent;
    
    if (!element.getAttribute('data-original-text')) {
        element.setAttribute('data-original-text', originalText);
    }
    
    if (searchTerm.length === 0) {
        element.textContent = originalText;
        return;
    }
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const highlightedText = originalText.replace(regex, '<span class="search-highlight">$1</span>');
    element.innerHTML = highlightedText;
}

// Show all FAQs (reset search)
function showAllFAQs() {
    const allFaqItems = document.querySelectorAll('.faq-item');
    allFaqItems.forEach(item => {
        item.classList.remove('hidden');
        
        // Remove highlights
        const question = item.querySelector('.faq-question h5');
        const originalText = question.getAttribute('data-original-text');
        if (originalText) {
            question.textContent = originalText;
        }
    });
    
    // Show category tabs
    const categoryTabsContainer = document.querySelector('.category-tabs');
    categoryTabsContainer.style.display = 'flex';
    
    // Show only active category
    const allCategories = document.querySelectorAll('.faq-category');
    allCategories.forEach(cat => {
        if (!cat.classList.contains('active')) {
            cat.classList.remove('active');
        }
    });
    
    // If no category is active, show first one
    const activeCategory = document.querySelector('.faq-category.active');
    if (!activeCategory) {
        const firstTab = document.querySelector('.category-tab');
        if (firstTab) {
            firstTab.click();
        }
    }
    
    showNoResultsMessage(false);
}

// Show or hide "no results" message
function showNoResultsMessage(show) {
    let noResultsElement = document.querySelector('.no-results');
    
    if (show) {
        if (!noResultsElement) {
            noResultsElement = document.createElement('div');
            noResultsElement.className = 'no-results';
            noResultsElement.innerHTML = `
                <i class="fas fa-search"></i>
                <h4>검색 결과가 없습니다</h4>
                <p>다른 검색어로 시도해보세요</p>
            `;
            
            const container = document.querySelector('.container.mt--8');
            container.appendChild(noResultsElement);
        }
        noResultsElement.style.display = 'block';
    } else {
        if (noResultsElement) {
            noResultsElement.style.display = 'none';
        }
    }
}

// Generate category tabs
function generateCategoryTabs() {
    const categoryTabsContainer = document.querySelector('.category-tabs');
    categoryTabsContainer.innerHTML = '';
    
    faqData.categories.forEach(category => {
        const tabElement = document.createElement('div');
        tabElement.className = 'category-tab';
        tabElement.onclick = () => showCategory(category.id);
        tabElement.innerHTML = `
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
        `;
        categoryTabsContainer.appendChild(tabElement);
    });
}

// Generate FAQ content
function generateFAQContent() {
    const container = document.querySelector('.container.mt--8');
    
    // Remove existing FAQ categories
    const existingCategories = container.querySelectorAll('.faq-category');
    existingCategories.forEach(cat => cat.remove());
    
    // Create new FAQ categories
    faqData.categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'faq-category';
        categoryElement.id = `category-${category.id}`;
        
        category.faqs.forEach(faq => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.setAttribute('data-category', category.id);
            faqItem.innerHTML = `
                <div class="faq-question" onclick="toggleAnswer(this)">
                    <h5>${faq.question}</h5>
                    <i class="fas fa-chevron-down faq-icon"></i>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        ${faq.answer}
                    </div>
                </div>
            `;
            categoryElement.appendChild(faqItem);
        });
        
        container.appendChild(categoryElement);
    });
}

function showCategory(categoryName) {
    // Hide all categories
    const allCategories = document.querySelectorAll('.faq-category');
    allCategories.forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Remove active class from all category tabs
    const allTabs = document.querySelectorAll('.category-tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected category
    const selectedCategory = document.getElementById('category-' + categoryName);
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
    
    // Add active class to clicked tab
    event.currentTarget.classList.add('active');
}

function toggleAnswer(element) {
    const faqItem = element.closest('.faq-item');
    const searchInput = document.getElementById('faq-search');
    const isSearching = searchInput && searchInput.value.trim().length > 0;
    
    // If searching, return to category view first
    if (isSearching) {
        const categoryId = faqItem.getAttribute('data-category');
        returnToCategoryFromSearch(categoryId, faqItem);
        return;
    }
    
    const answer = element.nextElementSibling;
    const icon = element.querySelector('.faq-icon');
    
    // Close other open answers in the same category
    const category = element.closest('.faq-category');
    const otherAnswers = category.querySelectorAll('.faq-answer.active');
    const otherIcons = category.querySelectorAll('.faq-icon.active');
    
    otherAnswers.forEach(ans => {
        if (ans !== answer) {
            ans.classList.remove('active');
        }
    });
    
    otherIcons.forEach(ico => {
        if (ico !== icon) {
            ico.classList.remove('active');
        }
    });
    
    // Toggle current answer
    answer.classList.toggle('active');
    icon.classList.toggle('active');
}

// Return to category view from search and open the clicked FAQ
function returnToCategoryFromSearch(categoryId, clickedFaqItem) {
    // Clear search
    const searchInput = document.getElementById('faq-search');
    searchInput.value = '';
    
    // Reset all FAQ items
    showAllFAQs();
    
    // Hide all categories
    const allCategories = document.querySelectorAll('.faq-category');
    allCategories.forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Remove active class from all category tabs
    const allTabs = document.querySelectorAll('.category-tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show and activate the target category
    const targetCategory = document.getElementById('category-' + categoryId);
    if (targetCategory) {
        targetCategory.classList.add('active');
        
        // Activate the corresponding tab
        allTabs.forEach(tab => {
            if (tab.querySelector('span').textContent === getCategoryName(categoryId)) {
                tab.classList.add('active');
            }
        });
        
        // Find and open the clicked FAQ item in the category
        setTimeout(() => {
            const faqItems = targetCategory.querySelectorAll('.faq-item');
            faqItems.forEach((item, index) => {
                const question = item.querySelector('.faq-question h5');
                const clickedQuestion = clickedFaqItem.querySelector('.faq-question h5');
                const originalText = clickedQuestion.getAttribute('data-original-text') || clickedQuestion.textContent;
                
                if (question.textContent === originalText) {
                    const answer = item.querySelector('.faq-answer');
                    const icon = item.querySelector('.faq-icon');
                    answer.classList.add('active');
                    icon.classList.add('active');
                    
                    // Scroll to the item
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }, 100);
    }
}

// Get category name by ID
function getCategoryName(categoryId) {
    const category = faqData.categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
}

// Initialize FAQ when page loads
/**
 * Profile Dropdown Functionality
 */
function initProfileDropdown() {
    const dropdownToggle = document.getElementById('profileDropdownToggle');
    const dropdownMenu = document.getElementById('profileDropdownMenu');
    const logoutButton = document.getElementById('logoutButton');
    const profileSettings = document.getElementById('profileSettings');
    const accountSettings = document.getElementById('accountSettings');
    
    if (!dropdownToggle || !dropdownMenu) {
        return;
    }
    
    // Create overlay for closing dropdown
    const overlay = document.createElement('div');
    overlay.className = 'dropdown-overlay';
    overlay.id = 'dropdownOverlay';
    document.body.appendChild(overlay);
    
    // Toggle dropdown
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownMenu.classList.contains('show');
        
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });
    
    // Close dropdown when clicking overlay
    overlay.addEventListener('click', closeDropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
            closeDropdown();
        }
    });
    
    // Logout functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Profile settings
    if (profileSettings) {
        profileSettings.addEventListener('click', (e) => {
            e.preventDefault();
            alert('프로필 설정 페이지로 이동합니다.');
            closeDropdown();
        });
    }
    
    // Account settings
    if (accountSettings) {
        accountSettings.addEventListener('click', (e) => {
            e.preventDefault();
            alert('계정 설정 페이지로 이동합니다.');
            closeDropdown();
        });
    }
    
    function openDropdown() {
        dropdownMenu.classList.add('show');
        dropdownToggle.classList.add('active');
        overlay.classList.add('show');
    }
    
    function closeDropdown() {
        dropdownMenu.classList.remove('show');
        dropdownToggle.classList.remove('active');
        overlay.classList.remove('show');
    }
    
    function handleLogout() {
        // Confirm logout
        if (confirm('로그아웃 하시겠습니까?')) {
            // Show loading state
            logoutButton.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span>로그아웃 중...</span>
            `;
            
            // Simulate logout process
            setTimeout(() => {
                alert('로그아웃 되었습니다.');
                closeDropdown();
                
                // Reset logout button
                logoutButton.innerHTML = `
                    <i class="fas fa-sign-out-alt"></i>
                    <span>로그아웃</span>
                `;
                
                // Redirect to login page (uncomment in production)
                // window.location.href = '/login';
            }, 1000);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeFAQ();
    initProfileDropdown();
});
