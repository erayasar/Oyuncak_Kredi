import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert
} from 'react-native';
import api from '../services/api';

const ToyDetailScreen = ({ route, navigation }) => {
    const { toy } = route.params;

    const handleRent = async () => {
        try {
            // API'ye kiralama isteği gönder
            await api.rentToy(toy.id);
            Alert.alert(
                'Başarılı',
                'Oyuncak kiralama talebiniz alındı',
                [
                    {
                        text: 'Tamam',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Hata', error.message || 'Kiralama işlemi başarısız oldu');
        }
    };

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

            <ScrollView>
                <Image 
                    source={{ uri: toy.imageUrl }} 
                    style={styles.image}
                    resizeMode="cover"
                />
                
                <View style={styles.content}>
                    <Text style={styles.name}>{toy.name}</Text>
                    <Text style={styles.price}>{toy.price} TL</Text>
                    
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Kategori:</Text>
                        <Text style={styles.value}>{toy.category}</Text>
                    </View>
                    
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Yaş Aralığı:</Text>
                        <Text style={styles.value}>{toy.ageRange}</Text>
                    </View>
                    
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.label}>Açıklama:</Text>
                        <Text style={styles.description}>{toy.description}</Text>
                    </View>

                    <TouchableOpacity 
                        style={styles.rentButton}
                        onPress={handleRent}
                    >
                        <Text style={styles.rentButtonText}>Kirala</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    price: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FF6B6B',
        marginBottom: 20,
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
    rentButton: {
        backgroundColor: '#FF6B6B',
        padding: 15,
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
    rentButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ToyDetailScreen; 