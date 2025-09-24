<?php
// Configuración de conexión a MySQL
$host = 'localhost';
$usuario = 'root';
$contraseña = '';
$base_de_datos = 'sisca';

// Conectar a la base de datos
$conexion = new mysqli($host, $usuario, $contraseña, $base_de_datos);

// Verificar la conexión
if ($conexion->connect_error) {
    die("Conexión fallida: " . $conexion->connect_error);
}

// Obtener los datos enviados desde JavaScript
$data = json_decode(file_get_contents('php://input'), true);
$periodo = $data['periodo'];
$año = $data['año'];

// Sanear el nombre de la base de datos para evitar SQL Injection
$nombre_base_datos = "periodo_" . preg_replace("/[^a-zA-Z0-9_]/", "", $periodo);

// Crear la base de datos si no existe
$query = "CREATE DATABASE IF NOT EXISTS `$nombre_base_datos`";
if ($conexion->query($query) === TRUE) {
    // Seleccionar la base de datos creada
    $conexion->select_db($nombre_base_datos);

    // Crear la tabla 'docentes'
    $query_docentes = "CREATE TABLE IF NOT EXISTS `docentes` (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        nombreCompleto VARCHAR(255) NOT NULL,
        regimen VARCHAR(100) NOT NULL,
        horas INT(11) NOT NULL
    )";
    
    // Crear la tabla 'grupos'
    $query_grupos = "CREATE TABLE IF NOT EXISTS `grupos` (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(100) NOT NULL,
        turno VARCHAR(50) NOT NULL,
        nivel VARCHAR(50) NOT NULL,
        extension VARCHAR(100) NOT NULL,
        generacion INT(11) NOT NULL,
        nomenclatura VARCHAR(50) NOT NULL,
        grado INT(11) NOT NULL,
        grupo VARCHAR(100) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    // Crear la tabla 'horarios'
    $query_horarios = "CREATE TABLE IF NOT EXISTS `horarios` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(100) NOT NULL,
        nombre_archivo VARCHAR(255) NOT NULL,
        pdf_base64 LONGTEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    // Crear la tabla 'planEstudios'
    $query_planEstudios = "CREATE TABLE IF NOT EXISTS `planEstudios` (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(100) NOT NULL,
        año_academico INT(11) NOT NULL,
        nivel VARCHAR(50) NOT NULL,
        turno VARCHAR(50) NOT NULL,
        programa_educativo VARCHAR(255) NOT NULL,
        grado INT(11) NOT NULL,
        areaConocimiento VARCHAR(255) NOT NULL,
        asignatura VARCHAR(255) NOT NULL,
        tHoras INT(11) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    // Crear la tabla 'carga' con la nueva columna 'plantillaPE'
    $query_carga = "CREATE TABLE IF NOT EXISTS `carga` (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(100) NOT NULL,
        programa_educativo VARCHAR(255) NOT NULL,
        nombreCompleto VARCHAR(255) NOT NULL,
        asignatura VARCHAR(255) NOT NULL,
        horas VARCHAR(100) NOT NULL,
        grupo VARCHAR(100) NOT NULL,
        tutoria VARCHAR(100) NOT NULL DEFAULT 'FALSE',
        estadia VARCHAR(100) NOT NULL DEFAULT 'FALSE',
        administrativas VARCHAR(100) NOT NULL DEFAULT 'FALSE',
        totales INT(11) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    // Crear la tabla 'plantillasCarga' con la columna 'plantillaC' para almacenar la imagen en Base64
    $query_plantillasCarga = "CREATE TABLE IF NOT EXISTS `plantillasCarga` (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(100) NOT NULL,
        plantillaC LONGTEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    // Crear la tabla 'plantillasCarga' con la columna 'plantillaC' para almacenar la imagen en Base64
    $query_plantillasPlanEstudios = "CREATE TABLE IF NOT EXISTS `plantillasPlanEstudios` (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(100) NOT NULL,
        plantillaPE LONGTEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";


// Ejecutar todas las consultas, incluyendo la de plantillasCarga
if (
    $conexion->query($query_docentes) === TRUE &&
    $conexion->query($query_grupos) === TRUE &&
    $conexion->query($query_horarios) === TRUE &&
    $conexion->query($query_planEstudios) === TRUE &&
    $conexion->query($query_carga) === TRUE &&
    $conexion->query($query_plantillasCarga) === TRUE && // Nueva tabla para plantillas
    $conexion->query($query_plantillasPlanEstudios) === TRUE
) {
    echo json_encode(["success" => true, "nombreBaseDatos" => $nombre_base_datos]);
} 
} else {
    echo json_encode(["success" => false, "error" => $conexion->error]);
}

// Cerrar la conexión
$conexion->close();
?>
