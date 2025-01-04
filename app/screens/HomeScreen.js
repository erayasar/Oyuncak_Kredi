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
    SafeAreaView,
    RefreshControl
} from 'react-native';
import api from '../services/api';

const AgeGroups = {
    '0-2': '🎈 Bebekler',
    '3-5': '🧸 Okul Öncesi',
    '6-8': '🚗 İlkokul',
    '9-12': '🎮 Ortaokul',
    '12+': '🎲 12+ Yaş'
};

const HomeScreen = ({ navigation }) => {
    const [toys, setToys] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);

    const loadToys = async () => {
        try {
            const response = await api.getToys();
            setToys(response);
        } catch (error) {
            console.error('Oyuncaklar yüklenirken hata:', error);
        }
    };

    useEffect(() => {
        loadToys();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadToys();
        setRefreshing(false);
    };

    const filterToysByAge = (toys, ageGroup) => {
        if (!ageGroup) return toys;
        return toys.filter(toy => toy.ageRange === ageGroup);
    };

    const renderToyCard = ({ item }) => (
        <TouchableOpacity 
            style={styles.toyCard}
            onPress={() => navigation.navigate('ToyDetail', { toy: item })}
        >
            <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.toyImage}
                resizeMode="cover"
            />
            <View style={styles.toyInfo}>
                <Text style={styles.toyName}>{item.name}</Text>
                <Text style={styles.toyPrice}>{item.price} TL</Text>
                <Text style={styles.toyCategory}>{item.category}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Oyuncak Dünyası</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddToy')}
                    >
                        <Text style={styles.buttonText}>+ Oyuncak Ekle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('UserProfile')}
                    >
                        <Text style={styles.buttonText}>👤 Profilim</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.ageGroupsContainer}
            >
                <TouchableOpacity 
                    style={[
                        styles.ageGroupButton,
                        !selectedAgeGroup && styles.selectedAgeGroup
                    ]}
                    onPress={() => setSelectedAgeGroup(null)}
                >
                    <Text style={styles.ageGroupText}>Tümü</Text>
                </TouchableOpacity>
                {Object.entries(AgeGroups).map(([age, label]) => (
                    <TouchableOpacity 
                        key={age}
                        style={[
                            styles.ageGroupButton,
                            selectedAgeGroup === age && styles.selectedAgeGroup
                        ]}
                        onPress={() => setSelectedAgeGroup(age)}
                    >
                        <Text style={styles.ageGroupText}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FlatList
                data={filterToysByAge(toys, selectedAgeGroup)}
                renderItem={renderToyCard}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.toyList}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    profileButton: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 14,
    },
    ageGroupsContainer: {
        backgroundColor: '#FFF',
        paddingVertical: 10,
    },
    ageGroupButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
    },
    selectedAgeGroup: {
        backgroundColor: '#FF6B6B',
    },
    ageGroupText: {
        color: '#333',
        fontWeight: '600',
    },
    toyList: {
        padding: 10,
    },
    toyCard: {
        flex: 1,
        margin: 5,
        backgroundColor: '#FFF',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    toyImage: {
        width: '100%',
        height: 150,
    },
    toyInfo: {
        padding: 10,
    },
    toyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    toyPrice: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
        marginTop: 5,
    },
    toyCategory: {
        fontSize: 12,
        color: '#666',
        marginTop: 3,
    },
});

export default HomeScreen;
