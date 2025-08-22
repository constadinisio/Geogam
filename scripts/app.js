window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("pantalla_de_carga").style.display = "none";
    document.getElementById("main-content").style.display = "block";
  }, 3000); // 3000 ms = 3 segundos
});