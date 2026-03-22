import { getPublishedPosts } from './database.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

/**
 * Format post date for display
 * @param {string} isoDate - ISO date string from database
 * @returns {string} Formatted date string
 */
function formatPostDate(isoDate) {
    return dayjs(isoDate).format('dddd, MMMM D');
}

/**
 * Render blogs to the page
 */
function renderBlogs(postsToRender = null) {
    const posts = postsToRender || getPublishedPosts();
    let blogsHTML = '';

    if (posts.length === 0) {
        blogsHTML = `
            <div class="no-posts">
                <p>No blog posts found. Check back later!</p>
            </div>
        `;
    } else {
        posts.forEach((post) => {
            blogsHTML += `
                <article class="blog-card" data-category="${post.category.type}">
                    <div class="blog-card-image">
                        ${post.image
                    ? `<img src="${post.image}" alt="${post.title}">`
                    : `<div class="placeholder-image">📊</div>
                        }
                    </div>
                    <div class="blog-card-content">
                        <div class="blog-meta">
                            <span class="category-badge category-${post.category.badge}">${post.category.type}</span>
                            <span class="read-time">${post.readTime}</span>
                        </div>
                        <h2>${post.title}</h2>
                        <p>${post.content}</p>
                        <div class="blog-footer">
                            <span class="publish-date">${formatPostDate(post.publishDate)}</span>
                            <a href="blog page/blog-page.html?id=${post.id}" class="read-more">Read More →</a>
                        </div>
                    </div>
                </article>
            `;
        });
    }

    const gridElement = document.querySelector('.js-blogs-grid');
    if (gridElement) {
        gridElement.innerHTML = blogsHTML;
    }
}

/**
 * Filter blogs by category
 * @param {string} category - Category to filter by
 */
function filterBlogsByCategory(category) {
    const allPosts = getPublishedPosts();
    if (category === 'all') {
        renderBlogs(allPosts);
    } else {
        const filtered = allPosts.filter(post =>
            post.category.type.toLowerCase() === category.toLowerCase()
        );
        renderBlogs(filtered);
    }
}

/**
 * Filter blogs by search query
 * @param {string} query - Search query
 */
function searchBlogs(query) {
    const allPosts = getPublishedPosts();
    const lowerQuery = query.toLowerCase();
    const filtered = allPosts.filter(post =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
    );
    renderBlogs(filtered);
}

// Initialize blogs when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    renderBlogs();

    // Set up category filter buttons if they exist
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category || 'all';
            filterBlogsByCategory(category);
        });
    });

    // Set up search input if it exists
    const searchInput = document.querySelector('.blog-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchBlogs(e.target.value);
        });
    }
});

export { renderBlogs, filterBlogsByCategory, searchBlogs };