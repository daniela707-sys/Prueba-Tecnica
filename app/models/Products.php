<?php
class Products {
    private $conn;
    private $table = "productos";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function obtenerTodos() {
        $query = "SELECT * FROM " . $this->table . " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function crear($nombre, $descripcion, $precio, $stock, $imagen) {
        $query = "INSERT INTO " . $this->table . " (nombre, descripcion, precio, stock, imagen)
                  VALUES (:nombre, :descripcion, :precio, :stock, :imagen)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            ":nombre" => $nombre,
            ":descripcion" => $descripcion,
            ":precio" => $precio,
            ":stock" => $stock,
            ":imagen" => $imagen
        ]);
    }

    public function actualizar($id, $nombre, $descripcion, $precio, $stock, $imagen = null) {
        $query = "UPDATE " . $this->table . " SET nombre = :nombre, descripcion = :descripcion, precio = :precio, stock = :stock";
        if ($imagen) {
            $query .= ", imagen = :imagen";
        }
        $query .= " WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $params = [
            ":id" => $id,
            ":nombre" => $nombre,
            ":descripcion" => $descripcion,
            ":precio" => $precio,
            ":stock" => $stock
        ];
        if ($imagen) {
            $params[":imagen"] = $imagen;
        }

        return $stmt->execute($params);
    }

    public function eliminar($id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
