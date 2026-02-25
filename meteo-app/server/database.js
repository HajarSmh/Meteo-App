const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//création de la base de données
const dbPath = path.join(__dirname, 'weather.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

//création des tables
function initializeTables() {
  //table pour stocker les données météo
  db.run(`
    CREATE TABLE IF NOT EXISTS weather_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT NOT NULL UNIQUE,
      temperature REAL,
      description TEXT,
      humidity INTEGER,
      wind_speed REAL,
      icon TEXT,
      country TEXT,
      sunrise INTEGER,
      sunset INTEGER,
      uv_index REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating weather_cache table:', err.message);
    } else {
      console.log('weather_cache table ready');
    }
  });

  //table pour stocker les villes favorites
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT NOT NULL UNIQUE,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating favorites table:', err.message);
    } else {
      console.log('favorites table ready');
    }
  });

  //table pour stocker les prévisions météo
  db.run(`
    CREATE TABLE IF NOT EXISTS forecast_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT NOT NULL UNIQUE,
      forecast_data TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating forecast_cache table:', err.message);
    } else {
      console.log('forecast_cache table ready');
    }
  });

  //table pour stocker les utilisateurs
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    )
  `, (err) => {
    if (!err) {
      console.log('users table ready');
      // Création d'un admin par défaut pour les tests
      const stmt = db.prepare("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)");
      stmt.run('admin', 'admin123', 'admin');
      stmt.finalize();
    }
  });

  //table pour stocker les rapports météo
  db.run(`
    CREATE TABLE IF NOT EXISTS weather_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      author_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(author_id) REFERENCES users(id)
    )
  `, (err) => {
    if (!err) console.log('weather_reports table ready');
  });
}

// Récupérer les données météo mises en cache pour une ville
function getCachedWeather(cityName) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *, 
      (julianday('now') - julianday(timestamp)) * 24 * 60 as age_minutes
      FROM weather_cache 
      WHERE LOWER(city_name) = LOWER(?)
    `;

    db.get(query, [cityName], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Enregistrer ou mettre à jour les données météo dans le cache
function saveWeatherCache(weatherData) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO weather_cache 
      (city_name, temperature, description, humidity, wind_speed, icon, country, sunrise, sunset, uv_index, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(city_name) 
      DO UPDATE SET 
        temperature = excluded.temperature,
        description = excluded.description,
        humidity = excluded.humidity,
        wind_speed = excluded.wind_speed,
        icon = excluded.icon,
        country = excluded.country,
        sunrise = excluded.sunrise,
        sunset = excluded.sunset,
        uv_index = excluded.uv_index,
        timestamp = CURRENT_TIMESTAMP
    `;



    db.run(
      query,
      [
        weatherData.city_name,
        weatherData.temperature,
        weatherData.description,
        weatherData.humidity,
        weatherData.wind_speed,
        weatherData.icon,
        weatherData.country,
        weatherData.sunrise,
        weatherData.sunset,
        weatherData.uv_index
      ],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
}

// Récupérer les rapports par admin
const getReportsByAdmin = (adminId) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM weather_reports WHERE author_id = ? ORDER BY created_at DESC`;
    db.all(sql, [adminId], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

// Récupérer les villes favorites
function getFavorites() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM favorites ORDER BY added_at DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Ajouter une ville aux favoris
function addFavorite(cityName) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO favorites (city_name) VALUES (?)',
      [cityName],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            reject(new Error('City already in favorites'));
          } else {
            reject(err);
          }
        } else {
          resolve({ id: this.lastID, city_name: cityName });
        }
      }
    );
  });
}

// Supprimer une ville des favoris
function removeFavorite(cityName) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM favorites WHERE LOWER(city_name) = LOWER(?)',
      [cityName],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
}

// Récupérer les prévisions météo mises en cache pour une ville
function getCachedForecast(cityName) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT *, 
      (julianday('now') - julianday(timestamp)) * 24 * 60 as age_minutes
      FROM forecast_cache 
      WHERE LOWER(city_name) = LOWER(?)
    `;

    db.get(query, [cityName], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Enregistrer ou mettre à jour les prévisions météo dans le cache
function saveForecastCache(cityName, forecastData) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO forecast_cache 
      (city_name, forecast_data, timestamp)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(city_name) 
      DO UPDATE SET 
        forecast_data = excluded.forecast_data,
        timestamp = CURRENT_TIMESTAMP
    `;

    db.run(
      query,
      [cityName, JSON.stringify(forecastData)],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
}

// Vérifier les identifiants de connexion
function loginUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, username, role FROM users WHERE username = ? AND password = ?',
      [username, password], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
  });
}

// Ajouter un rapport météo
function addWeatherReport(cityName, title, content, authorId) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO weather_reports (city_name, title, content, author_id) VALUES (?, ?, ?, ?)',
      [cityName, title, content, authorId],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

// Récupérer les rapports pour une ville
function getReportsByCity(cityName) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM weather_reports WHERE LOWER(city_name) = LOWER(?) ORDER BY created_at DESC',
      [cityName],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

// Supprimer un rapport météo
function deleteWeatherReport(id) {
  return new Promise((resolve, reject) => {
    console.log("==> SQL: Tentative de suppression du rapport ID:", id);
    const sql = `DELETE FROM weather_reports WHERE id = ?`;

    db.run(sql, [id], function (err) {
      if (err) {
        console.error("Erreur SQL suppression:", err.message);
        reject(err);
      } else {
        console.log(`==> SQL: Succès, lignes supprimées: ${this.changes}`);
        resolve({ changes: this.changes });
      }
    });
  });
}

// Modifier un rapport météo
function updateWeatherReport(id, content) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE weather_reports SET content = ? WHERE id = ?`;
    db.run(sql, [content, id], function (err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
}

module.exports = {
  db,
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
  getReportsByAdmin,
  deleteWeatherReport,
  updateWeatherReport
};