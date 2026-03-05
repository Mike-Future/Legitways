document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('blog-search');
    const filterTags = document.querySelectorAll('.filter-tag');
    const blogCards = document.querySelectorAll('.blog-card');
    const noResults = document.querySelector('.no-results');

    let currentFilter = 'all';
    let currentSearch = '';

    // Filter by category
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentFilter = tag.dataset.filter;
            filterPosts();
        });
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        filterPosts();
    });

    function filterPosts() {
        let visibleCount = 0;

        blogCards.forEach(card => {
            const category = card.dataset.category;
            const title = card.querySelector('h2').textContent.toLowerCase();
            const text = card.querySelector('p').textContent.toLowerCase();

            const matchesCategory = currentFilter === 'all' || category === currentFilter;
            const matchesSearch = title.includes(currentSearch) || text.includes(currentSearch);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide no results message
        if (visibleCount === 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }
});