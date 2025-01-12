import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ageRanges = [
    { label: '0-3 Yaş', value: '0-3' },
    { label: '4-6 Yaş', value: '4-6' },
    { label: '7-12 Yaş', value: '7-12' },
    { label: '12+ Yaş', value: '12+' }
];

const AgeRangePicker = ({ selectedRange, onSelect }) => {
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
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    ageButton: {
        width: '48%',
        padding: 15,
        marginBottom: 10,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    selectedAge: {
        backgroundColor: '#FF6B6B',
    },
    ageText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    selectedAgeText: {
        color: '#FFF',
    }
});

export default AgeRangePicker; 