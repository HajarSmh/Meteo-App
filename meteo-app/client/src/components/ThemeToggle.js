import React from 'react';
import { TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

//bouton pour changer le thème
const ThemeToggle = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#2D3748' : '#E2E8F0',
          ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }),
        }
      ]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      {/* Cercle qui se déplace */}
      <View style={[
        styles.toggle,
        isDarkMode ? styles.toggleRight : styles.toggleLeft,
        {
          ...(Platform.OS === 'web' ? {
            boxShadow: '0 2px 3px rgba(0, 0, 0, 0.15)',
          } : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }),
        }
      ]}>
        {/* Icône soleil ou lune */}
        <View style={styles.iconContainer}>
          {isDarkMode ? (
            // Lune avec étoiles
            <View style={styles.moonContainer}>
              <View style={styles.moon} />
              <View style={[styles.star, styles.star1]} />
              <View style={[styles.star, styles.star2]} />
              <View style={[styles.star, styles.star3]} />
            </View>
          ) : (
            // Soleil avec rayons
            <View style={styles.sunContainer}>
              <View style={styles.sun} />
              <View style={[styles.ray, styles.ray1]} />
              <View style={[styles.ray, styles.ray2]} />
              <View style={[styles.ray, styles.ray3]} />
              <View style={[styles.ray, styles.ray4]} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toggleLeft: {
    alignSelf: 'flex-start',
  },
  toggleRight: {
    alignSelf: 'flex-end',
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Soleil
  sunContainer: {
    position: 'relative',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sun: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  ray: {
    position: 'absolute',
    width: 2,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 1,
  },
  ray1: {
    top: 0,
    left: 9,
  },
  ray2: {
    bottom: 0,
    left: 9,
  },
  ray3: {
    left: 0,
    top: 7,
  },
  ray4: {
    right: 0,
    top: 7,
  },

  // Lune
  moonContainer: {
    position: 'relative',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFD700',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  star1: {
    top: 2,
    right: 3,
  },
  star2: {
    bottom: 3,
    right: 2,
  },
  star3: {
    top: 8,
    right: 1,
  },
});

export default ThemeToggle;