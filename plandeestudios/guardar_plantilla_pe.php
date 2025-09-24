<?php
// Establecer encabezado de respuesta JSON
header('Content-Type: application/json');

// Habilitar reportes de errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuración de conexión a MySQL
$host = 'localhost';
$usuario = 'root';
$contraseña = '';

// Obtener datos enviados
$data = json_decode(file_get_contents('php://input'), true);

// Validar datos recibidos
if (!isset($data['periodo']) || empty($data['periodo'])) {
    echo json_encode([
        'success' => false,
        'error' => 'No se recibió un periodo válido'
    ]);
    exit();
}

if (!isset($data['plantillaPE']) || empty($data['plantillaPE'])) {
    echo json_encode([
        'success' => false,
        'error' => 'No se recibió el contenido de la plantilla de Plan de Estudios'
    ]);
    exit();
}

$periodo = $data['periodo'];
$plantillaPE = $data['plantillaPE'];

// Configuración de la base de datos dinámica, basada en el periodo
$base_de_datos = $periodo; // La base de datos es el nombre del periodo

// Conexión a la base de datos del periodo
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

// Verificar la conexión
if ($conexion->connect_error) {
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión: ' . $conexion->connect_error
    ]);
    exit();
}

// Preparar la consulta de inserción en la tabla plantillasPlanEstudios
$query = "INSERT INTO plantillasPlanEstudios (periodo, plantillaPE) VALUES (?, ?)";
$stmt = $conexion->prepare($query);

// Verificar preparación de la consulta
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error en la preparación de la consulta: ' . $conexion->error
    ]);
    exit();
}

// Vincular parámetros
$stmt->bind_param("ss", $periodo, $plantillaPE);

// Ejecutar la consulta
if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Plantilla de Plan de Estudios guardada correctamente',
        'id' => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Error al guardar la plantilla de Plan de Estudios: ' . $stmt->error
    ]);
}

// Cerrar statement y conexión
$stmt->close();
$conexion->close();

?>
