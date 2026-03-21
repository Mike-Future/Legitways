let blogsHTML = '';

blogs.forEach((blog) => [
    blogsHTML += `
    <article class="blog-card" data-category="${post.category.type}">
        <div class="blog-card-image">
            <div class="placeholder-image">📊</div>
        </div>
        <div class="blog-card-content">
            <div class="blog-meta">
                <span class="category-badge">${post.category.badge}</span>
                <span class="read-time">${post.readTime}</span>
            </div>
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <div class="blog-footer">
                <span class="publish-date">${post.publishDate}</span>
                <a href="${post.id}" class="read-more">Read More →</a>
            </div>
        </div>
    </article>
    `
]);

document.querySelector('js-blogs-grid')
    .innerHTML = blogsHTML;



// ${post.image}