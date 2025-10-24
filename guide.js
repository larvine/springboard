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
        
        try {
            // Render markdown to HTML
            const htmlContent = marked.parse(category.content);
            sectionElement.innerHTML = `<div class="markdown-content">${htmlContent}</div>`;
            
            // Add copy buttons to code blocks
            addCopyButtonsToCodeBlocks(sectionElement);
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
        
        guideContent.appendChild(sectionElement);
    });
}

// Add copy buttons to all code blocks
function addCopyButtonsToCodeBlocks(container) {
    const codeBlocks = container.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock, index) => {
        const pre = codeBlock.parentElement;
        
        // Wrap pre in a div if not already wrapped
        if (!pre.parentElement.classList.contains('code-block-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
        }
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i> 복사';
        copyButton.setAttribute('data-code-index', index);
        
        // Add click event
        copyButton.addEventListener('click', function() {
            copyCodeToClipboard(codeBlock, copyButton);
        });
        
        // Insert button into wrapper
        pre.parentElement.insertBefore(copyButton, pre);
    });
}

// Copy code to clipboard
function copyCodeToClipboard(codeBlock, button) {
    const code = codeBlock.textContent;
    
    // Use modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            showCopySuccess(button);
        }).catch(err => {
            console.error('복사 실패:', err);
            fallbackCopyToClipboard(code, button);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(code, button);
    }
}

// Fallback copy method for older browsers
function fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(button);
    } catch (err) {
        console.error('복사 실패:', err);
        button.innerHTML = '<i class="fas fa-times"></i> 실패';
    }
    
    document.body.removeChild(textArea);
}

// Show copy success feedback
function showCopySuccess(button) {
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> 복사됨!';
    button.classList.add('copied');
    
    setTimeout(() => {
        button.innerHTML = originalContent;
        button.classList.remove('copied');
    }, 2000);
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
    initializeGuide();
    initProfileDropdown();
});
