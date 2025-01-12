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
    ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../services/api';
import formStyles from '../styles/formStyles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CompactCategoryPicker from '../components/CompactCategoryPicker';
import CompactAgeRangePicker from '../components/CompactAgeRangePicker';

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
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.getCategories();
            setCategories(response);
        } catch (error) {
            Alert.alert('Hata', 'Kategoriler yüklenirken bir hata oluştu');
        }
    };

    const pickImage = async () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        try {
            const response = await launchImageLibrary(options);
            if (response.assets && response.assets[0]) {
                setSelectedImage(response.assets[0]);
                setImageUrl(response.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Hata', 'Resim seçilirken bir hata oluştu');
        }
    };

    const handleSubmit = async () => {
        if (!name || !points || !category || !ageRange) {
            Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun');
            return;
        }

        setLoading(true);
        try {
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

            await api.addToy({
                name,
                points: parseInt(points),
                description,
                category_id: category,
                ageRange,
                imageUrl: finalImageUrl
            });

            Alert.alert('Başarılı', 'Oyuncak başarıyla eklendi', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Hata', error.message || 'Oyuncak eklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={formStyles.container}>
            <ScrollView style={formStyles.scrollView}>
                <View style={formStyles.header}>
                    <Text style={formStyles.headerText}>Yeni Oyuncak Ekle</Text>
                </View>
                
                <View style={formStyles.form}>
                    <TouchableOpacity style={formStyles.imagePickerButton} onPress={pickImage}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={formStyles.previewImage} />
                        ) : (
                            <View style={formStyles.imagePlaceholder}>
                                <Icon name="camera-plus" size={40} color="#FF6B6B" />
                                <Text style={formStyles.imagePlaceholderText}>Fotoğraf Ekle</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={formStyles.inputContainer}>
                        <Text style={formStyles.label}>Oyuncak Adı *</Text>
                        <TextInput
                            style={formStyles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Oyuncak adını girin"
                        />
                    </View>

                    <View style={formStyles.inputContainer}>
                        <Text style={formStyles.label}>Puan Değeri *</Text>
                        <TextInput
                            style={formStyles.input}
                            value={points}
                            onChangeText={setPoints}
                            keyboardType="numeric"
                            placeholder="Puan değerini girin"
                        />
                    </View>

                    <View style={formStyles.inputContainer}>
                        <Text style={formStyles.label}>Kategori *</Text>
                        <CompactCategoryPicker
                            categories={categories}
                            selectedCategory={category}
                            onSelect={setCategory}
                        />
                    </View>

                    <View style={formStyles.inputContainer}>
                        <Text style={formStyles.label}>Yaş Aralığı *</Text>
                        <CompactAgeRangePicker
                            selectedRange={ageRange}
                            onSelect={setAgeRange}
                        />
                    </View>

                    <View style={formStyles.inputContainer}>
                        <Text style={formStyles.label}>Açıklama</Text>
                        <TextInput
                            style={[formStyles.input, formStyles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Oyuncak hakkında açıklama girin"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity
                        style={[formStyles.submitButton, loading && formStyles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={formStyles.submitButtonText}>Oyuncak Ekle</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddToyScreen;
