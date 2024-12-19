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

// Handle request
try {
    switch ($method) {
        case 'GET':
            // Get cart items
            $items = getCartItems();
            $totals = calculateOrderTotal($items);
            
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'items' => $items,
                    'totals' => $totals
                ]
            ]);
            break;

        case 'POST':
            // Add item to cart
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['product_id'])) {
                throw new Exception("Product ID is required", 400);
            }
            
            $productId = (int)$data['product_id'];
            $quantity = isset($data['quantity']) ? (int)$data['quantity'] : 1;
            
            // Check if product exists
            $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
            if (!$product) {
                throw new Exception("Product not found", 404);
            }
            
            // Check stock
            if ($product['stock'] < $quantity) {
                throw new Exception("Not enough stock available", 400);
            }
            
            // Add to cart
            if (addToCart($productId, $quantity)) {
                $items = getCartItems();
                $totals = calculateOrderTotal($items);
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Item added to cart',
                    'data' => [
                        'items' => $items,
                        'totals' => $totals
                    ]
                ]);
            } else {
                throw new Exception("Failed to add item to cart", 500);
            }
            break;

        case 'PUT':
            // Update cart item quantity
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['product_id']) || !isset($data['quantity'])) {
                throw new Exception("Product ID and quantity are required", 400);
            }
            
            $productId = (int)$data['product_id'];
            $quantity = (int)$data['quantity'];
            
            // Check if product exists
            $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
            if (!$product) {
                throw new Exception("Product not found", 404);
            }
            
            // Check stock
            if ($product['stock'] < $quantity) {
                throw new Exception("Not enough stock available", 400);
            }
            
            // Update quantity
            if (updateCartQuantity($productId, $quantity)) {
                $items = getCartItems();
                $totals = calculateOrderTotal($items);
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Cart updated',
                    'data' => [
                        'items' => $items,
                        'totals' => $totals
                    ]
                ]);
            } else {
                throw new Exception("Failed to update cart", 500);
            }
            break;

        case 'DELETE':
            $path = isset($_GET['path']) ? $_GET['path'] : '';
            $pathParts = explode('/', trim($path, '/'));
            
            if (empty($pathParts[0])) {
                // Clear entire cart
                clearCart();
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Cart cleared'
                ]);
            } else {
                // Remove specific item
                $productId = (int)$pathParts[0];
                
                if (removeFromCart($productId)) {
                    $items = getCartItems();
                    $totals = calculateOrderTotal($items);
                    
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Item removed from cart',
                        'data' => [
                            'items' => $items,
                            'totals' => $totals
                        ]
                    ]);
                } else {
                    throw new Exception("Failed to remove item from cart", 500);
                }
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

// Helper function to validate cart item
function validateCartItem($productId, $quantity) {
    global $db;
    
    // Check if product exists and has enough stock
    $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
    
    if (!$product) {
        throw new Exception("Product not found", 404);
    }
    
    if ($product['stock'] < $quantity) {
        throw new Exception("Not enough stock available", 400);
    }
    
    return $product;
}

// Helper function to get cart summary
function getCartSummary() {
    $items = getCartItems();
    $totals = calculateOrderTotal($items);
    
    return [
        'items' => $items,
        'totals' => $totals
    ];
} 