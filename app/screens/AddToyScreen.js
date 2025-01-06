// AddToyScreen.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../services/api';

const AddToyScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [points, setPoints] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await api.getCategories();
                setCategories(response);
            } catch (error) {
                console.error('Kategoriler yüklenirken hata:', error);
            }
        };
        loadCategories();
    }, []);

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
        if (!name.trim()) {
            Alert.alert('Hata', 'Lütfen oyuncak adını girin');
            return;
        }
        if (!points.trim()) {
            Alert.alert('Hata', 'Lütfen puan değeri girin');
            return;
        }
        if (!category) {
            Alert.alert('Hata', 'Lütfen kategori seçin');
            return;
        }
        if (!ageRange) {
            Alert.alert('Hata', 'Lütfen yaş aralığı seçin');
            return;
        }
        if (!imageUrl) {
            Alert.alert('Hata', 'Lütfen bir resim seçin');
            return;
        }

        try {
            setLoading(true);

            let finalImageUrl = imageUrl;
            if (selectedImage) {
                const formData = new FormData();
                formData.append('image', {
                    uri: selectedImage.uri,
                    type: selectedImage.type,
                    name: selectedImage.fileName || 'image.jpg'
                });

                const uploadResponse = await api.uploadImage(formData);
                finalImageUrl = uploadResponse.imageUrl;
            }

            // Oyuncak verilerini hazırla
            const toyData = {
                name,
                points: parseInt(points),
                description,
                category,
                ageRange,
                imageUrl: finalImageUrl,
            };

            await api.addToy(toyData);
            
            Alert.alert(
                'Başarılı',
                'Oyuncak başarıyla eklendi!',
                [{ text: 'Tamam', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Hata', error.message || 'Oyuncak eklenirken bir hata oluştu');
        } finally {
            setLoading(false);
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

            <ScrollView style={styles.scrollView}>
                <View style={styles.form}>
                    <TouchableOpacity 
                        style={styles.imagePickerButton} 
                        onPress={pickImage}
                    >
                        {imageUrl ? (
                            <>
                                <Image 
                                    source={{ uri: imageUrl }} 
                                    style={styles.previewImage}
                                />
                                <View style={styles.imageOverlay}>
                                    <Text style={styles.changeImageText}>Fotoğrafı Değiştir</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Text style={styles.imagePlaceholderText}>
                                    📸 Fotoğraf Ekle
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Oyuncak Adı</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: LEGO Star Wars"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Puan Değeri</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: 100"
                            value={points}
                            onChangeText={setPoints}
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <Text style={styles.label}>Kategori</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryContainer}
                    >
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryButton,
                                    category === cat.id && styles.selectedCategoryButton
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Text style={[
                                    styles.categoryButtonText,
                                    category === cat.id && styles.selectedCategoryButtonText
                                ]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.label}>Yaş Aralığı</Text>
                    <View style={styles.ageRangeContainer}>
                        {[
                            { label: '0-3 Yaş', value: '0-3' },
                            { label: '3-6 Yaş', value: '3-6' },
                            { label: '6-12 Yaş', value: '6-12' },
                            { label: '12+ Yaş', value: '12+' }
                        ].map((range) => (
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

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Açıklama</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Oyuncak hakkında detaylı bilgi verin..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <TouchableOpacity 
                        style={[
                            styles.submitButton,
                            loading && styles.submitButtonDisabled
                        ]} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>
                                Oyuncağı Ekle
                            </Text>
                        )}
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
        marginBottom: 8,
    },
    categoryContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    categoryButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedCategoryButton: {
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
    },
    categoryButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    selectedCategoryButtonText: {
        color: '#fff',
    },
    ageRangeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    ageButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        margin: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedAgeButton: {
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
    },
    ageButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    selectedAgeButtonText: {
        color: '#fff',
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        alignItems: 'center',
    },
    changeImageText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '500',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        backgroundColor: '#fff',
        marginBottom: 15,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        backgroundColor: '#fff',
        marginBottom: 15,
    }
});

export default AddToyScreen;
