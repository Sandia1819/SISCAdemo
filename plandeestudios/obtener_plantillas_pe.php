<?php 
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar si se envió el período
if (!isset($_GET['periodo'])) {
    echo json_encode(["success" => false, "error" => "Período no especificado"]);
    exit();
}

$periodo = $_GET['periodo'];

// Configuración de conexión a MySQL
$host = 'localhost';
$usuario = 'root';
$contraseña = '';  
$base_de_datos = $periodo;  // Usar el periodo como nombre de base de datos

// Conectar a la base de datos del periodo
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

// Verificar la conexión
if ($conexion->connect_error) {
    echo json_encode([ 
        "success" => false, 
        "error" => "Conexión fallida a la base de datos del periodo: " . $conexion->connect_error
    ]);
    exit();
}

// Consultar las plantillas según el período de la tabla 'plantillasCarga'
$query = "SELECT id, plantillaPE, fecha_creacion FROM plantillasPlanEstudios WHERE periodo = ?";
$stmt = $conexion->prepare($query);

if (!$stmt) {
    echo json_encode([ 
        "success" => false, 
        "error" => "Error al preparar la consulta: " . $conexion->error
    ]);
    exit();
}

$stmt->bind_param("s", $periodo);
$stmt->execute();
$resultado = $stmt->get_result();

$plantillas = [];
while ($fila = $resultado->fetch_assoc()) {
    $plantillas[] = $fila;
}

// Cerrar conexión
$stmt->close();
$conexion->close();

// Enviar respuesta JSON
if (count($plantillas) > 0) {
    echo json_encode([ 
        "success" => true, 
        "plantillas" => $plantillas
    ]);
} else {
    echo json_encode([ 
        "success" => false, 
        "error" => "No se encontraron plantillas para el periodo seleccionado"
    ]);
}
?>
