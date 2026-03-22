/**
 * Admin Dashboard Script
 * Handles admin authentication and dashboard functionality
 */

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function () {
    // Redirect to login if not authenticated
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Initialize dashboard
    initDashboard();
});

/**
 * Initialize the admin dashboard
 */
function initDashboard() {
    // Load existing posts from the database
    loadPostsFromDatabase();
    
    // Update statistics
    updateStats();

    // Set up event listeners
    setupEventListeners();
}

/**
 * Load posts from localStorage database and display them
 */
function loadPostsFromDatabase() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;

    // Get posts from localStorage
    const stored = localStorage.getItem('legitways_blogs');
    const posts = stored ? JSON.parse(stored) : [];

    if (posts.length === 0) {
        postsList.innerHTML = `
            <div class="empty-state">
                <p>No posts yet. Create your first blog post!</p>
            </div>
        `;
        return;
    }

    // Render posts table
    postsList.innerHTML = `
        <table class="posts-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Views</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${posts.map(post => `
                    <tr data-post-id="${post.id}">
                        <td>${post.id}</td>
                        <td>${escapeHtml(post.title)}</td>
                        <td><span class="badge badge-${post.category.badge}">${post.category.type}</span></td>
                        <td><span class="status status-${post.status}">${post.status}</span></td>
                        <td>${new Date(post.publishDate).toLocaleDateString()}</td>
                        <td>${post.views || 0}</td>
                        <td class="actions">
                            <button class="btn-icon btn-edit" data-id="${post.id}" title="Edit">✏️</button>
                            <button class="btn-icon btn-delete" data-id="${post.id}" title="Delete">🗑️</button>
                            <button class="btn-icon btn-view" data-id="${post.id}" title="View">👁️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Attach action handlers
    attachPostActionHandlers();
}

/**
 * Attach event handlers to post action buttons
 */
function attachPostActionHandlers() {
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
            deletePost(postId);
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
 * Set up main event listeners
 */
function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // New post button
    const newPostBtn = document.getElementById('new-post');
    if (newPostBtn) {
        newPostBtn.addEventListener('click', () => {
            openPostModal();
        });
    }

    // Export database button
    const exportBtn = document.getElementById('export-db');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDatabase);
    }

    // Import database button
    const importBtn = document.getElementById('import-db');
    const importFile = document.getElementById('import-file');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', handleImportDatabase);
    }

    // Close modal on backdrop click
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closePostModal);
    }

    // Close modal on X button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePostModal);
    }

    // Close modal on cancel button
    const cancelBtn = document.querySelector('.modal-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closePostModal);
    }

    // Post form submission
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }
}

/**
 * Open the post modal for creating/editing
 * @param {Object} postData - Post data for editing (optional)
 */
function openPostModal(postData = null) {
    const modal = document.getElementById('post-modal');
    const form = document.getElementById('post-form');
    const title = document.getElementById('modal-title');

    if (!modal || !form) return;

    // Reset form
    form.reset();
    form.dataset.postId = '';

    if (postData) {
        // Edit mode
        title.textContent = 'Edit Post';
        form.dataset.postId = postData.id;
        form.querySelector('[name="title"]').value = postData.title;
        form.querySelector('[name="content"]').value = postData.content;
        form.querySelector('[name="category"]').value = postData.category.type;
        form.querySelector('[name="status"]').value = postData.status || 'published';
        form.querySelector('[name="readTime"]').value = postData.readTime || '5 min read';
    } else {
        // Create mode
        title.textContent = 'New Post';
    }

    modal.classList.add('active');
}

/**
 * Close the post modal
 */
function closePostModal() {
    const modal = document.getElementById('post-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Handle post form submission
 * @param {Event} e - Form submit event
 */
function handlePostSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const postId = form.dataset.postId ? parseInt(form.dataset.postId) : null;
    const formData = new FormData(form);

    const postData = {
        title: formData.get('title'),
        content: formData.get('content'),
        category: {
            type: formData.get('category'),
            badge: formData.get('category').toLowerCase()
        },
        status: formData.get('status') || 'published',
        readTime: formData.get('readTime') || '5 min read',
        author: 'Admin'
    };

    // Get existing posts
    const stored = localStorage.getItem('legitways_blogs');
    let posts = stored ? JSON.parse(stored) : [];

    if (postId) {
        // Update existing post
        const index = posts.findIndex(p => p.id === postId);
        if (index !== -1) {
            posts[index] = { ...posts[index], ...postData };
            showNotification('Post updated successfully!', 'success');
        }
    } else {
        // Create new post
        const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;
        posts.push({
            id: newId,
            ...postData,
            publishDate: new Date().toISOString(),
            views: 0
        });
        showNotification('Post created successfully!', 'success');
    }

    // Save to database
    localStorage.setItem('legitways_blogs', JSON.stringify(posts));

    // Refresh display, stats and close modal
    loadPostsFromDatabase();
    updateStats();
    closePostModal();
}

/**
 * Edit an existing post
 * @param {number} postId - The ID of the post to edit
 */
function editPost(postId) {
    const stored = localStorage.getItem('legitways_blogs');
    const posts = stored ? JSON.parse(stored) : [];
    const post = posts.find(p => p.id === postId);

    if (post) {
        openPostModal(post);
    } else {
        showNotification('Post not found', 'error');
    }
}

/**
 * Delete a post
 * @param {number} postId - The ID of the post to delete
 */
function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    const stored = localStorage.getItem('legitways_blogs');
    let posts = stored ? JSON.parse(stored) : [];

    const initialLength = posts.length;
    posts = posts.filter(p => p.id !== postId);

    if (posts.length < initialLength) {
        localStorage.setItem('legitways_blogs', JSON.stringify(posts));
        showNotification('Post deleted successfully!', 'success');
        loadPostsFromDatabase();
        updateStats();
    } else {
        showNotification('Post not found', 'error');
    }
}

/**
 * View a post on the frontend
 * @param {number} postId - The ID of the post to view
 */
function viewPost(postId) {
    window.open(`../blog page/blog-page.html?id=${postId}`, '_blank');
}

/**
 * Export database to JSON file
 */
function exportDatabase() {
    const stored = localStorage.getItem('legitways_blogs');
    const posts = stored ? JSON.parse(stored) : [];
    
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
    
    showNotification('Database exported successfully!', 'success');
}

/**
 * Handle database import from JSON file
 * @param {Event} e - Change event from file input
 */
function handleImportDatabase(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!confirm('This will replace all existing posts. Are you sure?')) {
        e.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const posts = JSON.parse(event.target.result);
            if (Array.isArray(posts)) {
                localStorage.setItem('legitways_blogs', JSON.stringify(posts));
                showNotification('Database imported successfully!', 'success');
                loadPostsFromDatabase();
                updateStats();
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            showNotification('Error importing database: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

/**
 * Update dashboard statistics
 */
function updateStats() {
    const stored = localStorage.getItem('legitways_blogs');
    const posts = stored ? JSON.parse(stored) : [];
    
    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-published').textContent = published;
    document.getElementById('stat-draft').textContent = drafts;
    document.getElementById('stat-views').textContent = totalViews.toLocaleString();
}

/**
 * Log out the admin user
 */
function logout() {
    localStorage.removeItem('loggedIn');
    window.location.href = 'login.html';
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
