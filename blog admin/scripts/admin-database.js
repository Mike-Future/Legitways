/**
 * Admin Database Handler
 * Provides admin-specific database operations for the blog admin panel
 */

import {
    getAllPosts,
    getPost,
    createPost,
    updatePost,
    deletePost,
    getStats,
    resetDatabase
} from '../../scripts/data/database.js';

/**
 * Load all posts into the admin dashboard
 */
function loadPostsIntoDashboard() {
    const posts = getAllPosts();
    const tbody = document.querySelector('.posts-table tbody');

    if (!tbody) return;

    if (posts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="no-posts">No posts found. Create your first post!</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = posts.map(post => `
        <tr data-post-id="${post.id}">
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td><span class="category-badge">${post.category.type}</span></td>
            <td><span class="status-badge status-${post.status}">${post.status}</span></td>
            <td>${new Date(post.publishDate).toLocaleDateString()}</td>
            <td>${post.views || 0}</td>
            <td class="actions">
                <button class="btn-edit" data-id="${post.id}">Edit</button>
                <button class="btn-delete" data-id="${post.id}">Delete</button>
                <button class="btn-view" data-id="${post.id}">View</button>
            </td>
        </tr>
    `).join('');

    attachActionHandlers();
}

/**
 * Attach event handlers to action buttons
 */
function attachActionHandlers() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = parseInt(e.target.dataset.id);
            editPost(postId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = parseInt(e.target.dataset.id);
            deletePostHandler(postId);
        });
    });

    // View buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = parseInt(e.target.dataset.id);
            viewPost(postId);
        });
    });
}

/**
 * Handle creating a new post
 * @param {Object} postData - The post data from the form
 */
function handleCreatePost(postData) {
    try {
        const newPost = createPost(postData);
        showNotification('Post created successfully!', 'success');
        loadPostsIntoDashboard();
        return newPost;
    } catch (error) {
        showNotification('Error creating post: ' + error.message, 'error');
        return null;
    }
}

/**
 * Handle updating an existing post
 * @param {number} postId - The ID of the post to update
 * @param {Object} updates - The updated post data
 */
function handleUpdatePost(postId, updates) {
    try {
        const updatedPost = updatePost(postId, updates);
        if (updatedPost) {
            showNotification('Post updated successfully!', 'success');
            loadPostsIntoDashboard();
            return updatedPost;
        } else {
            showNotification('Post not found', 'error');
            return null;
        }
    } catch (error) {
        showNotification('Error updating post: ' + error.message, 'error');
        return null;
    }
}

/**
 * Handle deleting a post
 * @param {number} postId - The ID of the post to delete
 */
function deletePostHandler(postId) {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        const deleted = deletePost(postId);
        if (deleted) {
            showNotification('Post deleted successfully!', 'success');
            loadPostsIntoDashboard();
        } else {
            showNotification('Error deleting post', 'error');
        }
    }
}

/**
 * Open edit modal with post data
 * @param {number} postId - The ID of the post to edit
 */
function editPost(postId) {
    const post = getPost(postId);
    if (!post) {
        showNotification('Post not found', 'error');
        return;
    }

    // Populate form with post data
    const form = document.querySelector('.post-form');
    if (form) {
        form.dataset.postId = postId;
        form.querySelector('[name="title"]').value = post.title;
        form.querySelector('[name="content"]').value = post.content;
        form.querySelector('[name="category"]').value = post.category.type;
        form.querySelector('[name="status"]').value = post.status;
        form.querySelector('[name="readTime"]').value = post.readTime;

        // Show modal
        const modal = document.querySelector('.post-modal');
        if (modal) modal.classList.add('active');
    }
}

/**
 * View a post (redirect to blog page)
 * @param {number} postId - The ID of the post to view
 */
function viewPost(postId) {
    window.open(`../blog page/blog-page.html?id=${postId}`, '_blank');
}

/**
 * Update dashboard statistics
 */
function updateStats() {
    const stats = getStats();

    const totalEl = document.querySelector('.stat-total');
    const publishedEl = document.querySelector('.stat-published');
    const draftsEl = document.querySelector('.stat-drafts');
    const viewsEl = document.querySelector('.stat-views');

    if (totalEl) totalEl.textContent = stats.total;
    if (publishedEl) publishedEl.textContent = stats.published;
    if (draftsEl) draftsEl.textContent = stats.drafts;
    if (viewsEl) viewsEl.textContent = stats.totalViews.toLocaleString();
}

/**
 * Show notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Export database data to JSON file
 */
function exportDatabase() {
    const posts = getAllPosts();
    const dataStr = JSON.stringify(posts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `legitways-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Import database data from JSON file
 * @param {File} file - The JSON file to import
 */
function importDatabase(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const posts = JSON.parse(e.target.result);
            if (Array.isArray(posts)) {
                localStorage.setItem('legitways_blogs', JSON.stringify(posts));
                showNotification('Database imported successfully!', 'success');
                loadPostsIntoDashboard();
                updateStats();
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            showNotification('Error importing database: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadPostsIntoDashboard();
    updateStats();

    // Set up form submission handler
    const postForm = document.querySelector('.post-form');
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(postForm);
            const postData = {
                title: formData.get('title'),
                content: formData.get('content'),
                category: {
                    type: formData.get('category'),
                    badge: formData.get('category').toLowerCase()
                },
                status: formData.get('status'),
                readTime: formData.get('readTime') || '5 min read',
                author: 'Admin'
            };

            const postId = postForm.dataset.postId;
            if (postId) {
                handleUpdatePost(parseInt(postId), postData);
            } else {
                handleCreatePost(postData);
            }

            // Close modal
            const modal = document.querySelector('.post-modal');
            if (modal) modal.classList.remove('active');
            postForm.reset();
            delete postForm.dataset.postId;
        });
    }

    // Export button
    const exportBtn = document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDatabase);
    }

    // Import button
    const importBtn = document.querySelector('.btn-import');
    const importInput = document.querySelector('.import-file');
    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => importInput.click());
        importInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                importDatabase(e.target.files[0]);
            }
        });
    }
});

export {
    loadPostsIntoDashboard,
    handleCreatePost,
    handleUpdatePost,
    deletePostHandler,
    updateStats,
    exportDatabase,
    importDatabase
};
