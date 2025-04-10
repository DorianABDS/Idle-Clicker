// Initialisation des catégories d'objets
let categories = {
    pickaxe: [],
    npc: [],
    potion: []
}

// Variables de jeu
let currentCategory = 'pickaxe'
let points = 0
let clickPower = 1
let autoClickPower = 0

// Chargement des données depuis le JSON
fetch('/data/items.json')
    .then(response => response.json())
    .then(data => {
        const itemData = data.items[0]

        // Remplissage des pioches
        const pickaxeItems = itemData.pickaxe[0]
        for (const key in pickaxeItems) {
            const item = pickaxeItems[key][0]
            categories.pickaxe.push({
                name: item.name,
                cost: item.cost,
                bonus: item.bonus_pickaxe,        // bonus manuel
                autoBonus: item.bonus_pickaxe * 0.5, // bonus auto partiel
                quantity: 0
            })
        }

        // Remplissage des NPC
        const npcItems = itemData.png[0]
        for (const key in npcItems) {
            const item = npcItems[key][0]
            categories.npc.push({
                name: item.name,
                cost: item.cost,
                bonus: 0,
                quantity: 0,
                purchased: false // Indicateur d'achat unique
            })
        }

        // Remplissage des potions
        const potionItems = itemData.potion[0]
        for (const key in potionItems) {
            const item = potionItems[key][0]
            categories.potion.push({
                name: item.name,
                cost: item.cost,
                bonus: item.bonus,
                cooldown: item.cooldown,
                quantity: 0,
                active: false,
                autoBonus: item.bonus // Bonus auto sur les potions
            })
        }

        renderShop()
        updateUI()
    })
    .catch(error => console.error('Erreur du chargement du JSON', error))

// Achat d’un upgrade (pioche, npc ou potion)
function buyUpgrade(name) {
    const upgrades = categories[currentCategory]
    const upgrade = upgrades.find(u => u.name === name)

    if (!upgrade) return
    if (points < upgrade.cost) {
        alert("Pas assez de points !")
        return
    }

    points -= upgrade.cost
    upgrade.quantity += 1

    // Application du bonus selon la catégorie
    if (currentCategory === 'pickaxe') {
        clickPower += upgrade.bonus
        autoClickPower += upgrade.autoBonus
    } else if (currentCategory === 'npc') {
        if (upgrade.purchased) {
            alert("NPC déjà acheté.")
            return
        }
        upgrade.purchased = true
    } else if (currentCategory === 'potion') {
        if (upgrade.active) {
            alert("Potion déjà active. Patiente le cooldown.")
            return
        }
        activatePotion(upgrade)
    }

    // Augmentation du coût à chaque achat
    upgrade.cost = Math.floor(upgrade.cost * 1.3)
    updateUI()
}

// Activation d'une potion avec bonus temporaire
function activatePotion(potion) {
    potion.active = true
    autoClickPower += potion.autoBonus

    setTimeout(() => {
        autoClickPower -= potion.autoBonus
        potion.active = false
        updateUI()
    }, potion.cooldown * 1000)
}

// Affichage des items de la boutique
function renderShop() {
    const shopDiv = document.getElementById("shop")
    shopDiv.innerHTML = ""

    const upgrades = categories[currentCategory]
    upgrades.forEach(upgrade => {
        const btn = document.createElement("button")
        let bonusText = currentCategory === 'pickaxe'
            ? `+${upgrade.bonus} clic, +${upgrade.autoBonus.toFixed(1)} auto`
            : currentCategory === 'npc'
                ? `Unique achat - ${upgrade.cost} pts`
                : `+${upgrade.bonus} auto temporaire (${upgrade.cooldown}s)`
        btn.textContent = `${upgrade.name} (${bonusText}) - ${upgrade.cost} pts [x${upgrade.quantity}]`
        btn.onclick = () => buyUpgrade(upgrade.name)
        shopDiv.appendChild(btn)
    })
}

// Mise à jour de l'affichage
function updateUI() {
    document.getElementById('points').textContent = `Points : ${Math.floor(points)}`
    renderShop()
}

// Boucle automatique de gain de points
setInterval(() => {
    points += autoClickPower
    updateUI()
}, 1000)