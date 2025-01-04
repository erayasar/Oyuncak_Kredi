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
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../services/api';

const ageRanges = [
    { label: '0-3 Yaş', value: '0-3' },
    { label: '3-6 Yaş', value: '3-6' },
    { label: '6-12 Yaş', value: '6-12' },
    { label: '12+ Yaş', value: '12+' }
];

const AddToyScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const pickImage = async () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        try {
            const response = await launchImageLibrary(options);
            
            if (response.didCancel) {
                return;
            }

            if (response.errorCode) {
                Alert.alert('Hata', 'Resim seçilirken bir hata oluştu');
                return;
            }

            if (response.assets && response.assets[0]) {
                setSelectedImage(response.assets[0]);
                setImageUrl(response.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Hata', 'Resim seçilirken bir hata oluştu');
        }
    };

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
            let finalImageUrl = 'https://raw.githubusercontent.com/Erayakg/OyuncakKrediResimler/main/default.jpg';

            if (selectedImage) {
                const formData = new FormData();
                
                // URI'den dosya adını çıkar
                const fileName = selectedImage.uri.split('/').pop();
                
                // Dosya tipini belirle
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                
                formData.append('image', {
                    uri: selectedImage.uri,
                    type: type,
                    name: fileName
                });

                try {
                    console.log('Uploading image...');
                    const uploadResponse = await api.uploadImage(formData);
                    console.log('Upload response:', uploadResponse);
                    finalImageUrl = uploadResponse.imageUrl;
                } catch (error) {
                    console.error('Resim yükleme hatası:', error);
                    Alert.alert('Uyarı', 'Resim yüklenemedi, varsayılan resim kullanılacak');
                }
            }

            const result = await api.addToy({
                name: name.trim(),
                price: parseFloat(price),
                description: description.trim(),
                category: category.trim(),
                ageRange,
                imageUrl: finalImageUrl
            });

            Alert.alert(
                'Başarılı',
                'Oyuncak başarıyla eklendi',
                [
                    {
                        text: 'Tamam',
                        onPress: () => {
                            navigation.navigate('AnaSayfa', { 
                                refresh: true,
                                timestamp: new Date().getTime()
                            });
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Hata', error.message || 'Oyuncak eklenirken bir hata oluştu');
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
                <Text style={styles.headerTitle}>Yeni Oyuncak Ekle</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView>
                <View style={styles.form}>
                    <TouchableOpacity 
                        style={styles.imagePickerButton} 
                        onPress={pickImage}
                    >
                        {imageUrl ? (
                            <Image 
                                source={{ uri: imageUrl }} 
                                style={styles.previewImage}
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderText}>
                                    Fotoğraf Ekle
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

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
                        {ageRanges.map((range) => (
                            <TouchableOpacity
                                key={range.value}
                                style={[
                                    styles.ageButton,
                                    ageRange === range.value && styles.selectedAgeButton
                                ]}
                                onPress={() => setAgeRange(range.value)}
                            >
                                <Text style={[
                                    styles.ageButtonText,
                                    ageRange === range.value && styles.selectedAgeButtonText
                                ]}>
                                    {range.label}
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
        width: 30, // Dengelemek için boş alan
    },
    form: {
        padding: 20,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#DDD',
        fontSize: 16,
        color: '#333',
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
        borderWidth: 1,
        borderColor: '#DDD',
    },
    selectedAgeButton: {
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
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
        backgroundColor: '#FF6B6B',
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
    imagePickerButton: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginBottom: 15,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
});

export default AddToyScreen;
