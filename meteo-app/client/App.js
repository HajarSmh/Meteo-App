import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import TabIcon from './src/components/TabIcon';
import { ThemeProvider } from './src/context/ThemeContext';
import AdminScreen from './src/screens/AdminScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#4A90E2',
            tabBarInactiveTintColor: '#95A5A6',
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#E8E8E8',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Recherche',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon iconName="search" color={color} focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesScreen}
            options={{
              tabBarLabel: 'Favoris',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon iconName="star" color={color} focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Admin"
            component={AdminScreen}
            options={{
              tabBarLabel: 'Admin',
              tabBarIcon: ({ color, focused }) => (
                <TabIcon iconName="settings" color={color} focused={focused} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}