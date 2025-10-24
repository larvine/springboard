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

// Initialize FAQ when page loads
document.addEventListener('DOMContentLoaded', initializeFAQ);
