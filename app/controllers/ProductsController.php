<?php
ob_start();
header('Content-Type: application/json; charset=utf-8');

// Configuración de errores
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/controller_errors.log');
error_reporting(E_ALL);

// CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Incluir dependencias
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Products.php';

try {
    $database = new Database();
    $db = $database->connect();
    $producto = new Products($db);

    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            $stmt = $producto->obtenerTodos();
            $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($productos);
            break;

        case 'POST':
            // Validar campos requeridos
            $required = ['nombre', 'descripcion', 'precio', 'stock'];
            foreach ($required as $field) {
                if (empty($_POST[$field])) {
                    throw new Exception("El campo $field es requerido");
                }
            }

            // Manejo de imagen
            $imagen = '';
            // Dentro del case 'POST':
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
                $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/PruebaTecnica/public/uploads/';
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                $extension = pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION);
                $filename = uniqid() . '.' . $extension;
                $targetPath = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['imagen']['tmp_name'], $targetPath)) {
                    $imagen = $filename;
                    // Agrega este log para verificar
                    error_log("Imagen guardada en: " . $targetPath);
                    error_log("URL accesible: http://" . $_SERVER['HTTP_HOST'] . '/PruebaTecnica/public/uploads/' . $filename);
                }
            }
            
            $result = $producto->crear(
                $_POST['nombre'],
                $_POST['descripcion'],
                $_POST['precio'],
                $_POST['stock'],
                $imagen
            );
            
            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Producto creado' : 'Error al crear producto'
            ]);
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('JSON inválido');
            }

            // Validar campos requeridos
            $required = ['id', 'nombre', 'descripcion', 'precio', 'stock'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    throw new Exception("El campo $field es requerido");
                }
            }

            $result = $producto->actualizar(
                $data['id'],
                $data['nombre'],
                $data['descripcion'],
                $data['precio'],
                $data['stock'],
                $data['imagen'] ?? null
            );
            
            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Producto actualizado' : 'Error al actualizar'
            ]);
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['id'])) {
                throw new Exception('ID del producto es requerido');
            }

            $result = $producto->eliminar($data['id']);
            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Producto eliminado' : 'Error al eliminar'
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    ob_end_flush();
}