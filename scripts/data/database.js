/**
 * Database Module with localStorage Persistence
 * Provides CRUD operations for blog posts
 */

const DB_KEY = 'legitways_blogs';
const DB_VERSION = '1';

// Default initial posts data
const initialPosts = [
    {
        id: 1,
        category: {
            badge: "income",
            type: "Income"
        },
        image: null,
        readTime: '5 min read',
        title: '5 Legitimate Ways to Earn Extra Income Online',
        content: "Explore real opportunities to earn money online without falling for scams. Learn what works, what doesn't, and how to get started.",
        publishDate: new Date().toISOString(),
        author: 'Admin',
        status: 'published',
        views: 0
    },
    {
        id: 2,
        category: {
            badge: "tips",
            type: "Tips"
        },
        image: null,
        readTime: '3 min read',
        title: 'How to Avoid Common Online Scams',
        content: "Protect yourself from fraudsters with these essential tips for staying safe online.",
        publishDate: new Date().toISOString(),
        author: 'Admin',
        status: 'published',
        views: 0
    }
];

/**
 * Initialize the database
 * Loads data from localStorage or creates with initial data
 */
function initDatabase() {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
        localStorage.setItem(DB_KEY, JSON.stringify(initialPosts));
        localStorage.setItem(`${DB_KEY}_version`, DB_VERSION);
    }
}

/**
 * Get all posts from the database
 * @returns {Array} Array of blog posts
 */
function getAllPosts() {
    initDatabase();
    const stored = localStorage.getItem(DB_KEY);
    return stored ? JSON.parse(stored) : [];
}

/**
 * Get a single post by ID
 * @param {number} postId - The ID of the post to retrieve
 * @returns {Object|null} The blog post or null if not found
 */
function getPost(postId) {
    const posts = getAllPosts();
    return posts.find(post => post.id === postId) || null;
}

/**
 * Get posts by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of posts matching the category
 */
function getPostsByCategory(category) {
    const posts = getAllPosts();
    return posts.filter(post => post.category.type === category);
}

/**
 * Get published posts only
 * @returns {Array} Array of published posts
 */
function getPublishedPosts() {
    const posts = getAllPosts();
    return posts.filter(post => post.status === 'published');
}

/**
 * Create a new post
 * @param {Object} postData - The post data to create
 * @returns {Object} The created post with generated ID
 */
function createPost(postData) {
    const posts = getAllPosts();
    const newId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1;

    const newPost = {
        id: newId,
        ...postData,
        publishDate: new Date().toISOString(),
        views: 0
    };

    posts.push(newPost);
    savePosts(posts);
    return newPost;
}

/**
 * Update an existing post
 * @param {number} postId - The ID of the post to update
 * @param {Object} updates - The fields to update
 * @returns {Object|null} The updated post or null if not found
 */
function updatePost(postId, updates) {
    const posts = getAllPosts();
    const index = posts.findIndex(post => post.id === postId);

    if (index === -1) return null;

    posts[index] = { ...posts[index], ...updates };
    savePosts(posts);
    return posts[index];
}

/**
 * Delete a post by ID
 * @param {number} postId - The ID of the post to delete
 * @returns {boolean} True if deleted, false if not found
 */
function deletePost(postId) {
    const posts = getAllPosts();
    const filtered = posts.filter(post => post.id !== postId);

    if (filtered.length === posts.length) return false;

    savePosts(filtered);
    return true;
}

/**
 * Increment post view count
 * @param {number} postId - The ID of the post to increment views for
 */
function incrementViews(postId) {
    const post = getPost(postId);
    if (post) {
        post.views = (post.views || 0) + 1;
        updatePost(postId, { views: post.views });
    }
}

/**
 * Search posts by title or content
 * @param {string} query - The search query
 * @returns {Array} Array of matching posts
 */
function searchPosts(query) {
    const posts = getAllPosts();
    const lowerQuery = query.toLowerCase();
    return posts.filter(post =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Save posts to localStorage
 * @param {Array} posts - Array of posts to save
 */
function savePosts(posts) {
    localStorage.setItem(DB_KEY, JSON.stringify(posts));
}

/**
 * Reset database to initial state
 */
function resetDatabase() {
    localStorage.setItem(DB_KEY, JSON.stringify(initialPosts));
    localStorage.setItem(`${DB_KEY}_version`, DB_VERSION);
}

/**
 * Get database statistics
 * @returns {Object} Statistics about the database
 */
function getStats() {
    const posts = getAllPosts();
    return {
        total: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        drafts: posts.filter(p => p.status === 'draft').length,
        totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0)
    };
}

// Export the database API
export {
    initDatabase,
    getAllPosts,
    getPost,
    getPostsByCategory,
    getPublishedPosts,
    createPost,
    updatePost,
    deletePost,
    incrementViews,
    searchPosts,
    savePosts,
    resetDatabase,
    getStats
};
