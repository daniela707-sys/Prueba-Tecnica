<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRUD de Productos</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="container">
        <h1>CRUD de Productos</h1>
        
        <!-- Formulario para agregar/editar productos -->
        <div class="form-container">
            <h2 id="form-title">Agregar Producto</h2>
            <form id="producto-form">
                <input type="hidden" id="producto-id">
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" required>
                </div>
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion" required></textarea>
                </div>
                <div class="form-group">
                    <label for="precio">Precio:</label>
                    <input type="number" id="precio" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="stock">Stock:</label>
                    <input type="number" id="stock" required>
                </div>
                <button type="submit" id="submit-btn">Guardar</button>
                <button type="button" id="cancel-btn" style="display: none;">Cancelar</button>
            </form>
        </div>
        
        <!-- Tabla de productos -->
        <div class="table-container">
            <h2>Lista de Productos</h2>
            <table id="productos-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="productos-body">
                    <!-- Los productos se cargarán aquí con JavaScript -->
                </tbody>
            </table>
        </div>
    </div>

    <script src="js/app.js"></script>
</body>
</html>