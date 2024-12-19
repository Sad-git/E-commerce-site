// DOM Elements
const newsletterForm = document.querySelector('.newsletter-form');
const collectionCards = document.querySelectorAll('.collection-card');
const categoryCards = document.querySelectorAll('.category-card');
const trendingCards = document.querySelectorAll('.trending-card');
const specialCards = document.querySelectorAll('.special-card');

// Initialize collections page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeAnimations();
    loadCollectionStats();
});

// Set up event listeners
function setupEventListeners() {
    // Newsletter form submission
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }

    // Collection card interactions
    collectionCards.forEach(card => {
        card.addEventListener('mouseenter', handleCollectionHover);
        card.addEventListener('mouseleave', handleCollectionLeave);
    });

    // Category card interactions
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', handleCategoryHover);
        card.addEventListener('mouseleave', handleCategoryLeave);
    });

    // Trending card interactions
    trendingCards.forEach(card => {
        card.addEventListener('click', handleTrendingClick);
    });

    // Special card interactions
    specialCards.forEach(card => {
        card.addEventListener('mouseenter', handleSpecialHover);
        card.addEventListener('mouseleave', handleSpecialLeave);
    });
}

// Initialize animations
function initializeAnimations() {
    // Add animation classes to elements as they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe elements
    document.querySelectorAll('.collection-card, .category-card, .trending-card, .special-card').forEach(el => {
        observer.observe(el);
    });
}

// Load collection statistics
async function loadCollectionStats() {
    try {
        const response = await fetch('/api/collections.php/stats');
        const data = await response.json();

        if (data.status === 'success') {
            updateCollectionStats(data.data);
        }
    } catch (error) {
        console.error('Error loading collection stats:', error);
    }
}

// Update collection statistics
function updateCollectionStats(stats) {
    // Update trending stats
    document.querySelectorAll('.trending-stats').forEach(statContainer => {
        const collectionId = statContainer.closest('.trending-card').dataset.collectionId;
        if (stats[collectionId]) {
            const { likes, orders } = stats[collectionId];
            statContainer.querySelector('.fa-heart').nextSibling.textContent = ` ${formatNumber(likes)} Likes`;
            statContainer.querySelector('.fa-shopping-bag').nextSibling.textContent = ` ${formatNumber(orders)}+ Orders`;
        }
    });
}

// Handle newsletter form submission
async function handleNewsletterSubmit(e) {
    e.preventDefault();

    const email = e.target.querySelector('input[type="email"]').value;
    const button = e.target.querySelector('button');

    try {
        button.disabled = true;
        button.textContent = 'Subscribing...';

        const response = await fetch('/api/newsletter.php/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.status === 'success') {
            showNotification('Successfully subscribed to newsletter!', 'success');
            e.target.reset();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        showNotification('Error subscribing to newsletter', 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Subscribe';
    }
}

// Handle collection card hover
function handleCollectionHover(e) {
    const card = e.currentTarget;
    const info = card.querySelector('.collection-info');
    
    // Add hover effects
    info.style.transform = 'translateY(0)';
    info.style.opacity = '1';
}

// Handle collection card leave
function handleCollectionLeave(e) {
    const card = e.currentTarget;
    const info = card.querySelector('.collection-info');
    
    // Remove hover effects
    info.style.transform = 'translateY(10px)';
    info.style.opacity = '0.8';
}

// Handle category card hover
function handleCategoryHover(e) {
    const card = e.currentTarget;
    const info = card.querySelector('.category-info');
    
    // Add hover effects
    info.style.opacity = '1';
    card.querySelector('img').style.transform = 'scale(1.1)';
}

// Handle category card leave
function handleCategoryLeave(e) {
    const card = e.currentTarget;
    const info = card.querySelector('.category-info');
    
    // Remove hover effects
    info.style.opacity = '0';
    card.querySelector('img').style.transform = 'scale(1)';
}

// Handle trending card click
function handleTrendingClick(e) {
    const card = e.currentTarget;
    const collectionId = card.dataset.collectionId;
    
    // Navigate to collection page
    if (!e.target.closest('a')) {
        window.location.href = `products.html?collection=${collectionId}`;
    }
}

// Handle special card hover
function handleSpecialHover(e) {
    const card = e.currentTarget;
    const overlay = card.querySelector('.special-overlay');
    const content = card.querySelector('.special-content');
    
    // Add hover effects
    overlay.style.background = 'rgba(0,0,0,0.7)';
    content.style.transform = 'scale(1.05)';
}

// Handle special card leave
function handleSpecialLeave(e) {
    const card = e.currentTarget;
    const overlay = card.querySelector('.special-overlay');
    const content = card.querySelector('.special-content');
    
    // Remove hover effects
    overlay.style.background = 'rgba(0,0,0,0.5)';
    content.style.transform = 'scale(1)';
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Export functions for use in other scripts
window.collections = {
    loadCollectionStats,
    updateCollectionStats
}; 