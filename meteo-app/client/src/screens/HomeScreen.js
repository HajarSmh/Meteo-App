import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  TouchableOpacity
} from 'react-native';
import { useIsFocused, useRoute } from '@react-navigation/native';

import SearchBar from '../components/SearchBar';
import WeatherCard from '../components/WeatherCard';
import ForecastCard from '../components/ForecastCard';
import SunInfo from '../components/SunInfo';
import ThemeToggle from '../components/ThemeToggle';
import LocationButton from '../components/LocationButton';
import StorytellingButton from '../components/StorytellingButton';
import weatherApi from '../api/weatherApi';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const isFocused = useIsFocused();
  const route = useRoute();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adminReports, setAdminReports] = useState([]);

  //pour charger les favoris
  useEffect(() => {
    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused]);

  useEffect(() => {
    if (route.params?.searchCity) {
      handleSearch(route.params.searchCity);
    }
  }, [route.params?.searchCity]);

  const loadFavorites = async () => {
    const result = await weatherApi.getFavorites();
    if (result.success) setFavorites(result.favorites);
  };

  //pour rechercher une ville
  const handleSearch = async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    setError(null);
    setAdminReports([]);

    const result = await weatherApi.getWeather(cityName);
    if (result.success) {
      setWeatherData(result.data);

      try {
        const reportsRes = await weatherApi.getCityReports(cityName);
        if (reportsRes.success) {
          setAdminReports(reportsRes.reports);
        }
      } catch (e) {
        console.error("Erreur rapports admin", e);
      }

      const forecastResult = await weatherApi.getForecast(cityName);
      if (forecastResult.success) setForecastData(forecastResult.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  //pour trouver la ville par rapport à la position
  const handleLocationFound = async (lat, lon) => {
    const res = await weatherApi.getCityFromLocation(lat, lon);
    if (res.success) handleSearch(res.city);
  };

  //pour ajouter un favori
  const handleAddFavorite = async () => {
    if (!weatherData) return;
    if (isCityFavorite()) {
      const res = await weatherApi.removeFavorite(weatherData.city);
      if (res.success) loadFavorites();
      return;
    }
    const result = await weatherApi.addFavorite(weatherData.city);
    if (result.success) {
      Alert.alert('Succès', `${weatherData.city} ajouté aux favoris !`);
      loadFavorites();
    }
  };

  //pour vérifier si la ville est dans les favoris
  const isCityFavorite = () => {
    if (!weatherData || !favorites) return false;
    return favorites.some(fav => fav.city_name.toLowerCase() === weatherData.city.toLowerCase());
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#4A90E2' }]} />
      <View style={[styles.darkOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)' }]} />

      <View style={styles.mainWrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>MeteoApp</Text>
            {weatherData && <Text style={styles.subtitle}>Météo à {weatherData.city}</Text>}
          </View>

          <View style={styles.headerButtons}>

            <LocationButton onLocationFound={handleLocationFound} theme={theme} />

            <View style={{ width: 12 }} />

            <ThemeToggle />
          </View>
        </View>

        {weatherData && (
          <View style={styles.searchSection}>
            <SearchBar onSearch={handleSearch} theme={theme} />
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 100 }} />
          ) : weatherData ? (
            <>
              <WeatherCard
                weatherData={weatherData}
                onAddFavorite={handleAddFavorite}
                isFavorite={isCityFavorite()}
                theme={theme}
              />

              {adminReports.length > 0 && adminReports.map((report, index) => (
                <View key={index} style={[styles.glassCard, styles.adminReportBorder]}>
                  <View style={{ padding: 15 }}>
                    <Text style={styles.adminBadge}>📢 NOTE OFFICIELLE</Text>
                    <Text style={styles.adminContent}>{report.content}</Text>
                    <Text style={styles.adminDate}>
                      Publié le {new Date(report.created_at).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.glassCard}>
                <SunInfo sunrise={weatherData.sunrise} sunset={weatherData.sunset} uvIndex={weatherData.uvIndex} theme={theme} />
              </View>

              <StorytellingButton weatherData={weatherData} theme={theme} />

              <Text style={styles.sectionTitle}>Prévisions</Text>
              <View style={styles.glassCard}>
                <ForecastCard forecastData={forecastData} theme={theme} isDarkMode={isDarkMode} />
              </View>
            </>
          ) : error ? (
            <View style={styles.errorBox}>
              <SearchBar onSearch={handleSearch} theme={theme} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>Votre fenêtre sur le ciel</Text>
              <Text style={styles.welcomeSubtitle}>
                Retrouvez vos villes favorites et recevez les alertes météo
                officielles pour rester toujours un pas devant.
              </Text>

              <View style={styles.centerSearch}>
                <SearchBar onSearch={handleSearch} theme={theme} />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  darkOverlay: { ...StyleSheet.absoluteFillObject },
  mainWrapper: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  searchSection: { paddingHorizontal: 20, marginBottom: 10 },
  centerSearch: { width: '100%', paddingHorizontal: 0, marginTop: 10 },
  scrollPadding: { paddingBottom: 60, paddingHorizontal: 15 },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 28,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden'
  },
  proButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10, marginTop: 15 },
  errorBox: { backgroundColor: 'rgba(255,0,0,0.2)', padding: 20, borderRadius: 20, marginTop: 50 },
  errorText: { color: '#fff', textAlign: 'center', marginTop: 10 },
  adminReportBorder: { borderColor: '#F1C40F', borderLeftWidth: 5 },
  adminBadge: { color: '#F1C40F', fontWeight: 'bold', fontSize: 12, marginBottom: 5 },
  adminContent: { color: '#fff', fontSize: 15, lineHeight: 22 },
  adminDate: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 10 },
  welcomeContainer: {
    marginTop: '30%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 35,
  },
});

export default HomeScreen; 