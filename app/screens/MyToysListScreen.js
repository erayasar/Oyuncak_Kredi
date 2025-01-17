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
import ToyCard from '../components/ToyCard';
import api from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

const MyToysListScreen = ({ navigation }) => {
    const [toys, setToys] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadToys = async () => {
        try {
            const response = await api.getMyToys();
            setToys(response);
        } catch (error) {
            Alert.alert('Hata', 'Oyuncaklar yüklenirken bir hata oluştu');
        }
    };

    useEffect(() => {
        loadToys();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadToys().finally(() => setRefreshing(false));
    };

    const handleDelete = (toyId) => {
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
                            await api.deleteToy(toyId);
                            Alert.alert('Başarılı', 'Oyuncak başarıyla silindi');
                            loadToys(); // Listeyi yenile
                        } catch (error) {
                            Alert.alert('Hata', 'Oyuncak silinirken bir hata oluştu');
                        }
                    }
                }
            ]
        );
    };

    const renderToyItem = ({ item }) => (
        <View style={styles.toyCard}>
            <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.toyImage}
                resizeMode="cover"
            />
            <View style={styles.toyInfo}>
                <Text style={styles.toyName}>{item.name}</Text>
                <Text style={styles.categoryName}>Kategori: {item.category_name}</Text>
                <Text style={styles.points}>Puan: {item.points}</Text>
                <Text style={styles.ageRange}>Yaş Aralığı: {item.ageRange}</Text>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.editButton]}
                        onPress={() => navigation.navigate('EditToy', { toy: item })}
                    >
                        <Icon name="create-outline" size={20} color="#FFF" />
                        <Text style={styles.buttonText}>Düzenle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.button, styles.deleteButton]}
                        onPress={() => handleDelete(item.id)}
                    >
                        <Icon name="trash-outline" size={20} color="#FFF" />
                        <Text style={styles.buttonText}>Sil</Text>
                    </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Eklediğim Oyuncaklar</Text>
                <View style={styles.headerRight} />
            </View>

            <FlatList
                data={toys}
                renderItem={renderToyItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Henüz oyuncak eklememişsiniz</Text>
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
        marginRight: 34, // backButton width için
    },
    headerRight: {
        width: 24,
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
    toyCard: {
        backgroundColor: '#FFF',
        margin: 10,
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
        height: 200,
    },
    toyInfo: {
        padding: 15,
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
        marginBottom: 3,
    },
    points: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: '600',
        marginBottom: 3,
    },
    ageRange: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        justifyContent: 'center',
    },
    editButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#FFF',
        marginLeft: 5,
        fontSize: 14,
        fontWeight: '500',
    }
});

export default MyToysListScreen; 