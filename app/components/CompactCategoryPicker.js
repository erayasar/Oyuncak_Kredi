import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CompactCategoryPicker = ({ categories, selectedCategory, onSelect }) => {
    return (
        <View style={styles.container}>
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
                        size={16} 
                        color={selectedCategory === category.id ? '#FFF' : '#666'}
                        style={styles.icon}
                    />
                    <Text style={[
                        styles.categoryText,
                        selectedCategory === category.id && styles.selectedCategoryText
                    ]}>
                        {category.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const getCategoryIcon = (categoryName) => {
    const icons = {
        'Araçlar & Arabalar': 'car-sport-outline',
        'Bebek & Aksesuar': 'person-circle-outline',
        'Dış Mekan Oyuncakları': 'basketball-outline',
        'Eğitici Oyuncaklar': 'book-outline',
        'Elektronik Oyuncaklar': 'game-controller-outline',
        'Kutu Oyunları': 'grid-outline',
        'LEGO & Yapı Oyuncakları': 'cube-outline',
        'Müzik Aletleri': 'musical-notes-outline',
        'Peluş Oyuncaklar': 'heart-outline',
        'Sanat & El İşi': 'color-palette-outline',
        'Diğer': 'ellipsis-horizontal-outline'
    };
    return icons[categoryName] || 'cube-outline';
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingVertical: 5,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginBottom: 8,
        minWidth: 80,
        maxWidth: 'auto',
    },
    selectedCategory: {
        backgroundColor: '#FF6B6B',
    },
    icon: {
        marginRight: 6,
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        flexShrink: 1,
    },
    selectedCategoryText: {
        color: '#FFF',
    }
});

export default CompactCategoryPicker; 