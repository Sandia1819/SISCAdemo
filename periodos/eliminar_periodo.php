<?php
// Configuración de conexión a MySQL
$host = 'localhost'; // Cambia esto si tu servidor MySQL está en otro host
$usuario = 'root'; // Usuario de la base de datos
$contraseña = ''; // Contraseña de la base de datos
$base_de_datos = 'sisca'; // Nombre de tu base de datos

// Configuración de conexión a MySQL
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

// Obtener los datos enviados desde JavaScript
$data = json_decode(file_get_contents('php://input'), true);
$nombre_base_datos = $data['nombreBaseDatos'];  // Obtener el nombre de la base de datos a eliminar

// Sanear el nombre de la base de datos para evitar problemas de SQL injection
$nombre_base_datos = preg_replace("/[^a-zA-Z0-9_]/", "", $nombre_base_datos); // Evitar caracteres extraños

// Verificar que el nombre de la base de datos no esté vacío
if (empty($nombre_base_datos)) {
    echo json_encode(["success" => false, "error" => "El nombre de la base de datos es inválido."]);
    exit;
}

// Crear la consulta para eliminar la base de datos
$query = "DROP DATABASE IF EXISTS `$nombre_base_datos`";

// Ejecutar la consulta
if ($conexion->query($query) === TRUE) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $conexion->error]);
}

// Cerrar la conexión
$conexion->close();

?>
