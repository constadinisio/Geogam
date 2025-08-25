<?php
session_start();
include("conexion.php");

// Verificar si hay sesión activa
if (!isset($_SESSION['idJugador'])) {
    die("❌ No has iniciado sesión.");
}

$idJugador = $_SESSION['idJugador'];

// Primero eliminar dependencias (si tenés claves foráneas)
$conn->query("DELETE FROM partidas WHERE idJugador = $idJugador");
$conn->query("DELETE FROM jugador_marcos WHERE idJugador = $idJugador");

// Ahora eliminar el jugador
$sql = "DELETE FROM jugadores WHERE idJugador = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $idJugador);

if ($stmt->execute()) {
    // Cerrar sesión
    session_destroy();
    header("Location: ../public/registro.html?msg=Cuenta eliminada con éxito");
    exit();
} else {
    echo "❌ Error al eliminar la cuenta: " . $stmt->error;
}
?>