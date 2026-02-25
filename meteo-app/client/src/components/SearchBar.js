import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import MapSearchModal from './MapSearchModal';

//barre de recherche
const SearchBar = ({ onSearch, theme }) => {
  const [cityName, setCityName] = useState('');
  const [mapModalVisible, setMapModalVisible] = useState(false);
  //gérer la recherche
  const handleSearch = () => {
    if (cityName.trim()) {
      onSearch(cityName.trim());
      setCityName('');
    }
  };

  const handleMapLocationSelected = (city) => {
    onSearch(city);
    setMapModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="Saisir une ville..."
          placeholderTextColor={theme.textTertiary}
          value={cityName}
          onChangeText={setCityName}
          onSubmitEditing={handleSearch}
          onFocus={() => { }}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleSearch}>
          <Text style={styles.buttonText}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: theme.primary }]}
          onPress={() => setMapModalVisible(true)}
        >
          <Text style={styles.mapButtonText}>🗺️</Text>
        </TouchableOpacity>

      </View>

      <MapSearchModal
        visible={mapModalVisible}
        onClose={() => setMapModalVisible(false)}
        onLocationSelected={handleMapLocationSelected}
        theme={theme}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  mapButton: {
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    }),
  },
  mapButtonText: {
    fontSize: 20,
  },
  button: {
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    }),
  },
  buttonText: {
    fontSize: 20,
  },
});

export default SearchBar;