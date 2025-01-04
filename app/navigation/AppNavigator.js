import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import UserScreen from '../screens/UserScreen';
import AddToyScreen from '../screens/AddToyScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ToyDetailScreen from '../screens/ToyDetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Ana tab navigasyonu
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FF6B6B',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#EEEEEE',
                }
            }}
        >
            <Tab.Screen 
                name="AnaSayfa" 
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Text style={{fontSize: 24, color}}>🏠</Text>
                    ),
                    tabBarLabel: 'Ana Sayfa'
                }}
            />
            <Tab.Screen 
                name="OyuncakEkle" 
                component={AddToyScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Text style={{fontSize: 24, color}}>➕</Text>
                    ),
                    tabBarLabel: 'Oyuncak Ekle'
                }}
            />
            <Tab.Screen 
                name="Profilim" 
                component={UserScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Text style={{fontSize: 24, color}}>👤</Text>
                    ),
                    tabBarLabel: 'Profilim'
                }}
            />
        </Tab.Navigator>
    );
}

const AppNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { 
                    backgroundColor: '#FFFFFF'
                }
            }}
        >
            <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
            />
            <Stack.Screen 
                name="Register" 
                component={RegisterScreen} 
            />
            <Stack.Screen 
                name="Main" 
                component={MainTabs} 
            />
            <Stack.Screen name="ToyDetail" component={ToyDetailScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator; 