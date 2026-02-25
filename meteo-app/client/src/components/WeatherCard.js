import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';

//carte météo
const WeatherCard = ({ weatherData, onAddFavorite, isFavorite, theme }) => {
  if (!weatherData) return null;

  const {
    city,
    country,
    temperature,
    description,
    humidity,
    windSpeed,
    icon
  } = weatherData;

  const iconUrl = `https://openweathermap.org/img/wn/${icon}@4x.png`;

  return (
    <View style={styles.glassContainer}>
      {/* En-tête : Ville et Favori */}
      <View style={styles.header}>
        <View>
          <Text style={styles.cityName}>{city}</Text>
          <Text style={styles.country}>{country}</Text>
        </View>

        {onAddFavorite && (
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFavorite ? styles.favoriteActive : styles.favoriteInactive
            ]}
            onPress={onAddFavorite}
          >
            <Text style={[styles.favoriteIcon, { color: isFavorite ? '#FFD700' : '#FFF' }]}>
              {isFavorite ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Centre : Icone et Température */}
      <View style={styles.mainWeather}>
        <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
        <View>
          <Text style={styles.temperature}>{Math.round(temperature)}°</Text>
          <Text style={styles.description}>
            {description.charAt(0).toUpperCase() + description.slice(1)}
          </Text>
        </View>
      </View>

      {/* Pied : Détails Humidité et Vent */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Humidité</Text>
          <Text style={styles.detailValue}>{humidity}%</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Vent</Text>
          <Text style={styles.detailValue}>{windSpeed} <Text style={{ fontSize: 12 }}>m/s</Text></Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    marginHorizontal: 10,
    borderRadius: 30,
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fond translucide
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Bordure brillante
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 0, // L'élévation casse parfois l'effet glass sur Android
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cityName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  country: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  favoriteButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  favoriteInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  favoriteActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#FFD700',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  weatherIcon: {
    width: 130,
    height: 130,
  },
  temperature: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 80,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    marginTop: -10,
    opacity: 0.9,
  },
  detailsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: '100%',
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default WeatherCard;