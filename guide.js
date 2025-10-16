// Initialize Guide with loaded data
function initializeGuide() {
    if (!guideData) {
        console.error('가이드 데이터가 로드되지 않았습니다.');
        return;
    }
    
    // Configure marked.js options
    marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        mangle: false
    });
    
    // Generate category tabs
    generateCategoryTabs();
    
    // Generate guide sections
    generateGuideSections();
    
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
    
    guideData.categories.forEach(category => {
        const tabElement = document.createElement('div');
        tabElement.className = 'category-tab';
        tabElement.onclick = () => showGuide(category.id);
        tabElement.innerHTML = `
            <i class="${category.icon}"></i>
            <span>${category.name}</span>
        `;
        categoryTabsContainer.appendChild(tabElement);
    });
}

// Generate guide sections
function generateGuideSections() {
    const guideContent = document.querySelector('.guide-content');
    guideContent.innerHTML = '';
    
    guideData.categories.forEach(category => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'guide-section';
        sectionElement.id = `guide-${category.id}`;
        
        // Render markdown content directly
        renderMarkdownContent(category.id, category.content);
        
        guideContent.appendChild(sectionElement);
    });
}

// Render markdown content
function renderMarkdownContent(categoryId, markdownText) {
    const sectionElement = document.getElementById(`guide-${categoryId}`);
    
    try {
        // Render markdown to HTML
        const htmlContent = marked.parse(markdownText);
        
        // Update section content
        sectionElement.innerHTML = `<div class="markdown-content">${htmlContent}</div>`;
    } catch (error) {
        console.error(`마크다운 렌더링 실패:`, error);
        sectionElement.innerHTML = `
            <div class="markdown-content">
                <p style="color: #f56565;">
                    <i class="fas fa-exclamation-triangle"></i>
                    콘텐츠를 렌더링하는데 실패했습니다.
                </p>
            </div>
        `;
    }
}

// Show specific guide section
function showGuide(categoryId) {
    // Hide all sections
    const allSections = document.querySelectorAll('.guide-section');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.category-tab');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`guide-${categoryId}`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Add active class to clicked tab
    event.currentTarget.classList.add('active');
}

// Initialize guide when page loads
document.addEventListener('DOMContentLoaded', initializeGuide);
