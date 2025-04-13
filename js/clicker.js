let points = 0;
let currentBlockIndex = 0;
let currentBackgroundIndex = 0;
let currentTitleIndex = 0;
let currentBlockNameIndex = 0;
let currentMusicLevel = 'overworldMusic';


const clickSound = document.getElementById('click-sound');
const levelUpSound = document.getElementById('level-up-sound');

import { loadGameStateClicker, saveGameStateClicker } from './storage.js';

// Ajuster le volume des sons
clickSound.volume = 0.3;   // Réduit à 30% du volume
levelUpSound.volume = 0.15;
levelUpSound.play();
setTimeout(() => {
    levelUpSound.volume = 0.1; // Diminue progressivement
}, 500);


// Liste des blocs avec leur seuil
const blockList = [
    { id: 'wood-block', threshold: 0 },
    { id: 'stone-block', threshold: 10 },
    { id: 'coal-block', threshold: 20 },
    { id: 'iron-block', threshold: 30 },
    { id: 'gold-block', threshold: 40 },
    { id: 'redstone-block', threshold: 50 },
    { id: 'lapis-block', threshold: 60 },
    { id: 'emerald-block', threshold: 70 },
    { id: 'diamond-block', threshold: 80 },
    { id: 'netherite-block', threshold: 90 }
];

// Liste des backgrounds avec leur seuil
const backgroundsList = [
    { id: 'herbe-wall', threshold: 0 },
    { id: 'stone-wall', threshold: 20 },
    { id: 'deepslate-wall', threshold: 80 },
    { id: 'portail-nether', threshold: 90 }
];

// Liste des titres avec leur seuil
const titlesList = [
    { title: 'Plaine', threshold: 0 },
    { title: 'Grotte', threshold: 20 },
    { title: 'Grotte Profonde', threshold: 80 },
    { title: 'Nether', threshold: 90 }
];

// Liste des noms de blocs avec leur seuil
const blockNamesList = [
    { name: 'BOIS', threshold: 0 },
    { name: 'PIERRE', threshold: 10 },
    { name: 'CHARBON', threshold: 20 },
    { name: 'FER', threshold: 30 },
    { name: 'OR', threshold: 40 },
    { name: 'REDSTONE', threshold: 50 },
    { name: 'LAPIS-LAZULIS', threshold: 60 },
    { name: 'ÉMERAUDE', threshold: 70 },
    { name: 'DIAMANT', threshold: 80 },
    { name: 'NETHERITE', threshold: 90 }
];
// Récupérer les éléments audio pour chaque niveau
const overworldMusic = document.getElementById('overworld-music');
const caveMusic = document.getElementById('cave-music');
const netherMusic = document.getElementById('nether-music');

function changeMusic() {
    if (points >= 90 && currentMusicLevel !== 'nether') {
        // Si le joueur a 90 points ou plus et que la musique n'est pas déjà celle du Nether
        overworldMusic.pause();  // Pause la musique de l'Overworld
        caveMusic.pause();       // Pause la musique de la Cave
        netherMusic.currentTime = 0;  // Remettre la musique du Nether au début
        netherMusic.play();      // Démarrer la musique du Nether
        currentMusicLevel = 'nether';  // Mettre à jour le niveau de musique
    } else if (points >= 20 && points < 90 && currentMusicLevel !== 'cave') {
        // Si le joueur a entre 20 et 89 points et que la musique n'est pas déjà celle de la Cave
        overworldMusic.pause();  // Pause la musique de l'Overworld
        netherMusic.pause();     // Pause la musique du Nether
        caveMusic.currentTime = 0;  // Remettre la musique de la Cave au début
        caveMusic.play();        // Démarrer la musique de la Cave
        currentMusicLevel = 'cave';  // Mettre à jour le niveau de musique
    } else if (points < 20 && currentMusicLevel !== 'overworld') {
        // Si le joueur a moins de 20 points et que la musique n'est pas déjà celle de l'Overworld
        caveMusic.pause();       // Pause la musique de la Cave
        netherMusic.pause();     // Pause la musique du Nether
        overworldMusic.currentTime = 0;  // Remettre la musique de l'Overworld au début
        overworldMusic.play();   // Démarrer la musique de l'Overworld
        currentMusicLevel = 'overworld';  // Mettre à jour le niveau de musique
    }
}



// Liste des items spéciaux (bonus et malus)
const specialItems = [
    {
        id: 'pomme-notch',
        src: '/assets/img/pomme_notch.webp',
        chance: 0.1, // 10% à chaque intervalle
        onClick: () => {
            const percentageToAdd = 10; // Ajouter 10% des points actuels
            const pointsToAdd = Math.round(points * (percentageToAdd / 100)); // Arrondir les points à ajouter
            points += pointsToAdd;
            updatePointsDisplay();
            showFeedbackMessage(`+${pointsToAdd} points !`, 'green');
        },
        onTimeout: () => {
            // Aucun malus si ignoré, mais l'élément sera supprimé quand même
        }
    },
    {
        id: 'creeper',
        src: '/assets/img/creeper.png',
        chance: 0.07, // 7% de chance
        onClick: () => {
            // Pas de bonus pour le creeper, juste un message de perte de points si ignoré
        },
        onTimeout: () => {
            const percentageToRemove = 10; // Retirer 10% des points actuels
            const pointsToRemove = Math.round(points * (percentageToRemove / 100)); // Arrondir les points à retirer
            points = Math.max(0, points - pointsToRemove); // Assurer que points ne deviennent pas négatifs
            updatePointsDisplay();
            showFeedbackMessage(`-${pointsToRemove} points !`, 'red');
    
            // Re-vérifie le changement de musique après perte de points
    changeMusic();

    // Vérifie le changement de bloc, de fond, de titre et du nom du bloc après la perte de points
    checkBlockUnlock();
    checkBackgroundUnlock();
    checkTitleUnlock();
    checkBlockNamesUnlock();  // Vérifie le changement du nom du bloc
        }
    }
    
];

// Fonctions pour sauvegarder la progression dans le localStorage
function saveGame() {
    const gameState = {
        points: points,
        currentBlockIndex: currentBlockIndex,
        currentBackgroundIndex: currentBackgroundIndex,
        currentTitleIndex: currentTitleIndex,
        currentBlockNameIndex: currentBlockNameIndex,
        currentMusicLevel: currentMusicLevel
    };

    saveGameStateClicker(gameState);
    console.log('Progression sauvegardée');
}

// Fonction pour charger la progression depuis le localStorage
function loadGame() {
    const gameState = loadGameStateClicker();


    if (gameState) {
        points = gameState.points;
        currentBlockIndex = gameState.currentBlockIndex;
        currentBackgroundIndex = gameState.currentBackgroundIndex;
        currentTitleIndex = gameState.currentTitleIndex;
        currentBlockNameIndex = gameState.currentBlockNameIndex;
        currentMusicLevel = gameState.currentMusicLevel;

        console.log('Progression chargée');

        updatePointsDisplay();
        changeMusic();

        // Mise à jour des éléments visuels comme tu le fais déjà très bien :
        for (let i = 0; i < blockList.length; i++) {
            const block = document.getElementById(blockList[i].id);
            if (block) {
                block.style.display = i === currentBlockIndex ? 'block' : 'none';
            }
        }
        for (let i = 0; i < backgroundsList.length; i++) {
            const background = document.querySelector(`#background-block-section img:nth-child(${i + 1})`);
            if (background) {
                background.style.display = i === currentBackgroundIndex ? 'block' : 'none';
            }
        }
        for (let i = 0; i < titlesList.length; i++) {
            const title = document.querySelector(`.titre-bg h1:nth-child(${i + 1})`);
            if (title) {
                title.style.display = i === currentTitleIndex ? 'block' : 'none';
            }
        }
        for (let i = 0; i < blockNamesList.length; i++) {
            const blockName = document.querySelector(`.nom-block h1:nth-child(${i + 1})`);
            if (blockName) {
                blockName.style.display = i === currentBlockNameIndex ? 'block' : 'none';
            }
        }
    } else {
        console.log('Aucune sauvegarde trouvée');
    }
}


// Sauvegarder automatiquement la progression toutes les 10 secondes
function setupAutoSave() {
    setInterval(saveGame, 10000); // 10000 ms = 10 secondes
}

// Sauvegarder aussi avant que la page ne soit fermée
window.addEventListener('beforeunload', saveGame);

// Fonction pour gérer le clic sur les blocs
function handleClick(event) {
    const pointsPerClick = calculatePointsPerClick();
    points += pointsPerClick;
    updatePointsDisplay();
    showClickFeedback(event, pointsPerClick);
    checkBlockUnlock(); // Vérifie le changement de bloc
    checkBackgroundUnlock(); // Vérifie le changement de fond
    checkTitleUnlock(); // Vérifie le changement de titre
    checkBlockNamesUnlock(); // Vérifie le changement du nom du bloc

    // Appel à changeMusic() à chaque clic pour gérer la musique
    changeMusic();

    // Joue le son lors du clic
    clickSound.play();

    trySpawnSpecialItem();
    
    // Sauvegarder la progression après chaque clic
    saveGame();
}

function calculatePointsPerClick() {
    return 1; // Valeur par défaut, tu peux adapter selon ta logique
}

function updatePointsDisplay() {
    const pointsDisplay = document.getElementById('points-display');
    const pointsPerClickDisplay = document.getElementById('points-per-click-display');

    if (pointsDisplay) {
        pointsDisplay.textContent = `Points: ${points}`;
    }

    if (pointsPerClickDisplay) {
        const pointsPerClick = calculatePointsPerClick();
        pointsPerClickDisplay.textContent = `Points par clic: ${pointsPerClick}`;
    }
}

function showClickFeedback(event, pointsPerClick) {
    const feedback = document.createElement('div');
    feedback.textContent = `+${pointsPerClick}`;
    feedback.className = 'click-feedback';
    document.body.appendChild(feedback);

    feedback.style.left = `${event.clientX}px`;
    feedback.style.top = `${event.clientY}px`;

    setTimeout(() => {
        feedback.remove();
    }, 1000);
}

// Vérifie si on doit débloquer ou rétablir un bloc
function checkBlockUnlock() {
    let nextBlockIndex = currentBlockIndex + 1;
    let previousBlockIndex = currentBlockIndex - 1;

    // Débloquer un nouveau bloc si points >= seuil du prochain bloc
    if (nextBlockIndex < blockList.length && points >= blockList[nextBlockIndex].threshold) {
        const currentBlock = document.getElementById(blockList[currentBlockIndex].id);
        if (currentBlock) currentBlock.style.display = 'none'; // Cacher l'ancien bloc

        const newBlock = document.getElementById(blockList[nextBlockIndex].id);
        if (newBlock) {
            newBlock.style.display = 'block'; // Afficher le nouveau bloc

            // Animation pop-in
            newBlock.classList.add('unlocked');
            setTimeout(() => {
                newBlock.classList.remove('unlocked');
            }, 400);
        }

        currentBlockIndex = nextBlockIndex;

        // Joue le son de "level-up" quand un nouveau bloc est débloqué
        levelUpSound.play();
    }

    // Rétablir un bloc précédent si points < seuil du bloc actuel
    if (previousBlockIndex >= 0 && points < blockList[currentBlockIndex].threshold) {
        const currentBlock = document.getElementById(blockList[currentBlockIndex].id);
        if (currentBlock) currentBlock.style.display = 'none'; // Cacher l'actuel bloc

        const previousBlock = document.getElementById(blockList[previousBlockIndex].id);
        if (previousBlock) {
            previousBlock.style.display = 'block'; // Afficher le bloc précédent

            // Animation pop-in
            previousBlock.classList.add('unlocked');
            setTimeout(() => {
                previousBlock.classList.remove('unlocked');
            }, 400);
        }

        currentBlockIndex = previousBlockIndex;
    }
}


// Vérifie si on doit changer de fond ou rétablir un fond précédent
function checkBackgroundUnlock() {
    let nextBackgroundIndex = currentBackgroundIndex + 1;
    let previousBackgroundIndex = currentBackgroundIndex - 1;

    // Débloquer un nouveau fond si points >= seuil du prochain fond
    if (nextBackgroundIndex < backgroundsList.length && points >= backgroundsList[nextBackgroundIndex].threshold) {
        const currentBackground = document.querySelector(`#background-block-section img:nth-child(${currentBackgroundIndex + 1})`);
        if (currentBackground) {
            currentBackground.style.display = 'none'; // Cacher l'image actuelle
        }

        const newBackground = document.querySelector(`#background-block-section img:nth-child(${nextBackgroundIndex + 1})`);
        if (newBackground) {
            newBackground.style.display = 'block'; // Afficher le nouveau fond
        }

        currentBackgroundIndex = nextBackgroundIndex;
    }

    // Rétablir un fond précédent si points < seuil du fond actuel
    if (previousBackgroundIndex >= 0 && points < backgroundsList[currentBackgroundIndex].threshold) {
        const currentBackground = document.querySelector(`#background-block-section img:nth-child(${currentBackgroundIndex + 1})`);
        if (currentBackground) {
            currentBackground.style.display = 'none'; // Cacher l'image actuelle
        }

        const previousBackground = document.querySelector(`#background-block-section img:nth-child(${previousBackgroundIndex + 1})`);
        if (previousBackground) {
            previousBackground.style.display = 'block'; // Afficher le fond précédent
        }

        currentBackgroundIndex = previousBackgroundIndex;
    }
}

// Vérifie si on doit changer de titre ou rétablir un titre précédent
function checkTitleUnlock() {
    let nextTitleIndex = currentTitleIndex + 1;
    let previousTitleIndex = currentTitleIndex - 1;

    // Débloquer un nouveau titre si points >= seuil du prochain titre
    if (nextTitleIndex < titlesList.length && points >= titlesList[nextTitleIndex].threshold) {
        const currentTitle = document.querySelector('.titre-bg h1:nth-child(' + (currentTitleIndex + 1) + ')');
        if (currentTitle) currentTitle.style.display = 'none'; // Cacher l'ancien titre

        const newTitle = document.querySelector('.titre-bg h1:nth-child(' + (nextTitleIndex + 1) + ')');
        if (newTitle) {
            newTitle.style.display = 'block'; // Afficher le nouveau titre
        }

        currentTitleIndex = nextTitleIndex;
    }

    // Rétablir un titre précédent si points < seuil du titre actuel
    if (previousTitleIndex >= 0 && points < titlesList[currentTitleIndex].threshold) {
        const currentTitle = document.querySelector('.titre-bg h1:nth-child(' + (currentTitleIndex + 1) + ')');
        if (currentTitle) currentTitle.style.display = 'none'; // Cacher l'actuel titre

        const previousTitle = document.querySelector('.titre-bg h1:nth-child(' + (previousTitleIndex + 1) + ')');
        if (previousTitle) {
            previousTitle.style.display = 'block'; // Afficher le titre précédent
        }

        currentTitleIndex = previousTitleIndex;
    }
}

// Vérifie si on doit changer le nom du bloc ou rétablir un nom précédent
function checkBlockNamesUnlock() {
    let nextBlockNameIndex = currentBlockNameIndex + 1;
    let previousBlockNameIndex = currentBlockNameIndex - 1;

    // Débloquer un nouveau nom de bloc si points >= seuil du prochain nom
    if (nextBlockNameIndex < blockNamesList.length && points >= blockNamesList[nextBlockNameIndex].threshold) {
        const currentBlockName = document.querySelector('.nom-block h1:nth-child(' + (currentBlockNameIndex + 1) + ')');
        if (currentBlockName) currentBlockName.style.display = 'none'; // Cacher l'ancien nom de bloc

        const newBlockName = document.querySelector('.nom-block h1:nth-child(' + (nextBlockNameIndex + 1) + ')');
        if (newBlockName) {
            newBlockName.style.display = 'block'; // Afficher le nouveau nom de bloc
        }

        currentBlockNameIndex = nextBlockNameIndex;
    }

    // Rétablir un nom de bloc précédent si points < seuil du nom actuel
    if (previousBlockNameIndex >= 0 && points < blockNamesList[currentBlockNameIndex].threshold) {
        const currentBlockName = document.querySelector('.nom-block h1:nth-child(' + (currentBlockNameIndex + 1) + ')');
        if (currentBlockName) currentBlockName.style.display = 'none'; // Cacher l'actuel nom de bloc

        const previousBlockName = document.querySelector('.nom-block h1:nth-child(' + (previousBlockNameIndex + 1) + ')');
        if (previousBlockName) {
            previousBlockName.style.display = 'block'; // Afficher le nom de bloc précédent
        }

        currentBlockNameIndex = previousBlockNameIndex;
    }
}


// Fonction pour afficher un message de feedback sur l'écran
function showFeedbackMessage(message, color) {
    const feedbackMessage = document.createElement('div');
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message';
    feedbackMessage.style.color = color; // Change la couleur selon le gain ou la perte
    document.body.appendChild(feedbackMessage);

    // Positionner le message juste à côté du feedback
    feedbackMessage.style.position = 'absolute';
    feedbackMessage.style.left = '8.5%';  // Centré horizontalement
    feedbackMessage.style.bottom = '28%';  // Centré verticalement

    // Supprime le message après 2 secondes
    setTimeout(() => {
        feedbackMessage.remove();
    }, 2000);
}

// Fonction pour tenter de générer un item spécial à un endroit aléatoire
function trySpawnSpecialItem() {
    specialItems.forEach(item => {
        if (Math.random() < item.chance) {
            const img = document.createElement('img');
            img.src = item.src;
            img.className = 'special-item';
            img.id = item.id;

            let wasClicked = false;

            // Positionnement aléatoire dans la fenêtre
            const x = Math.random() * (window.innerWidth - 120);  // Ajuste selon la taille de l'image (120px)
            const y = Math.random() * (window.innerHeight - 120); // Ajuste selon la taille de l'image (120px)
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;

            // Ajouter l'image au corps du document
            document.body.appendChild(img);

            // Si l'image a été cliquée avant la fin du délai, annuler le timeout
            img.addEventListener('click', () => {
                if (!wasClicked) {
                    wasClicked = true;
                    item.onClick();  // Appliquer le bonus ou malus
                    img.remove();    // Retirer l'image immédiatement après clic
                    console.log(`${item.id} a été cliqué, le bonus/malus est appliqué`);
                }
            });

            // Timeout pour supprimer l'image si elle n'est pas cliquée après 3 secondes
            setTimeout(() => {
                if (!wasClicked) {
                    item.onTimeout();  // Appliquer le malus ou bonus si non cliqué
                    img.remove();      // Retirer l'image après 3 secondes
                    console.log(`${item.id} est expiré après 3 secondes sans clic`);
                }
            }, 3000); // 3 secondes avant disparition
        }
    });
}


// Fonction pour spawner un item spécial toutes les 5 secondes
function startRandomItemSpawner() {
    setInterval(() => {
        specialItems.forEach(item => {
            if (Math.random() < item.chance) {
                trySpawnSpecialItem();
            }
        });
    }, 5000); // Toutes les 5 secondes, vérifie les chances
}

document.addEventListener('DOMContentLoaded', () => {
    // Définition des volumes au chargement de la page
    clickSound.volume = 0.3;
    levelUpSound.volume = 0.4;
    overworldMusic.volume = 0.1;
    caveMusic.volume = 0.1;
    netherMusic.volume = 0.1;

    // Charger la sauvegarde si elle existe
    loadGame();
    
    // // Configurer la sauvegarde automatique
    setupAutoSave();
    
    function startMusicOnce() {
        if (currentMusicLevel === 'overworld') {
            overworldMusic.play();
        } else if (currentMusicLevel === 'cave') {
            caveMusic.play();
        } else if (currentMusicLevel === 'nether') {
            netherMusic.play();
        }
    
        // Supprime le listener une fois la musique lancée
        document.removeEventListener('click', startMusicOnce);
    }
    
    document.addEventListener('click', startMusicOnce);

    startRandomItemSpawner();  // Autres initialisations
    const clickTarget = document.getElementById('click-button');
    if (clickTarget) {
        clickTarget.addEventListener('click', handleClick);
    }

    updatePointsDisplay(); // Affiche les points initiaux
});