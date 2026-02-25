import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator, Image, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import WeatherStoryEngine from '../utils/WeatherStoryEngine';

//bouton pour raconter la météo
const StorytellingButton = ({ weatherData, theme }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  //fonction pour parler sur le web
  const speakOnWeb = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };
  //fonction pour parler sur le mobile
  const speakOnMobile = async (text) => {
    try {
      console.log('Démarrage de la synthèse vocale mobile...');

      Speech.speak(text, {
        language: 'fr-FR',
        rate: 0.9,
        onStart: () => console.log('Lecture commencée'),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: (err) => {
          console.error('Erreur Speech:', err);
          setIsSpeaking(false);
        }
      });
    } catch (e) {
      console.error('Exception mobile:', e);
      setIsSpeaking(false);
    }
  };
  //gérer le storytelling
  const handleStoryTelling = async () => {
    if (!weatherData) return;

    if (isSpeaking) {
      if (Platform.OS === 'web') {
        window.speechSynthesis?.cancel();
      } else {
        Speech.stop();
      }
      setIsSpeaking(false);
      return;
    }
    //générer l'histoire
    const engine = WeatherStoryEngine.default || WeatherStoryEngine;
    const story = engine.generateStory(weatherData);

    if (!story) return;

    setIsSpeaking(true);

    if (Platform.OS === 'web') {
      speakOnWeb(story);
    } else {
      speakOnMobile(story);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme?.primary || '#007AFF' },
        isSpeaking && styles.buttonActive
      ]}
      onPress={handleStoryTelling}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isSpeaking ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Arrêter</Text>
          </>
        ) : (
          <>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/786/786297.png' }}
              style={styles.iconImage}
            />
            <Text style={styles.buttonText}>Ecouter la météo</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      },
    }),
  },
  buttonActive: {
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StorytellingButton;