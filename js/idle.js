// idle.js - Gestion de l'auto-clicker basé sur les mobs

let autoClickInterval;      // Intervalle pour les clics automatiques
let autoClicksPerSecond = 0; // Nombre de clics automatiques par seconde
let purchasedMobs = {};     // Suivi des mobs achetés (une seule fois)
let autoClickMultiplier = 1; // Multiplicateur pour les potions
let mobDataMap = {
    'villageois': { type: 'villager', bonus: 1, cost: 150 },
    'zombie': { type: 'zombie', bonus: 3, cost: 500 },
    'squelette': { type: 'skeleton', bonus: 10, cost: 1200 },
    'enderman': { type: 'endermen', bonus: 50, cost: 3000 },
    'wither-squelette': { type: 'whither_skeleton', bonus: 100, cost: 7000 },
    'dragon-end': { type: 'ender_dragon', bonus: 500, cost: 10000 },
    'wither': { type: 'wither', bonus: 1000, cost: 17500 }
};

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
        } catch (e) {
            console.error("Erreur lors du chargement des mobs achetés:", e);
            purchasedMobs = {};
        }
    }
}

// Sauvegarder les mobs achetés dans localStorage
function savePurchasedMobs() {
    localStorage.setItem('purchasedMobs', JSON.stringify(purchasedMobs));
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
    
    // Appliquer le multiplicateur (pour les potions)
    autoClicksPerSecond = total * autoClickMultiplier;
    
    console.log("Clics auto par seconde:", autoClicksPerSecond);
    
    // Mettre à jour un élément d'UI pour montrer le taux actuel (optionnel)
    updateAutoClickDisplay();
}

// Mettre à jour l'affichage des clics automatiques (nouvelle fonction)
function updateAutoClickDisplay() {
    // Vous pourriez ajouter un élément dans votre HTML pour afficher ce taux
    // Par exemple: <div id="auto-clicks-display">0 clics/s</div>
    const autoClicksDisplay = document.createElement('div');
    autoClicksDisplay.id = 'auto-clicks-display';
    autoClicksDisplay.style.position = 'absolute';
    autoClicksDisplay.style.top = '10px';
    autoClicksDisplay.style.right = '10px';
    autoClicksDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    autoClicksDisplay.style.color = 'white';
    autoClicksDisplay.style.padding = '5px 10px';
    autoClicksDisplay.style.borderRadius = '5px';
    
    // Ajouter au document s'il n'existe pas déjà
    if (!document.getElementById('auto-clicks-display')) {
        document.body.appendChild(autoClicksDisplay);
    }
    
    // Mettre à jour le texte
    document.getElementById('auto-clicks-display').textContent = autoClicksPerSecond.toFixed(1) + ' clics/s';
}

// Démarrer l'auto-clicker
function startAutoClicker() {
    // Arrêter l'ancien intervalle s'il existe
    if (autoClickInterval) {
        clearInterval(autoClickInterval);
    }
    
    // Créer un nouvel intervalle qui effectue des clics automatiques
    autoClickInterval = setInterval(() => {
        if (autoClicksPerSecond > 0) {
            // Ajouter les points basés sur le taux actuel (1 seconde = 1000ms)
            addAutoClickPoints(autoClicksPerSecond / 10);
        }
    }, 100); // Mise à jour toutes les 100ms
}

// Ajouter des points basés sur les clics automatiques
function addAutoClickPoints(amount) {
    // Utiliser la fonction de gestion des points de clicker.js
    if (window.gamePoints && typeof window.gamePoints.addPoints === 'function') {
        window.gamePoints.addPoints(Math.floor(amount));
    } else {
        // Fallback si gamePoints n'est pas disponible
        const pointsDisplay = document.getElementById('points-display');
        if (!pointsDisplay) return;
        
        // Extraire le nombre actuel de points
        const pointsText = pointsDisplay.textContent || '0';
        const currentPoints = parseInt(pointsText) || 0;
        
        // Calculer les nouveaux points
        const newPoints = currentPoints + Math.floor(amount);
        
        // Mettre à jour l'affichage
        const nonNumericContent = pointsDisplay.innerHTML.replace(/^\d+/, '');
        pointsDisplay.innerHTML = newPoints + nonNumericContent;
    }
}

// Acheter un mob auto-clicker
function buyMob(mobType, clicksPerSecond, cost) {
    // Vérifier si le mob a déjà été acheté
    if (purchasedMobs[mobType] && purchasedMobs[mobType].purchased) {
        console.log("Mob déjà acheté:", mobType);
        return false;
    }
    
    // Utiliser la fonction de soustraction de points de clicker.js
    if (window.gamePoints && typeof window.gamePoints.subtractPoints === 'function') {
        if (window.gamePoints.subtractPoints(cost)) {
            // Achat réussi, continuer avec l'achat du mob
            purchaseMob(mobType, clicksPerSecond);
            return true;
        }
    } else {
        // Fallback si gamePoints n'est pas disponible
        const pointsDisplay = document.getElementById('points-display');
        if (!pointsDisplay) return false;
        
        // Extraire le nombre actuel de points
        const pointsText = pointsDisplay.textContent || '0';
        const currentPoints = parseInt(pointsText) || 0;
        
        // Vérifier si le joueur a assez de points
        if (currentPoints >= cost) {
            // Déduire le coût
            const newPoints = currentPoints - cost;
            const nonNumericContent = pointsDisplay.innerHTML.replace(/^\d+/, '');
            pointsDisplay.innerHTML = newPoints + nonNumericContent;
            
            // Puis acheter le mob
            purchaseMob(mobType, clicksPerSecond);
            return true;
        }
    }
    
    return false;
}

// Fonction séparée pour l'achat du mob (pour meilleure lisibilité)
function purchaseMob(mobType, clicksPerSecond) {
    // Enregistrer l'achat du mob
    purchasedMobs[mobType] = {
        purchased: true,
        clicksPerSecond: clicksPerSecond
    };
    
    // Mettre à jour le filtre gris de l'image du mob
    const mobImages = document.querySelectorAll('.img-village-bonus');
    for (let i = 0; i < mobImages.length; i++) {
        const imgSrc = mobImages[i].src;
        if (imgSrc.includes(mobType) || (mobImages[i].alt && mobImages[i].alt.toLowerCase().includes(mobType))) {
            mobImages[i].style.filter = 'grayscale(0%)';
            break;
        }
    }
    
    // Mettre à jour le taux de clics automatiques
    updateAutoClicksPerSecond();
    
    // Sauvegarder l'achat
    savePurchasedMobs();
    
    console.log(`Mob acheté: ${mobType}, +${clicksPerSecond} clics/sec`);
}

// Configurer les événements pour les icônes de mobs
function setupMobClickEvents() {
    // Ajouter des gestionnaires d'événements aux images des mobs
    const mobImages = document.querySelectorAll('.img-village-bonus');
    
    mobImages.forEach((img, index) => {
        // Déterminer le type de mob en fonction de l'index
        let mobType;
        switch (index) {
            case 0: mobType = 'villager'; break;
            case 1: mobType = 'zombie'; break;
            case 2: mobType = 'skeleton'; break;
            case 3: mobType = 'endermen'; break;
            case 4: mobType = 'whither_skeleton'; break;
            case 5: mobType = 'ender_dragon'; break;
            case 6: mobType = 'wither'; break;
            default: return;
        }
        
        // Vérifier si le mob est déjà acheté lors du chargement
        if (purchasedMobs[mobType] && purchasedMobs[mobType].purchased) {
            img.style.filter = 'grayscale(0%)';
        }
        
        // Ajouter l'événement de clic
        img.addEventListener('click', function() {
            // Déterminer les bonus et coûts en fonction du type de mob
            let bonus = 0;
            let cost = 0;
            
            switch (mobType) {
                case 'villager':
                    bonus = 1;
                    cost = 150;
                    break;
                case 'zombie':
                    bonus = 3;
                    cost = 500;
                    break;
                case 'skeleton':
                    bonus = 10;
                    cost = 1200;
                    break;
                case 'endermen':
                    bonus = 50;
                    cost = 3000;
                    break;
                case 'whither_skeleton':
                    bonus = 100;
                    cost = 7000;
                    break;
                case 'ender_dragon':
                    bonus = 500;
                    cost = 10000;
                    break;
                case 'wither':
                    bonus = 1000;
                    cost = 17500;
                    break;
            }
            
            // Essayer d'acheter le mob
            buyMob(mobType, bonus, cost);
        });
    });
}

// Appliquer un boost temporaire aux clics automatiques (pour les potions)
function applyAutoClickBoost(multiplier, duration) {
    // Sauvegarder l'ancien multiplicateur
    const oldMultiplier = autoClickMultiplier;
    
    // Appliquer le nouveau multiplicateur
    autoClickMultiplier = multiplier;
    updateAutoClicksPerSecond();
    
    // Réinitialiser après la durée spécifiée
    setTimeout(() => {
        autoClickMultiplier = oldMultiplier;
        updateAutoClicksPerSecond();
    }, duration * 1000);
}

// Initialiser l'auto-clicker quand la page est chargée
document.addEventListener('DOMContentLoaded', initAutoClicker);

// Exposer les fonctions qui pourraient être nécessaires pour d'autres parties du jeu
window.autoClicker = {
    buyMob,
    applyAutoClickBoost,
    getAutoClicksPerSecond: () => autoClicksPerSecond
};