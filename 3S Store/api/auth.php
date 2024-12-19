<?php
require_once '../includes/config.php';
require_once '../includes/db.php';
require_once '../includes/functions.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Get database instance
$db = Database::getInstance();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get request path
$path = isset($_GET['path']) ? $_GET['path'] : '';
$pathParts = explode('/', trim($path, '/'));

// Handle request
try {
    switch ($method) {
        case 'POST':
            if (empty($pathParts[0])) {
                throw new Exception("Action is required", 400);
            }

            $action = $pathParts[0];
            $data = json_decode(file_get_contents('php://input'), true);

            switch ($action) {
                case 'register':
                    // Validate required fields
                    $required = ['name', 'email', 'password', 'confirm_password'];
                    $errors = validateRequired($required, $data);
                    if (!empty($errors)) {
                        throw new Exception(implode("\n", $errors), 400);
                    }

                    // Validate email
                    if (!validateEmail($data['email'])) {
                        throw new Exception("Invalid email address", 400);
                    }

                    // Check if email already exists
                    $existingUser = $db->getRow(
                        "SELECT id FROM users WHERE email = ?",
                        [$data['email']]
                    );
                    if ($existingUser) {
                        throw new Exception("Email already registered", 400);
                    }

                    // Validate password
                    if (strlen($data['password']) < 8) {
                        throw new Exception("Password must be at least 8 characters long", 400);
                    }
                    if ($data['password'] !== $data['confirm_password']) {
                        throw new Exception("Passwords do not match", 400);
                    }

                    // Create user
                    $userId = $db->insert('users', [
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'password' => password_hash($data['password'], PASSWORD_DEFAULT),
                        'phone' => $data['phone'] ?? null,
                        'address' => $data['address'] ?? null,
                        'city' => $data['city'] ?? null,
                        'state' => $data['state'] ?? null,
                        'zip' => $data['zip'] ?? null,
                        'country' => $data['country'] ?? null
                    ]);

                    // Get created user
                    $user = $db->getRow(
                        "SELECT id, name, email, created_at FROM users WHERE id = ?",
                        [$userId]
                    );

                    // Start session
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_name'] = $user['name'];
                    $_SESSION['user_email'] = $user['email'];

                    // Send welcome email
                    sendWelcomeEmail($user);

                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Registration successful',
                        'data' => $user
                    ]);
                    break;

                case 'login':
                    // Validate required fields
                    $required = ['email', 'password'];
                    $errors = validateRequired($required, $data);
                    if (!empty($errors)) {
                        throw new Exception(implode("\n", $errors), 400);
                    }

                    // Get user by email
                    $user = $db->getRow(
                        "SELECT * FROM users WHERE email = ?",
                        [$data['email']]
                    );

                    if (!$user || !password_verify($data['password'], $user['password'])) {
                        throw new Exception("Invalid email or password", 401);
                    }

                    // Start session
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_name'] = $user['name'];
                    $_SESSION['user_email'] = $user['email'];
                    $_SESSION['user_role'] = $user['role'] ?? 'user';

                    // Update last login
                    $db->update('users',
                        ['last_login' => date('Y-m-d H:i:s')],
                        "id = ?",
                        [$user['id']]
                    );

                    // Log activity
                    logActivity($user['id'], 'login');

                    // Remove password from response
                    unset($user['password']);

                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Login successful',
                        'data' => $user
                    ]);
                    break;

                case 'forgot-password':
                    // Validate required fields
                    if (!isset($data['email'])) {
                        throw new Exception("Email is required", 400);
                    }

                    // Get user by email
                    $user = $db->getRow(
                        "SELECT * FROM users WHERE email = ?",
                        [$data['email']]
                    );

                    if (!$user) {
                        throw new Exception("Email not found", 404);
                    }

                    // Generate reset token
                    $token = generateRandomString(32);
                    $expires = date('Y-m-d H:i:s', time() + TOKEN_EXPIRY);

                    // Save reset token
                    $db->update('users',
                        [
                            'reset_token' => $token,
                            'reset_token_expires' => $expires
                        ],
                        "id = ?",
                        [$user['id']]
                    );

                    // Send reset password email
                    sendPasswordResetEmail($user, $token);

                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Password reset instructions sent to your email'
                    ]);
                    break;

                case 'reset-password':
                    // Validate required fields
                    $required = ['token', 'password', 'confirm_password'];
                    $errors = validateRequired($required, $data);
                    if (!empty($errors)) {
                        throw new Exception(implode("\n", $errors), 400);
                    }

                    // Validate password
                    if (strlen($data['password']) < 8) {
                        throw new Exception("Password must be at least 8 characters long", 400);
                    }
                    if ($data['password'] !== $data['confirm_password']) {
                        throw new Exception("Passwords do not match", 400);
                    }

                    // Get user by reset token
                    $user = $db->getRow(
                        "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
                        [$data['token']]
                    );

                    if (!$user) {
                        throw new Exception("Invalid or expired reset token", 400);
                    }

                    // Update password
                    $db->update('users',
                        [
                            'password' => password_hash($data['password'], PASSWORD_DEFAULT),
                            'reset_token' => null,
                            'reset_token_expires' => null
                        ],
                        "id = ?",
                        [$user['id']]
                    );

                    // Log activity
                    logActivity($user['id'], 'password_reset');

                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Password reset successful'
                    ]);
                    break;

                case 'logout':
                    // Clear session
                    session_destroy();

                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Logout successful'
                    ]);
                    break;

                default:
                    throw new Exception("Invalid action", 400);
            }
            break;

        case 'GET':
            if (!empty($pathParts[0]) && $pathParts[0] === 'check') {
                // Check if user is logged in
                echo json_encode([
                    'status' => 'success',
                    'data' => [
                        'authenticated' => isLoggedIn(),
                        'user' => getCurrentUser()
                    ]
                ]);
            } else {
                throw new Exception("Invalid action", 400);
            }
            break;

        default:
            throw new Exception("Method not allowed", 405);
    }
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

// Helper function to send welcome email
function sendWelcomeEmail($user) {
    $subject = "Welcome to " . SITE_NAME;
    
    $message = "<h1>Welcome to " . SITE_NAME . "!</h1>";
    $message .= "<p>Dear {$user['name']},</p>";
    $message .= "<p>Thank you for registering with us. We're excited to have you as a member!</p>";
    $message .= "<p>You can now:</p>";
    $message .= "<ul>";
    $message .= "<li>Browse our products</li>";
    $message .= "<li>Add items to your cart</li>";
    $message .= "<li>Place orders</li>";
    $message .= "<li>Track your orders</li>";
    $message .= "</ul>";
    $message .= "<p>If you have any questions, feel free to contact us.</p>";
    
    sendEmail($user['email'], $subject, $message);
}

// Helper function to send password reset email
function sendPasswordResetEmail($user, $token) {
    $resetLink = SITE_URL . "/reset-password?token=" . $token;
    $subject = "Password Reset Request";
    
    $message = "<h1>Password Reset Request</h1>";
    $message .= "<p>Dear {$user['name']},</p>";
    $message .= "<p>We received a request to reset your password. ";
    $message .= "Click the link below to reset your password:</p>";
    $message .= "<p><a href='{$resetLink}'>{$resetLink}</a></p>";
    $message .= "<p>This link will expire in " . (TOKEN_EXPIRY / 3600) . " hours.</p>";
    $message .= "<p>If you didn't request this, please ignore this email.</p>";
    
    sendEmail($user['email'], $subject, $message);
} 