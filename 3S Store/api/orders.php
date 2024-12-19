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

// Check if user is logged in
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unauthorized'
    ]);
    exit;
}

// Handle request
try {
    switch ($method) {
        case 'GET':
            if (empty($pathParts[0])) {
                // Get all orders for current user
                $userId = $_SESSION['user_id'];
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
                $offset = ($page - 1) * $limit;
                
                // Build query
                $sql = "SELECT * FROM orders WHERE user_id = ?";
                $params = [$userId];
                
                // Apply filters
                if (isset($_GET['status'])) {
                    $sql .= " AND status = ?";
                    $params[] = $_GET['status'];
                }
                
                // Get total count
                $countSql = str_replace("SELECT *", "SELECT COUNT(*)", $sql);
                $total = $db->getRow($countSql, $params)['COUNT(*)'];
                
                // Apply sorting
                $sql .= " ORDER BY created_at DESC";
                
                // Apply pagination
                $sql .= " LIMIT ? OFFSET ?";
                $params[] = $limit;
                $params[] = $offset;
                
                // Get orders
                $orders = $db->getRows($sql, $params);
                
                // Get order items for each order
                foreach ($orders as &$order) {
                    $order['items'] = $db->getRows(
                        "SELECT oi.*, p.name, p.image 
                        FROM order_items oi 
                        JOIN products p ON oi.product_id = p.id 
                        WHERE oi.order_id = ?",
                        [$order['id']]
                    );
                }
                
                echo json_encode([
                    'status' => 'success',
                    'data' => [
                        'orders' => $orders,
                        'total' => $total,
                        'page' => $page,
                        'limit' => $limit,
                        'total_pages' => ceil($total / $limit)
                    ]
                ]);
            } else {
                // Get single order
                $orderId = (int)$pathParts[0];
                $userId = $_SESSION['user_id'];
                
                // Get order
                $order = $db->getRow(
                    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
                    [$orderId, $userId]
                );
                
                if (!$order) {
                    throw new Exception("Order not found", 404);
                }
                
                // Get order items
                $order['items'] = $db->getRows(
                    "SELECT oi.*, p.name, p.image 
                    FROM order_items oi 
                    JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = ?",
                    [$orderId]
                );
                
                echo json_encode([
                    'status' => 'success',
                    'data' => $order
                ]);
            }
            break;

        case 'POST':
            // Create new order
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Get cart items
            $cartItems = getCartItems();
            if (empty($cartItems)) {
                throw new Exception("Cart is empty", 400);
            }
            
            // Validate shipping address
            $required = ['name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'];
            $errors = validateRequired($required, $data);
            if (!empty($errors)) {
                throw new Exception(implode("\n", $errors), 400);
            }
            
            // Start transaction
            $db->beginTransaction();
            
            try {
                // Calculate totals
                $totals = calculateOrderTotal($cartItems);
                
                // Create order
                $orderId = $db->insert('orders', [
                    'user_id' => $_SESSION['user_id'],
                    'total' => $totals['total'],
                    'shipping_address' => json_encode($data),
                    'status' => 'pending',
                    'payment_method' => $data['payment_method'] ?? 'credit_card'
                ]);
                
                // Create order items
                foreach ($cartItems as $item) {
                    $db->insert('order_items', [
                        'order_id' => $orderId,
                        'product_id' => $item['id'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price']
                    ]);
                    
                    // Update product stock
                    $db->query(
                        "UPDATE products SET stock = stock - ? WHERE id = ?",
                        [$item['quantity'], $item['id']]
                    );
                }
                
                // Clear cart
                clearCart();
                
                // Commit transaction
                $db->commit();
                
                // Get created order
                $order = $db->getRow("SELECT * FROM orders WHERE id = ?", [$orderId]);
                $order['items'] = $db->getRows(
                    "SELECT oi.*, p.name, p.image 
                    FROM order_items oi 
                    JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = ?",
                    [$orderId]
                );
                
                // Send order confirmation email
                sendOrderConfirmationEmail($order);
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Order created successfully',
                    'data' => $order
                ]);
            } catch (Exception $e) {
                $db->rollback();
                throw $e;
            }
            break;

        case 'PUT':
            // Update order status (admin only)
            if (!isAdmin()) {
                throw new Exception("Unauthorized", 401);
            }
            
            if (empty($pathParts[0])) {
                throw new Exception("Order ID is required", 400);
            }
            
            $orderId = (int)$pathParts[0];
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['status'])) {
                throw new Exception("Status is required", 400);
            }
            
            // Update order
            $db->update('orders', 
                ['status' => $data['status']], 
                "id = ?", 
                [$orderId]
            );
            
            // Get updated order
            $order = $db->getRow("SELECT * FROM orders WHERE id = ?", [$orderId]);
            $order['items'] = $db->getRows(
                "SELECT oi.*, p.name, p.image 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?",
                [$orderId]
            );
            
            // Send order status update email
            sendOrderStatusUpdateEmail($order);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Order updated successfully',
                'data' => $order
            ]);
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

// Helper function to send order confirmation email
function sendOrderConfirmationEmail($order) {
    $to = json_decode($order['shipping_address'], true)['email'];
    $subject = "Order Confirmation - Order #{$order['id']}";
    
    // Build email message
    $message = "<h1>Thank you for your order!</h1>";
    $message .= "<p>Your order #{$order['id']} has been received and is being processed.</p>";
    
    $message .= "<h2>Order Details</h2>";
    $message .= "<table>";
    foreach ($order['items'] as $item) {
        $message .= "<tr>";
        $message .= "<td>{$item['name']}</td>";
        $message .= "<td>{$item['quantity']} x \${$item['price']}</td>";
        $message .= "<td>\$" . ($item['quantity'] * $item['price']) . "</td>";
        $message .= "</tr>";
    }
    $message .= "</table>";
    
    $message .= "<p><strong>Total:</strong> \${$order['total']}</p>";
    
    // Send email
    sendEmail($to, $subject, $message);
}

// Helper function to send order status update email
function sendOrderStatusUpdateEmail($order) {
    $to = json_decode($order['shipping_address'], true)['email'];
    $subject = "Order Status Update - Order #{$order['id']}";
    
    $statusLabels = [
        'pending' => 'Pending',
        'processing' => 'Processing',
        'shipped' => 'Shipped',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled'
    ];
    
    $message = "<h1>Order Status Update</h1>";
    $message .= "<p>Your order #{$order['id']} status has been updated to: " . 
                $statusLabels[$order['status']] . "</p>";
    
    if ($order['status'] === 'shipped') {
        $message .= "<p>Your order has been shipped and is on its way to you!</p>";
        // Add tracking information if available
    }
    
    // Send email
    sendEmail($to, $subject, $message);
} 