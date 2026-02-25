# 🌦️ Meteo App

Bienvenue dans **Meteo App**, une application météo complète et interactive développée avec **React Native (Expo)** et **Node.js**.

Cette application permet non seulement de consulter la météo en temps réel, mais aussi de gérer des villes favorites, de recevoir des bulletins officiels via une interface administrateur, et même d'écouter les prévisions racontées comme une histoire !

## ✨ Fonctionnalités Principales

*   **Météo en Temps Réel** : Température, humidité, vent, lever/coucher du soleil et indice UV.
*   **Prévisions sur 5 Jours** : Affichage détaillé des tendances à venir.
*   **Géolocalisation & Recherche** : Trouvez votre ville automatiquement ou via une barre de recherche.
*   **Carte Interactive** : Choisissez une ville directement en cliquant sur la carte (Compatible Web & Mobile).
*   **Gestion des Favoris** : Sauvegardez vos villes préférées pour un accès rapide.
*   **Mode Sombre / Clair** : Une interface soignée qui s'adapte à vos préférences (Theme Context).
*   **Storytelling Météo** : Un moteur narratif unique qui génère et lit un bulletin météo personnalisé (Text-to-Speech).
*   **Espace Administrateur** :
    *   Connexion sécurisée.
    *   Publication, modification et suppression de "Rapports Officiels" pour des villes spécifiques.
    *   Ces rapports apparaissent comme des alertes sur l'écran d'accueil des utilisateurs.

## 🛠️ Stack Technique

### Client (Mobile & Web)
*   **Framework** : React Native avec Expo.
*   **Navigation** : React Navigation (Bottom Tabs).
*   **API** : Axios pour la communication avec le backend.
*   **UI** : Styles StyleSheet personnalisés, support du Dark Mode.
*   **Cartographie** : `react-native-maps` (Mobile) et `react-leaflet` (Web).
*   **Audio** : `expo-speech` pour la lecture vocale.

### Serveur (Backend)
*   **Runtime** : Node.js.
*   **Serveur Web** : Express.js.
*   **Base de Données** : SQLite (stockage local des favoris, rapports admin, et cache météo).
*   **API Externe** : OpenWeatherMap (Météo et Géocodage).
*   **Architecture** : REST API avec mise en cache intelligente pour limiter les appels externes.

## 🚀 Installation et Lancement

### Prérequis
*   Node.js installé.
*   Expo Go (sur votre téléphone) ou un émulateur Android/iOS.

### 1. Démarrer le Serveur (Backend)
Le serveur gère la base de données et l'API.

```bash
cd server
npm install
# Créez un fichier .env avec votre clé API OpenWeatherMap :
# OPENWEATHER_API_KEY=votre_cle_ici
# PORT=3000
npm start
```
Le serveur démarrera sur `http://localhost:3000`.

### 2. Démarrer l'Application (Client)
L'application mobile se connecte au serveur.

```bash
cd client
npm install
npx expo start
```
*   Scannez le QR Code avec **Expo Go** (Android/iOS).
*   Ou appuyez sur `w` pour lancer la version Web.

## 📂 Structure du Projet

Pour une explication détaillée de chaque fichier, consultez le document **[project_structure.md](./project_structure.md)** (si disponible dans vos artifacts).

En bref :
*   `client/` : Code source de l'application React Native.
    *   `src/screens/` : Écrans (Home, Favorites, Admin).
    *   `src/components/` : Composants réutilisables.
    *   `src/api/` : Configuration Axios.
*   `server/` : Code source de l'API Node.js.
    *   `database.js` : Gestion SQLite.
    *   `server.js` : Routes API.

## 👥 Auteur
Développé avec passion par Samouh Hajar et Halal Saad pour offrir une expérience météo simple et complète.
