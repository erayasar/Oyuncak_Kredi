import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './app/screens/LoginScreen' 
import HomeScreen from './app/screens/HomeScreen';
import UserProfileScreen from './app/screens/UserProfileScreen';
import AddToyScreen from './app/screens/AddToyScreen';
import RegisterScreen from './app/screens/RegisterScreen';

const Stack = createStackNavigator();

const App = () => {
  const [toys, setToys] = useState([]);
  const [userPoints, updateUserPoints] = useState([]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="UserProfile" 
          component={UserProfileScreen} 
        />
        <Stack.Screen
          name="AddToy"
          component={AddToyScreen}
          initialParams={{ setToys, updateUserPoints }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
