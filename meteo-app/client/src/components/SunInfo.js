import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

//pour l'indice uv
const SunInfo = ({ sunrise, sunset, uvIndex, theme }) => {
  if (!sunrise || !sunset) {
    return null;
  }
  //fonction pour formater le temps
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };
  //fonction pour obtenir le niveau d'uv
  const getUVLevel = (uv) => {
    if (uv === null || uv === undefined) return { text: 'N/A', color: '#95A5A6' };
    if (uv <= 2) return { text: 'Faible', color: '#27AE60' };
    if (uv <= 5) return { text: 'Modéré', color: '#F39C12' };
    if (uv <= 7) return { text: 'Élevé', color: '#E67E22' };
    if (uv <= 10) return { text: 'Très élevé', color: '#E74C3C' };
    return { text: 'Extrême', color: '#8E44AD' };
  };

  const uvLevel = getUVLevel(uvIndex);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.row}>
        {/* Lever du soleil */}
        <View style={styles.item}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/869/869869.png' }}
            style={[styles.icon, { tintColor: '#F39C12' }]}
          />
          <Text style={[styles.label, { color: theme.textSecondary }]}>Lever</Text>
          <Text style={[styles.value, { color: theme.text }]}>{formatTime(sunrise)}</Text>
        </View>

        {/* Coucher du soleil */}
        <View style={styles.item}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2698/2698194.png' }}
            style={[styles.icon, { tintColor: '#E74C3C' }]}
          />
          <Text style={[styles.label, { color: theme.textSecondary }]}>Coucher</Text>
          <Text style={[styles.value, { color: theme.text }]}>{formatTime(sunset)}</Text>
        </View>

        {/* Indice UV */}
        <View style={styles.item}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png' }}
            style={[styles.icon, { tintColor: uvLevel.color }]}
          />
          <Text style={[styles.label, { color: theme.textSecondary }]}>UV Index</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {uvIndex !== null ? uvIndex.toFixed(1) : 'N/A'}
          </Text>
          <Text style={[styles.uvLevel, { color: uvLevel.color }]}>
            {uvLevel.text}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  uvLevel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default SunInfo;