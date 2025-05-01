<?php
// Estas líneas DEBEN ir al principio absoluto, antes de cualquier espacio en blanco
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Buffer de salida para evitar errores de cabeceras
ob_start();

// Cabeceras CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Incluir archivos con rutas absolutas
require_once realpath(__DIR__ . '/../../models/Products.php');
require_once realpath(__DIR__ . '/../../config/database.php');


// Conectar a la base de datos
$database = new Database();
$db = $database->connect();

// Instanciar el modelo Producto
$producto = new Products($db); 
// Obtener el método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];

// Manejar diferentes métodos
switch($method) {
    case 'GET':
        // Leer productos
        if(isset($_GET['id'])) {
            // Leer un solo producto
            $producto->id = $_GET['id'];
            $stmt = $producto->leer_uno($producto->id);
            $num = $stmt->rowCount();

            if($num > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                echo json_encode($row);
            } else {
                echo json_encode(array('mensaje' => 'Producto no encontrado'));
            }
        } else {
            // Leer todos los productos
            $stmt = $producto->leer();
            $num = $stmt->rowCount();

            if($num > 0) {
                $productos_arr = array();
                $productos_arr['data'] = array();

                while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    extract($row);
                    $producto_item = array(
                        'id' => $id,
                        'nombre' => $nombre,
                        'descripcion' => $descripcion,
                        'precio' => $precio,
                        'stock' => $stock,
                        'fecha_creacion' => $fecha_creacion
                    );
                    array_push($productos_arr['data'], $producto_item);
                }
                echo json_encode($productos_arr);
            } else {
                echo json_encode(array('mensaje' => 'No se encontraron productos'));
            }
        }
        break;

    case 'POST':
        // Crear producto
        $data = json_decode(file_get_contents("php://input"));

        $producto->nombre = $data->nombre;
        $producto->descripcion = $data->descripcion;
        $producto->precio = $data->precio;
        $producto->stock = $data->stock;

        if($producto->crear()) {
            echo json_encode(array('mensaje' => 'Producto creado'));
        } else {
            echo json_encode(array('mensaje' => 'Producto no creado'));
        }
        break;

    case 'PUT':
        // Actualizar producto
        $data = json_decode(file_get_contents("php://input"));

        $producto->id = $data->id;
        $producto->nombre = $data->nombre;
        $producto->descripcion = $data->descripcion;
        $producto->precio = $data->precio;
        $producto->stock = $data->stock;

        if($producto->actualizar()) {
            echo json_encode(array('mensaje' => 'Producto actualizado'));
        } else {
            echo json_encode(array('mensaje' => 'Producto no actualizado'));
        }
        break;

    case 'DELETE':
        // Eliminar producto
        $data = json_decode(file_get_contents("php://input"));

        $producto->id = $data->id;

        if($producto->eliminar()) {
            echo json_encode(array('mensaje' => 'Producto eliminado'));
        } else {
            echo json_encode(array('mensaje' => 'Producto no eliminado'));
        }
        break;

    default:
        // Método no soportado
        http_response_code(405);
        echo json_encode(array('mensaje' => 'Método no permitido'));
        break;
}
?>