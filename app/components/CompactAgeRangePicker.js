import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ageRanges = [
    { label: '0-3', value: '0-3', icon: 'person-circle-outline' },
    { label: '4-6', value: '4-6', icon: 'happy-outline' },
    { label: '7-12', value: '7-12', icon: 'people-outline' },
    { label: '12+', value: '12+', icon: 'people-circle-outline' }
];

const CompactAgeRangePicker = ({ selectedRange, onSelect }) => {
    return (
        <View style={styles.container}>
            {ageRanges.map((range) => (
                <TouchableOpacity
                    key={range.value}
                    style={[
                        styles.ageButton,
                        selectedRange === range.value && styles.selectedAge
                    ]}
                    onPress={() => onSelect(range.value)}
                >
                    <Icon 
                        name={range.icon} 
                        size={16} 
                        color={selectedRange === range.value ? '#FFF' : '#666'}
                        style={styles.icon}
                    />
                    <Text style={[
                        styles.ageText,
                        selectedRange === range.value && styles.selectedAgeText
                    ]}>
                        {range.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        gap: 8,
    },
    ageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        flex: 1,
        justifyContent: 'center',
    },
    selectedAge: {
        backgroundColor: '#FF6B6B',
    },
    icon: {
        marginRight: 6,
    },
    ageText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    selectedAgeText: {
        color: '#FFF',
    }
});

export default CompactAgeRangePicker; 