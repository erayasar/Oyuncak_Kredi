import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    RefreshControl,
    SafeAreaView,
    Alert
} from 'react-native';
import api from '../services/api';

const UserScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [myToys, setMyToys] = useState([]);
    const [myRentals, setMyRentals] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            const [userData, toysData, rentalsData] = await Promise.all([
                api.getUserInfo(),
                api.getMyToys(),
                api.getMyRentals()
            ]);
            setUserInfo(userData);
            setMyToys(toysData);
            setMyRentals(rentalsData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadData().finally(() => setRefreshing(false));
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

    const renderToyItem = (toy) => (
        <View key={toy.id} style={styles.toyCard}>
            <Image source={{ uri: toy.imageUrl }} style={styles.toyImage} />
            <View style={styles.toyInfo}>
                <Text style={styles.toyName}>{toy.name}</Text>
                <Text style={styles.toyPrice}>{toy.price} TL</Text>
                <Text style={styles.toyPoints}>Puan: {toy.points}</Text>
                <Text style={styles.toyStatus}>
                    {toy.is_available ? 'Kiralanabilir' : 'Kirada'}
                </Text>
            </View>
        </View>
    );

    const renderRentalItem = (rental) => (
        <View key={rental.id} style={styles.rentalCard}>
            <Image source={{ uri: rental.toy.imageUrl }} style={styles.toyImage} />
            <View style={styles.rentalInfo}>
                <Text style={styles.toyName}>{rental.toy.name}</Text>
                <Text style={styles.rentalDate}>
                    Başlangıç: {new Date(rental.start_date).toLocaleDateString()}
                </Text>
                <Text style={styles.rentalDate}>
                    Bitiş: {new Date(rental.end_date).toLocaleDateString()}
                </Text>
                <Text style={[
                    styles.status,
                    rental.status === 'active' ? styles.activeStatus :
                    rental.status === 'returned' ? styles.returnedStatus :
                    styles.cancelledStatus
                ]}>
                    {rental.status === 'active' ? 'Aktif' :
                     rental.status === 'returned' ? 'İade Edildi' :
                     'İptal Edildi'}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {userInfo && (
                    <View style={styles.profileSection}>
                        <Text style={styles.userName}>{userInfo.fullName}</Text>
                        <Text style={styles.userPoints}>Mevcut Puan: {userInfo.points}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Oyuncaklarım</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {myToys.length > 0 ? (
                            myToys.map(renderToyItem)
                        ) : (
                            <Text style={styles.emptyText}>Henüz oyuncağınız bulunmuyor.</Text>
                        )}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kiraladığım Oyuncaklar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {myRentals.length > 0 ? (
                            myRentals.map(renderRentalItem)
                        ) : (
                            <Text style={styles.emptyText}>Henüz kiralama işleminiz bulunmuyor.</Text>
                        )}
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    profileSection: {
        backgroundColor: '#FFF',
        padding: 20,
        alignItems: 'center',
        marginBottom: 15,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    userPoints: {
        fontSize: 18,
        color: '#FF6B6B',
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#FFF',
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 15,
        padding: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    toyCard: {
        backgroundColor: '#FFF',
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden',
        width: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    rentalCard: {
        backgroundColor: '#FFF',
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden',
        width: 200,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toyImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    toyInfo: {
        padding: 10,
    },
    rentalInfo: {
        padding: 10,
    },
    toyName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    toyPrice: {
        fontSize: 14,
        color: '#FF6B6B',
    },
    toyPoints: {
        fontSize: 14,
        color: '#666',
    },
    toyStatus: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    rentalDate: {
        fontSize: 14,
        color: '#666',
    },
    status: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 5,
    },
    activeStatus: {
        color: '#4CAF50',
    },
    returnedStatus: {
        color: '#2196F3',
    },
    cancelledStatus: {
        color: '#F44336',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 15,
        marginHorizontal: 15,
        marginTop: 15,
        borderRadius: 10,
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
    },
    menuItemArrow: {
        fontSize: 18,
        color: '#666',
    },
    logoutButton: {
        backgroundColor: '#FF6B6B',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
    }
});

export default UserScreen; 