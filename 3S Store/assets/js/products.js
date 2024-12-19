// Sample products data (This would typically come from a backend API)
const products = [
    {
        id: 1,
        name: "Men's Classic White Oxford Shirt",
        price: 49.99,
        rating: 4.5,
        category: "mens",
        size: ["S", "M", "L", "XL"],
        color: "white",
        image: "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        name: "Women's Floral Summer Dress",
        price: 79.99,
        rating: 4.8,
        category: "womens",
        size: ["XS", "S", "M", "L"],
        color: "blue",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        name: "Leather Crossbody Bag",
        price: 89.99,
        rating: 4.7,
        category: "accessories",
        color: "brown",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 4,
        name: "Men's Slim Fit Denim Jeans",
        price: 69.99,
        rating: 4.6,
        category: "mens",
        size: ["30x32", "32x32", "34x32", "36x32"],
        color: "blue",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 5,
        name: "Women's High-Waist Yoga Pants",
        price: 54.99,
        rating: 4.9,
        category: "womens",
        size: ["XS", "S", "M", "L", "XL"],
        color: "black",
        image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 6,
        name: "Classic Aviator Sunglasses",
        price: 129.99,
        rating: 4.7,
        category: "accessories",
        color: "gold",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 7,
        name: "Men's Casual Blazer",
        price: 149.99,
        rating: 4.6,
        category: "mens",
        size: ["S", "M", "L", "XL"],
        color: "navy",
        image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 8,
        name: "Women's Knit Sweater",
        price: 64.99,
        rating: 4.5,
        category: "womens",
        size: ["S", "M", "L"],
        color: "beige",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 9,
        name: "Minimalist Watch",
        price: 199.99,
        rating: 4.8,
        category: "accessories",
        color: "silver",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 10,
        name: "Men's Running Shoes",
        price: 119.99,
        rating: 4.7,
        category: "mens",
        size: ["8", "9", "10", "11", "12"],
        color: "gray",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 11,
        name: "Women's Leather Jacket",
        price: 199.99,
        rating: 4.9,
        category: "womens",
        size: ["XS", "S", "M", "L"],
        color: "black",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 12,
        name: "Designer Tote Bag",
        price: 159.99,
        rating: 4.6,
        category: "accessories",
        color: "tan",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 13,
        name: "Men's Polo Shirt",
        price: 39.99,
        rating: 4.5,
        category: "mens",
        size: ["S", "M", "L", "XL"],
        color: "navy",
        image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 14,
        name: "Women's Maxi Skirt",
        price: 69.99,
        rating: 4.7,
        category: "womens",
        size: ["XS", "S", "M", "L"],
        color: "floral",
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 15,
        name: "Leather Wallet",
        price: 49.99,
        rating: 4.8,
        category: "accessories",
        color: "brown",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=60"
    }
];

// State management
let currentState = {
    products: products,
    filters: {
        priceRange: { min: 0, max: 1000 },
        categories: [],
        sizes: [],
        colors: []
    },
    sort: "featured",
    currentPage: 1,
    itemsPerPage: 12
};

// DOM Elements
const productsContainer = document.getElementById('products-container');
const sortSelect = document.getElementById('sort-select');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');
const priceRange = document.getElementById('price-range');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    setupEventListeners();
    
    // Load initial products
    renderProducts();
    
    // Check URL parameters for any filters
    applyUrlFilters();
});

// Set up event listeners
function setupEventListeners() {
    // Sorting
    sortSelect.addEventListener('change', handleSort);
    
    // Filters
    applyFiltersBtn.addEventListener('click', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Price range
    priceRange.addEventListener('input', updatePriceInputs);
    minPriceInput.addEventListener('change', updatePriceRange);
    maxPriceInput.addEventListener('change', updatePriceRange);
    
    // Checkboxes
    document.querySelectorAll('.checkbox-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.closest('.filter-section').querySelector('h3').textContent === 'Categories') {
                updateFilters('categories', checkbox);
            } else if (checkbox.closest('.filter-section').querySelector('h3').textContent === 'Size') {
                updateFilters('sizes', checkbox);
            }
        });
    });
    
    // Color options
    document.querySelectorAll('.color-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateFilters('colors', checkbox);
        });
    });
}

// Handle sorting
function handleSort(e) {
    currentState.sort = e.target.value;
    renderProducts();
}

// Apply filters
function applyFilters() {
    currentState.currentPage = 1;
    filterProducts();
    renderProducts();
    updateUrl();
}

// Clear all filters
function clearFilters() {
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset price range
    priceRange.value = 1000;
    minPriceInput.value = '';
    maxPriceInput.value = '';
    
    // Reset state
    currentState.filters = {
        priceRange: { min: 0, max: 1000 },
        categories: [],
        sizes: [],
        colors: []
    };
    
    // Reset sort
    sortSelect.value = 'featured';
    currentState.sort = 'featured';
    
    // Reset page
    currentState.currentPage = 1;
    
    // Rerender
    filterProducts();
    renderProducts();
    updateUrl();
}

// Update price inputs when range slider changes
function updatePriceInputs(e) {
    const value = e.target.value;
    minPriceInput.value = 0;
    maxPriceInput.value = value;
    currentState.filters.priceRange.max = Number(value);
}

// Update range slider when price inputs change
function updatePriceRange() {
    const min = Number(minPriceInput.value) || 0;
    const max = Number(maxPriceInput.value) || 1000;
    
    currentState.filters.priceRange = { min, max };
    priceRange.value = max;
}

// Update filters when checkboxes change
function updateFilters(filterType, checkbox) {
    const value = checkbox.value;
    const isChecked = checkbox.checked;
    
    if (isChecked) {
        currentState.filters[filterType].push(value);
    } else {
        currentState.filters[filterType] = currentState.filters[filterType].filter(item => item !== value);
    }
}

// Filter products based on current state
function filterProducts() {
    currentState.products = products.filter(product => {
        // Price filter
        const price = product.price;
        const { min, max } = currentState.filters.priceRange;
        if (price < min || price > max) return false;
        
        // Category filter
        if (currentState.filters.categories.length > 0 && 
            !currentState.filters.categories.includes(product.category)) {
            return false;
        }
        
        // Size filter
        if (currentState.filters.sizes.length > 0 && 
            !product.size.some(size => currentState.filters.sizes.includes(size))) {
            return false;
        }
        
        // Color filter
        if (currentState.filters.colors.length > 0 && 
            !currentState.filters.colors.includes(product.color)) {
            return false;
        }
        
        return true;
    });
}

// Sort products
function sortProducts(products) {
    switch (currentState.sort) {
        case 'price-low':
            return [...products].sort((a, b) => a.price - b.price);
        case 'price-high':
            return [...products].sort((a, b) => b.price - a.price);
        case 'newest':
            return [...products].sort((a, b) => b.id - a.id);
        case 'popular':
            return [...products].sort((a, b) => b.rating - a.rating);
        default:
            return products;
    }
}

// Render products
function renderProducts() {
    const sortedProducts = sortProducts(currentState.products);
    const startIndex = (currentState.currentPage - 1) * currentState.itemsPerPage;
    const endIndex = startIndex + currentState.itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
    
    productsContainer.innerHTML = '';
    
    if (paginatedProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    paginatedProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${generateStarRating(product.rating)}
                </div>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;
        productsContainer.appendChild(productElement);
    });
    
    renderPagination(sortedProducts.length);
}

// Render pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / currentState.itemsPerPage);
    const pagination = document.querySelector('.pagination');
    
    pagination.innerHTML = `
        <button class="pagination-btn" ${currentState.currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentState.currentPage - 1 && i <= currentState.currentPage + 1)) {
            pagination.innerHTML += `
                <button class="pagination-btn ${i === currentState.currentPage ? 'active' : ''}">${i}</button>
            `;
        } else if (i === currentState.currentPage - 2 || i === currentState.currentPage + 2) {
            pagination.innerHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    pagination.innerHTML += `
        <button class="pagination-btn" ${currentState.currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // Add click events to pagination buttons
    document.querySelectorAll('.pagination-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            
            if (button.children[0]?.classList.contains('fa-chevron-left')) {
                currentState.currentPage--;
            } else if (button.children[0]?.classList.contains('fa-chevron-right')) {
                currentState.currentPage++;
            } else {
                currentState.currentPage = Number(button.textContent);
            }
            
            renderProducts();
            updateUrl();
        });
    });
}

// Update URL with current filters
function updateUrl() {
    const params = new URLSearchParams();
    
    // Add filters to URL
    if (currentState.filters.categories.length > 0) {
        params.set('categories', currentState.filters.categories.join(','));
    }
    if (currentState.filters.sizes.length > 0) {
        params.set('sizes', currentState.filters.sizes.join(','));
    }
    if (currentState.filters.colors.length > 0) {
        params.set('colors', currentState.filters.colors.join(','));
    }
    if (currentState.filters.priceRange.min > 0 || currentState.filters.priceRange.max < 1000) {
        params.set('price', `${currentState.filters.priceRange.min},${currentState.filters.priceRange.max}`);
    }
    
    // Add sort and page to URL
    if (currentState.sort !== 'featured') {
        params.set('sort', currentState.sort);
    }
    if (currentState.currentPage > 1) {
        params.set('page', currentState.currentPage);
    }
    
    // Update URL
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
}

// Apply filters from URL
function applyUrlFilters() {
    const params = new URLSearchParams(window.location.search);
    
    // Apply categories
    const categories = params.get('categories')?.split(',') || [];
    categories.forEach(category => {
        const checkbox = document.querySelector(`input[type="checkbox"][value="${category}"]`);
        if (checkbox) {
            checkbox.checked = true;
            currentState.filters.categories.push(category);
        }
    });
    
    // Apply sizes
    const sizes = params.get('sizes')?.split(',') || [];
    sizes.forEach(size => {
        const checkbox = document.querySelector(`input[type="checkbox"][value="${size}"]`);
        if (checkbox) {
            checkbox.checked = true;
            currentState.filters.sizes.push(size);
        }
    });
    
    // Apply colors
    const colors = params.get('colors')?.split(',') || [];
    colors.forEach(color => {
        const checkbox = document.querySelector(`input[type="checkbox"][value="${color}"]`);
        if (checkbox) {
            checkbox.checked = true;
            currentState.filters.colors.push(color);
        }
    });
    
    // Apply price range
    const price = params.get('price')?.split(',');
    if (price) {
        currentState.filters.priceRange.min = Number(price[0]);
        currentState.filters.priceRange.max = Number(price[1]);
        minPriceInput.value = price[0];
        maxPriceInput.value = price[1];
        priceRange.value = price[1];
    }
    
    // Apply sort
    const sort = params.get('sort');
    if (sort) {
        currentState.sort = sort;
        sortSelect.value = sort;
    }
    
    // Apply page
    const page = params.get('page');
    if (page) {
        currentState.currentPage = Number(page);
    }
    
    // Apply filters and render
    if (categories.length > 0 || sizes.length > 0 || colors.length > 0 || price) {
        filterProducts();
    }
    renderProducts();
}

// Update product prices (multiply existing prices by 120 to convert USD to NPR)
const updatePrices = () => {
    const priceElements = document.querySelectorAll('.product-price');
    priceElements.forEach(element => {
        const usdPrice = parseFloat(element.textContent.replace('$', ''));
        const nprPrice = Math.round(usdPrice * 120);
        element.textContent = `NPR ${nprPrice.toLocaleString()}`;
    });
};

// Cart item template
const createCartItemCard = (product) => `
    <div class="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <img src="${product.image}" alt="${product.name}" class="w-20 h-20 object-cover rounded-md">
            <div>
                <h3 class="font-semibold text-lg">${product.name}</h3>
                <p class="text-gray-600">NPR ${product.price.toLocaleString()}</p>
            </div>
        </div>
        <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
                <button onclick="handleUpdateQuantity(${product.id}, -1)" 
                        class="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300">-</button>
                <span class="w-8 text-center">${product.quantity}</span>
                <button onclick="handleUpdateQuantity(${product.id}, 1)"
                        class="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300">+</button>
            </div>
            <button onclick="handleRemoveFromCart(${product.id})"
                    class="text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    </div>
`;

// Update cart total
const updateCartTotal = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
        totalElement.textContent = `NPR ${total.toLocaleString()}`;
    }
    
    return total;
};

// Render cart items
const renderCartItems = () => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const cartContainer = document.getElementById('cartItems');
    
    if (cartContainer) {
        cartContainer.innerHTML = cartItems.length 
            ? cartItems.map(item => createCartItemCard(item)).join('')
            : '<p class="text-center text-gray-500">Your cart is empty</p>';
        
        updateCartTotal();
    }
};

// Handle quantity updates
const handleUpdateQuantity = (productId, change) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const itemIndex = cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
        cartItems[itemIndex].quantity = Math.max(1, cartItems[itemIndex].quantity + change);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        renderCartItems();
    }
};

// Handle remove from cart
const handleRemoveFromCart = (productId) => {
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const updatedItems = cartItems.filter(item => item.id !== productId);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    renderCartItems();
    showToast('Item removed from cart');
};

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    updatePrices();
    renderCartItems();
}); 