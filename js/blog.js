// Blog configuration
const BLOG_CONFIG = {
    baseUrl: 'https://raw.githubusercontent.com/A3lpha/A3lpha/main',
    posts: [
        {
            id: 'linux-privilege-escalation',
            file: 'blog/linux-privilege-escalation.md',
            category: 'privilege-escalation',
            date: '2023-03-15',
            author: 'Security Researcher',
            readTime: 10
        },
        {
            id: 'metasploit-payload-customization',
            file: 'blog/metasploit-payload-customization.md',
            category: 'exploit-development',
            date: '2023-02-28',
            author: 'Penetration Tester',
            readTime: 15
        },
        {
            id: 'advanced-network-enumeration',
            file: 'blog/advanced-network-enumeration.md',
            category: 'network-security',
            date: '2023-01-12',
            author: 'SOC Analyst',
            readTime: 12
        },
        {
            id: 'windows-privilege-escalation',
            file: 'blog/windows-privilege-escalation.md',
            category: 'privilege-escalation',
            date: '2023-04-05',
            author: 'Red Team Operator',
            readTime: 14
        }
    ]
};

// Initialize the blog
document.addEventListener('DOMContentLoaded', function() {
    initializeBlog();
    setupEventListeners();
});

// Initialize blog functionality
function initializeBlog() {
    loadBlogPosts();
    setupMobileMenu();
    setupCategoryFilters();
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    
    if (mobileMenu && nav) {
        mobileMenu.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('active');
                }
            });
        });
    }
}

// Setup category filters
function setupCategoryFilters() {
    const categoryLinks = document.querySelectorAll('.categories-list a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterPostsByCategory(category);
        });
    });
}

// Load all blog posts
async function loadBlogPosts() {
    const blogContent = document.getElementById('blog-content');
    
    if (!blogContent) return;
    
    try {
        blogContent.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading blog posts...</p></div>';
        
        let postsHTML = '';
        
        for (const post of BLOG_CONFIG.posts) {
            const postHTML = await loadPostPreview(post);
            postsHTML += postHTML;
        }
        
        blogContent.innerHTML = postsHTML;
        loadPopularPosts();
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogContent.innerHTML = '<div class="error-message"><p>Error loading blog posts. Please try again later.</p></div>';
    }
}

// Load individual post preview
async function loadPostPreview(post) {
    try {
        const response = await fetch(`${BLOG_CONFIG.baseUrl}/${post.file}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load ${post.file}`);
        }
        
        const markdown = await response.text();
        const excerpt = extractExcerpt(markdown);
        
        return `
            <article class="blog-post" data-category="${post.category}">
                <div class="post-header">
                    <span class="post-category">${formatCategory(post.category)}</span>
                    <h2 class="post-title">${extractTitle(markdown)}</h2>
                    <div class="post-meta">
                        <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
                        <span><i class="far fa-user"></i> By ${post.author}</span>
                        <span><i class="far fa-clock"></i> ${post.readTime} min read</span>
                    </div>
                </div>
                <div class="post-content">
                    <div class="post-excerpt">${excerpt}</div>
                    <a href="#" class="read-more" data-post="${post.id}">Continue Reading <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `;
    } catch (error) {
        console.error(`Error loading post ${post.id}:`, error);
        return `
            <article class="blog-post">
                <div class="post-header">
                    <span class="post-category">Error</span>
                    <h2 class="post-title">Failed to load post</h2>
                </div>
                <div class="post-content">
                    <p>Sorry, this post could not be loaded.</p>
                </div>
            </article>
        `;
    }
}

// Load full post when "Continue Reading" is clicked
function setupPostNavigation() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('read-more') || e.target.closest('.read-more')) {
            e.preventDefault();
            const readMoreLink = e.target.classList.contains('read-more') ? e.target : e.target.closest('.read-more');
            const postId = readMoreLink.getAttribute('data-post');
            loadFullPost(postId);
        }
    });
}

// Load full post content
async function loadFullPost(postId) {
    const post = BLOG_CONFIG.posts.find(p => p.id === postId);
    
    if (!post) {
        console.error('Post not found:', postId);
        return;
    }
    
    try {
        const response = await fetch(`${BLOG_CONFIG.baseUrl}/${post.file}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load ${post.file}`);
        }
        
        const markdown = await response.text();
        const htmlContent = marked.parse(markdown);
        
        // Replace blog content with full post
        const blogContent = document.getElementById('blog-content');
        blogContent.innerHTML = `
            <article class="blog-post">
                <div class="post-header">
                    <span class="post-category">${formatCategory(post.category)}</span>
                    <h2 class="post-title">${extractTitle(markdown)}</h2>
                    <div class="post-meta">
                        <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
                        <span><i class="far fa-user"></i> By ${post.author}</span>
                        <span><i class="far fa-clock"></i> ${post.readTime} min read</span>
                    </div>
                </div>
                <div class="post-content markdown-content">
                    ${htmlContent}
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1)">
                        <a href="#" class="read-more back-to-blog"><i class="fas fa-arrow-left"></i> Back to Blog</a>
                    </div>
                </div>
            </article>
        `;
        
        // Setup back to blog functionality
        document.querySelector('.back-to-blog').addEventListener('click', function(e) {
            e.preventDefault();
            loadBlogPosts();
        });
        
        // Apply syntax highlighting
        hljs.highlightAll();
        
    } catch (error) {
        console.error('Error loading full post:', error);
    }
}

// Load popular posts for sidebar
function loadPopularPosts() {
    const popularPostsContainer = document.getElementById('popular-posts');
    
    if (!popularPostsContainer) return;
    
    // Show first 3 posts as popular
    const popularPosts = BLOG_CONFIG.posts.slice(0, 3);
    
    let popularHTML = '';
    
    popularPosts.forEach(post => {
        popularHTML += `
            <div class="recent-post">
                <div class="recent-post-content">
                    <h4>${extractTitleFromId(post.id)}</h4>
                    <p>${post.readTime} min read • ${formatCategory(post.category)}</p>
                </div>
            </div>
        `;
    });
    
    popularPostsContainer.innerHTML = popularHTML;
}

// Filter posts by category
function filterPostsByCategory(category) {
    const posts = document.querySelectorAll('.blog-post');
    
    posts.forEach(post => {
        if (category === 'all' || post.getAttribute('data-category') === category) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
    
    // Update active category in sidebar
    const categoryLinks = document.querySelectorAll('.categories-list a');
    categoryLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-category') === category) {
            link.classList.add('active');
        }
    });
}

// Utility functions
function extractTitle(markdown) {
    const titleMatch = markdown.match(/^# (.+)$/m);
    return titleMatch ? titleMatch[1] : 'Untitled';
}

function extractTitleFromId(postId) {
    return postId.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function extractExcerpt(markdown, length = 150) {
    // Remove title
    const content = markdown.replace(/^# .+\n?/, '');
    // Remove code blocks
    const text = content.replace(/```[\s\S]*?```/g, '');
    // Get first paragraph
    const firstParagraph = text.split('\n\n')[0];
    
    if (firstParagraph && firstParagraph.length > length) {
        return firstParagraph.substring(0, length) + '...';
    }
    
    return firstParagraph || 'No excerpt available.';
}

function formatCategory(category) {
    return category.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Setup event listeners
function setupEventListeners() {
    setupPostNavigation();
    
    // Highlight.js initialization
    hljs.configure({
        languages: ['bash', 'python', 'javascript', 'html', 'css', 'json', 'xml']
    });
}