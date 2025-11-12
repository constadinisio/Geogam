export const missions = [
  {
    id: "G-01",
    name: "El Erudito Impecable",
    description: "Gana 3 partidas con todas las respuestas correctas.",
    difficulty: "Difícil",
    category: "General",
    condition: {
      type: "perfectGames",
      count: 3
    },
    reward: { coins: 150 }
  },
  {
    id: "G-02",
    name: "Precisión de Cirujano",
    description: "Finaliza una partida con un porcentaje de acierto del 90% o superior.",
    difficulty: "Medio",
    category: "General",
    condition: {
      type: "accuracy",
      percentage: 90
    },
    reward: { coins: 75 }
  },
  {
    id: "V-01",
    name: "Novato Aplicado",
    description: "Completa 5 partidas de preguntados.",
    difficulty: "Fácil",
    category: "Varios",
    condition: {
      type: "gamesPlayed",
      count: 5
    },
    reward: { coins: 50 }
  },
  {
    id: "V-02",
    name: "Media Maratón",
    description: "Juega un total acumulado de 60 minutos en GeoGam.",
    difficulty: "Medio",
    category: "Varios",
    condition: {
      type: "timePlayed",
      minutes: 60
    },
    reward: { coins: 100 }
  },
  {
    id: "V-03",
    name: "El Explorador Diario",
    description: "Completa 2 partidas de preguntados.",
    difficulty: "Fácil",
    category: "Varios",
    condition: {
      type: "gamesPlayed",
      count: 2
    },
    reward: { coins: 25 }
  }
];