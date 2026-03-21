import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

const today = dayjs();

const dateString = today.format(
    'dddd, MMMM D'
);

export function getPost(postID) {
    let matchingPost;

    blogs.forEach((blog) => {
        if (blogsHTML.id === blogID) {
            matchingPost = blogs;
        }
    });

    return matchingPost;
}

export const blogs = [
    {
        id: 1,
        category: {
            badge: "income",
            type: "Income"
        },
        // image: ,
        readTime: '5 min read',
        title: '5 Legitimate Ways to Earn Extra Income Online',
        content: "Explore real opportunities to earn money online without falling for scams. Learn what works, what does't, and how to get started",
        publishDate: "${dateString}"
    }
]