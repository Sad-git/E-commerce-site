// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Featured products data
const featuredProducts = [
    {
        id: 7,
        name: "Men's Casual Blazer",
        price: 149.99,
        rating: 4.6,
        category: "mens",
        image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        name: "Women's Floral Summer Dress",
        price: 79.99,
        rating: 4.8,
        category: "womens",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 9,
        name: "Minimalist Watch",
        price: 199.99,
        rating: 4.8,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 11,
        name: "Women's Leather Jacket",
        price: 199.99,
        rating: 4.9,
        category: "womens",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60"
    }
];

// Function to generate star rating HTML
const generateStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
};

// Function to render featured products
const renderFeaturedProducts = () => {
    const productsContainer = document.getElementById('featured-products-container');
    if (!productsContainer) {
        console.log('Featured products container not found on this page');
        return;
    }
    
    featuredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                </div>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}" data-product-name="${product.name}" data-product-price="${product.price}">
                    Add to Cart
                </button>
            </div>
        `;
        productsContainer.appendChild(productElement);
    });
};

// Cart functionality
const cart = {
    items: [],
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(this.items));
    },
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
};

// Search functionality
function setupSearchBar() {
    const searchBar = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    const handleSearch = () => {
        const searchTerm = searchBar.value.trim();
        if (searchTerm) {
            window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
        }
    };

    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    
    if (searchBar) {
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
}

// Setup add to cart functionality
function setupAddToCart() {
    // Select all add-to-cart buttons across the site
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    if (addToCartButtons.length > 0) {
        console.log('Found add-to-cart buttons:', addToCartButtons.length);
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                try {
                    e.preventDefault();
                    console.log('Add to cart clicked');
                    
                    const productId = parseInt(this.dataset.productId);
                    const productName = this.dataset.productName;
                    const productPrice = parseFloat(this.dataset.productPrice);
                    
                    console.log('Product details:', { productId, productName, productPrice });
                    
                    // Add item to cart
                    cart.addItem({
                        id: productId,
                        name: productName,
                        price: productPrice
                    });
                    
                    console.log('Item added to cart, redirecting to checkout...');
                    
                    // Redirect to checkout using window.location.replace for more reliable redirection
                    window.location.replace('checkout.html');
                } catch (error) {
                    console.error('Error in add to cart:', error);
                }
            });
        });
    }
}

// Initialize main functionality
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();
    setupSearchBar();
    updateNavigationAuth();
    
    // Only try to render featured products if we're on the right page
    const productsContainer = document.getElementById('featured-products-container');
    if (productsContainer) {
        renderFeaturedProducts();
    }
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart.items = JSON.parse(savedCart);
    }
    
    // Setup add to cart functionality for all pages
    setupAddToCart();
});

// Newsletter form submission
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        // This would typically send the email to a backend service
        alert('Thank you for subscribing to our newsletter!');
        newsletterForm.reset();
    });
}

// Check authentication and update navigation
async function updateNavigationAuth() {
    try {
        // For development, we'll assume user is not authenticated
        // In production, this would be replaced with actual API call
        const isAuthenticated = false;

        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) {
            console.log('Navigation links container not found');
            return;
        }

        const accountLink = navLinks.querySelector('a[href="account.html"]');
        if (accountLink) {
            accountLink.style.display = isAuthenticated ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });
    }
}

// ... existing code ... 