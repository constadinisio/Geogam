<?php
include("conexion.php");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre     = $_POST['nombre'];
    $apellido   = $_POST['apellido'];
    $usuario    = $_POST['usuario'];
    $email      = $_POST['email'];
    $password   = $_POST['contrasena'];

    // Encriptar la contraseña
    $hash = password_hash($password, PASSWORD_BCRYPT);

    // Verificar si ya existe usuario o email
    $check = $conn->prepare("SELECT * FROM jugadores WHERE usuario=? OR email=?");
    $check->bind_param("ss", $usuario, $email);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        echo "El usuario o email ya están registrados.";
    } else {
        // Insertar con valores iniciales
        $sql = "INSERT INTO jugadores 
                (nombre, apellido, usuario, email, contrasena, nivelJuego, tiempoRecord, tiempoJugado, monedas, millasRecorridas, idRango) 
                VALUES (?, ?, ?, ?, ?, 'N/A', NULL, NULL, 0, 0, 1)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssss", $nombre, $apellido, $usuario, $email, $hash);

        if ($stmt->execute()) {
            echo "Registro exitoso 🎉";
        } else {
            echo "Error: " . $stmt->error;
        }
    }
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $usuario_email = $_POST['usuario_email'];
    $password      = $_POST['contrasena'];

    // Buscar por usuario o email
    $sql = "SELECT * FROM jugadores WHERE usuario=? OR email=? LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $usuario_email, $usuario_email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        // Verificar contraseña
        if (password_verify($password, $user['contrasena'])) {
            // Guardar datos en sesión
            $_SESSION['idJugador'] = $user['idJugador'];
            $_SESSION['usuario']   = $user['usuario'];
            $_SESSION['email']     = $user['email'];
            
            header("Location: ../../public/index.html"); // redirige al menú principal
            exit();
        } else {
            echo "❌ Contraseña incorrecta.";
        }
    } else {
        echo "❌ Usuario o Email no encontrados.";
    }
}
?>
