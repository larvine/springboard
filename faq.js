function showCategory(categoryName) {
    // Hide all categories
    const allCategories = document.querySelectorAll('.faq-category');
    allCategories.forEach(cat => {
        cat.classList.remove('active');
    });
    
    // Remove active class from all category cards
    const allCards = document.querySelectorAll('.category-card');
    allCards.forEach(card => {
        card.classList.remove('active');
    });
    
    // Show selected category
    const selectedCategory = document.getElementById('category-' + categoryName);
    if (selectedCategory) {
        selectedCategory.classList.add('active');
    }
    
    // Add active class to clicked card
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

// Show first category by default when page loads
document.addEventListener('DOMContentLoaded', function() {
    const firstCard = document.querySelector('.category-card');
    if (firstCard) {
        firstCard.click();
    }
});
