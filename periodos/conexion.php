<?php
// Configuración de conexión a MySQL
$host = 'localhost'; // Cambia esto si tu servidor MySQL está en otro host
$usuario = 'root'; // Usuario de la base de datos
$contraseña = ''; // Contraseña de la base de datos
$base_de_datos = 'sisca'; // Nombre de tu base de datos

// Conectar a la base de datos
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

// Verificar la conexión
if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}
?>
