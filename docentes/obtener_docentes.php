<?php
$host = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_de_datos = $_GET['periodo']; // Obtener el periodo desde la solicitud GET

$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

if ($conexion->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Error de conexión: ' . $conexion->connect_error]));
}

$query = "SELECT * FROM docentes"; // Obtener todos los docentes de la tabla 'docentes'
$resultado = $conexion->query($query);

$docentes = [];
while ($fila = $resultado->fetch_assoc()) {
    $docentes[] = $fila;
}

header('Content-Type: application/json');
echo json_encode($docentes);

$conexion->close();
?>

