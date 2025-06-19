/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import RechercheScreen from './screens/RechercheScreen';
import FavorisScreen from './screens/FavorisScreen';
import PreferencesScreen from './screens/PreferencesScreen';

const Tab = createBottomTabNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#8E8E93',
          headerStyle: {
            backgroundColor: '#F2F2F7',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Tab.Screen 
          name="Recherche" 
          component={RechercheScreen}
          options={{
            tabBarLabel: 'Recherche',
            title: 'Recherche',
          tabBarIcon: ({ color, size }) => (
            <Icon name="search" size={size} color="blue" />
          ),
          }}
        />
        <Tab.Screen 
          name="Favoris" 
          component={FavorisScreen}
          options={{
            tabBarLabel: 'Favoris',
            title: 'Favoris',
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart" size={size} color="blue" />
          ),
          }}
        />
        <Tab.Screen 
          name="Preferences" 
          component={PreferencesScreen}
          options={{
            tabBarLabel: 'Préférences',
            title: 'Préférences',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color="blue" />
          ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
