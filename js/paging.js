document.addEventListener('DOMContentLoaded', function () {
    console.clear();
    console.log("Script de pagination démarré");

    // Sélection des onglets
    const pickaxeTab = document.getElementById('pickaxe-tab');
    const mobTab = document.getElementById('mob-tab');
    const potionTab = document.getElementById('potion-tab');

    // Sélection des images à afficher pour chaque catégorie
    const craftTableImgs = document.querySelectorAll('.craft-table-bonus img');
    const villageImgs = document.querySelectorAll('.vilage-bonus img');
    const potionImgs = document.querySelectorAll('.potion-bonus img');

    // Sélection des images de fond
    const craftTableImg = document.getElementById('craft-table');
    const villageImg = document.getElementById('village');
    const alambicImg = document.getElementById('alambic');

    // Activer tous les onglets
    [pickaxeTab, mobTab, potionTab].forEach(tab => tab.classList.add('tab-active'));

    // Fonction pour masquer une liste d’images
    function hideImages(imgList) {
        imgList.forEach(img => img.style.display = 'none');
    }

    // Fonction pour afficher une liste d’images
    function showImages(imgList) {
        imgList.forEach(img => img.style.display = 'inline-block');
    }

    // Fonction principale d'activation d'un onglet
    function activateTab(tab, imagesToShow, backgroundImg) {
        console.log("Activation de l'onglet:", tab.id);

        // Réinitialise l'effet de zoom sur tous les onglets
        [pickaxeTab, mobTab, potionTab].forEach(t => {
            t.style.transform = 'scale(1)';
            t.style.zIndex = '1';
        });

        // Zoom l’onglet actif
        tab.style.transform = 'scale(1.2)';
        tab.style.zIndex = '10';

        // Masquer toutes les images bonus
        hideImages(craftTableImgs);
        hideImages(villageImgs);
        hideImages(potionImgs);

        // Afficher les images liées à l'onglet actif
        showImages(imagesToShow);

        // Gérer les images de fond
        craftTableImg.style.display = 'none';
        villageImg.style.display = 'none';
        alambicImg.style.display = 'none';

        backgroundImg.style.display = 'block';
    }

    // Écouteurs d’événements sur les onglets
    pickaxeTab.onclick = function () {
        console.log("Clic sur onglet Pioche");
        activateTab(pickaxeTab, craftTableImgs, craftTableImg);
    };

    mobTab.onclick = function () {
        console.log("Clic sur onglet Villageois");
        activateTab(mobTab, villageImgs, villageImg);
    };

    potionTab.onclick = function () {
        console.log("Clic sur onglet Potion");
        activateTab(potionTab, potionImgs, alambicImg);
    };

    // Onglet pioche activé par défaut
    activateTab(pickaxeTab, craftTableImgs, craftTableImg);

    console.log("Script de pagination initialisé avec succès");
});
