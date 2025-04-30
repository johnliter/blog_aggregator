document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Initialize particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#64ffda" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#64ffda", opacity: 0.2, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" }
                }
            }
        });
    }
    
    // For the homepage only
    if (document.querySelector('.posts-grid')) {
        // Load posts from JSON files
        loadAllPosts();
        
        // Search functionality
        document.getElementById('searchButton').addEventListener('click', searchPosts);
        document.getElementById('searchInput').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') searchPosts();
        });
        
        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterPosts(this.dataset.filter);
            });
        });
    }
    
    // For contact page form
    if (document.getElementById('contactForm')) {
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! I will get back to you soon.');
            this.reset();
        });
    }
});

// Load all posts from JSON files
async function loadAllPosts() {
    const postsContainer = document.getElementById('postsContainer');
    
    try {
        // Load posts from each platform
        const platforms = ['wordpress', 'devto', 'hashnode', 'dailydev', 'kofi'];
        const allPosts = [];
        
        for (const platform of platforms) {
            try {
                const response = await fetch(`data/${platform}.json`);
                if (!response.ok) continue; // Skip if file doesn't exist
                
                const posts = await response.json();
                posts.forEach(post => {
                    post.source = platform;
                    allPosts.push(post);
                });
            } catch (error) {
                console.error(`Error loading ${platform} posts:`, error);
            }
        }
        
        // Sort by date (newest first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Display posts
        displayPosts(allPosts);
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unable to load posts at this time. Please try again later.</p>
            </div>
        `;
    }
}

// Display posts in the grid
function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-newspaper"></i>
                <p>No posts found. Add some posts to the JSON files!</p>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const postCard = document.createElement('div');
        postCard.className = `post-card ${post.source}`;
        postCard.innerHTML = `
            <div class="post-image" style="background-image: url('${post.image || getDefaultImage(post.source)}')">
                <span class="post-source">${formatSource(post.source)}</span>
            </div>
            <div class="post-content">
                <p class="post-date">${formatDate(post.date)}</p>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <a href="${post.url}" class="read-more" target="_blank" rel="noopener noreferrer">Read more <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        postsContainer.appendChild(postCard);
    });
}

// Get default image based on platform
function getDefaultImage(source) {
    const defaultImages = {
        wordpress: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        devto: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        hashnode: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        dailydev: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
        kofi: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80'
    };
    return defaultImages[source] || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
}

function formatSource(source) {
    const sources = {
        wordpress: "WordPress",
        dailydev: "Daily.dev",
        hashnode: "Hashnode",
        devto: "Dev.to",
        kofi: "Ko-fi"
    };
    return sources[source] || source;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const posts = document.querySelectorAll('.post-card');
    
    posts.forEach(post => {
        const title = post.querySelector('.post-title').textContent.toLowerCase();
        const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

function filterPosts(filter) {
    const posts = document.querySelectorAll('.post-card');
    
    posts.forEach(post => {
        if (filter === 'all' || post.classList.contains(filter)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}