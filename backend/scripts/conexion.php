<?php
// conexion.php
$servername = "18.230.164.213";   // Servidor (XAMPP usa localhost)
$username   = "root";        // Usuario de MySQL (por defecto root en XAMPP)
$password   = "";            // Contraseña (vacía por defecto en XAMPP)
$database   = "geogame";     // Nombre de la base de datos

// Crear conexión
$conn = new mysqli($servername, $username, $password, $database);

// Verificar conexión
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
