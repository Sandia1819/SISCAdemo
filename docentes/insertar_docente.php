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

// Verificar si los datos están completos
if (isset($data['periodo'], $data['nombreCompleto'], $data['regimen'], $data['horas'])) {
    $periodo = $data['periodo'];
    $nombreCompleto = $data['nombreCompleto'];
    $regimen = $data['regimen'];
    $horas = $data['horas'];

    // Conectar a la base de datos correspondiente al periodo
    $conexionPeriodo = new mysqli($host, $usuario, $contraseña, $periodo);

    // Verificar si la conexión fue exitosa
    if ($conexionPeriodo->connect_error) {
        echo json_encode(['success' => false, 'error' => 'No se pudo conectar a la base de datos del periodo.']);
        exit();
    }

    // Preparar la consulta para insertar el docente en la tabla 'docentes'
    $query = "INSERT INTO docentes (nombreCompleto, regimen, horas) VALUES (?, ?, ?)";
    $stmt = $conexionPeriodo->prepare($query);

    // Verificar si la preparación de la consulta fue exitosa
    if ($stmt === false) {
        echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta: ' . $conexionPeriodo->error]);
        exit();
    }

    // Vincular los parámetros y ejecutar la consulta
    $stmt->bind_param('ssi', $nombreCompleto, $regimen, $horas);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Error al insertar los datos: ' . $stmt->error]);
    }

    // Cerrar la conexión
    $stmt->close();
    $conexionPeriodo->close();
} else {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
}

// Cerrar la conexión a la base de datos principal
$conexion->close();
?>