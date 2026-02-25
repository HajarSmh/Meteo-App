import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

//icone des onglets
const TabIcon = ({ iconName, focused, color }) => {
  const icons = {
    search: 'https://cdn-icons-png.flaticon.com/512/149/149852.png',
    star: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png',
    admin: 'https://cdn-icons-png.flaticon.com/512/2592/2592189.png',
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: icons[iconName] || icons.admin }}
        style={[
          styles.icon,
          {
            tintColor: color,
            opacity: focused ? 1 : 0.5,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
});

export default TabIcon;