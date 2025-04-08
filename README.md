# 🎮 Clicker Game – Créez votre propre Idle Game

Bienvenue dans ce projet de jeu **clicker incrémental (Idle Game)** ! Ce jeu est un excellent point de départ pour comprendre les mécaniques de jeux d'incrémentation, la gestion d'état, les achats de bonus, la sauvegarde des données en local et plus encore.

---

## 🚀 Objectif du jeu

Le principe est simple :

- Cliquez pour gagner des **points**.
  
- Utilisez ces points pour acheter des **objets** et des **bonus**.
  
- Progresser dans l'univers du jeu, débloquer des éléments et faire exploser vos gains de manière **exponentielle**.
  

---

## 🧠 Fonctionnalités

### 🌌 1. Univers personnalisable

Le jeu s'articule autour d’un **thème choisi par le développeur** (vous). Cela permet de créer une expérience immersive et cohérente.

### 🖱️ 2. Clic = Gain

Chaque clic rapporte des points. Au début, vous gagnez **1 point par clic**.

### 🛒 3. Boutique intégrée

- Achetez des **éléments** qui augmentent la production de points.

  - Production **manuelle** (clics boostés).

  - Production **automatique** (idle).

- Achetez des **bonus** qui améliorent les éléments existants.
  
- Les coûts augmentent de manière **exponentielle** pour équilibrer la progression.
  

### 🌱 4. Ressources supplémentaires

- Le joueur peut **cliquer sur des éléments du décor** pour générer diverses ressources additionnelles (booster, objets rares, etc.).

### 📈 5. Progression exponentielle

- Chaque amélioration rend le joueur **toujours plus puissant**.
  
- Exemple :
  

  - Début : 1 point/clic

  - 1 min : 3 points/clic

  - 1 h : 1 000 points/clic

  - 1 jour : 1 000 000 points/clic

### 💾 6. Sauvegarde automatique

- L'état du jeu est **sauvegardé régulièrement** via le `localStorage`.
  
- En cas de fermeture ou rafraîchissement, le joueur **ne perd pas sa progression**.
  

---

## 🛠️ Technologies utilisées

- **HTML / CSS / JavaScript**
  
- `localStorage` pour la persistance des données
  

---

## 📦 Installation & Lancement

1. Clonez le repo :

   ```bash

   git clone https://github.com/votre-utilisateur/Idle-Clicker

   cd Idle-Clicker