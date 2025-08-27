// Obtén la referencia a la pantalla de carga
const loadingScreen = document.getElementById("pantalla_de_carga"); // Asegúrate de que tu pantalla de carga tenga este ID

// Verifica si la navegación proviene del login
const fromLogin = sessionStorage.getItem("fromLogin");

if (fromLogin === "true") {
  // Si viene del login, muestra la pantalla de carga
  if (loadingScreen) {
    loadingScreen.style.display = "flex"; // O el estilo que uses para mostrarla
  }

  // Elimina la bandera de sessionStorage para que no se muestre en futuras navegaciones
  sessionStorage.removeItem("fromLogin");

  // Agrega aquí la lógica para ocultar la pantalla de carga después de un tiempo o cuando el contenido esté listo
  // Por ejemplo, para ocultarla después de 3 segundos:
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
  }, 3000); // 3000 milisegundos = 3 segundos
} else {
  // Si no viene del login, asegúrate de que la pantalla de carga esté oculta por defecto
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
}