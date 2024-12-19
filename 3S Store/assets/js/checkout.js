// DOM Elements
const billingForm = document.getElementById('billing-form');
const orderItemsContainer = document.getElementById('order-items');
const subtotalElement = document.getElementById('checkout-subtotal');
const shippingElement = document.getElementById('checkout-shipping');
const taxElement = document.getElementById('checkout-tax');
const totalElement = document.getElementById('checkout-total');
const saveInfoCheckbox = document.getElementById('save-info');

// Constants
const TAX_RATE = 0.10;
const SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 10;

// Initialize checkout
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadSavedInfo();
    setupEventListeners();
});

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        const cart = JSON.parse(savedCart);
        renderOrderItems(cart.items);
        updateOrderSummary(cart);
    } else {
        window.location.href = 'cart.html';
    }
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

// Update order summary
function updateOrderSummary(cart) {
    subtotalElement.textContent = `$${cart.subtotal.toFixed(2)}`;
    shippingElement.textContent = cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}`;
    taxElement.textContent = `$${cart.tax.toFixed(2)}`;
    totalElement.textContent = `$${cart.total.toFixed(2)}`;
}

// Load saved billing information
function loadSavedInfo() {
    const savedInfo = localStorage.getItem('billingInfo');
    if (savedInfo && saveInfoCheckbox.checked) {
        const info = JSON.parse(savedInfo);
        Object.keys(info).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = info[key];
            }
        });
    }
}

// Save billing information
function saveBillingInfo() {
    if (saveInfoCheckbox.checked) {
        const billingInfo = {
            'full-name': document.getElementById('full-name').value,
            'email': document.getElementById('email').value,
            'phone': document.getElementById('phone').value,
            'address': document.getElementById('address').value,
            'city': document.getElementById('city').value,
            'state': document.getElementById('state').value,
            'zip': document.getElementById('zip').value,
            'country': document.getElementById('country').value
        };
        localStorage.setItem('billingInfo', JSON.stringify(billingInfo));
    } else {
        localStorage.removeItem('billingInfo');
    }
}

// Validate form
function validateForm() {
    const requiredFields = [
        'full-name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip',
        'country'
    ];

    let isValid = true;
    const errors = [];

    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        const value = input.value.trim();

        if (!value) {
            isValid = false;
            errors.push(`${field.replace('-', ' ')} is required`);
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    // Email validation
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        isValid = false;
        errors.push('Please enter a valid email address');
        document.getElementById('email').classList.add('error');
    }

    // Phone validation
    const phone = document.getElementById('phone').value;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
        isValid = false;
        errors.push('Please enter a valid phone number');
        document.getElementById('phone').classList.add('error');
    }

    // ZIP/Postal code validation
    const zip = document.getElementById('zip').value;
    const zipRegex = /^[\d\w\s-]{4,10}$/;
    if (!zipRegex.test(zip)) {
        isValid = false;
        errors.push('Please enter a valid ZIP/Postal code');
        document.getElementById('zip').classList.add('error');
    }

    if (!isValid) {
        showErrors(errors);
    }

    return isValid;
}

// Show form errors
function showErrors(errors) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.innerHTML = `
        <div class="error-message">
            <h3>Please correct the following errors:</h3>
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        </div>
    `;

    // Remove existing error container if any
    const existingError = document.querySelector('.error-container');
    if (existingError) {
        existingError.remove();
    }

    billingForm.insertBefore(errorContainer, billingForm.firstChild);

    // Scroll to error message
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate order ID
function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Process order
function processOrder(formData) {
    // This would typically send the order to a backend server
    // For now, we'll simulate the process
    
    const orderId = generateOrderId();
    const order = {
        id: orderId,
        date: new Date().toISOString(),
        customer: {
            name: formData.get('full-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: {
                street: formData.get('address'),
                city: formData.get('city'),
                state: formData.get('state'),
                zip: formData.get('zip'),
                country: formData.get('country')
            }
        },
        items: JSON.parse(localStorage.getItem('cart')).items,
        total: JSON.parse(localStorage.getItem('cart')).total,
        status: 'pending'
    };

    // Save order to localStorage (in a real app, this would go to a database)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    return orderId;
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    billingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateForm()) {
            const formData = new FormData(billingForm);
            
            // Save billing info if checkbox is checked
            if (saveInfoCheckbox.checked) {
                saveBillingInfo();
            }

            // Process the order
            const orderId = processOrder(formData);

            // Clear cart
            localStorage.removeItem('cart');

            // Redirect to confirmation page
            window.location.href = `confirmation.html?order=${orderId}`;
        }
    });

    // Real-time validation
    const inputs = billingForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateForm();
        });
    });

    // Save info checkbox
    saveInfoCheckbox.addEventListener('change', () => {
        if (saveInfoCheckbox.checked) {
            saveBillingInfo();
        } else {
            localStorage.removeItem('billingInfo');
        }
    });
}

// Progress step navigation (if implementing multi-step checkout)
function updateProgress(step) {
    const steps = document.querySelectorAll('.progress-step');
    const lines = document.querySelectorAll('.progress-line');

    steps.forEach((stepElement, index) => {
        if (index < step) {
            stepElement.classList.add('completed');
            stepElement.classList.remove('active');
        } else if (index === step) {
            stepElement.classList.add('active');
            stepElement.classList.remove('completed');
        } else {
            stepElement.classList.remove('completed', 'active');
        }
    });

    lines.forEach((line, index) => {
        if (index < step) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
} 