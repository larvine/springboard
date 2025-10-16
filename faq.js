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
