import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    Alert,
    Image
} from 'react-native';
import api from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

const MyRentalsListScreen = ({ navigation }) => {
    const [rentals, setRentals] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadRentals = async () => {
        try {
            const response = await api.getMyRentals();
            console.log('Yüklenen kiralamalar:', JSON.stringify(response, null, 2));
            setRentals(response);
        } catch (error) {
            console.error('Kiralamalar yüklenirken hata:', error);
            Alert.alert('Hata', 'Kiralamalar yüklenirken bir hata oluştu');
        }
    };

    useEffect(() => {
        loadRentals();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadRentals().finally(() => setRefreshing(false));
    };

    const renderRentalItem = ({ item }) => (
        <View style={styles.rentalCard}>
            <Image 
                source={{ 
                    uri: item.toy_imageUrl || 'https://via.placeholder.com/200'
                }} 
                style={styles.toyImage}
                resizeMode="cover"
            />
            <View style={styles.rentalInfo}>
                <View style={styles.headerSection}>
                    <Text style={styles.toyName}>{item.toy_name}</Text>
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

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kategori:</Text>
                        <Text style={styles.infoValue}>{item.category_name}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Yaş Aralığı:</Text>
                        <Text style={styles.infoValue}>{item.toy_ageRange}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Oyuncak Puanı:</Text>
                        <Text style={styles.pointsValue}>{item.toy_points}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kiralama Süresi:</Text>
                        <Text style={styles.infoValue}>{item.rental_period} Ay</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Harcanan Puan:</Text>
                        <Text style={styles.pointsValue}>{item.points_spent}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Başlangıç:</Text>
                        <Text style={styles.infoValue}>{new Date(item.start_date).toLocaleDateString('tr-TR')}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Bitiş:</Text>
                        <Text style={styles.infoValue}>{new Date(item.end_date).toLocaleDateString('tr-TR')}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Teslimat Adresi:</Text>
                        <Text style={styles.infoValue}>{item.delivery_address}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Telefon:</Text>
                        <Text style={styles.infoValue}>{item.phone}</Text>
                    </View>

                    {item.status === 'active' && (
                        <View style={styles.remainingDaysContainer}>
                            {item.remaining_days > 0 ? (
                                <Text style={styles.remainingDays}>
                                    Kalan: {item.remaining_days} gün
                                </Text>
                            ) : (
                                <Text style={[styles.remainingDays, styles.expiredText]}>
                                    Süre Doldu!
                                </Text>
                            )}
                        </View>
                    )}
                </View>
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
                    <Icon name="arrow-back" size={24} color="#FF6B6B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kiraladığım Oyuncaklar</Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={rentals}
                renderItem={renderRentalItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Henüz kiralama yapmamışsınız</Text>
                    </View>
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
        padding: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 34,
    },
    headerRight: {
        width: 24,
    },
    rentalCard: {
        backgroundColor: '#FFF',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    rentalInfo: {
        gap: 5,
    },
    toyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    categoryName: {
        fontSize: 14,
        color: '#666',
    },
    dates: {
        fontSize: 14,
        color: '#666',
    },
    remainingDays: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    status: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        fontSize: 13,
        fontWeight: '600',
    },
    activeStatus: {
        backgroundColor: '#E3F2FD',
        color: '#1976D2',
    },
    returnedStatus: {
        backgroundColor: '#E8F5E9',
        color: '#388E3C',
    },
    cancelledStatus: {
        backgroundColor: '#FFEBEE',
        color: '#D32F2F',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    toyImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
    headerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    infoSection: {
        marginTop: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        width: 120,
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    remainingDaysContainer: {
        marginTop: 5,
    },
    expiredText: {
        color: '#D32F2F',
        fontWeight: 'bold',
    },
    pointsValue: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
});

export default MyRentalsListScreen; 