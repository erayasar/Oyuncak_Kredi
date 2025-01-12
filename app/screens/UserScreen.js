import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import ToyCard from '../components/ToyCard';
import { useFocusEffect } from '@react-navigation/native';

const UserScreen = ({ navigation }) => {
    const [toys, setToys] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [activeTab, setActiveTab] = useState('toys');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUserData = async () => {
        try {
            const [toysResponse, rentalsResponse, userResponse] = await Promise.all([
                api.getUserToys(),
                api.getMyRentals(),
                api.getUserInfo()
            ]);
            setToys(toysResponse || []);
            setRentals(rentalsResponse || []);
            setUserInfo(userResponse);
        } catch (error) {
            console.error('Veri getirme hatası:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserData();
    };

    const handleLogout = async () => {
        Alert.alert(
            "Çıkış Yap",
            "Çıkış yapmak istediğinize emin misiniz?",
            [
                {
                    text: "İptal",
                    style: "cancel"
                },
                {
                    text: "Çıkış Yap",
                    onPress: async () => {
                        try {
                            await api.logout();
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
                        }
                    }
                }
            ]
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.userInfo}>
                    <Icon name="person-circle" size={50} color="#FFF" />
                    <View style={styles.userInfoText}>
                        <Text style={styles.headerTitle}>
                            {userInfo?.username}
                        </Text>
                        <Text style={styles.pointsText}>
                            <Icon name="star" size={16} color="#FFD700" /> {userInfo?.points || 0} Puan
                        </Text>
                    </View>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity 
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('ProfileSettings')}
                    >
                        <Icon name="settings-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Icon name="log-out-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'toys' && styles.activeTab]}
                    onPress={() => setActiveTab('toys')}
                >
                    <Icon 
                        name="cube-outline" 
                        size={20} 
                        color={activeTab === 'toys' ? '#FFF' : 'rgba(255,255,255,0.7)'} 
                    />
                    <Text style={[styles.tabText, activeTab === 'toys' && styles.activeTabText]}>
                        Oyuncaklarım
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'rentals' && styles.activeTab]}
                    onPress={() => setActiveTab('rentals')}
                >
                    <Icon 
                        name="swap-horizontal-outline" 
                        size={20} 
                        color={activeTab === 'rentals' ? '#FFF' : 'rgba(255,255,255,0.7)'} 
                    />
                    <Text style={[styles.tabText, activeTab === 'rentals' && styles.activeTabText]}>
                        Kiraladıklarım
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <Text>Yükleniyor...</Text>
                </View>
            );
        }

        const data = activeTab === 'toys' ? toys : rentals;
        
        if (data.length === 0) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={styles.noItemsText}>
                        {activeTab === 'toys' 
                            ? 'Henüz hiç oyuncak eklemediniz.'
                            : 'Henüz hiç oyuncak kiralamadınız.'}
                    </Text>
                </View>
            );
        }

        return (
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <ToyCard
                        toy={activeTab === 'toys' ? item : item.toy}
                        onPress={() => navigation.navigate('ToyDetail', { 
                            toy: activeTab === 'toys' ? item : item.toy
                        })}
                        rentalInfo={activeTab === 'rentals' ? {
                            startDate: item.start_date,
                            endDate: item.end_date,
                            status: item.status
                        } : null}
                    />
                )}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                contentContainerStyle={styles.listContent}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            {renderContent()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        backgroundColor: '#FF6B6B',
        paddingTop: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfoText: {
        marginLeft: 10,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    profileButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    logoutButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,0,0,0.2)',
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#FFF',
    },
    tabText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 10,
    },
    noItemsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    }
});

export default UserScreen; 