// AddToyScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    SafeAreaView
} from 'react-native';
import api from '../services/api';

const AgeGroups = {
    '0-2': '🎈 Bebekler',
    '3-5': '🧸 Okul Öncesi',
    '6-8': '🚗 İlkokul',
    '9-12': '🎮 Ortaokul',
    '12+': '🎲 12+ Yaş'
};

const AddToyScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [ageRange, setAgeRange] = useState('');

    const handleSubmit = async () => {
        // Form validasyonu
        if (!name.trim()) {
            Alert.alert('Hata', 'Oyuncak adı zorunludur');
            return;
        }

        if (!price || isNaN(price) || parseFloat(price) <= 0) {
            Alert.alert('Hata', 'Geçerli bir fiyat giriniz');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Hata', 'Açıklama zorunludur');
            return;
        }

        if (!category.trim()) {
            Alert.alert('Hata', 'Kategori zorunludur');
            return;
        }

        if (!ageRange) {
            Alert.alert('Hata', 'Yaş aralığı seçiniz');
            return;
        }

        try {
            await api.addToy({
                name: name.trim(),
                price: parseFloat(price),
                description: description.trim(),
                category: category.trim(),
                ageRange
            });

            Alert.alert(
                'Başarılı',
                'Oyuncak başarıyla eklendi',
                [
                    {
                        text: 'Tamam',
                        onPress: () => {
                            // Ana sayfaya dön ve listeyi yenile
                            navigation.navigate('Home', { refresh: true });
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert(
                'Hata',
                error.message || 'Oyuncak eklenirken bir hata oluştu'
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.form}>
                    <Text style={styles.title}>Yeni Oyuncak Ekle</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Oyuncak Adı"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#666"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Fiyat (TL)"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        placeholderTextColor="#666"
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Açıklama"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        placeholderTextColor="#666"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Kategori"
                        value={category}
                        onChangeText={setCategory}
                        placeholderTextColor="#666"
                    />

                    <Text style={styles.label}>Yaş Aralığı</Text>
                    <View style={styles.ageRangeContainer}>
                        {Object.entries(AgeGroups).map(([age, label]) => (
                            <TouchableOpacity
                                key={age}
                                style={[
                                    styles.ageButton,
                                    ageRange === age && styles.selectedAgeButton
                                ]}
                                onPress={() => setAgeRange(age)}
                            >
                                <Text style={[
                                    styles.ageButtonText,
                                    ageRange === age && styles.selectedAgeButtonText
                                ]}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity 
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Oyuncak Ekle</Text>
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
    form: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#DDD',
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    ageRangeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
        justifyContent: 'center',
    },
    ageButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        margin: 5,
    },
    selectedAgeButton: {
        backgroundColor: '#FF6B6B',
    },
    ageButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    selectedAgeButtonText: {
        color: '#FFF',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default AddToyScreen;
