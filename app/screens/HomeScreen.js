//HomeScreen.js 
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    RefreshControl,
    SafeAreaView,
    Platform,
    StatusBar,
    Alert
} from 'react-native';
import api from '../services/api';

const HomeScreen = ({ navigation }) => {
    const [toys, setToys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgeRange, setSelectedAgeRange] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Yaş aralıkları
    const ageRanges = [
        { label: 'Tümü', value: null },
        { label: '0-3 Yaş', value: '0-3' },
        { label: '3-6 Yaş', value: '3-6' },
        { label: '6-12 Yaş', value: '6-12' },
        { label: '12+ Yaş', value: '12+' }
    ];

    const loadToys = async () => {
        try {
            setLoading(true);
            const response = await api.getToys();
            setToys(response);
        } catch (error) {
            console.error('Oyuncaklar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadToys();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadToys().then(() => setRefreshing(false));
    }, []);

    const filteredToys = selectedAgeRange
        ? toys.filter(toy => {
            const toyAge = toy.ageRange;
            switch(selectedAgeRange) {
                case '0-3':
                    return toyAge === '0-3' || toyAge === '0+';
                case '3-6':
                    return toyAge === '3-6';
                case '6-12':
                    return toyAge === '6-12' || toyAge === '8+' || toyAge === '6+';
                case '12+':
                    return toyAge === '12+';
                default:
                    return true;
            }
        })
        : toys;

    useEffect(() => {
        console.log('Seçili yaş aralığı:', selectedAgeRange);
        console.log('Filtrelenmiş oyuncaklar:', filteredToys);
    }, [selectedAgeRange, toys]);

    const renderToyItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.toyCard}
            onPress={() => navigation.navigate('ToyDetail', { toy: item })}
        >
            <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.toyImage}
                resizeMode="cover"
            />
            <View style={styles.toyInfo}>
                <Text style={styles.toyName}>{item.name}</Text>
                <Text style={styles.toyPrice}>{item.price} TL</Text>
                <Text style={styles.toyAge}>Yaş: {item.ageRange}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Oyuncak Dünyası</Text>
                    <TouchableOpacity 
                        style={styles.settingsButton}
                        onPress={() => {
                            Alert.alert(
                                "Ayarlar",
                                "Seçenekler",
                                [
                                    {
                                        text: "Karanlık Mod",
                                        onPress: () => Alert.alert("Bilgi", "Karanlık mod yakında eklenecek")
                                    },
                                    {
                                        text: "Dil Seçimi",
                                        onPress: () => Alert.alert("Bilgi", "Dil seçenekleri yakında eklenecek")
                                    },
                                    {
                                        text: "Bildirimler",
                                        onPress: () => Alert.alert("Bilgi", "Bildirim ayarları yakında eklenecek")
                                    },
                                    {
                                        text: "Kapat",
                                        style: "cancel"
                                    }
                                ]
                            );
                        }}
                    >
                        <Text style={styles.buttonText}>⚙️ Ayarlar</Text>
                    </TouchableOpacity>
                </View>

                {/* Yaş Filtreleri */}
                <View style={styles.filterContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterScroll}
                    >
                        {ageRanges.map((range) => (
                            <TouchableOpacity
                                key={range.label}
                                style={[
                                    styles.filterButton,
                                    selectedAgeRange === range.value && styles.filterButtonActive
                                ]}
                                onPress={() => setSelectedAgeRange(range.value)}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    selectedAgeRange === range.value && styles.filterButtonTextActive
                                ]}>
                                    {range.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Oyuncak Listesi */}
                <FlatList
                    data={filteredToys}
                    renderItem={renderToyItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    contentContainerStyle={styles.listContainer}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    settingsButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    filterContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    filterScroll: {
        paddingHorizontal: 10,
    },
    filterButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterButtonActive: {
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
    },
    filterButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    listContainer: {
        padding: 10,
    },
    toyCard: {
        flex: 1,
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
        fontWeight: 'bold',
        marginBottom: 5,
    },
    toyPrice: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: '600',
    },
    toyAge: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    }
});

export default HomeScreen;
