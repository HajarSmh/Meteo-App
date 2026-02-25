Structure et Description du Projet Meteo App
Voici une explication détaillée de chaque fichier de notre projet, organisé par dossier.

📂 Client (client/src)
C'est la partie "Visible" de l'application (React Native / Expo).

Écrans (screens/)
Ces fichiers représentent les pages complètes de notre application.

HomeScreen.js
 :
C'est le tableau de bord principal.
Gère la recherche de ville, l'affichage de la météo actuelle, des prévisions et des infos soleil.
Affiche aussi les "Rapports Admin" (alertes officielles) si disponibles pour la ville.
FavoritesScreen.js
 :
Affiche la liste des villes que nous avons ajoutées en favoris.
Permet de supprimer un favori ou de cliquer dessus pour voir sa météo.
AdminScreen.js
 :
Zone réservée aux administrateurs.
Permet de se connecter (
loginAdmin
).
Permet de publier (
postWeatherReport
), modifier (
updateReport
) ou supprimer (
deleteReport
) des bulletins météo officiels.
Composants (components/)
Ce sont les briques réutilisables qui construisent nos écrans.

WeatherCard.js
 :
Le gros bloc principal qui affiche la température, l'icône météo, l'humidité et le vent.
Contient aussi l'étoile pour ajouter/retirer des favoris.
ForecastCard.js
 :
Affiche la liste des prévisions sur 5 jours en bas de l'écran d'accueil.
SearchBar.js
 :
La barre de recherche où nous tapons le nom de la ville.
Contient aussi le bouton "Carte" (🗺️) pour chercher par position.
LocationButton.js
 :
Le bouton (📍) en haut à droite. Il demande la permission GPS et trouve notre ville actuelle.
MapSearchModal.web.js
 / 
.native.js
 :
La carte interactive pour choisir une ville en cliquant dessus.
Deux versions existent car la carte ne marche pas pareil sur Web (Leaflet) et sur Mobile (Apple/Google Maps).
StorytellingButton.js
 :
Le bouton "Écouter la météo". Il génère un texte créatif via WeatherStoryEngine et le lit à voix haute.
SunInfo.js
 :
Affiche les heures de lever/coucher du soleil et l'indice UV.
ThemeToggle.js
 :
Le bouton (🌙/☀️) pour passer du mode sombre au mode clair.
TabIcon.js
 :
Gère l'affichage des petites icônes (Maison, Étoile, Engrenage) dans la barre de navigation en bas.
API & Logique (api/ et utils/)
api/weatherApi.js
 :
Le "téléphone" de l'application. C'est lui qui contacte notre serveur pour demander la météo ou envoyer des rapports.
C'est ici qu'on définit l'adresse IP du serveur (BASE_URL).
utils/WeatherStoryEngine.js
 :
Un petit moteur créatif qui transforme les données froides (20°C, Pluie) en une phrase sympa (ex: "Sortez le parapluie, l'ambiance est humide aujourd'hui !").
Contexte (context/)
ThemeContext.js
 :
La mémoire du thème. Il retient si vous préférez le mode Sombre ou Clair et le dit à tous les autres composants.
Racine
App.js
 :
Le point de départ. Il configure la navigation (les onglets en bas) et charge le thème global.

📂 Serveur (server/)
C'est le "Cerveau" caché qui traite les données et stocke les informations.

server.js
 :
Le chef d'orchestre. Il reçoit les requêtes de l'application (ex: GET /weather/paris) et décide quoi faire.
Il contient toutes les "Routes" (URL) de l'API.
database.js
 :
Le bibliothécaire. Il gère la base de données SQLite (
weather.db
).
C'est lui qui enregistre réellement les favoris, les rapports et le cache météo sur le disque.
weather.db
 :
Le fichier de stockage. C'est là que sont sauvegardés nos utilisateurs admin, nos rapports et nos villes favorites.
.env
 :
Le coffre-fort. Il contient notre clé secrète OpenWeatherMap pour qu'elle ne soit pas visible dans le code.