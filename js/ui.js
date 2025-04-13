document.getElementById('tab-pickaxe').addEventListener('click', () => {
    currentCategory = 'pickaxe'
    renderShop()
})

document.getElementById('tab-npc').addEventListener('click', () => {
    currentCategory = 'npc'
    renderShop()
})

document.getElementById('tab-potion').addEventListener('click', () => {
    currentCategory = 'potion'
    renderShop()
})
