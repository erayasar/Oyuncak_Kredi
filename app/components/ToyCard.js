import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const ToyCard = ({ toy, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image
                source={{ uri: toy.imageUrl || 'https://raw.githubusercontent.com/Erayakg/OyuncakKrediResimler/main/default.jpg' }}
                style={styles.image}
            />
            <View style={styles.info}>
                <Text style={styles.name}>{toy.name}</Text>
                <Text style={styles.category}>Kategori: {toy.category_name}</Text>
                <Text style={styles.points}>Puan: {toy.points}</Text>
                <Text style={styles.ageRange}>Yaş Aralığı: {toy.ageRange}</Text>
                <Text style={styles.status}>
                    Durum: {toy.is_available ? 'Müsait' : 'Kirada'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginVertical: 8,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    image: {
        width: 120,
        height: 120,
    },
    info: {
        flex: 1,
        padding: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    category: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    points: {
        fontSize: 14,
        color: '#2196F3',
        marginBottom: 3,
    },
    ageRange: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    status: {
        fontSize: 14,
        color: '#4CAF50',
    }
});

export default ToyCard; 