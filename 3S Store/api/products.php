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
        case 'GET':
            if (empty($pathParts[0])) {
                // Get all products with optional filtering and pagination
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12;
                $offset = ($page - 1) * $limit;
                
                // Build query
                $sql = "SELECT * FROM products WHERE 1=1";
                $params = [];
                
                // Apply filters
                if (isset($_GET['category'])) {
                    $sql .= " AND category = ?";
                    $params[] = $_GET['category'];
                }
                
                if (isset($_GET['search'])) {
                    $sql .= " AND (name LIKE ? OR description LIKE ?)";
                    $searchTerm = "%{$_GET['search']}%";
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                }
                
                if (isset($_GET['min_price'])) {
                    $sql .= " AND price >= ?";
                    $params[] = (float)$_GET['min_price'];
                }
                
                if (isset($_GET['max_price'])) {
                    $sql .= " AND price <= ?";
                    $params[] = (float)$_GET['max_price'];
                }
                
                // Get total count
                $countSql = str_replace("SELECT *", "SELECT COUNT(*)", $sql);
                $total = $db->getRow($countSql, $params)['COUNT(*)'];
                
                // Apply sorting
                if (isset($_GET['sort'])) {
                    switch ($_GET['sort']) {
                        case 'price-low':
                            $sql .= " ORDER BY price ASC";
                            break;
                        case 'price-high':
                            $sql .= " ORDER BY price DESC";
                            break;
                        case 'newest':
                            $sql .= " ORDER BY created_at DESC";
                            break;
                        default:
                            $sql .= " ORDER BY id DESC";
                    }
                } else {
                    $sql .= " ORDER BY id DESC";
                }
                
                // Apply pagination
                $sql .= " LIMIT ? OFFSET ?";
                $params[] = $limit;
                $params[] = $offset;
                
                // Get products
                $products = $db->getRows($sql, $params);
                
                // Return response
                echo json_encode([
                    'status' => 'success',
                    'data' => [
                        'products' => $products,
                        'total' => $total,
                        'page' => $page,
                        'limit' => $limit,
                        'total_pages' => ceil($total / $limit)
                    ]
                ]);
            } else {
                // Get single product
                $productId = (int)$pathParts[0];
                $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
                
                if (!$product) {
                    throw new Exception("Product not found", 404);
                }
                
                echo json_encode([
                    'status' => 'success',
                    'data' => $product
                ]);
            }
            break;

        case 'POST':
            // Check if user is admin (implement your own admin check)
            if (!isAdmin()) {
                throw new Exception("Unauthorized", 401);
            }

            // Get POST data
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $required = ['name', 'price', 'category'];
            $errors = validateRequired($required, $data);
            
            if (!empty($errors)) {
                throw new Exception(implode("\n", $errors), 400);
            }
            
            // Insert product
            $productId = $db->insert('products', [
                'name' => $data['name'],
                'description' => $data['description'] ?? '',
                'price' => (float)$data['price'],
                'category' => $data['category'],
                'image' => $data['image'] ?? '',
                'stock' => $data['stock'] ?? 0
            ]);
            
            // Get inserted product
            $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Product created successfully',
                'data' => $product
            ]);
            break;

        case 'PUT':
            // Check if user is admin
            if (!isAdmin()) {
                throw new Exception("Unauthorized", 401);
            }

            // Get product ID
            if (empty($pathParts[0])) {
                throw new Exception("Product ID is required", 400);
            }
            
            $productId = (int)$pathParts[0];
            
            // Check if product exists
            $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
            if (!$product) {
                throw new Exception("Product not found", 404);
            }
            
            // Get PUT data
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Update product
            $db->update('products', $data, "id = ?", [$productId]);
            
            // Get updated product
            $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Product updated successfully',
                'data' => $product
            ]);
            break;

        case 'DELETE':
            // Check if user is admin
            if (!isAdmin()) {
                throw new Exception("Unauthorized", 401);
            }

            // Get product ID
            if (empty($pathParts[0])) {
                throw new Exception("Product ID is required", 400);
            }
            
            $productId = (int)$pathParts[0];
            
            // Check if product exists
            $product = $db->getRow("SELECT * FROM products WHERE id = ?", [$productId]);
            if (!$product) {
                throw new Exception("Product not found", 404);
            }
            
            // Delete product
            $db->delete('products', "id = ?", [$productId]);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Product deleted successfully'
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

// Helper function to check if user is admin
function isAdmin() {
    // Implement your own admin check logic
    return isset($_SESSION['user_id']) && $_SESSION['user_role'] === 'admin';
} 