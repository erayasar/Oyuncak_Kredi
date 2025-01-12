import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CategoryPicker = ({ categories, selectedCategory, onSelect }) => {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {categories.map((category) => (
                <TouchableOpacity
                    key={category.id}
                    style={[
                        styles.categoryButton,
                        selectedCategory === category.id && styles.selectedCategory
                    ]}
                    onPress={() => onSelect(category.id)}
                >
                    <Icon 
                        name={getCategoryIcon(category.name)} 
                        size={24} 
                        color={selectedCategory === category.id ? '#FFF' : '#666'}
                    />
                    <Text style={[
                        styles.categoryText,
                        selectedCategory === category.id && styles.selectedCategoryText
                    ]}>
                        {category.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const getCategoryIcon = (categoryName) => {
    const icons = {
        'Bebek': 'baby-face-outline',
        'Araba': 'car-sports',
        'Yapboz': 'puzzle',
        'Lego': 'toy-brick',
        'Peluş': 'teddy-bear',
        'Eğitici': 'school',
        'Outdoor': 'basketball',
        'Masa Oyunu': 'cards',
        'Elektronik': 'gamepad-variant',
        'Diğer': 'dots-horizontal'
    };
    return icons[categoryName] || 'toy-brick';
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    categoryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        marginRight: 10,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        minWidth: 100,
    },
    selectedCategory: {
        backgroundColor: '#FF6B6B',
    },
    categoryText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    selectedCategoryText: {
        color: '#FFF',
    }
});

export default CategoryPicker; 