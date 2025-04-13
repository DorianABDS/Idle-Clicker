// Variables globales
let purchasedMobs = {};
let autoClickInterval;
let autoClicksPerSecond = 0;

// Ajouter un bouton pour réinitialiser le jeu
document.addEventListener('DOMContentLoaded', () => {
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Réinitialiser le jeu';
    resetButton.style.position = 'absolute';
    resetButton.style.top = '40px';
    resetButton.style.right = '10px';
    resetButton.style.padding = '5px 10px';
    resetButton.style.backgroundColor = '#ff4444';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '5px';
    resetButton.style.cursor = 'pointer';

    resetButton.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser le jeu ? Tout progrès sera perdu.')) {
            // Reset game data
            purchasedMobs = {};
            autoClicksPerSecond = 0;
            
            // Clear all localStorage
            localStorage.clear();
            
            // Reset mob images to grayscale
            document.querySelectorAll('.img-village-bonus').forEach(img => {
                img.style.filter = 'grayscale(100%)';
            });
            
            // Reset points via la variable globale points de clicker.js
            if (typeof points !== 'undefined') {
                points = 0;
                updatePointsDisplay();
            }
            
            // Stop auto clicker interval
            if (autoClickInterval) {
                clearInterval(autoClickInterval);
            }
            
            // Update auto-clicks display
            updateAutoClicksPerSecond();
            // Restart auto clicker with reset values
            startAutoClicker();
        }
    });

    document.body.appendChild(resetButton);
});

// Carte des données des mobs
const mobDataMap = {
    'villageois': { type: 'villager', bonus: 1, cost: 150 },
    'zombie': { type: 'zombie', bonus: 3, cost: 500 },
    'squelette': { type: 'skeleton', bonus: 10, cost: 1200 },
    'enderman': { type: 'endermen', bonus: 50, cost: 3000 },
    'wither-squelette': { type: 'whither_skeleton', bonus: 100, cost: 7000 },
    'dragon-end': { type: 'ender_dragon', bonus: 500, cost: 10000 },
    'wither': { type: 'wither', bonus: 1000, cost: 17500 }
};

// Fonction pour sauvegarder les données d'auto-clicker
function saveAutoClickerData() {
    localStorage.setItem('purchasedMobs', JSON.stringify(purchasedMobs));
    localStorage.setItem('autoClicksPerSecond', autoClicksPerSecond);
}

// Initialiser l'auto-clicker
function initAutoClicker() {
    console.log("Initialisation de l'auto-clicker");
    
    // Récupérer les données enregistrées des mobs achetés
    loadPurchasedMobs();
    
    // Démarrer l'auto-clicker
    startAutoClicker();
    
    // Configurer les événements pour les icônes de mobs
    setupMobClickEvents();
}

// Charger les mobs achetés depuis localStorage
function loadPurchasedMobs() {
    const savedData = localStorage.getItem('purchasedMobs');
    if (savedData) {
        try {
            purchasedMobs = JSON.parse(savedData);
            updateAutoClicksPerSecond();
            
            // Mettre à jour le style des images pour les mobs achetés
            for (const mobType in purchasedMobs) {
                if (purchasedMobs[mobType].purchased) {
                    updateMobImageStyle(mobType, false);
                }
            }
        } catch (e) {
            console.error("Erreur lors du chargement des mobs achetés:", e);
            purchasedMobs = {};
        }
    }
}

// Mettre à jour le nombre de clics automatiques par seconde
function updateAutoClicksPerSecond() {
    let total = 0;
    
    // Calculer le total des clics automatiques
    for (const mobType in purchasedMobs) {
        if (purchasedMobs.hasOwnProperty(mobType) && purchasedMobs[mobType].purchased) {
            total += purchasedMobs[mobType].clicksPerSecond;
        }
    }
    
    autoClicksPerSecond = total;
    
    console.log("Clics auto par seconde:", autoClicksPerSecond);
    
    // Mettre à jour un élément d'UI pour montrer le taux actuel
    updateAutoClickDisplay();
}

// Mettre à jour l'affichage des clics automatiques
function updateAutoClickDisplay() {
    let autoClicksDisplay = document.getElementById('auto-clicks-display');
    
    // Créer l'élément s'il n'existe pas
    if (!autoClicksDisplay) {
        autoClicksDisplay = document.createElement('div');
        autoClicksDisplay.id = 'auto-clicks-display';
        autoClicksDisplay.style.position = 'absolute';
        autoClicksDisplay.style.top = '10px';
        autoClicksDisplay.style.right = '10px';
        autoClicksDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        autoClicksDisplay.style.color = 'white';
        autoClicksDisplay.style.padding = '5px 10px';
        autoClicksDisplay.style.borderRadius = '5px';
        autoClicksDisplay.style.fontFamily = 'Arial, sans-serif';
        autoClicksDisplay.style.fontSize = '14px';
        autoClicksDisplay.style.zIndex = '1000';
        
        document.body.appendChild(autoClicksDisplay);
    }
    
    // Mettre à jour le texte
    autoClicksDisplay.textContent = autoClicksPerSecond.toFixed(1) + ' clics/s';
}

// Démarrer l'auto-clicker
function startAutoClicker() {
    // Arrêter l'ancien intervalle s'il existe
    if (autoClickInterval) {
        clearInterval(autoClickInterval);
    }
    
    // Créer un nouvel intervalle qui effectue des clics automatiques plus fréquemment
    // mais avec des montants plus petits (10 fois par seconde)
    autoClickInterval = setInterval(() => {
        if (autoClicksPerSecond > 0) {
            // Ajouter un dixième du taux par seconde
            // Le problème était peut-être ici, s'assurer d'appliquer la valeur exacte
            addAutoClickPoints(autoClicksPerSecond / 10);
        }
    }, 100); // Mise à jour 10 fois par seconde
}

// Simuler un clic automatique et ajouter des points
function addAutoClickPoints(amount) {
    // S'assurer que amount est un nombre raisonnable
    if (isNaN(amount) || amount <= 0) {
        console.warn("Montant invalide pour addAutoClickPoints:", amount);
        return;
    }
    
    // Limiter le montant en cas de valeur anormalement élevée
    if (amount > 1000) {
        console.warn("Montant anormalement élevé limité:", amount);
        amount = 1000; // Valeur maximale arbitraire
    }
    
    // Accéder directement à la variable points de clicker.js
    if (typeof points !== 'undefined') {
        points += amount;
        
        // Mettre à jour l'affichage
        updatePointsDisplay();
        
        // Vérifier si des déverrouillages doivent se produire
        if (typeof checkBlockUnlock === 'function') checkBlockUnlock();
        if (typeof checkBackgroundUnlock === 'function') checkBackgroundUnlock();
        if (typeof checkTitleUnlock === 'function') checkTitleUnlock();
        if (typeof checkBlockNamesUnlock === 'function') checkBlockNamesUnlock();
        if (typeof changeMusic === 'function') changeMusic();
    } else {
        // Fallback si la variable points n'est pas accessible
        const pointsDisplay = document.getElementById('points-display');
        if (pointsDisplay) {
            // Extraire le nombre actuel de points du texte affiché
            const pointsText = pointsDisplay.textContent.replace(/[^\d]/g, '');
            const currentPoints = parseInt(pointsText) || 0;
            
            // Calculer les nouveaux points
            const newPoints = currentPoints + Math.floor(amount);
            
            // Mettre à jour l'affichage
            // On préserve l'image d'émeraude s'il y en a une
            const nonNumericContent = pointsDisplay.innerHTML.replace(/^\d+/, '');
            pointsDisplay.innerHTML = newPoints + nonNumericContent;
        }
    }
}

// Acheter un mob auto-clicker
function buyMob(mobType, clicksPerSecond, cost) {
    console.log(`Tentative d'achat: ${mobType}, coût: ${cost}`);
    
    // Vérifier si le mob a déjà été acheté
    if (purchasedMobs[mobType] && purchasedMobs[mobType].purchased) {
        console.log("Mob déjà acheté:", mobType);
        return false;
    }
    
    // Vérifier si le joueur a assez de points
    let currentPoints;
    
    // Accéder directement à la variable points de clicker.js
    if (typeof points !== 'undefined') {
        currentPoints = points;
    } else {
        // Fallback: extraire les points de l'affichage
        const pointsDisplay = document.getElementById('points-display');
        if (pointsDisplay) {
            const pointsText = pointsDisplay.textContent.replace(/[^\d]/g, '');
            currentPoints = parseInt(pointsText) || 0;
        } else {
            console.error("Impossible de déterminer les points actuels");
            return false;
        }
    }
    
    console.log(`Points actuels: ${currentPoints}, coût: ${cost}`);
    
    // Vérifier si le joueur a assez de points
    if (currentPoints >= cost) {
        // Déduire le coût
        if (typeof points !== 'undefined') {
            points -= cost;
            updatePointsDisplay();
        } else {
            // Fallback pour mettre à jour l'affichage
            const pointsDisplay = document.getElementById('points-display');
            if (pointsDisplay) {
                const newPoints = currentPoints - cost;
                const nonNumericContent = pointsDisplay.innerHTML.replace(/^\d+/, '');
                pointsDisplay.innerHTML = newPoints + nonNumericContent;
            }
        }
        
        // Enregistrer l'achat du mob
        purchasedMobs[mobType] = {
            purchased: true,
            clicksPerSecond: clicksPerSecond
        };
        
        // Mettre à jour le style de l'image du mob
        updateMobImageStyle(mobType, true);
        
        // Mettre à jour le taux de clics automatiques
        updateAutoClicksPerSecond();
        
        // Sauvegarder l'achat
        saveAutoClickerData();
        
        console.log(`Mob acheté: ${mobType}, +${clicksPerSecond} clics/sec`);
        
        // Jouer un son d'achat si disponible
        const levelUpSound = document.getElementById('level-up-sound');
        if (levelUpSound) {
            levelUpSound.play();
        }
        
        return true;
    } else {
        console.log("Pas assez de points pour acheter ce mob");
        return false;
    }
}

// Mettre à jour le style de l'image d'un mob
function updateMobImageStyle(mobType, showFeedback) {
    // Trouver la bonne image à mettre à jour
    const mobImages = document.querySelectorAll('.img-village-bonus');
    let foundImage = false;
    
    // Chercher l'image correspondante dans le DOM
    mobImages.forEach((img, index) => {
        const imgSrc = img.src.toLowerCase();
        const imgAlt = (img.alt || '').toLowerCase();
        
        // Vérifier si l'image correspond au type de mob
        let matchesMob = false;
        
        // Correspondance par le nom du fichier dans l'URL
        for (const key in mobDataMap) {
            if (mobDataMap[key].type.toLowerCase() === mobType.toLowerCase() && 
                (imgSrc.includes(key.toLowerCase()) || imgAlt.includes(key.toLowerCase()))) {
                matchesMob = true;
                break;
            }
        }
        
        // Correspondance alternative en utilisant l'index pour les cas d'échec de correspondance URL
        if (!matchesMob) {
            const mobTypes = Object.values(mobDataMap).map(data => data.type.toLowerCase());
            if (index < mobTypes.length && mobTypes[index] === mobType.toLowerCase()) {
                matchesMob = true;
            }
        }
        
        if (matchesMob) {
            // Mettre à jour le filtre de gris
            img.style.filter = 'grayscale(0%)';
            foundImage = true;
            
            // Ajouter une animation pour le feedback visuel
            if (showFeedback) {
                img.classList.add('purchase-animation');
                setTimeout(() => {
                    img.classList.remove('purchase-animation');
                }, 1000);
            }
        }
    });
    
    if (!foundImage) {
        console.warn(`Image pour le mob ${mobType} non trouvée`);
    }
    
    return foundImage;
}

// Configurer les événements pour les icônes de mobs
function setupMobClickEvents() {
    console.log("Configuration des événements pour les mobs");
    
    // Ajouter du CSS pour l'animation d'achat
    const style = document.createElement('style');
    style.textContent = `
        @keyframes purchaseAnimation {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        .purchase-animation {
            animation: purchaseAnimation 0.5s ease;
        }
        .img-village-bonus {
            cursor: pointer;
        }
        .img-village-bonus:hover {
            transform: scale(1.1);
            transition: transform 0.2s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Ajouter des gestionnaires d'événements aux images des mobs
    const mobImages = document.querySelectorAll('.img-village-bonus');
    console.log(`Trouvé ${mobImages.length} images de mobs`);
    
    mobImages.forEach((img, index) => {
        // Déterminer le type de mob en fonction de l'image ou de l'index
        let mobKey = '';
        
        // D'abord, essayer par le nom de fichier dans l'URL
        const imgSrc = img.src;
        const imgName = imgSrc.substring(imgSrc.lastIndexOf('/') + 1).replace('.png', '');
        
        // Chercher dans mobDataMap
        for (const key in mobDataMap) {
            if (imgName === key || imgSrc.includes(key)) {
                mobKey = key;
                break;
            }
        }
        
        // Si aucune correspondance n'est trouvée, utiliser l'index
        if (!mobKey) {
            const keys = Object.keys(mobDataMap);
            if (index < keys.length) {
                mobKey = keys[index];
            } else {
                console.warn(`Pas de données trouvées pour l'image #${index}`);
                return;
            }
        }
        
        const mobData = mobDataMap[mobKey];
        const mobType = mobData.type;
        const bonus = mobData.bonus;
        const cost = mobData.cost;
        
        console.log(`Configuré mob ${mobKey} (${mobType}) avec bonus=${bonus}, cost=${cost}`);
        
        // Vérifier si le mob est déjà acheté lors du chargement
        if (purchasedMobs[mobType] && purchasedMobs[mobType].purchased) {
            img.style.filter = 'grayscale(0%)';
        }
        
        // Ajouter un tooltip pour montrer le coût et le bonus
        img.title = `${mobType}: Coût ${cost} points, +${bonus} clics/sec`;
        
        // Ajouter l'événement de clic
        img.addEventListener('click', function() {
            console.log(`Clic sur le mob ${mobType}`);
            // Essayer d'acheter le mob
            buyMob(mobType, bonus, cost);
        });
    });
}

// Initialiser l'auto-clicker quand la page est chargée
document.addEventListener('DOMContentLoaded', initAutoClicker);

// Exposer les fonctions qui pourraient être nécessaires pour d'autres parties du jeu
window.autoClicker = {
    buyMob,
    getAutoClicksPerSecond: () => autoClicksPerSecond
};