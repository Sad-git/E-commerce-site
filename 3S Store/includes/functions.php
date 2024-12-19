<?php
require_once 'config.php';
require_once 'db.php';

// Sanitize input
function sanitize($input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            $input[$key] = sanitize($value);
        }
    } else {
        $input = trim($input);
        $input = stripslashes($input);
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    }
    return $input;
}

// Validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Generate random string
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $randomString;
}

// Format price
function formatPrice($price) {
    return number_format($price, 2, '.', ',');
}

// Calculate order total
function calculateOrderTotal($items) {
    $subtotal = 0;
    foreach ($items as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }
    
    $shipping = $subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    $tax = $subtotal * TAX_RATE;
    $total = $subtotal + $shipping + $tax;
    
    return [
        'subtotal' => $subtotal,
        'shipping' => $shipping,
        'tax' => $tax,
        'total' => $total
    ];
}

// Upload file
function uploadFile($file, $destination) {
    $fileName = basename($file['name']);
    $targetPath = $destination . $fileName;
    $fileType = strtolower(pathinfo($targetPath, PATHINFO_EXTENSION));

    // Check if file is actually an image
    if (!getimagesize($file['tmp_name'])) {
        return ['error' => 'File is not an image.'];
    }

    // Check file size
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['error' => 'File is too large.'];
    }

    // Allow certain file formats
    if (!in_array($fileType, ALLOWED_EXTENSIONS)) {
        return ['error' => 'Only JPG, JPEG, PNG & GIF files are allowed.'];
    }

    // Generate unique filename
    $fileName = uniqid() . '.' . $fileType;
    $targetPath = $destination . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return ['success' => true, 'filename' => $fileName];
    } else {
        return ['error' => 'Error uploading file.'];
    }
}

// Send email
function sendEmail($to, $subject, $message) {
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: ' . SMTP_NAME . ' <' . SMTP_FROM . '>' . "\r\n";
    
    return mail($to, $subject, $message, $headers);
}

// Check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Get current user
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }

    $db = Database::getInstance();
    return $db->getRow("SELECT * FROM users WHERE id = ?", [$_SESSION['user_id']]);
}

// Redirect with message
function redirect($url, $message = '', $type = 'success') {
    if ($message) {
        $_SESSION['message'] = [
            'text' => $message,
            'type' => $type
        ];
    }
    header("Location: $url");
    exit();
}

// Display message
function displayMessage() {
    if (isset($_SESSION['message'])) {
        $message = $_SESSION['message'];
        unset($_SESSION['message']);
        return "<div class='alert alert-{$message['type']}'>{$message['text']}</div>";
    }
    return '';
}

// Generate pagination
function generatePagination($total, $perPage, $currentPage, $url) {
    $totalPages = ceil($total / $perPage);
    
    if ($totalPages <= 1) {
        return '';
    }

    $html = '<div class="pagination">';
    
    // Previous button
    if ($currentPage > 1) {
        $html .= "<a href='{$url}?page=" . ($currentPage - 1) . "' class='pagination-btn'><i class='fas fa-chevron-left'></i></a>";
    }

    // Page numbers
    for ($i = 1; $i <= $totalPages; $i++) {
        if ($i == $currentPage) {
            $html .= "<span class='pagination-btn active'>$i</span>";
        } elseif ($i == 1 || $i == $totalPages || ($i >= $currentPage - 2 && $i <= $currentPage + 2)) {
            $html .= "<a href='{$url}?page=$i' class='pagination-btn'>$i</a>";
        } elseif ($i == $currentPage - 3 || $i == $currentPage + 3) {
            $html .= "<span class='pagination-ellipsis'>...</span>";
        }
    }

    // Next button
    if ($currentPage < $totalPages) {
        $html .= "<a href='{$url}?page=" . ($currentPage + 1) . "' class='pagination-btn'><i class='fas fa-chevron-right'></i></a>";
    }

    $html .= '</div>';
    return $html;
}

// Format date
function formatDate($date, $format = 'Y-m-d H:i:s') {
    return date($format, strtotime($date));
}

// Get order status label
function getOrderStatusLabel($status) {
    $labels = [
        'pending' => '<span class="badge badge-warning">Pending</span>',
        'processing' => '<span class="badge badge-info">Processing</span>',
        'shipped' => '<span class="badge badge-primary">Shipped</span>',
        'delivered' => '<span class="badge badge-success">Delivered</span>',
        'cancelled' => '<span class="badge badge-danger">Cancelled</span>'
    ];
    
    return isset($labels[$status]) ? $labels[$status] : $status;
}

// Generate order number
function generateOrderNumber() {
    return 'ORD-' . date('Ymd') . '-' . strtoupper(generateRandomString(6));
}

// Get cart items
function getCartItems() {
    return isset($_SESSION['cart']) ? $_SESSION['cart'] : [];
}

// Add item to cart
function addToCart($productId, $quantity = 1) {
    $db = Database::getInstance();
    $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
    
    if (!$product) {
        return false;
    }

    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    if (isset($_SESSION['cart'][$productId])) {
        $_SESSION['cart'][$productId]['quantity'] += $quantity;
    } else {
        $_SESSION['cart'][$productId] = [
            'id' => $product['id'],
            'name' => $product['name'],
            'price' => $product['price'],
            'image' => $product['image'],
            'quantity' => $quantity
        ];
    }

    return true;
}

// Update cart quantity
function updateCartQuantity($productId, $quantity) {
    if (isset($_SESSION['cart'][$productId])) {
        if ($quantity > 0) {
            $_SESSION['cart'][$productId]['quantity'] = $quantity;
        } else {
            removeFromCart($productId);
        }
        return true;
    }
    return false;
}

// Remove from cart
function removeFromCart($productId) {
    if (isset($_SESSION['cart'][$productId])) {
        unset($_SESSION['cart'][$productId]);
        return true;
    }
    return false;
}

// Clear cart
function clearCart() {
    unset($_SESSION['cart']);
}

// Get cart total
function getCartTotal() {
    $items = getCartItems();
    return calculateOrderTotal($items);
}

// Validate form token
function validateFormToken($token) {
    return isset($_SESSION['form_token']) && $_SESSION['form_token'] === $token;
}

// Generate form token
function generateFormToken() {
    $token = generateRandomString(32);
    $_SESSION['form_token'] = $token;
    return $token;
}

// Display form token field
function displayFormToken() {
    $token = generateFormToken();
    return "<input type='hidden' name='token' value='$token'>";
}

// Validate required fields
function validateRequired($fields, $data) {
    $errors = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' is required.';
        }
    }
    return $errors;
}

// Get client IP address
function getClientIP() {
    if (isset($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

// Log activity
function logActivity($userId, $action, $details = '') {
    $db = Database::getInstance();
    $data = [
        'user_id' => $userId,
        'action' => $action,
        'details' => $details,
        'ip_address' => getClientIP()
    ];
    return $db->insert('activity_logs', $data);
}

// Debug function
function debug($data) {
    echo '<pre>';
    print_r($data);
    echo '</pre>';
} 