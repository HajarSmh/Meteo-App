import React, { useState } from 'react';
import { TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';

//bouton pour la geolocalisation 
const LocationButton = ({ onLocationFound, theme }) => {
  const [loading, setLoading] = useState(false);

  const getLocation = async () => {
    try {
      setLoading(true);

      // Demander la permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour cette fonctionnalité.'
        );
        setLoading(false);
        return;
      }

      // Obtenir la position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      //appeler le callback avec les coordonnées
      if (onLocationFound) {
        await onLocationFound(latitude, longitude);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'obtenir votre position. Vérifiez vos paramètres de localisation.'
      );
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.primary }]}
      onPress={getLocation}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/535/535239.png' }}
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
});

export default LocationButton;