import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
    SafeAreaView,
    Alert
} from 'react-native';
import api from '../services/api';

const UserScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [userToys, setUserToys] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await api.getUserInfo();
            const userToys = await api.getUserToys();
            setUserInfo(userData);
            setUserToys(userToys);
        } catch (error) {
            Alert.alert('Hata', 'Kullanıcı bilgileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const renderToyItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.toyCard}
            onPress={() => navigation.navigate('ToyDetail', { toy: item })}
        >
            <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.toyImage}
            />
            <View style={styles.toyInfo}>
                <Text style={styles.toyName}>{item.name}</Text>
                <Text style={styles.toyPrice}>{item.price} TL</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Profil Başlığı */}
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <Text style={styles.username}>{userInfo?.username}</Text>
                        <Text style={styles.email}>{userInfo?.email}</Text>
                    </View>
                </View>

                {/* Puan Kartı */}
                <View style={styles.pointsCard}>
                    <Text style={styles.pointsTitle}>Toplam Puanınız</Text>
                    <Text style={styles.points}>{userInfo?.points || 0}</Text>
                </View>

                {/* Kişisel Bilgiler */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Ad Soyad:</Text>
                            <Text style={styles.infoValue}>{userInfo?.fullName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Telefon:</Text>
                            <Text style={styles.infoValue}>{userInfo?.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Adres:</Text>
                            <Text style={styles.infoValue}>{userInfo?.address}</Text>
                        </View>
                    </View>
                </View>

                {/* Eklenen Oyuncaklar */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Eklediğiniz Oyuncaklar</Text>
                    <FlatList
                        data={userToys}
                        renderItem={renderToyItem}
                        keyExtractor={item => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.toysList}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>Henüz oyuncak eklemediniz</Text>
                        }
                    />
                </View>

                {/* Düzenle Butonu */}
                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => navigation.navigate('EditProfile')}
                >
                    <Text style={styles.editButtonText}>Profili Düzenle</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#4CAF50',
        padding: 20,
        alignItems: 'center',
    },
    profileInfo: {
        alignItems: 'center',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#FFF',
        opacity: 0.8,
    },
    pointsCard: {
        backgroundColor: '#FFF',
        margin: 15,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    pointsTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    points: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    section: {
        margin: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    infoCard: {
        backgroundColor: '#FFF',
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
    infoRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    infoLabel: {
        width: 100,
        fontSize: 14,
        color: '#666',
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    toysList: {
        paddingHorizontal: 5,
    },
    toyCard: {
        width: 150,
        backgroundColor: '#FFF',
        marginHorizontal: 5,
        borderRadius: 10,
        overflow: 'hidden',
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
        height: 150,
    },
    toyInfo: {
        padding: 10,
    },
    toyName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    toyPrice: {
        fontSize: 12,
        color: '#4CAF50',
        marginTop: 5,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 20,
    },
    editButton: {
        backgroundColor: '#4CAF50',
        margin: 15,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default UserScreen; 