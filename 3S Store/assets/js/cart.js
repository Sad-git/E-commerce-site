// Cart state management
let cart = {
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    discountCode: ''
};

// Constants
const TAX_RATE = 0.10; // 10%
const SHIPPING_THRESHOLD = 100; // Free shipping for orders over $100
const SHIPPING_COST = 10;

// DOM Elements
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMessage = document.getElementById('empty-cart');
const subtotalElement = document.getElementById('subtotal');
const shippingElement = document.getElementById('shipping');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const discountInput = document.querySelector('.discount-code input');
const discountButton = document.querySelector('.discount-code button');

// Sample cart data for testing
const sampleCartItems = [
    {
        id: 1,
        name: "Classic White T-Shirt",
        price: 29.99,
        quantity: 1,
        size: "M",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        name: "Denim Jeans",
        price: 79.99,
        quantity: 1,
        size: "32",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        name: "Leather Jacket",
        price: 199.99,
        quantity: 1,
        size: "L",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop&q=60"
    }
];

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    setupEventListeners();
});

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Set up event listeners
function setupEventListeners() {
    // Discount code
    discountButton.addEventListener('click', applyDiscount);
    
    // Cart items events will be added when rendering items
}

// Update cart display
function updateCartDisplay() {
    if (cart.items.length === 0) {
        cartItemsContainer.style.display = 'none';
        emptyCartMessage.style.display = 'block';
        document.querySelector('.cart-container').style.display = 'none';
        return;
    }

    cartItemsContainer.style.display = 'block';
    emptyCartMessage.style.display = 'none';
    document.querySelector('.cart-container').style.display = 'grid';

    renderCartItems();
    calculateTotals();
    updateSummary();
}

// Render cart items
function renderCartItems() {
    cartItemsContainer.innerHTML = '';

    cart.items.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="product-info">
                <img src="${item.image}" alt="${item.name}" class="product-image">
                <div class="product-details">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.size}</p>
                </div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-id="${item.id}">
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>
            <div class="price">$${item.price.toFixed(2)}</div>
            <div class="total">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-btn" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;

        cartItemsContainer.appendChild(cartItem);

        // Add event listeners for this item
        const quantityInput = cartItem.querySelector('.quantity-input');
        const minusBtn = cartItem.querySelector('.minus');
        const plusBtn = cartItem.querySelector('.plus');
        const removeBtn = cartItem.querySelector('.remove-btn');

        quantityInput.addEventListener('change', (e) => updateQuantity(item.id, parseInt(e.target.value)));
        minusBtn.addEventListener('click', () => decrementQuantity(item.id));
        plusBtn.addEventListener('click', () => incrementQuantity(item.id));
        removeBtn.addEventListener('click', () => removeItem(item.id));
    });
}

// Update quantity
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;

    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
        cart.items[itemIndex].quantity = newQuantity;
        saveCart();
        updateCartDisplay();
    }
}

// Increment quantity
function incrementQuantity(itemId) {
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1 && cart.items[itemIndex].quantity < 10) {
        cart.items[itemIndex].quantity++;
        saveCart();
        updateCartDisplay();
    }
}

// Decrement quantity
function decrementQuantity(itemId) {
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1 && cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity--;
        saveCart();
        updateCartDisplay();
    }
}

// Remove item
function removeItem(itemId) {
    cart.items = cart.items.filter(item => item.id !== itemId);
    saveCart();
    updateCartDisplay();
}

// Calculate totals
function calculateTotals() {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Calculate shipping
    cart.shipping = cart.subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    // Calculate tax
    cart.tax = cart.subtotal * TAX_RATE;

    // Calculate total
    cart.total = cart.subtotal + cart.shipping + cart.tax;
}

// Update summary display
function updateSummary() {
    subtotalElement.textContent = `$${cart.subtotal.toFixed(2)}`;
    shippingElement.textContent = cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}`;
    taxElement.textContent = `$${cart.tax.toFixed(2)}`;
    totalElement.textContent = `$${cart.total.toFixed(2)}`;
}

// Apply discount code
function applyDiscount() {
    const code = discountInput.value.trim().toUpperCase();
    
    // Example discount codes
    const discounts = {
        'WELCOME10': 0.10,
        'SAVE20': 0.20,
        'SPECIAL50': 0.50
    };

    if (discounts[code]) {
        const discount = cart.subtotal * discounts[code];
        cart.total -= discount;
        updateSummary();
        
        // Show success message
        alert(`Discount applied! You saved $${discount.toFixed(2)}`);
        
        // Disable discount input and button
        discountInput.disabled = true;
        discountButton.disabled = true;
    } else {
        alert('Invalid discount code');
    }
}

// Add item to cart (called from product pages)
function addToCart(product) {
    const existingItem = cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity < 10) {
            existingItem.quantity++;
        }
    } else {
        cart.items.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
}

// Clear cart
function clearCart() {
    cart.items = [];
    saveCart();
    updateCartDisplay();
}

// Export functions for use in other scripts
window.cartFunctions = {
    addToCart,
    clearCart
}; 