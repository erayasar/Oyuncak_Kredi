import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';
import ToyCard from '../components/ToyCard';
import { useFocusEffect } from '@react-navigation/native';

const UserScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadUserInfo = async () => {
        try {
            const response = await api.getUserInfo();
            setUserInfo(response);
        } catch (error) {
            console.error('Kullanıcı bilgileri yüklenirken hata:', error);
            Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserInfo();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadUserInfo().finally(() => setRefreshing(false));
    }, []);

    const handleLogout = async () => {
        try {
            await api.logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.userInfo}>
                    <Icon name="person-circle-outline" size={40} color="#FFF" />
                    <View style={styles.userInfoText}>
                        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>
                            {userInfo?.fullName || 'Kullanıcı'}
                        </Text>
                        <Text style={{ color: '#FFF', fontSize: 14 }}>
                            {userInfo?.points || 0} Puan
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
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {renderHeader()}
            <View style={styles.content}>
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Icon name="person" size={40} color="#FFF" />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{userInfo?.fullName}</Text>
                            <Text style={styles.profileEmail}>{userInfo?.email}</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Icon name="star" size={24} color="#FFD700" />
                            <Text style={styles.statValue}>{userInfo?.points || 0}</Text>
                            <Text style={styles.statLabel}>Puan</Text>
                        </View>
                        <View style={[styles.statItem, styles.statBorder]}>
                            <Icon name="call" size={24} color="#4CAF50" />
                            <Text style={styles.statValue}>{userInfo?.phone || '-'}</Text>
                            <Text style={styles.statLabel}>Telefon</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionCards}>
                    <TouchableOpacity 
                        style={[styles.actionCard, { backgroundColor: '#FF6B6B' }]}
                        onPress={() => navigation.navigate('MyRentalsList')}
                    >
                        <View style={styles.actionIcon}>
                            <Icon name="time" size={32} color="#FFF" />
                        </View>
                        <View style={styles.actionInfo}>
                            <Text style={styles.actionTitle}>Kiraladığım Oyuncaklar</Text>
                            <Text style={styles.actionSubtitle}>Kiralama geçmişinizi görüntüleyin</Text>
                        </View>
                        <Icon name="chevron-forward" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.actionCard, { backgroundColor: '#4CAF50' }]}
                        onPress={() => navigation.navigate('MyToysList')}
                    >
                        <View style={styles.actionIcon}>
                            <Icon name="cube" size={32} color="#FFF" />
                        </View>
                        <View style={styles.actionInfo}>
                            <Text style={styles.actionTitle}>Eklediğim Oyuncaklar</Text>
                            <Text style={styles.actionSubtitle}>Oyuncaklarınızı yönetin</Text>
                        </View>
                        <Icon name="chevron-forward" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        padding: 16,
        gap: 16,
    },
    profileCard: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 14,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statBorder: {
        borderLeftWidth: 1,
        borderLeftColor: '#EEE',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    actionCards: {
        gap: 12,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
    header: {
        backgroundColor: '#FF6B6B',
        paddingTop: 15,
        paddingBottom: 15,
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
});

export default UserScreen; 