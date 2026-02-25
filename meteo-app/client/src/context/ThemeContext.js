import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

//contexte pour gérer le thème
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  // Charger la préférence sauvegardée au démarrage
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Thème clair
const lightTheme = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  primary: '#4A90E2',
  secondary: '#FFD700',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textTertiary: '#95A5A6',
  border: '#E8E8E8',
  error: '#FFEBEE',
  errorText: '#C62828',
  warning: '#FFF3CD',
  warningText: '#856404',
  headerGradient: ['#4A90E2', '#357ABD'],
  cardShadow: 'rgba(0, 0, 0, 0.1)',
};

// Thème sombre
const darkTheme = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  primary: '#64B5F6',
  secondary: '#FFD54F',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  border: '#2C2C2C',
  error: '#5D1F1F',
  errorText: '#EF9A9A',
  warning: '#5D4F1F',
  warningText: '#FFE082',
  headerGradient: ['#1976D2', '#1565C0'],
  cardShadow: 'rgba(255, 255, 255, 0.1)',
};