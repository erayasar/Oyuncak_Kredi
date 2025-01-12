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
import RentalsScreen from '../screens/RentalsScreen';
import MyRentalsScreen from '../screens/MyRentalsScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import EditToyScreen from '../screens/EditToyScreen';
import ProfileSettingsScreen from '../screens/ProfileSettingsScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home-outline" size={size} color={color} />
                    ),
                    tabBarLabel: 'Ana Sayfa'
                }}
            />
            <Tab.Screen 
                name="OyuncakEkle" 
                component={AddToyScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="add-circle-outline" size={size} color={color} />
                    ),
                    tabBarLabel: 'Oyuncak Ekle'
                }}
            />
            <Tab.Screen 
                name="Profilim" 
                component={UserScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="person-outline" size={size} color={color} />
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
                cardStyle: { backgroundColor: '#FFFFFF' }
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ToyDetail" component={ToyDetailScreen} />
            <Stack.Screen name="MyRentals" component={MyRentalsScreen} />
            <Stack.Screen 
                name="AccountSettings"
                component={AccountSettingsScreen}
                options={{
                    headerShown: true,
                    title: 'Hesap Ayarları',
                    headerStyle: {
                        backgroundColor: '#FF6B6B',
                    },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen 
                name="EditToy"
                component={EditToyScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen 
                name="ProfileSettings" 
                component={ProfileSettingsScreen}
                options={{ 
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator; 