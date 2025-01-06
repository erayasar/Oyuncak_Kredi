import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    RefreshControl,
    SafeAreaView,
    Alert
} from 'react-native';
import api from '../services/api';

const MyRentalsScreen = ({ navigation }) => {
    const [myRentals, setMyRentals] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadMyRentals = async () => {
        try {
            const response = await api.getMyRentals();
            setMyRentals(response);
        } catch (error) {
            console.error('Kiralama bilgileri yüklenirken hata:', error);
            Alert.alert('Hata', 'Kiralama bilgileri yüklenemedi');
        }
    };

    useEffect(() => {
        loadMyRentals();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadMyRentals().finally(() => setRefreshing(false));
    }, []);

    const renderRentalItem = ({ item }) => (
        <View style={styles.rentalCard}>
            <Image 
                source={{ uri: item.toy.imageUrl }} 
                style={styles.toyImage}
            />
            <View style={styles.rentalInfo}>
                <Text style={styles.toyName}>{item.toy.name}</Text>
                <Text style={styles.rentalDate}>
                    Kiralama Tarihi: {new Date(item.rental_date).toLocaleDateString()}
                </Text>
                <Text style={styles.rentalDuration}>
                    Süre: {item.rental_duration} gün
                </Text>
                <Text style={styles.rentalPrice}>
                    Ücret: {item.rental_price} TL
                </Text>
                <Text style={[styles.status, 
                    item.status === 'active' ? styles.activeStatus : 
                    item.status === 'returned' ? styles.returnedStatus :
                    styles.cancelledStatus
                ]}>
                    {item.status === 'active' ? 'Aktif' :
                     item.status === 'returned' ? 'İade Edildi' :
                     'İptal Edildi'}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kiralama Geçmişim</Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={myRentals}
                renderItem={renderRentalItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        Henüz kiralama işleminiz bulunmuyor.
                    </Text>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 24,
        color: '#FF6B6B',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    headerRight: {
        width: 30,
    },
    rentalCard: {
        backgroundColor: '#FFF',
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden',
        flexDirection: 'row',
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
        width: 120,
        height: 120,
    },
    rentalInfo: {
        flex: 1,
        padding: 10,
    },
    toyName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    rentalDate: {
        fontSize: 14,
        color: '#666',
    },
    rentalDuration: {
        fontSize: 14,
        color: '#666',
    },
    rentalPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B6B',
        marginTop: 5,
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
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
});

export default MyRentalsScreen; 