<?php
// conexion.php
$servername = "18.230.164.213";
$username   = "root";
$password   = "";
$database   = "geogame";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $database);

// Verificar conexión
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}
?>
