/* -----pagination----- */
let tabPickaxe = document.querySelector(".pickaxe-tab");
let tabMob = document.querySelector(".mob-tab");
let tabPotion = document.querySelector(".potion-tab");

/*----- bonus -----*/
let pickaxePage = document.querySelector(".craft-table-bonus");
let mobPage = document.querySelector(".vilage-bonus");
let potionPage = document.querySelector(".potion-bonus");

/* ----- background ----- */
let pickaxeBackground = document.querySelector("#craft-table");
let mobBackground = document.querySelector("#village");
let potionBackground = document.querySelector("#alambic");

// Fonction pour réinitialiser l'apparence des onglets
function resetTabs() {
    tabPickaxe.classList.remove("tab-active");
    tabMob.classList.remove("tab-active");
    tabPotion.classList.remove("tab-active");
}

document.addEventListener("DOMContentLoaded", function () {
    tabPickaxe.classList.add("tab-active");
});

tabPickaxe.addEventListener("click", () => {  

    resetTabs();
    tabPickaxe.classList.add("tab-active");
    
    // Changer les contenus
    pickaxePage.classList.remove("hidden");
    pickaxePage.classList.add("active");  
    mobPage.classList.remove("active");
    mobPage.classList.add("hidden");
    potionPage.classList.remove("active");
    potionPage.classList.add("hidden");

    // Changer les arrière-plans
    pickaxeBackground.classList.remove("hidden");
    pickaxeBackground.classList.add("active");
    mobBackground.classList.remove("active");
    mobBackground.classList.add("hidden");
    potionBackground.classList.remove("active");
    potionBackground.classList.add("hidden");
});

tabMob.addEventListener("click", () => {  

   resetTabs();
    tabMob.classList.add("tab-active");
    
    // Changer les contenus
    pickaxePage.classList.remove("active");
    pickaxePage.classList.add("hidden");
    mobPage.classList.remove("hidden");
    mobPage.classList.add("active");
    potionPage.classList.remove("active");
    potionPage.classList.add("hidden");

    // Changer les arrière-plans
    pickaxeBackground.classList.remove("active");
    pickaxeBackground.classList.add("hidden");
    mobBackground.classList.remove("hidden");
    mobBackground.classList.add("active");
    potionBackground.classList.remove("active");
    potionBackground.classList.add("hidden");
});

tabPotion.addEventListener("click", () => { 
    
     resetTabs();
    tabPotion.classList.add("tab-active");

    
    // Changer les contenus
    pickaxePage.classList.remove("active");
    pickaxePage.classList.add("hidden");
    mobPage.classList.remove("active");
    mobPage.classList.add("hidden");
    potionPage.classList.remove("hidden");
    potionPage.classList.add("active");

    // Changer les arrière-plans
    pickaxeBackground.classList.remove("active");
    pickaxeBackground.classList.add("hidden");
    mobBackground.classList.remove("active");
    mobBackground.classList.add("hidden");
    potionBackground.classList.remove("hidden");
    potionBackground.classList.add("active");
});