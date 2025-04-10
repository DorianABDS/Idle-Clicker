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