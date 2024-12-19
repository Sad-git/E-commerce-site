// DOM Elements
const orderDateElement = document.getElementById('order-date');
const orderIdElement = document.getElementById('order-id');
const orderItemsContainer = document.getElementById('order-items');
const shippingDetailsContainer = document.getElementById('shipping-details');
const subtotalElement = document.getElementById('confirmation-subtotal');
const shippingElement = document.getElementById('confirmation-shipping');
const taxElement = document.getElementById('confirmation-tax');
const totalElement = document.getElementById('confirmation-total');

// Initialize confirmation page
document.addEventListener('DOMContentLoaded', () => {
    const orderId = getOrderIdFromUrl();
    if (orderId) {
        loadOrderDetails(orderId);
    } else {
        window.location.href = 'index.html';
    }
});

// Get order ID from URL parameters
function getOrderIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('order');
}

// Load order details
function loadOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(order => order.id === orderId);

    if (order) {
        displayOrderDetails(order);
    } else {
        window.location.href = 'index.html';
    }
}

// Display order details
function displayOrderDetails(order) {
    // Display order ID and date
    orderIdElement.textContent = order.id;
    orderDateElement.textContent = formatDate(order.date);

    // Display order items
    renderOrderItems(order.items);

    // Display shipping details
    renderShippingDetails(order.customer);

    // Display order summary
    updateOrderSummary(order);
}

// Format date
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Render order items
function renderOrderItems(items) {
    orderItemsContainer.innerHTML = '';

    items.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="order-item-image">
            <div class="order-item-details">
                <h3 class="order-item-name">${item.name}</h3>
                <p class="order-item-price">$${item.price.toFixed(2)}</p>
                <p class="order-item-quantity">Quantity: ${item.quantity}</p>
            </div>
        `;
        orderItemsContainer.appendChild(orderItem);
    });
}

// Render shipping details
function renderShippingDetails(customer) {
    shippingDetailsContainer.innerHTML = `
        <div class="shipping-detail">
            <h4>Contact Information</h4>
            <p>${customer.name}</p>
            <p>${customer.email}</p>
            <p>${customer.phone}</p>
        </div>
        <div class="shipping-detail">
            <h4>Shipping Address</h4>
            <p>${customer.address.street}</p>
            <p>${customer.address.city}, ${customer.address.state} ${customer.address.zip}</p>
            <p>${customer.address.country}</p>
        </div>
    `;
}

// Update order summary
function updateOrderSummary(order) {
    // Calculate subtotal
    const subtotal = order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Calculate shipping (free for orders over $100)
    const shipping = subtotal >= 100 ? 0 : 10;
    
    // Calculate tax (10%)
    const tax = subtotal * 0.10;
    
    // Update display
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${order.total.toFixed(2)}`;
}

// Send confirmation email (simulated)
function sendConfirmationEmail(order) {
    console.log(`Confirmation email sent to ${order.customer.email}`);
    // In a real application, this would make an API call to your email service
}

// Track order (simulated)
function trackOrder(orderId) {
    console.log(`Tracking order: ${orderId}`);
    // In a real application, this would integrate with your shipping provider's API
}

// Print order (optional functionality)
function printOrder() {
    window.print();
}

// Add event listeners for additional functionality
document.addEventListener('DOMContentLoaded', () => {
    // Print button (if implemented)
    const printButton = document.querySelector('.print-order');
    if (printButton) {
        printButton.addEventListener('click', printOrder);
    }

    // Track order button (if implemented)
    const trackButton = document.querySelector('.track-order');
    if (trackButton) {
        trackButton.addEventListener('click', () => {
            const orderId = getOrderIdFromUrl();
            if (orderId) {
                trackOrder(orderId);
            }
        });
    }
});

// Handle print media styles
window.onbeforeprint = function() {
    // Add any specific styling for printing
    document.body.classList.add('printing');
};

window.onafterprint = function() {
    // Remove print-specific styling
    document.body.classList.remove('printing');
}; 