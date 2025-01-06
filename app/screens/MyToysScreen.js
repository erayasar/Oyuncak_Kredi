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

const MyToysScreen = ({ navigation }) => {
    const [myToys, setMyToys] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadMyToys = async () => {
        try {
            const response = await api.getMyToys();
            setMyToys(response);
        } catch (error) {
            console.error('Oyuncaklar yüklenirken hata:', error);
            Alert.alert('Hata', 'Oyuncaklar yüklenemedi');
        }
    };

    useEffect(() => {
        loadMyToys();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadMyToys().finally(() => setRefreshing(false));
    }, []);

    const handleDeleteToy = async (toyId) => {
        try {
            await api.deleteToy(toyId);
            Alert.alert('Başarılı', 'Oyuncak başarıyla silindi');
            loadMyToys();
        } catch (error) {
            Alert.alert('Hata', error.message || 'Oyuncak silinirken bir hata oluştu');
        }
    };

    const renderToyItem = ({ item }) => (
        <View style={styles.toyCard}>
            <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.toyImage}
            />
            <View style={styles.toyInfo}>
                <Text style={styles.toyName}>{item.name}</Text>
                <Text style={styles.toyPrice}>{item.price} TL</Text>
                <Text style={styles.toyCategory}>{item.category}</Text>
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                        Alert.alert(
                            'Oyuncak Sil',
                            'Bu oyuncağı silmek istediğinize emin misiniz?',
                            [
                                {
                                    text: 'İptal',
                                    style: 'cancel'
                                },
                                {
                                    text: 'Sil',
                                    onPress: () => handleDeleteToy(item.id),
                                    style: 'destructive'
                                }
                            ]
                        );
                    }}
                >
                    <Text style={styles.deleteButtonText}>Sil</Text>
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Oyuncaklarım</Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={myToys}
                renderItem={renderToyItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        Henüz oyuncak eklememişsiniz.
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
    toyCard: {
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
    toyInfo: {
        flex: 1,
        padding: 10,
    },
    toyName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    toyPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B6B',
    },
    toyCategory: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    deleteButton: {
        backgroundColor: '#FF4444',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    deleteButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
});

export default MyToysScreen; 