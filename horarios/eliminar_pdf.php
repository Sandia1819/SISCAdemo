<?php
// Configuración de conexión a MySQL
$host = 'localhost';
$usuario = 'root';
$contraseña = '';  // Cambia según tu configuración
$base_de_datos = 'sisca';  // Base de datos principal

// Conectar a la base de datos principal
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

// Verificar la conexión
if ($conexion->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Conexión fallida: ' . $conexion->connect_error]);
    exit();
}

// Obtener los datos enviados desde JavaScript
$data = json_decode(file_get_contents('php://input'), true);

// Verificar que se recibió una acción, ID y periodo
if (!isset($data['accion']) || !isset($data['id']) || !isset($data['periodo'])) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit();
}

$accion = $data['accion'];
$id = $data['id'];
$periodo = $data['periodo'];

// Conectar a la base de datos correspondiente al periodo
$conexionPeriodo = new mysqli($host, $usuario, $contraseña, $periodo);

// Verificar si la conexión fue exitosa
if ($conexionPeriodo->connect_error) {
    echo json_encode(['success' => false, 'error' => 'No se pudo conectar a la base de datos del periodo.']);
    exit();
}

// Procesar según la acción
switch ($accion) {
    case 'eliminar':
        // Verificar que se recibió el ID
        if (!isset($id)) {
            echo json_encode(['success' => false, 'error' => 'ID no proporcionado para eliminar']);
            exit();
        }

        // Preparar la consulta para eliminar el PDF de la tabla "horarios" en el periodo específico
        $query = "DELETE FROM horarios WHERE id = ? AND periodo = ?";
        $stmt = $conexionPeriodo->prepare($query);

        if ($stmt === false) {
            echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta de eliminación: ' . $conexionPeriodo->error]);
            exit();
        }

        $stmt->bind_param('is', $id, $periodo);  // 'i' para entero (id), 's' para string (periodo)
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Acción no reconocida']);
        exit();
}

// Ejecutar la consulta preparada
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al ejecutar la operación: ' . $stmt->error]);
}

// Cerrar la conexión
$stmt->close();
$conexionPeriodo->close();
$conexion->close();
?>
