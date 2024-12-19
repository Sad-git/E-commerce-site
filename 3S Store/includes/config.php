<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', '3s_store');

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Session configuration
session_start();

// Site configuration
define('SITE_URL', 'http://localhost/3s-store');
define('SITE_NAME', '3S Store');

// Email configuration
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-email-password');
define('SMTP_FROM', 'noreply@3sstore.com');
define('SMTP_NAME', '3S Store');

// Payment configuration (example for Stripe)
define('STRIPE_PUBLIC_KEY', 'your-stripe-public-key');
define('STRIPE_SECRET_KEY', 'your-stripe-secret-key');

// Shopping cart configuration
define('SHIPPING_THRESHOLD', 100); // Free shipping for orders over $100
define('SHIPPING_COST', 10);
define('TAX_RATE', 0.10); // 10% tax rate

// File upload configuration
define('UPLOAD_DIR', $_SERVER['DOCUMENT_ROOT'] . '/3s-store/uploads/');
define('MAX_FILE_SIZE', 5242880); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif']);

// Security configuration
define('HASH_COST', 12); // for password_hash()
define('TOKEN_EXPIRY', 3600); // 1 hour for reset tokens

// Time zone
date_default_timezone_set('UTC'); 