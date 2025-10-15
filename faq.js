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
