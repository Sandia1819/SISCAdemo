<?php
// Configuración de conexión a MySQL
$host = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_de_datos = $_GET['periodo'];  // Obtener el periodo desde la solicitud GET

// Conectar a la base de datos
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

if ($conexion->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Error de conexión: ' . $conexion->connect_error]));
}

// Consultar los PDFs del periodo seleccionado
$query = "SELECT id, nombre_archivo, pdf_base64, fecha_creacion FROM horarios ORDER BY fecha_creacion DESC";
$resultado = $conexion->query($query);

if (!$resultado) {
    echo json_encode(['success' => false, 'error' => 'Error en la consulta: ' . $conexion->error]);
    exit();
}

// Crear el arreglo para almacenar los datos de los PDFs
$pdfs = [];
while ($fila = $resultado->fetch_assoc()) {
    $pdfs[] = [
        'id' => $fila['id'], // ID real para operaciones de eliminación
        'nombre_archivo' => $fila['nombre_archivo'], // Nombre visible del archivo
        'fecha_creacion' => $fila['fecha_creacion'], // Fecha de creación
        'pdf_base64' => $fila['pdf_base64'], // Archivo en base64
    ];
}

// Responder en formato JSON
header('Content-Type: application/json');
echo json_encode(['success' => true, 'pdfs' => $pdfs]);

// Cerrar la conexión
$conexion->close();
?>
