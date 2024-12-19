// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const passwordInputs = document.querySelectorAll('.password-input input[type="password"]');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
});

// Set up event listeners
function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Password strength checker
        const passwordInput = document.getElementById('register-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', checkPasswordStrength);
        }
    }

    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', togglePasswordVisibility);
    });

    // Social login buttons
    document.querySelectorAll('.social-button').forEach(button => {
        button.addEventListener('click', handleSocialLogin);
    });
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('#login-email').value;
    const password = form.querySelector('#login-password').value;
    const remember = form.querySelector('#remember').checked;

    showLoading(form);

    try {
        const response = await fetch('/api/auth.php/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, remember })
        });

        const data = await response.json();

        if (data.status === 'success') {
            showSuccess(form, 'Login successful! Redirecting...');
            handleLoginSuccess(data.data);
        } else {
            showError(form, data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(form, 'An error occurred. Please try again.');
    } finally {
        hideLoading(form);
    }
}

// Handle registration form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const terms = document.getElementById('terms').checked;

    // Validate form
    const errors = validateRegistrationForm({
        name, email, phone, password, confirmPassword, terms
    });

    if (errors.length > 0) {
        showError(registerForm, errors.join('<br>'));
        return;
    }

    try {
        showLoading(registerForm);
        
        const response = await fetch('/api/auth.php/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                password,
                confirm_password: confirmPassword
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            showSuccess(registerForm, 'Registration successful. Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showError(registerForm, data.message);
        }
    } catch (error) {
        showError(registerForm, 'An error occurred. Please try again.');
    } finally {
        hideLoading(registerForm);
    }
}

// Validate registration form
function validateRegistrationForm(data) {
    const errors = [];

    if (!data.name.trim()) {
        errors.push('Name is required');
    }

    if (!data.email.trim()) {
        errors.push('Email is required');
    } else if (!isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }

    if (!data.phone.trim()) {
        errors.push('Phone number is required');
    }

    if (!data.password) {
        errors.push('Password is required');
    } else if (data.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (data.password !== data.confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (!data.terms) {
        errors.push('You must agree to the Terms & Conditions');
    }

    return errors;
}

// Check password strength
function checkPasswordStrength(e) {
    const password = e.target.value;
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    // Remove existing classes
    strengthBar.classList.remove('weak', 'medium', 'strong');

    if (password.length === 0) {
        strengthBar.style.width = '0';
        strengthText.textContent = 'Password strength';
        return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Character variety checks
    if (password.match(/[a-z]/)) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 1;

    // Update strength indicator
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Medium password';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
}

// Toggle password visibility
function togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const input = button.parentElement.querySelector('input');
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Handle social login
function handleSocialLogin(e) {
    const provider = e.currentTarget.classList.contains('google') ? 'google' : 'facebook';
    // Implement social login functionality
    console.log(`${provider} login clicked`);
}

// Check authentication status
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth.php/check');
        const data = await response.json();

        if (data.status === 'success' && data.data.authenticated) {
            // Update UI for authenticated user
            updateAuthenticatedUI(data.data.user);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
}

// Update UI for authenticated user
function updateAuthenticatedUI(user) {
    const authLinks = document.querySelector('.nav-links');
    if (authLinks) {
        const loginLink = authLinks.querySelector('a[href="login.html"]');
        if (loginLink) {
            loginLink.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
            loginLink.href = 'account.html';
        }
    }
}

// Helper Functions
function showLoading(form) {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.classList.add('loading');
}

function hideLoading(form) {
    const button = form.querySelector('button[type="submit"]');
    button.disabled = false;
    button.classList.remove('loading');
}

function showError(form, message) {
    removeMessages(form);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = message;
    form.insertBefore(errorDiv, form.firstChild);
}

function showSuccess(form, message) {
    removeMessages(form);
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    form.insertBefore(successDiv, form.firstChild);
}

function removeMessages(form) {
    const messages = form.querySelectorAll('.error-message, .success-message');
    messages.forEach(message => message.remove());
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Export functions for use in other scripts
window.auth = {
    checkAuthStatus,
    logout: async () => {
        try {
            const response = await fetch('/api/auth.php/logout', {
                method: 'POST'
            });
            const data = await response.json();

            if (data.status === 'success') {
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
};

// Check if user is authenticated
async function isAuthenticated() {
    try {
        const response = await fetch('/api/auth.php/check');
        const data = await response.json();
        return data.status === 'success' && data.data.authenticated;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

// Protect route - redirects to login if not authenticated
async function protectRoute() {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
        // Store the current URL to redirect back after login
        sessionStorage.setItem('redirectUrl', window.location.href);
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Handle successful login
function handleLoginSuccess(data) {
    // Update UI for authenticated user
    updateAuthenticatedUI(data.user);
    
    // Check if there's a redirect URL stored
    const redirectUrl = sessionStorage.getItem('redirectUrl');
    if (redirectUrl) {
        sessionStorage.removeItem('redirectUrl'); // Clear stored URL
        window.location.href = redirectUrl;
    } else {
        window.location.href = 'account.html'; // Default redirect
    }
} 