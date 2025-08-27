  const audio = document.getElementById("audio");
  const volume = document.getElementById("volume");

  // volumen inicial
  audio.volume = 0.5;

  volume.addEventListener("input", () => {
    audio.volume = volume.value;
  });
