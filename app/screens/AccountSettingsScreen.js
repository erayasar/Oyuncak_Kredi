import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

const AccountSettingsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const data = await api.getUserInfo();
            setUserInfo({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
            });
        } catch (error) {
            Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi');
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            if (passwords.newPassword) {
                if (passwords.newPassword !== passwords.confirmPassword) {
                    Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
                    return;
                }
                if (!passwords.currentPassword) {
                    Alert.alert('Hata', 'Mevcut şifrenizi girmelisiniz');
                    return;
                }
            }

            const updateData = {
                ...userInfo,
                ...(passwords.newPassword && {
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            };

            await api.updateUserProfile(updateData);
            Alert.alert('Başarılı', 'Bilgileriniz güncellendi', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Hata', error.message || 'Güncelleme sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Ad Soyad</Text>
                        <TextInput
                            style={styles.input}
                            value={userInfo.fullName}
                            onChangeText={(text) => setUserInfo(prev => ({...prev, fullName: text}))}
                            placeholder="Ad Soyad"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>E-posta</Text>
                        <TextInput
                            style={styles.input}
                            value={userInfo.email}
                            onChangeText={(text) => setUserInfo(prev => ({...prev, email: text}))}
                            placeholder="E-posta"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Telefon</Text>
                        <TextInput
                            style={styles.input}
                            value={userInfo.phone}
                            onChangeText={(text) => setUserInfo(prev => ({...prev, phone: text}))}
                            placeholder="Telefon"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Adres</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={userInfo.address}
                            onChangeText={(text) => setUserInfo(prev => ({...prev, address: text}))}
                            placeholder="Adres"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mevcut Şifre</Text>
                        <TextInput
                            style={styles.input}
                            value={passwords.currentPassword}
                            onChangeText={(text) => setPasswords(prev => ({...prev, currentPassword: text}))}
                            secureTextEntry={!showPasswords}
                            placeholder="Mevcut Şifre"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Yeni Şifre</Text>
                        <TextInput
                            style={styles.input}
                            value={passwords.newPassword}
                            onChangeText={(text) => setPasswords(prev => ({...prev, newPassword: text}))}
                            secureTextEntry={!showPasswords}
                            placeholder="Yeni Şifre"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Yeni Şifre (Tekrar)</Text>
                        <TextInput
                            style={styles.input}
                            value={passwords.confirmPassword}
                            onChangeText={(text) => setPasswords(prev => ({...prev, confirmPassword: text}))}
                            secureTextEntry={!showPasswords}
                            placeholder="Yeni Şifre (Tekrar)"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.showPasswordButton}
                        onPress={() => setShowPasswords(!showPasswords)}
                    >
                        <Icon 
                            name={showPasswords ? "eye-off-outline" : "eye-outline"} 
                            size={24} 
                            color="#666"
                        />
                        <Text style={styles.showPasswordText}>
                            {showPasswords ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: '#FFF',
        margin: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#FFF',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    showPasswordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    showPasswordText: {
        marginLeft: 10,
        color: '#666',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#FF6B6B',
        margin: 10,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AccountSettingsScreen; 