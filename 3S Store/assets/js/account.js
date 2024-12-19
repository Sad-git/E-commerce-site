// DOM Elements
const accountNav = document.querySelector('.account-nav');
const tabContents = document.querySelectorAll('.tab-content');
const profileForm = document.querySelector('.profile-form');
const passwordForm = document.querySelector('.password-form');
const editAvatarButton = document.querySelector('.edit-avatar');
const removeButtons = document.querySelectorAll('.remove-button');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const addressActions = document.querySelectorAll('.address-actions button');
const addAddressButton = document.querySelector('.add-address');
const settingsToggles = document.querySelectorAll('.switch input');

// Initialize account page
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication first
    if (!(await protectRoute())) {
        return; // Stop execution if not authenticated
    }
    
    setupEventListeners();
    loadUserData();
});

// Set up event listeners
function setupEventListeners() {
    // Tab navigation
    accountNav.addEventListener('click', handleTabClick);

    // Forms
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordUpdate);
    }

    // Avatar
    if (editAvatarButton) {
        editAvatarButton.addEventListener('click', handleAvatarEdit);
    }

    // Wishlist
    removeButtons.forEach(button => {
        button.addEventListener('click', handleWishlistRemove);
    });
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    // Addresses
    addressActions.forEach(button => {
        button.addEventListener('click', handleAddressAction);
    });
    if (addAddressButton) {
        addAddressButton.addEventListener('click', handleAddAddress);
    }

    // Settings
    settingsToggles.forEach(toggle => {
        toggle.addEventListener('change', handleSettingToggle);
    });
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth.php/check');
        const data = await response.json();

        if (!data.status === 'success' || !data.data.authenticated) {
            window.location.href = 'login.html';
        } else {
            updateUserInfo(data.data.user);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        showNotification('Error checking authentication status', 'error');
    }
}

// Update user information
function updateUserInfo(user) {
    const userNameElement = document.querySelector('.user-details h1');
    const userAvatarElement = document.querySelector('.user-avatar img');
    const memberSinceElement = document.querySelector('.user-details p');

    if (userNameElement) {
        userNameElement.textContent = `Welcome, ${user.name}`;
    }
    if (userAvatarElement && user.avatar) {
        userAvatarElement.src = user.avatar;
    }
    if (memberSinceElement && user.joined_date) {
        memberSinceElement.textContent = `Member since ${formatDate(user.joined_date)}`;
    }
}

// Handle tab navigation
function handleTabClick(e) {
    const button = e.target.closest('.nav-item');
    if (!button) return;

    const tabId = button.dataset.tab;
    if (!tabId) return;

    // Update active states
    accountNav.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    // Show selected tab content
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });

    // Update URL without page reload
    history.pushState({}, '', `?tab=${tabId}`);
}

// Handle profile form submission
async function handleProfileUpdate(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const button = e.target.querySelector('button[type="submit"]');
    
    try {
        button.disabled = true;
        button.textContent = 'Saving...';

        const response = await fetch('/api/auth.php/profile/update', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
            showNotification('Profile updated successfully', 'success');
            updateUserInfo(data.data.user);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Error updating profile', 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Save Changes';
    }
}

// Handle password form submission
async function handlePasswordUpdate(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const button = e.target.querySelector('button[type="submit"]');

    if (formData.get('new_password') !== formData.get('confirm_password')) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    try {
        button.disabled = true;
        button.textContent = 'Updating...';

        const response = await fetch('/api/auth.php/password/update', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
            showNotification('Password updated successfully', 'success');
            e.target.reset();
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating password:', error);
        showNotification('Error updating password', 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Update Password';
    }
}

// Handle avatar edit
function handleAvatarEdit() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/auth.php/avatar/update', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.status === 'success') {
                document.querySelector('.user-avatar img').src = data.data.avatar_url;
                showNotification('Avatar updated successfully', 'success');
            } else {
                showNotification(data.message, 'error');
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            showNotification('Error updating avatar', 'error');
        }
    });

    input.click();
}

// Handle wishlist item removal
async function handleWishlistRemove(e) {
    const wishlistItem = e.target.closest('.wishlist-item');
    const productId = wishlistItem.dataset.productId;

    try {
        const response = await fetch(`/api/wishlist.php/remove/${productId}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.status === 'success') {
            wishlistItem.remove();
            showNotification('Item removed from wishlist', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showNotification('Error removing item from wishlist', 'error');
    }
}

// Handle add to cart
async function handleAddToCart(e) {
    const button = e.target;
    const wishlistItem = button.closest('.wishlist-item');
    const productId = wishlistItem.dataset.productId;

    try {
        button.disabled = true;
        button.textContent = 'Adding...';

        const response = await fetch('/api/cart.php/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        const data = await response.json();

        if (data.status === 'success') {
            showNotification('Item added to cart', 'success');
            updateCartCount(data.data.cart_count);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding item to cart', 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Add to Cart';
    }
}

// Handle address actions
async function handleAddressAction(e) {
    const button = e.target;
    const action = button.classList.contains('edit-button') ? 'edit' :
                  button.classList.contains('delete-button') ? 'delete' :
                  'default';
    const addressCard = button.closest('.address-card');
    const addressId = addressCard.dataset.addressId;

    switch (action) {
        case 'edit':
            showAddressModal(addressCard);
            break;
        case 'delete':
            if (confirm('Are you sure you want to delete this address?')) {
                await deleteAddress(addressId, addressCard);
            }
            break;
        case 'default':
            await setDefaultAddress(addressId, addressCard);
            break;
    }
}

// Show address modal
function showAddressModal(addressCard = null) {
    // Implementation for address modal
    console.log('Show address modal', addressCard);
}

// Delete address
async function deleteAddress(addressId, addressCard) {
    try {
        const response = await fetch(`/api/address.php/delete/${addressId}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.status === 'success') {
            addressCard.remove();
            showNotification('Address deleted successfully', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
        showNotification('Error deleting address', 'error');
    }
}

// Set default address
async function setDefaultAddress(addressId, addressCard) {
    try {
        const response = await fetch(`/api/address.php/default/${addressId}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Update UI to reflect new default address
            document.querySelectorAll('.address-card').forEach(card => {
                card.classList.remove('default');
                card.querySelector('.default-badge')?.remove();
                card.querySelector('.make-default')?.style.display = 'block';
            });

            addressCard.classList.add('default');
            const header = addressCard.querySelector('.address-header');
            header.insertAdjacentHTML('beforeend', '<span class="default-badge">Default</span>');
            addressCard.querySelector('.make-default').style.display = 'none';

            showNotification('Default address updated', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error setting default address:', error);
        showNotification('Error setting default address', 'error');
    }
}

// Handle add new address
function handleAddAddress() {
    showAddressModal();
}

// Handle setting toggle
async function handleSettingToggle(e) {
    const toggle = e.target;
    const settingId = toggle.dataset.settingId;
    const value = toggle.checked;

    try {
        const response = await fetch('/api/settings.php/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                setting_id: settingId,
                value: value
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            showNotification('Setting updated successfully', 'success');
        } else {
            toggle.checked = !value; // Revert toggle if update failed
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating setting:', error);
        toggle.checked = !value; // Revert toggle if error occurred
        showNotification('Error updating setting', 'error');
    }
}

// Update cart count in header
function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }
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

// Format date
function formatDate(dateString) {
    const options = { month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Handle browser back/forward
window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const tabId = params.get('tab') || 'profile';
    
    // Simulate click on appropriate tab
    const tabButton = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.click();
    }
}); 