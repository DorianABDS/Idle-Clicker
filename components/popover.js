// Afficher l'URL actuelle pour le débogage
console.log('URL actuelle:', window.location.href);

// Créer l'élément popover s'il n'existe pas déjà
if (!document.getElementById('popover')) {
    const popoverElement = document.createElement('div');
    popoverElement.id = 'popover';
    document.body.appendChild(popoverElement);
    console.log('Élément popover créé dynamiquement');
}

// Utiliser un chemin relatif pour items.json
console.log('Tentative de chargement du fichier items.json...');
fetch('data/items.json')
    .then(response => {
        console.log('Statut de la réponse:', response.status);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Données JSON chargées avec succès');
        const popover = document.getElementById('popover');
        
        // Style de base pour le popover
        popover.style.display = 'none';
        popover.style.position = 'absolute';
        popover.style.backgroundColor = '#f9f9f9';
        popover.style.border = '1px solid #333';
        popover.style.padding = '10px';
        popover.style.borderRadius = '5px';
        popover.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
        popover.style.zIndex = '10000000000';
        popover.style.maxWidth = '250px';
        popover.style.fontFamily = 'Minecraft, Arial, sans-serif';
        
        // Fonction pour extraire tous les items du JSON complexe
        function extractAllItems(data) {
            const allItems = [];
            
            // Traiter les pioches
            const pickaxeData = data.items[0].pickaxe[0];
            for (const key in pickaxeData) {
                const item = pickaxeData[key][0];
                item.type = 'pickaxe';
                item.id = key;
                allItems.push(item);
            }
            
            // Traiter les mobs/villageois
            const mobData = data.items[0].png[0];
            for (const key in mobData) {
                const item = mobData[key][0];
                item.type = 'mob';
                item.id = key;
                allItems.push(item);
            }
            
            // Traiter les potions
            const potionData = data.items[0].potion[0];
            for (const key in potionData) {
                const item = potionData[key][0];
                item.type = 'potion';
                item.id = key;
                allItems.push(item);
            }
            
            return allItems;
        }
        
        const allItems = extractAllItems(data);
        console.log('Items extraits:', allItems.length);
        
        // Fonction pour trouver un item par son image
        function findItemByImage(imgSrc) {
            const imgFileName = imgSrc.split('/').pop();
            return allItems.find(item => item.img.includes(imgFileName));
        }
        
        // Fonction pour afficher le popover
        function showPopover(element, item) {
            console.log('Affichage du popover pour:', item.name);
            // Créer le contenu du popover
            popover.innerHTML = '';
            
            const itemName = document.createElement('h3');
            itemName.textContent = item.name;
            itemName.style.margin = '0 0 5px 0';
            itemName.style.color = '#22741c'; // Couleur style Minecraft
            itemName.style.fontStyle = 'MinecraftRegular, cursive';
            
            const itemDesc = document.createElement('p');
            itemDesc.textContent = item.description;
            itemDesc.style.margin = '0 0 8px 0';
            
            popover.appendChild(itemName);
            popover.appendChild(itemDesc);
            
            // Afficher le coût
            if (item.cost) {
                const costDiv = document.createElement('div');
                costDiv.style.marginTop = '5px';
                costDiv.innerHTML = `<strong>Coût:</strong> ${item.cost} <img src="/assets/img/minecraft-emerald-88740_orig.gif" alt="émeraude" style="width: 16px; height: 16px; vertical-align: middle;">`;
                popover.appendChild(costDiv);
            }
            
            // Afficher les bonus spécifiques selon le type d'item
            if (item.type === 'pickaxe' && item.bonus_pickaxe) {
                const bonusDiv = document.createElement('div');
                bonusDiv.innerHTML = `<strong>Bonus:</strong> Multiplie les clics par ${item.bonus_pickaxe}`;
                popover.appendChild(bonusDiv);
            } else if (item.type === 'mob' && item.bonus_auto_click) {
                const bonusDiv = document.createElement('div');
                bonusDiv.innerHTML = `<strong>Bonus:</strong> +${item.bonus_auto_click} clics automatiques/s`;
                popover.appendChild(bonusDiv);
            } else if (item.type === 'potion') {
                const bonusDiv = document.createElement('div');
                bonusDiv.innerHTML = `<strong>Effet:</strong> ${item.description}`;
                
                const cooldownDiv = document.createElement('div');
                cooldownDiv.innerHTML = `<strong>Temps d'effet:</strong> ${item.cooldown}s`;
                
                popover.appendChild(bonusDiv);
                popover.appendChild(cooldownDiv);
            }
            
            // Afficher le popover
            popover.style.display = 'block';
            
            // Positionner le popover près de l'élément survolé
            const rect = element.getBoundingClientRect();
            
            // Vérifier de quel côté placer le popover pour qu'il reste dans l'écran
            const windowWidth = window.innerWidth;
            const popoverWidth = 250; // Correspond à maxWidth dans les styles
            
            if (rect.right + popoverWidth + 10 < windowWidth) {
                // Placer à droite de l'élément si ça tient dans l'écran
                popover.style.left = rect.right + 10 + 'px';
                popover.style.top = rect.top + 'px';
            } else {
                // Sinon, placer à gauche
                popover.style.left = (rect.left - popoverWidth - 10) + 'px';
                popover.style.top = rect.top + 'px';
            }
        }
        
        // Fonction pour masquer le popover
        function hidePopover() {
            popover.style.display = 'none';
        }
        
        // Appliquer aux pioches et haches
        const craftItems = document.querySelectorAll('.craft-table-bonus .img-craft-bonus');
        console.log('Éléments de craft trouvés:', craftItems.length);
        craftItems.forEach(item => {
            const srcPath = item.src;
            const matchedItem = findItemByImage(srcPath);
            
            if (matchedItem) {
                console.log('Item correspondant trouvé pour:', srcPath);
                item.addEventListener('mouseenter', () => showPopover(item, matchedItem));
                item.addEventListener('mouseleave', hidePopover);
                
                // Ajout d'un curseur pointer pour indiquer l'interactivité
                item.style.cursor = 'pointer';
            } else {
                console.log('Aucun item correspondant pour:', srcPath);
            }
        });
        
        // Appliquer aux mobs/villageois
        const mobItems = document.querySelectorAll('.vilage-bonus .img-village-bonus');
        console.log('Éléments de mob trouvés:', mobItems.length);
        mobItems.forEach(item => {
            const srcPath = item.src;
            const matchedItem = findItemByImage(srcPath);
            
            if (matchedItem) {
                console.log('Item correspondant trouvé pour:', srcPath);
                item.addEventListener('mouseenter', () => showPopover(item, matchedItem));
                item.addEventListener('mouseleave', hidePopover);
                
                // Ajout d'un curseur pointer pour indiquer l'interactivité
                item.style.cursor = 'pointer';
            } else {
                console.log('Aucun item correspondant pour:', srcPath);
            }
        });
        
        // Appliquer aux potions
        const potionItems = document.querySelectorAll('.potion-bonus img');
        console.log('Éléments de potion trouvés:', potionItems.length);
        potionItems.forEach(item => {
            const srcPath = item.src;
            const matchedItem = findItemByImage(srcPath);
            
            if (matchedItem) {
                console.log('Item correspondant trouvé pour:', srcPath);
                item.addEventListener('mouseenter', () => showPopover(item, matchedItem));
                item.addEventListener('mouseleave', hidePopover);
                
                // Ajout d'un curseur pointer pour indiquer l'interactivité
                item.style.cursor = 'pointer';
            } else {
                console.log('Aucun item correspondant pour:', srcPath);
            }
        });
        
        // Empêcher le popover de disparaître immédiatement quand on le survole
        popover.addEventListener('mouseenter', () => {
            popover.style.display = 'block';
        });
        
        popover.addEventListener('mouseleave', hidePopover);

        console.log('Configuration du popover terminée avec succès');
    })
    .catch(error => {
        console.error('Erreur lors du chargement des items:', error);
        
        // Afficher des informations plus détaillées sur l'erreur
        if (error instanceof SyntaxError) {
            console.error('Erreur de parsing JSON. Vérifiez le format du fichier items.json');
        } else if (error.message.includes('Erreur HTTP')) {
            console.error('Le fichier items.json n\'a pas été trouvé. Vérifiez le chemin.');
            console.error('Essayez de placer items.json à la racine du projet ou ajustez le chemin dans le fetch');
        }
    });