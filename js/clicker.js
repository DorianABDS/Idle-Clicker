// Variables pour stocker les points et les informations de progression
let points = 0;
let currentBlockIndex = 0;
let currentBackgroundIndex = 0;
let currentTitleIndex = 0;
let currentBlockNameIndex = 0;
let currentMusicLevel = "overworldMusic";
let purchasedMobs = {};
let autoClicksPerSecond = 0;

// Éléments audio
const clickSound = document.getElementById("click-sound");
const levelUpSound = document.getElementById("level-up-sound");
const overworldMusic = document.getElementById("overworld-music");
const caveMusic = document.getElementById("cave-music");
const netherMusic = document.getElementById("nether-music");

// Importer le module de stockage
import { loadGameStateClicker, saveGameStateClicker } from "./storage.js";

// Liste des blocs avec leur seuil
const blockList = [
  { id: "wood-block", threshold: 0 },
  { id: "stone-block", threshold: 10 },
  { id: "coal-block", threshold: 20 },
  { id: "iron-block", threshold: 30 },
  { id: "gold-block", threshold: 40 },
  { id: "redstone-block", threshold: 50 },
  { id: "lapis-block", threshold: 60 },
  { id: "emerald-block", threshold: 70 },
  { id: "diamond-block", threshold: 80 },
  { id: "netherite-block", threshold: 90 },
];

// Liste des backgrounds avec leur seuil
const backgroundsList = [
  { id: "herbe-wall", threshold: 0 },
  { id: "stone-wall", threshold: 20 },
  { id: "deepslate-wall", threshold: 80 },
  { id: "portail-nether", threshold: 90 },
];

// Liste des titres avec leur seuil
const titlesList = [
  { title: "Plaine", threshold: 0 },
  { title: "Grotte", threshold: 20 },
  { title: "Grotte Profonde", threshold: 80 },
  { title: "Nether", threshold: 90 },
];

// Liste des noms de blocs avec leur seuil
const blockNamesList = [
  { name: "BOIS", threshold: 0 },
  { name: "PIERRE", threshold: 10 },
  { name: "CHARBON", threshold: 20 },
  { name: "FER", threshold: 30 },
  { name: "OR", threshold: 40 },
  { name: "REDSTONE", threshold: 50 },
  { name: "LAPIS-LAZULIS", threshold: 60 },
  { name: "ÉMERAUDE", threshold: 70 },
  { name: "DIAMANT", threshold: 80 },
  { name: "NETHERITE", threshold: 90 },
];

// Liste des items spéciaux (bonus et malus)
const specialItems = [
  {
    id: "pomme-notch",
    src: "/assets/img/pomme_notch.webp",
    chance: 0.1, // 10% à chaque intervalle
    onClick: () => {
      const percentageToAdd = 10; // Ajouter 10% des points actuels
      const pointsToAdd = Math.round(points * (percentageToAdd / 100));
      addPoints(pointsToAdd);
      showFeedbackMessage(`+${pointsToAdd} points !`, "green");
    },
    onTimeout: () => {
      // Aucun malus si ignoré
    },
  },
  {
    id: "creeper",
    src: "/assets/img/creeper.png",
    chance: 0.01, // 1% de chance
    onClick: () => {
      // Pas de bonus pour le creeper, juste éviter le malus
    },
    onTimeout: () => {
      const percentageToRemove = 10; // Retirer 10% des points actuels
      const pointsToRemove = Math.round(points * (percentageToRemove / 100));
      subtractPoints(pointsToRemove);
      showFeedbackMessage(`-${pointsToRemove} points !`, "red");
    },
  },
];

// Fonction pour initialiser le jeu
function initGame() {
  // Sélectionner les éléments dont nous avons besoin
  const clickButton = document.getElementById("click-button");
  const pointsDisplay = document.getElementById("points-display");

  // Vérifier que les éléments existent
  if (!clickButton || !pointsDisplay) {
    console.error("Éléments nécessaires non trouvés dans le DOM");
    return;
  }

  // Configuration des volumes audio
  if (clickSound) clickSound.volume = 0.3;
  if (levelUpSound) levelUpSound.volume = 0.4;
  if (overworldMusic) overworldMusic.volume = 0.1;
  if (caveMusic) caveMusic.volume = 0.1;
  if (netherMusic) netherMusic.volume = 0.1;

  // Ajouter un écouteur d'événements pour le clic
  clickButton.addEventListener("click", function(event) {
    // Incrémenter les points
    addPoints(1);
    
    // Jouer le son de clic
    if (clickSound) clickSound.play();
    
    // Afficher le feedback visuel
    showClickFeedback(event, 1);
    
    // Vérifier les débloquages
    checkBlockUnlock();
    checkBackgroundUnlock();
    checkTitleUnlock();
    checkBlockNamesUnlock();
    
    // Gérer la musique
    changeMusic();
    
    // Tenter de générer un item spécial
    trySpawnSpecialItem();
  });

  // Charger les données sauvegardées
  loadGame();

  // Démarrer la musique au premier clic
  function startMusicOnce() {
    if (currentMusicLevel === "overworld") {
      if (overworldMusic) overworldMusic.play();
    } else if (currentMusicLevel === "cave") {
      if (caveMusic) caveMusic.play();
    } else if (currentMusicLevel === "nether") {
      if (netherMusic) netherMusic.play();
    }
    document.removeEventListener("click", startMusicOnce);
  }
  
  document.addEventListener("click", startMusicOnce);

  // Démarrer le générateur d'items aléatoires
  startRandomItemSpawner();
  
  // Démarrer l'auto-clicker (si applicable)
  startAutoClicker();
  
  // Configurer la sauvegarde automatique
  setupAutoSave();
  
  // Ajouter le bouton de réinitialisation
  setTimeout(addResetButton, 100);

  // Mettre à jour l'affichage initial
  updatePointsDisplay();
}

// Fonction pour mettre à jour l'affichage des points
function updatePointsDisplay() {
  const pointsDisplay = document.getElementById("points-display");
  if (!pointsDisplay) return;

  // Extraire juste la partie numérique pour la mettre à jour
  const pointsText = points + " ";

  // Garder l'image d'émeraude intacte en préservant le HTML après le nombre
  const emeraldImg = pointsDisplay.querySelector("img");

  if (emeraldImg) {
    // Si l'image existe, on met à jour le texte puis on rajoute l'image
    pointsDisplay.innerHTML = pointsText;
    pointsDisplay.appendChild(emeraldImg);
  } else {
    // Sinon on met juste à jour le texte
    pointsDisplay.textContent = pointsText;
  }

  // Mettre à jour l'affichage des clics automatiques si présent
  const autoClicksDisplay = document.getElementById("auto-clicks-display");
  if (autoClicksDisplay) {
    autoClicksDisplay.textContent = `Clics automatiques: ${autoClicksPerSecond}/sec`;
  }
}

// Fonction pour ajouter des points
function addPoints(amount) {
  points += amount;
  updatePointsDisplay();
  
  // Sauvegarder la progression
  saveGame();
  
  return points;
}

// Fonction pour soustraire des points (pour les achats)
function subtractPoints(amount) {
  if (points >= amount) {
    points -= amount;
    updatePointsDisplay();
    
    // Vérifier les débloquages après soustraction
    checkBlockUnlock();
    checkBackgroundUnlock();
    checkTitleUnlock();
    checkBlockNamesUnlock();
    changeMusic();
    
    // Sauvegarder la progression
    saveGame();
    
    return true;
  }
  return false;
}

// Fonction pour obtenir le nombre actuel de points
function getPoints() {
  return points;
}

// Fonction pour afficher le feedback lors d'un clic
function showClickFeedback(event, pointsPerClick) {
  const feedback = document.createElement("div");
  feedback.textContent = `+${pointsPerClick}`;
  feedback.className = "click-feedback";
  document.body.appendChild(feedback);

  feedback.style.left = `${event.clientX}px`;
  feedback.style.top = `${event.clientY}px`;

  setTimeout(() => {
    feedback.remove();
  }, 1000);
}

// Fonction pour changer la musique selon le niveau
function changeMusic() {
  if (points >= 90 && currentMusicLevel !== "nether") {
    if (overworldMusic) overworldMusic.pause();
    if (caveMusic) caveMusic.pause();
    if (netherMusic) {
      netherMusic.currentTime = 0;
      netherMusic.play();
    }
    currentMusicLevel = "nether";
  } else if (points >= 20 && points < 90 && currentMusicLevel !== "cave") {
    if (overworldMusic) overworldMusic.pause();
    if (netherMusic) netherMusic.pause();
    if (caveMusic) {
      caveMusic.currentTime = 0;
      caveMusic.play();
    }
    currentMusicLevel = "cave";
  } else if (points < 20 && currentMusicLevel !== "overworld") {
    if (caveMusic) caveMusic.pause();
    if (netherMusic) netherMusic.pause();
    if (overworldMusic) {
      overworldMusic.currentTime = 0;
      overworldMusic.play();
    }
    currentMusicLevel = "overworld";
  }
}

// Vérifie si on doit débloquer ou rétablir un bloc
function checkBlockUnlock() {
  let nextBlockIndex = currentBlockIndex + 1;
  let previousBlockIndex = currentBlockIndex - 1;

  // Débloquer un nouveau bloc si points >= seuil du prochain bloc
  if (
    nextBlockIndex < blockList.length &&
    points >= blockList[nextBlockIndex].threshold
  ) {
    const currentBlock = document.getElementById(
      blockList[currentBlockIndex].id
    );
    if (currentBlock) currentBlock.style.display = "none";

    const newBlock = document.getElementById(blockList[nextBlockIndex].id);
    if (newBlock) {
      newBlock.style.display = "block";
      newBlock.classList.add("unlocked");
      setTimeout(() => {
        newBlock.classList.remove("unlocked");
      }, 400);
    }

    currentBlockIndex = nextBlockIndex;
    
    // Jouer le son de level-up
    if (levelUpSound) levelUpSound.play();
  }

  // Rétablir un bloc précédent si points < seuil du bloc actuel
  if (
    previousBlockIndex >= 0 &&
    points < blockList[currentBlockIndex].threshold
  ) {
    const currentBlock = document.getElementById(
      blockList[currentBlockIndex].id
    );
    if (currentBlock) currentBlock.style.display = "none";

    const previousBlock = document.getElementById(
      blockList[previousBlockIndex].id
    );
    if (previousBlock) {
      previousBlock.style.display = "block";
      previousBlock.classList.add("unlocked");
      setTimeout(() => {
        previousBlock.classList.remove("unlocked");
      }, 400);
    }

    currentBlockIndex = previousBlockIndex;
  }
}

// Vérifie si on doit changer de fond
function checkBackgroundUnlock() {
  let nextBackgroundIndex = currentBackgroundIndex + 1;
  let previousBackgroundIndex = currentBackgroundIndex - 1;

  // Débloquer un nouveau fond si points >= seuil du prochain fond
  if (
    nextBackgroundIndex < backgroundsList.length &&
    points >= backgroundsList[nextBackgroundIndex].threshold
  ) {
    const currentBackground = document.querySelector(
      `#background-block-section img:nth-child(${currentBackgroundIndex + 1})`
    );
    if (currentBackground) {
      currentBackground.style.display = "none";
    }

    const newBackground = document.querySelector(
      `#background-block-section img:nth-child(${nextBackgroundIndex + 1})`
    );
    if (newBackground) {
      newBackground.style.display = "block";
    }

    currentBackgroundIndex = nextBackgroundIndex;
  }

  // Rétablir un fond précédent si points < seuil du fond actuel
  if (
    previousBackgroundIndex >= 0 &&
    points < backgroundsList[currentBackgroundIndex].threshold
  ) {
    const currentBackground = document.querySelector(
      `#background-block-section img:nth-child(${currentBackgroundIndex + 1})`
    );
    if (currentBackground) {
      currentBackground.style.display = "none";
    }

    const previousBackground = document.querySelector(
      `#background-block-section img:nth-child(${previousBackgroundIndex + 1})`
    );
    if (previousBackground) {
      previousBackground.style.display = "block";
    }

    currentBackgroundIndex = previousBackgroundIndex;
  }
}

// Vérifie si on doit changer de titre
function checkTitleUnlock() {
  let nextTitleIndex = currentTitleIndex + 1;
  let previousTitleIndex = currentTitleIndex - 1;

  // Débloquer un nouveau titre si points >= seuil du prochain titre
  if (
    nextTitleIndex < titlesList.length &&
    points >= titlesList[nextTitleIndex].threshold
  ) {
    const currentTitle = document.querySelector(
      ".titre-bg h1:nth-child(" + (currentTitleIndex + 1) + ")"
    );
    if (currentTitle) currentTitle.style.display = "none";

    const newTitle = document.querySelector(
      ".titre-bg h1:nth-child(" + (nextTitleIndex + 1) + ")"
    );
    if (newTitle) {
      newTitle.style.display = "block";
    }

    currentTitleIndex = nextTitleIndex;
  }

  // Rétablir un titre précédent si points < seuil du titre actuel
  if (
    previousTitleIndex >= 0 &&
    points < titlesList[currentTitleIndex].threshold
  ) {
    const currentTitle = document.querySelector(
      ".titre-bg h1:nth-child(" + (currentTitleIndex + 1) + ")"
    );
    if (currentTitle) currentTitle.style.display = "none";

    const previousTitle = document.querySelector(
      ".titre-bg h1:nth-child(" + (previousTitleIndex + 1) + ")"
    );
    if (previousTitle) {
      previousTitle.style.display = "block";
    }

    currentTitleIndex = previousTitleIndex;
  }
}

// Vérifie si on doit changer le nom du bloc
function checkBlockNamesUnlock() {
  let nextBlockNameIndex = currentBlockNameIndex + 1;
  let previousBlockNameIndex = currentBlockNameIndex - 1;

  // Débloquer un nouveau nom de bloc si points >= seuil du prochain nom
  if (
    nextBlockNameIndex < blockNamesList.length &&
    points >= blockNamesList[nextBlockNameIndex].threshold
  ) {
    const currentBlockName = document.querySelector(
      ".nom-block h1:nth-child(" + (currentBlockNameIndex + 1) + ")"
    );
    if (currentBlockName) currentBlockName.style.display = "none";

    const newBlockName = document.querySelector(
      ".nom-block h1:nth-child(" + (nextBlockNameIndex + 1) + ")"
    );
    if (newBlockName) {
      newBlockName.style.display = "block";
    }

    currentBlockNameIndex = nextBlockNameIndex;
  }

  // Rétablir un nom de bloc précédent si points < seuil du nom actuel
  if (
    previousBlockNameIndex >= 0 &&
    points < blockNamesList[currentBlockNameIndex].threshold
  ) {
    const currentBlockName = document.querySelector(
      ".nom-block h1:nth-child(" + (currentBlockNameIndex + 1) + ")"
    );
    if (currentBlockName) currentBlockName.style.display = "none";

    const previousBlockName = document.querySelector(
      ".nom-block h1:nth-child(" + (previousBlockNameIndex + 1) + ")"
    );
    if (previousBlockName) {
      previousBlockName.style.display = "block";
    }

    currentBlockNameIndex = previousBlockNameIndex;
  }
}

// Fonction pour afficher un message de feedback sur l'écran
function showFeedbackMessage(message, color) {
  const feedbackMessage = document.createElement("div");
  feedbackMessage.textContent = message;
  feedbackMessage.className = "feedback-message";
  feedbackMessage.style.color = color;
  document.body.appendChild(feedbackMessage);

  feedbackMessage.style.position = "absolute";
  feedbackMessage.style.left = "8.5%";
  feedbackMessage.style.bottom = "28%";

  setTimeout(() => {
    feedbackMessage.remove();
  }, 2000);
}

// Fonctions pour les items spéciaux
function trySpawnSpecialItem() {
  specialItems.forEach((item) => {
    if (Math.random() < item.chance) {
      const img = document.createElement("img");
      img.src = item.src;
      img.className = "special-item";
      img.id = item.id;

      let wasClicked = false;

      const x = Math.random() * (window.innerWidth - 120);
      const y = Math.random() * (window.innerHeight - 120);
      img.style.left = `${x}px`;
      img.style.top = `${y}px`;

      document.body.appendChild(img);

      img.addEventListener("click", () => {
        if (!wasClicked) {
          wasClicked = true;
          item.onClick();
          img.remove();
        }
      });

      setTimeout(() => {
        if (!wasClicked) {
          item.onTimeout();
          img.remove();
        }
      }, 3000);
    }
  });
}

// Fonction pour spawner des items spéciaux régulièrement
function startRandomItemSpawner() {
  setInterval(() => {
    specialItems.forEach((item) => {
      if (Math.random() < item.chance) {
        trySpawnSpecialItem();
      }
    });
  }, 5000);
}

// Système de clics automatiques
function startAutoClicker() {
  setInterval(() => {
    if (autoClicksPerSecond > 0) {
      const pointsToAdd = autoClicksPerSecond;
      addPoints(pointsToAdd);
      // Feedback visuel optionnel pour les clics auto
      const feedback = document.createElement("div");
      feedback.textContent = `+${pointsToAdd} (auto)`;
      feedback.className = "auto-click-feedback";
      feedback.style.position = "absolute";
      feedback.style.left = "8.5%";
      feedback.style.bottom = "24%";
      feedback.style.color = "blue";
      document.body.appendChild(feedback);
      
      setTimeout(() => {
        feedback.remove();
      }, 1000);
    }
  }, 1000);
}

// Fonction pour sauvegarder les points et la progression
function saveGame() {
  // Utiliser la méthode de stockage du premier fichier
  const gameState = {
    points: points,
    currentBlockIndex: currentBlockIndex,
    currentBackgroundIndex: currentBackgroundIndex,
    currentTitleIndex: currentTitleIndex,
    currentBlockNameIndex: currentBlockNameIndex,
    currentMusicLevel: currentMusicLevel,
    autoClicksPerSecond: autoClicksPerSecond,
    purchasedMobs: purchasedMobs
  };

  saveGameStateClicker(gameState);
  
  // Aussi sauvegarder avec la méthode simple du second fichier
  localStorage.setItem("playerPoints", points);
  localStorage.setItem("purchasedMobs", JSON.stringify(purchasedMobs));
}

// Fonction pour charger les points et la progression
function loadGame() {
  // Essayer d'abord la méthode avancée
  const gameState = loadGameStateClicker();

  if (gameState) {
    // Si nous avons des données via le module de stockage
    points = gameState.points;
    currentBlockIndex = gameState.currentBlockIndex;
    currentBackgroundIndex = gameState.currentBackgroundIndex;
    currentTitleIndex = gameState.currentTitleIndex;
    currentBlockNameIndex = gameState.currentBlockNameIndex;
    currentMusicLevel = gameState.currentMusicLevel;
    
    if (gameState.autoClicksPerSecond !== undefined) {
      autoClicksPerSecond = gameState.autoClicksPerSecond;
    }
    
    if (gameState.purchasedMobs !== undefined) {
      purchasedMobs = gameState.purchasedMobs;
    }
  } else {
    // Fallback à la méthode simple
    const savedPoints = localStorage.getItem("playerPoints");
    if (savedPoints !== null) {
      points = parseInt(savedPoints);
    }
    
    const savedMobs = localStorage.getItem("purchasedMobs");
    if (savedMobs !== null) {
      purchasedMobs = JSON.parse(savedMobs);
      
      // Recalculer le total des clics auto si nécessaire
      autoClicksPerSecond = 0;
      for (const mobId in purchasedMobs) {
        if (purchasedMobs.hasOwnProperty(mobId)) {
          autoClicksPerSecond += purchasedMobs[mobId].clickRate * purchasedMobs[mobId].count;
        }
      }
    }
  }

  // Mettre à jour les éléments visuels
  for (let i = 0; i < blockList.length; i++) {
    const block = document.getElementById(blockList[i].id);
    if (block) {
      block.style.display = i === currentBlockIndex ? "block" : "none";
    }
  }
  
  for (let i = 0; i < backgroundsList.length; i++) {
    const background = document.querySelector(
      `#background-block-section img:nth-child(${i + 1})`
    );
    if (background) {
      background.style.display = i === currentBackgroundIndex ? "block" : "none";
    }
  }
  
  for (let i = 0; i < titlesList.length; i++) {
    const title = document.querySelector(`.titre-bg h1:nth-child(${i + 1})`);
    if (title) {
      title.style.display = i === currentTitleIndex ? "block" : "none";
    }
  }
  
  for (let i = 0; i < blockNamesList.length; i++) {
    const blockName = document.querySelector(`.nom-block h1:nth-child(${i + 1})`);
    if (blockName) {
      blockName.style.display = i === currentBlockNameIndex ? "block" : "none";
    }
  }
  
  // Mettre à jour les visuels des mobs achetés
  for (const mobId in purchasedMobs) {
    if (purchasedMobs.hasOwnProperty(mobId)) {
      const mobImg = document.getElementById(mobId);
      if (mobImg) {
        mobImg.style.filter = "grayscale(0%)";
      }
    }
  }
}

// Configurer la sauvegarde automatique
function setupAutoSave() {
  setInterval(saveGame, 10000); // Sauvegarde toutes les 10 secondes
}

// Fonction pour réinitialiser le jeu
function resetGame() {
  const confirmReset = confirm("Êtes-vous sûr de vouloir réinitialiser le jeu ? Toute votre progression sera perdue !");
  
  if (confirmReset) {
    // Réinitialiser les variables principales
    points = 0;
    currentBlockIndex = 0;
    currentBackgroundIndex = 0;
    currentTitleIndex = 0;
    currentBlockNameIndex = 0;
    currentMusicLevel = "overworldMusic";
    autoClicksPerSecond = 0;
    purchasedMobs = {};
    
    // Mettre à jour les affichages
    updatePointsDisplay();
    
    // Réinitialiser les éléments visuels
    for (let i = 0; i < blockList.length; i++) {
      const block = document.getElementById(blockList[i].id);
      if (block) {
        block.style.display = i === 0 ? "block" : "none";
      }
    }
    
    for (let i = 0; i < backgroundsList.length; i++) {
      const background = document.querySelector(
        `#background-block-section img:nth-child(${i + 1})`
      );
      if (background) {
        background.style.display = i === 0 ? "block" : "none";
      }
    }
    
    for (let i = 0; i < titlesList.length; i++) {
      const title = document.querySelector(`.titre-bg h1:nth-child(${i + 1})`);
      if (title) {
        title.style.display = i === 0 ? "block" : "none";
      }
    }
    
    for (let i = 0; i < blockNamesList.length; i++) {
      const blockName = document.querySelector(`.nom-block h1:nth-child(${i + 1})`);
      if (blockName) {
        blockName.style.display = i === 0 ? "block" : "none";
      }
    }
    
    // Remettre le filtre gris sur toutes les images de mobs
    const mobImages = document.querySelectorAll('.img-village-bonus');
    mobImages.forEach(img => {
      img.style.filter = 'grayscale(100%)';
    });
    
    // Changer la musique
    if (overworldMusic) overworldMusic.pause();
    if (caveMusic) caveMusic.pause();
    if (netherMusic) netherMusic.pause();
    if (overworldMusic) {
      overworldMusic.currentTime = 0;
      overworldMusic.play();
    }
    
    // Supprimer les données sauvegardées
    localStorage.removeItem("playerPoints");
    localStorage.removeItem("purchasedMobs");
    localStorage.removeItem("gameStateClicker");
    
    // Afficher un message de confirmation
    alert("Jeu réinitialisé avec succès !");
    
    // Sauvegarder le nouvel état
    saveGame();
  }
}

// Créer et ajouter le bouton de reset au DOM
function addResetButton() {
  if (!document.getElementById('reset-button')) {
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.textContent = 'Réinitialiser le jeu';
    resetButton.style.position = 'fixed';
    resetButton.style.bottom = '20px';
    resetButton.style.right = '20px';
    resetButton.style.padding = '10px 15px';
    resetButton.style.backgroundColor = '#c62828';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '5px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.fontWeight = 'bold';
    
    // Ajouter un effet de survol
    resetButton.addEventListener('mouseover', function() {
      resetButton.style.backgroundColor = '#e53935';
    });
    
    resetButton.addEventListener('mouseout', function() {
      resetButton.style.backgroundColor = '#c62828';
    });
    
    // Ajouter l'écouteur d'événements pour le clic
    resetButton.addEventListener('click', resetGame);
    
    // Ajouter le bouton au document
    document.body.appendChild(resetButton);
  }
}

// Exporter les fonctions pour les autres scripts
window.gamePoints = {
  addPoints,
  subtractPoints,
  getPoints,
  updatePointsDisplay,
  resetGame
};

// Exécuter l'initialisation quand le DOM est chargé
document.addEventListener("DOMContentLoaded", initGame);