// Sauvegarde une valeur dans le localStorage sous une clé spécifique
// La valeur est d'abord convertie en chaîne JSON avant d'être stockée
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
}

// Récupère une valeur depuis le localStorage en fonction de la clé
// Si aucune donnée n'est trouvée, retourne null
function getFromLocalStorage(key) {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
}

// Sauvegarde l'état du jeu sous la clé 'gameSave'
// Utilise la fonction saveToLocalStorage pour stocker l'objet d'état
function saveGameState(state) {
    saveToLocalStorage('gameSave', state)
}

// Charge l'état du jeu depuis le localStorage sous la clé 'gameSave'
// Retourne l'objet d'état ou null si rien n'a été sauvegardé
function loadGameState() {
    return getFromLocalStorage('gameSave')
}

// Rend ces fonctions accessibles globalement pour pouvoir les utiliser ailleurs
window.saveToLocalStorage = saveToLocalStorage
window.getFromLocalStorage = getFromLocalStorage
window.saveGameState = saveGameState
window.loadGameState = loadGameState