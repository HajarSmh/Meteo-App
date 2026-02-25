import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import weatherApi from '../api/weatherApi';
import { useTheme } from '../context/ThemeContext';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //pour recharger les favoris
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const result = await weatherApi.getFavorites();
      if (result.success) {
        setFavorites(result.favorites || []);
      }
    } catch (error) {
      console.error("Erreur de chargement des favoris:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  //pour supprimer un favori
  const handleRemoveFavorite = async (cityName) => {
    try {
      const result = await weatherApi.removeFavorite(cityName);
      if (result.success) {
        setFavorites((prev) => prev.filter((item) => item.city_name !== cityName));
        Alert.alert('✓ Succès', `${cityName} a été retiré des favoris`);
      } else {
        Alert.alert('Erreur', result.error || 'Impossible de supprimer');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Connexion au serveur impossible');
    }
  };

  //pour afficher les favoris
  const renderFavoriteItem = ({ item }) => (
    <View style={styles.glassCard}>
      <TouchableOpacity
        style={styles.favoriteContent}
        onPress={() => navigation.navigate('Home', { searchCity: item.city_name })}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.cityName}>{item.city_name}</Text>
          <Text style={styles.addedDate}>
            Ajouté le {new Date(item.added_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.city_name)}
        activeOpacity={0.6}
      >
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#4A90E2' }]} />
      <View style={[styles.darkOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)' }]} />

      <View style={styles.header}>
        <Text style={styles.title}>Mes Favoris</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? theme.textSecondary : 'rgba(255,255,255,0.7)' }]}>
          {favorites.length} {favorites.length <= 1 ? 'ville' : 'villes'} enregistrée(s)
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.glassCardEmpty}>
                <Text style={styles.emptyIcon}>📍</Text>
                <Text style={styles.emptyText}>Aucun favori</Text>
                <Text style={styles.emptyHint}>Ajoutez des villes via l'écran d'accueil pour les retrouver ici.</Text>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkOverlay: { ...StyleSheet.absoluteFillObject },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 25,
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  glassCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  favoriteContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  cityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addedDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  removeButton: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
  },
  removeIcon: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  glassCardEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 28,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
});

export default FavoritesScreen;