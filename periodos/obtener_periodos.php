<?php
// Configuración de conexión a MySQL
$host = 'localhost';
$usuario = 'root';
$contraseña = '';  // Cambia según tu configuración
$base_de_datos = 'sisca';  // Base de datos principal donde se hace la conexión

// Conectar a la base de datos
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

// Verificar la conexión
if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

// Consultar las bases de datos disponibles
$query = "SHOW DATABASES";
$resultado = $conexion->query($query);

$periodos = [];

// Filtrar las bases de datos que comienzan con 'periodo_'
if ($resultado->num_rows > 0) {
    while ($fila = $resultado->fetch_assoc()) {
        $baseDatos = $fila['Database'];
        
        // Filtrar solo las bases de datos que empiezan con 'periodo_'
        if (strpos($baseDatos, 'periodo_') === 0) {
            $periodos[] = $baseDatos;
        }
    }
}

// Devolver la lista de bases de datos como JSON
header('Content-Type: application/json'); // Asegúrate de enviar la cabecera correcta
echo json_encode($periodos);

// Cerrar la conexión
$conexion->close();
?>
