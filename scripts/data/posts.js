import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';
import {
    getPost as dbGetPost,
    getAllPosts,
    getPublishedPosts,
    getPostsByCategory,
    searchPosts,
    incrementViews
} from './database.js';

const today = dayjs();

const dateString = today.format(
    'dddd, MMMM D'
);

/**
 * Get a single post by ID - now uses database
 * @param {number} postID - The ID of the post
 * @returns {Object|null} The blog post or null if not found
 */
export function getPost(postID) {
    return dbGetPost(postID);
}

/**
 * Get all posts - now uses database
 * @returns {Array} Array of all blog posts
 */
export function getAllBlogs() {
    return getAllPosts();
}

/**
 * Get only published posts
 * @returns {Array} Array of published posts
 */
export function getBlogs() {
    return getPublishedPosts();
}

/**
 * Get posts by category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of posts matching the category
 */
export function getBlogsByCategory(category) {
    return getPostsByCategory(category);
}

/**
 * Search posts by query
 * @param {string} query - The search query
 * @returns {Array} Array of matching posts
 */
export function searchBlogs(query) {
    return searchPosts(query);
}

/**
 * Track a post view
 * @param {number} postID - The ID of the post
 */
export function trackPostView(postID) {
    incrementViews(postID);
}

/**
 * Format post date for display
 * @param {string} isoDate - ISO date string from database
 * @returns {string} Formatted date string
 */
export function formatPostDate(isoDate) {
    return dayjs(isoDate).format('dddd, MMMM D');
}

// Legacy blogs export for backward compatibility
// This will fetch from the database
export const blogs = getPublishedPosts();