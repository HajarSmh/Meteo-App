require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const {
  getCachedWeather,
  saveWeatherCache,
  getFavorites,
  addFavorite,
  removeFavorite,
  getCachedForecast,
  saveForecastCache,
  loginUser,
  addWeatherReport,
  getReportsByCity,
  deleteWeatherReport,
  getReportsByAdmin,
  updateWeatherReport,
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CACHE_DURATION_MINUTES = 10;

// Middleware
app.use(cors());// Comprend le format JSON envoyé par le mobile
app.use(express.json());// Accepte les connexions

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

//route pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.json({
    message: 'Weather Caching Proxy Server is running!',
    version: '1.0.0'
  });
});

//route pour obtenir les données météo avec la logique de mise en cache
app.get('/api/weather/:city', async (req, res) => {
  try {
    const cityName = req.params.city;

    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }

    console.log(`[REQUEST] Weather for: ${cityName}`);

    // Step 1: Vérifier le cache
    const cachedData = await getCachedWeather(cityName);

    if (cachedData && cachedData.age_minutes < CACHE_DURATION_MINUTES) {
      console.log(`[CACHE HIT] Data age: ${cachedData.age_minutes.toFixed(2)} minutes`);
      return res.json({
        source: 'cache',
        data: {
          city: cachedData.city_name,
          country: cachedData.country,
          temperature: cachedData.temperature,
          description: cachedData.description,
          humidity: cachedData.humidity,
          windSpeed: cachedData.wind_speed,
          icon: cachedData.icon,
          sunrise: cachedData.sunrise,
          sunset: cachedData.sunset,
          uvIndex: cachedData.uv_index,
          timestamp: cachedData.timestamp
        }
      });
    }

    // Step 2: cache manquant ou expiré - récupération depuis OpenWeatherMap
    console.log(`[CACHE MISS] Récupération depuis OpenWeatherMap...`);

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`;

    const response = await axios.get(weatherUrl);
    const weatherData = response.data;

    // Récupération de l'indice UV en utilisant les coordonnées
    let uvIndex = null;
    try {
      const uvUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${OPENWEATHER_API_KEY}`;
      const uvResponse = await axios.get(uvUrl);
      uvIndex = uvResponse.data.value;
    } catch (uvError) {
      console.log('[WARNING] Could not fetch UV index:', uvError.message);
    }

    // Step 3: Sauvegarde dans le cache
    const dataToCache = {
      city_name: weatherData.name,
      temperature: weatherData.main.temp,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      wind_speed: weatherData.wind.speed,
      icon: weatherData.weather[0].icon,
      country: weatherData.sys.country,
      sunrise: weatherData.sys.sunrise,
      sunset: weatherData.sys.sunset,
      uv_index: uvIndex
    };

    await saveWeatherCache(dataToCache);
    console.log(`[CACHE SAVED] Weather data for ${weatherData.name}`);

    // Step 4: Retour des données fraiches
    res.json({
      source: 'api',
      data: {
        city: weatherData.name,
        country: weatherData.sys.country,
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
        sunrise: weatherData.sys.sunrise,
        sunset: weatherData.sys.sunset,
        uvIndex: uvIndex,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[ERROR]', error.message);

    if (error.response) {
      // OpenWeatherMap API error
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'City not found' });
      }
      return res.status(error.response.status).json({
        error: error.response.data.message || 'Weather API error'
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

//route pour obtenir les prévisions météo sur 5 jours avec mise en cache
app.get('/api/forecast/:city', async (req, res) => {
  try {
    const cityName = req.params.city;

    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }

    console.log(`[REQUEST] Forecast for: ${cityName}`);

    // Step 1: Vérifier le cache
    const cachedData = await getCachedForecast(cityName);

    if (cachedData && cachedData.age_minutes < CACHE_DURATION_MINUTES) {
      console.log(`[CACHE HIT] Forecast data age: ${cachedData.age_minutes.toFixed(2)} minutes`);
      return res.json({
        source: 'cache',
        data: JSON.parse(cachedData.forecast_data)
      });
    }

    // Step 2: cache manquant ou expiré - récupération depuis OpenWeatherMap
    console.log(`[CACHE MISS] Récupération des prévisions depuis OpenWeatherMap...`);

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`;

    const response = await axios.get(forecastUrl);
    const forecastData = response.data;

    // Traitement des données de prévision - regroupement par jour
    const dailyForecasts = {};

    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];

      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: date,
          temp_min: item.main.temp_min,
          temp_max: item.main.temp_max,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
          items: []
        };
      }

      // Mise à jour des températures minimales et maximales
      dailyForecasts[date].temp_min = Math.min(dailyForecasts[date].temp_min, item.main.temp_min);
      dailyForecasts[date].temp_max = Math.max(dailyForecasts[date].temp_max, item.main.temp_max);
      dailyForecasts[date].items.push(item);
    });

    // Conversion en tableau et récupération des 5 premiers jours
    const processedData = {
      city: forecastData.city.name,
      country: forecastData.city.country,
      forecasts: Object.values(dailyForecasts).slice(0, 5)
    };

    // Step 3: Sauvegarde dans le cache
    await saveForecastCache(forecastData.city.name, processedData);
    console.log(`[CACHE SAVED] Forecast data for ${forecastData.city.name}`);

    // Step 4: Retour des données fraiches
    res.json({
      source: 'api',
      data: processedData
    });

  } catch (error) {
    console.error('[ERROR]', error.message);

    if (error.response) {
      if (error.response.status === 404) {
        return res.status(404).json({ error: 'City not found' });
      }
      return res.status(error.response.status).json({
        error: error.response.data.message || 'Weather API error'
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

//route pour obtenir la ville à partir des coordonnées (géocodage inverse)
app.get('/api/location/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;

    console.log(`[REQUEST] Reverse geocoding for: ${lat}, ${lon}`);

    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;

    const response = await axios.get(geoUrl);

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      res.json({
        success: true,
        city: location.name,
        country: location.country
      });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('[ERROR] Reverse geocoding:', error.message);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

//route pour obtenir toutes les villes favorites
app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await getFavorites();
    res.json({ favorites });
  } catch (error) {
    console.error('[ERROR] Getting favorites:', error.message);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
});

//route pour ajouter une ville aux favoris
app.post('/api/favorites', async (req, res) => {
  try {
    const { cityName } = req.body;

    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const result = await addFavorite(cityName);
    console.log(`[FAVORITE ADDED] ${cityName}`);

    res.status(201).json({
      message: 'City added to favorites',
      favorite: result
    });
  } catch (error) {
    console.error('[ERROR] Adding favorite:', error.message);

    if (error.message.includes('already in favorites')) {
      return res.status(409).json({ error: 'City already in favorites' });
    }

    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

//route pour supprimer une ville des favoris
app.delete('/api/favorites/:city', async (req, res) => {
  try {
    const cityName = req.params.city;

    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const result = await removeFavorite(cityName);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'City not found in favorites' });
    }

    console.log(`[FAVORITE REMOVED] ${cityName}`);
    res.json({ message: 'City removed from favorites' });
  } catch (error) {
    console.error('[ERROR] Removing favorite:', error.message);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

//route pour connecter l'admin
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await loginUser(username, password);

    if (user) {
      console.log(`[AUTH] Succès pour : ${username}`);
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, error: 'Identifiants invalides' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

//route pour enregistrer un rapport manuel dans la base de données
app.post('/api/reports', async (req, res) => {
  try {
    const { city_name, title, content, author_id } = req.body;

    if (!city_name || !content) {
      return res.status(400).json({ error: 'Ville et contenu requis' });
    }

    const result = await addWeatherReport(city_name, title, content, author_id);
    console.log(`[REPORT] Nouveau rapport pour ${city_name}`);
    res.status(201).json({ success: true, reportId: result.id });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du rapport' });
  }
});

//route pour afficher les rapports de l'admin quand on consulte une ville.
app.get('/api/reports/:city', async (req, res) => {
  try {
    const reports = await getReportsByCity(req.params.city);
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des rapports' });
  }
});

//route pour récupérer tous les rapports postés par un administrateur spécifique
app.get('/api/admin/reports/:adminId', async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const reports = await getReportsByAdmin(adminId);
    res.json(reports);
  } catch (error) {
    console.error('[ERROR] Getting admin reports:', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération de vos rapports' });
  }
});

//route pour modifier un rapport existant
app.put('/api/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Contenu requis' });
    }

    const result = await updateWeatherReport(reportId, content);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Rapport non trouvé ou non modifié' });
    }

    res.json({ success: true, message: 'Rapport mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur route PUT:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

//route pour supprimer un rapport spécifique
app.post('/api/reports/delete/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    console.log(`[POST DELETE] Tentative de suppression du rapport ID: ${reportId}`);

    const result = await deleteWeatherReport(reportId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Rapport non trouvé' });
    }

    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (error) {
    console.error('Erreur route POST DELETE:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

//route pour supprimer un rapport spécifique
app.delete('/api/reports/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    console.log(`Tentative de suppression du rapport ID: ${reportId}`);

    const result = await deleteWeatherReport(reportId);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Rapport non trouvé' });
    }

    res.json({ success: true, message: 'Supprimé avec succès' });
  } catch (error) {
    console.error('Erreur route DELETE:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n Weather Caching Proxy Server`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Cache duration: ${CACHE_DURATION_MINUTES} minutes`);
  console.log(`✓ OpenWeather API: ${OPENWEATHER_API_KEY ? 'Configured' : 'NOT CONFIGURED!'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});