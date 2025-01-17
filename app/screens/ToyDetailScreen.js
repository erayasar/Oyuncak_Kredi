import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    TextInput
} from 'react-native';
import api from '../services/api';

const ToyDetailScreen = ({ route, navigation }) => {
    const { toy } = route.params;
    const [userInfo, setUserInfo] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [rentalPeriod, setRentalPeriod] = useState('1');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [categoryName, setCategoryName] = useState('');

    const requiredPoints = toy.points * parseInt(rentalPeriod);
    const hasEnoughPoints = userInfo?.points >= requiredPoints;

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const userData = await api.getUserInfo();
                setUserInfo(userData);
                setIsOwner(userData.id === toy.user_id);
                if (userData.address) setDeliveryAddress(userData.address);
                if (userData.phone) setPhone(userData.phone);
            } catch (error) {
                console.error('Kullanıcı bilgileri yüklenirken hata:', error);
            }
        };

        loadUserInfo();
    }, [toy.user_id]);

    useEffect(() => {
        if (toy.category_name) {
            setCategoryName(toy.category_name);
        }
    }, [toy]);

    const handleRent = async () => {
        try {
            if (!rentalPeriod) {
                Alert.alert('Hata', 'Lütfen kiralama süresi seçin');
                return;
            }

            if (!deliveryAddress.trim()) {
                Alert.alert('Hata', 'Lütfen teslimat adresi girin');
                return;
            }

            if (!phone.trim()) {
                Alert.alert('Hata', 'Lütfen telefon numarası girin');
                return;
            }

            const rentalData = {
                rental_period: rentalPeriod,
                delivery_address: deliveryAddress,
                phone: phone
            };

            await api.rentToy(toy.id, rentalData);
            Alert.alert(
                'Başarılı', 
                'Oyuncak başarıyla kiralandı',
                [
                    { 
                        text: 'Tamam', 
                        onPress: () => navigation.navigate('Home')
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Hata', error.message || 'Kiralama işlemi başarısız oldu');
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Oyuncak Sil',
            'Bu oyuncağı silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.deleteToy(toy.id);
                            Alert.alert('Başarılı', 'Oyuncak başarıyla silindi');
                            navigation.goBack();
                            // HomeScreen'i güncelle
                            navigation.getParent()?.setParams({ refresh: true });
                        } catch (error) {
                            Alert.alert('Hata', error.message || 'Oyuncak silinirken bir hata oluştu');
                        }
                    }
                }
            ]
        );
    };

    const renderRentalSection = () => (
        <View style={styles.rentalSection}>
            <Text style={styles.sectionTitle}>Kiralama Süresi</Text>
            <View style={styles.periodSelector}>
                {['1', '2', '3'].map((period) => (
                    <TouchableOpacity
                        key={period}
                        style={[
                            styles.periodButton,
                            rentalPeriod === period && styles.periodButtonActive
                        ]}
                        onPress={() => setRentalPeriod(period)}
                    >
                        <Text style={[
                            styles.periodButtonText,
                            rentalPeriod === period && styles.periodButtonTextActive
                        ]}>
                            {period} Ay
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.pointsContainer}>
                <Text style={styles.pointsText}>
                    Gereken Puan: {requiredPoints}
                </Text>
                <Text style={styles.availablePoints}>
                    Mevcut Puanınız: {userInfo?.points || 0}
                </Text>
                {!hasEnoughPoints && (
                    <Text style={styles.insufficientPoints}>
                        Yetersiz Puan! ({requiredPoints - (userInfo?.points || 0)} puan eksik)
                    </Text>
                )}
            </View>

            <TextInput
                style={styles.input}
                placeholder="Teslimat Adresi"
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
            />

            <TextInput
                style={styles.input}
                placeholder="Telefon Numarası"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <TouchableOpacity
                style={[
                    styles.rentButton,
                    (!hasEnoughPoints || loading || !toy.is_available) && styles.rentButtonDisabled
                ]}
                onPress={handleRent}
                disabled={!hasEnoughPoints || loading || !toy.is_available}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.rentButtonText}>
                        {!toy.is_available ? 'Kirada' : 
                         !hasEnoughPoints ? 'Yetersiz Puan' : 
                         'Kirala'}
                    </Text>
                )}
            </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Oyuncak Detayı</Text>
                <View style={styles.headerRight} />
            </View>

            <View style={styles.mainContainer}>
                <ScrollView>
                    <View style={styles.imageContainer}>
                        <Image 
                            source={{ uri: toy.imageUrl }} 
                            style={styles.image}
                            resizeMode="cover"
                        />
                        {!toy.is_available && (
                            <View style={styles.unavailableBanner}>
                                <Text style={styles.unavailableBannerText}>
                                    Bu Oyuncak Şu Anda Kirada
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.content}>
                        <Text style={styles.name}>{toy.name}</Text>
                        <View style={styles.priceAndPointsContainer}>
                            <Text style={styles.points}>Kiralama Puanı: {toy.points} </Text>
                        </View>
                        
                        {!toy.is_available && (
                            <View style={styles.notAvailableContainer}>
                                <Text style={styles.notAvailable}>
                                    Bu oyuncak şu anda kiralanamaz durumda
                                </Text>
                            </View>
                        )}
                        
                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Kategori:</Text>
                            <Text style={styles.value}>{categoryName}</Text>
                        </View>
                        
                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Yaş Aralığı:</Text>
                            <Text style={styles.value}>{toy.ageRange}</Text>
                        </View>
                        
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.label}>Açıklama:</Text>
                            <Text style={styles.description}>{toy.description}</Text>
                        </View>

                        {isOwner ? (
                            <View style={styles.ownerActions}>
                                <TouchableOpacity 
                                    style={styles.editButton}
                                    onPress={() => navigation.navigate('EditToy', { toy })}
                                >
                                    <Text style={styles.editButtonText}>Düzenle</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.deleteButton}
                                    onPress={() => handleDelete()}
                                >
                                    <Text style={styles.deleteButtonText}>Sil</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            !toy.is_available ? (
                                <View style={styles.unavailableContainer}>
                                    <Text style={styles.unavailableText}>
                                        Bu oyuncak şu anda kiralanamaz durumda
                                    </Text>
                                </View>
                            ) : (
                                renderRentalSection()
                            )
                        )}
                    </View>
                </ScrollView>
            </View>
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
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
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
        color: '#333333',
    },
    headerRight: {
        width: 30,
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#f0f0f0',
    },
    content: {
        padding: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    priceAndPointsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    price: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FF6B6B',
    },
    points: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
    },
    notAvailable: {
        fontSize: 16,
        color: '#FF0000',
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
        backgroundColor: '#FFE5E5',
        padding: 10,
        borderRadius: 5,
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginRight: 10,
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    descriptionContainer: {
        marginBottom: 30,
    },
    description: {
        fontSize: 16,
        color: '#333',
        lineHeight: 24,
        marginTop: 5,
    },
    rentalSection: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    periodSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    periodButton: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    periodButtonActive: {
        backgroundColor: '#FF6B6B',
    },
    periodButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    periodButtonTextActive: {
        color: '#FFF',
    },
    pointsContainer: {
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
    },
    pointsText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    availablePoints: {
        fontSize: 14,
        color: '#4CAF50',
        marginTop: 5,
    },
    insufficientPoints: {
        fontSize: 14,
        color: '#FF4444',
        marginTop: 5,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        minHeight: 40,
    },
    rentButton: {
        backgroundColor: '#FF6B6B',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    rentButtonDisabled: {
        opacity: 0.7,
        backgroundColor: '#999',
    },
    rentButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginLeft: 10,
    },
    scrollContent: {
        flexGrow: 1,
    },
    mainContainer: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        height: 300,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notAvailableContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFE5E5',
        padding: 10,
        borderRadius: 5,
    },
    unavailableBanner: {
        position: 'absolute',
        top: 20,
        right: 0,
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    unavailableBannerText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    category: {
        fontSize: 16,
        color: '#666',
        marginVertical: 5,
    },
    ownerActions: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        marginRight: 10,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#FF6B6B',
        padding: 15,
        borderRadius: 10,
        marginLeft: 10,
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deleteButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ToyDetailScreen; 