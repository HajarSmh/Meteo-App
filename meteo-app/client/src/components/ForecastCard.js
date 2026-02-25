import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';

// Afficher les prévisions météo
const ForecastCard = ({ forecastData, theme, isDarkMode = false }) => {
  const [showFullForecast, setShowFullForecast] = useState(false);

  if (!forecastData || !forecastData.forecasts) {
    return null;
  }

  // Obtenir le nom du jour
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[date.getDay()];
  };

  // Obtenir la date formatée
  const getDateFormatted = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  if (!theme) {
    theme = {
      card: '#FFFFFF',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      textTertiary: '#95A5A6',
      border: '#E8E8E8',
      surface: '#F8F9FA',
    };
  }

  // On sépare les données : 3 premiers jours vs les 2 suivants
  const displayedForecasts = showFullForecast
    ? forecastData.forecasts.slice(3, 5)
    : forecastData.forecasts.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>
            {showFullForecast ? "Suivants" : "Prévisions sur 5 jours"}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {forecastData.city}, {forecastData.country}
          </Text>
        </View>

        {/* Bouton flèche pour basculer */}
        <TouchableOpacity
          style={[styles.arrowButton, { borderColor: theme.border }]}
          onPress={() => setShowFullForecast(!showFullForecast)}
        >
          <Text style={[styles.arrowText, { color: theme.text }]}>
            {showFullForecast ? "←" : "→"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.daysGrid}>
        {displayedForecasts.map((day, index) => {
          const iconUrl = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;

          return (
            <View key={index} style={[styles.dayCard, {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }]}>
              <Text style={[styles.dayName, { color: theme.text }]}>
                {(!showFullForecast && index === 0) ? 'Auj.' : getDayName(day.date)}
              </Text>
              <Text style={[styles.date, { color: theme.textTertiary }]}>{getDateFormatted(day.date)}</Text>

              <Image
                source={{ uri: iconUrl }}
                style={styles.weatherIcon}
              />

              <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                {day.description.charAt(0).toUpperCase() + day.description.slice(1)}
              </Text>

              <View style={styles.tempContainer}>
                <Text style={[styles.tempMax, { color: isDarkMode ? '#FF6B6B' : '#E74C3C' }]}>{Math.round(day.temp_max)}°</Text>
                <Text style={[styles.tempMin, { color: isDarkMode ? '#74B9FF' : '#3498DB' }]}>{Math.round(day.temp_min)}°</Text>
              </View>

              <View style={styles.detailsRow}>
                <Text style={[styles.detailText, { color: theme.textSecondary }]}>💧 {day.humidity}%</Text>
              </View>
            </View>
          );
        })}
        {/* Placeholder pour garder l'alignement quand il n'y a que 2 jours affichés */}
        {showFullForecast && <View style={[styles.dayCard, { backgroundColor: 'transparent', borderColor: 'transparent' }]} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginHorizontal: 20,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayCard: {
    borderRadius: 16,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    marginBottom: 4,
  },
  weatherIcon: {
    width: 50,
    height: 50,
  },
  description: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
    height: 30,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
  },
  tempMax: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tempMin: {
    fontSize: 15,
    fontWeight: '600',
  },
  detailsRow: {
    marginTop: 2,
  },
  detailText: {
    fontSize: 10,
  },
});

export default ForecastCard;