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
    die("Conexión fallida: " . $conexion->connect_error);
}

// Obtener los datos enviados desde JavaScript
$data = json_decode(file_get_contents('php://input'), true);

// Verificar que se recibió una acción
if (!isset($data['accion']) || !isset($data['periodo'])) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit();
}

$accion = $data['accion'];
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
    case 'insertar':
        if (!isset($data['nombreCompleto'], $data['regimen'], $data['horas'])) {
            echo json_encode(['success' => false, 'error' => 'Datos incompletos para insertar']);
            exit();
        }
        
        $nombreCompleto = $data['nombreCompleto'];
        $regimen = $data['regimen'];
        $horas = $data['horas'];
        
        // Preparar la consulta para insertar el docente
        $query = "INSERT INTO docentes (nombreCompleto, regimen, horas) VALUES (?, ?, ?)";
        $stmt = $conexionPeriodo->prepare($query);
        
        if ($stmt === false) {
            echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta de inserción: ' . $conexionPeriodo->error]);
            exit();
        }
        
        $stmt->bind_param('ssi', $nombreCompleto, $regimen, $horas);
        break;
        
    case 'editar':
        if (!isset($data['id'], $data['nombreCompleto'], $data['regimen'], $data['horas'])) {
            echo json_encode(['success' => false, 'error' => 'Datos incompletos para editar']);
            exit();
        }
        
        $id = $data['id'];
        $nombreCompleto = $data['nombreCompleto'];
        $regimen = $data['regimen'];
        $horas = $data['horas'];
        
        // Preparar la consulta para actualizar el docente
        $query = "UPDATE docentes SET nombreCompleto = ?, regimen = ?, horas = ? WHERE id = ?";
        $stmt = $conexionPeriodo->prepare($query);
        
        if ($stmt === false) {
            echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta de actualización: ' . $conexionPeriodo->error]);
            exit();
        }
        
        $stmt->bind_param('ssii', $nombreCompleto, $regimen, $horas, $id);
        break;
        
    case 'eliminar':
        if (!isset($data['id'])) {
            echo json_encode(['success' => false, 'error' => 'ID no proporcionado para eliminar']);
            exit();
        }
        
        $id = $data['id'];
        
        // Preparar la consulta para eliminar el docente
        $query = "DELETE FROM docentes WHERE id = ?";
        $stmt = $conexionPeriodo->prepare($query);
        
        if ($stmt === false) {
            echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta de eliminación: ' . $conexionPeriodo->error]);
            exit();
        }
        
        $stmt->bind_param('i', $id);
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