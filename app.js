import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import AppNavigator from './app/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar 
        backgroundColor="#FFFFFF" 
        barStyle="dark-content"
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}
