import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    SafeAreaView
} from 'react-native';
import api from '../services/api';

const SettingsScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [editedInfo, setEditedInfo] = useState({
        fullName: '',
        phone: '',
        address: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const loadUserData = async () => {
        try {
            const userData = await api.getUserInfo();
            setUserInfo(userData);
            setEditedInfo({
                fullName: userData.fullName || '',
                phone: userData.phone || '',
                address: userData.address || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Profil bilgileri yüklenirken hata:', error);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const handleSave = async () => {
        try {
            const updateData = {};
            
            if (editedInfo.fullName !== userInfo.fullName) {
                updateData.fullName = editedInfo.fullName;
            }
            if (editedInfo.phone !== userInfo.phone) {
                updateData.phone = editedInfo.phone;
            }
            if (editedInfo.address !== userInfo.address) {
                updateData.address = editedInfo.address;
            }

            if (showPasswordFields) {
                if (!editedInfo.currentPassword) {
                    Alert.alert('Hata', 'Mevcut şifrenizi giriniz');
                    return;
                }
                if (!editedInfo.newPassword) {
                    Alert.alert('Hata', 'Yeni şifrenizi giriniz');
                    return;
                }
                if (editedInfo.newPassword !== editedInfo.confirmPassword) {
                    Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
                    return;
                }
                if (editedInfo.newPassword.length < 6) {
                    Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır');
                    return;
                }

                updateData.currentPassword = editedInfo.currentPassword;
                updateData.newPassword = editedInfo.newPassword;
            }

            if (Object.keys(updateData).length === 0) {
                Alert.alert('Bilgi', 'Değişiklik yapılmadı');
                setIsEditing(false);
                setShowPasswordFields(false);
                return;
            }

            const response = await api.updateUserInfo(updateData);
            
            setEditedInfo(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            setIsEditing(false);
            setShowPasswordFields(false);
            loadUserData();
            Alert.alert('Başarılı', 'Profil bilgileri güncellendi');
        } catch (error) {
            Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu');
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
                <Text style={styles.headerTitle}>Hesap Ayarları</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
                    {isEditing ? (
                        <View style={styles.editForm}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ad Soyad"
                                value={editedInfo.fullName}
                                onChangeText={(text) => setEditedInfo({...editedInfo, fullName: text})}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Telefon"
                                value={editedInfo.phone}
                                onChangeText={(text) => setEditedInfo({...editedInfo, phone: text})}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Adres"
                                value={editedInfo.address}
                                onChangeText={(text) => setEditedInfo({...editedInfo, address: text})}
                                multiline
                            />
                            
                            <TouchableOpacity
                                style={styles.passwordButton}
                                onPress={() => setShowPasswordFields(!showPasswordFields)}
                            >
                                <Text style={styles.passwordButtonText}>
                                    {showPasswordFields ? 'Şifre Değiştirmeyi İptal Et' : 'Şifre Değiştir'}
                                </Text>
                            </TouchableOpacity>

                            {showPasswordFields && (
                                <>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mevcut Şifre"
                                        secureTextEntry
                                        value={editedInfo.currentPassword}
                                        onChangeText={(text) => setEditedInfo({...editedInfo, currentPassword: text})}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Yeni Şifre"
                                        secureTextEntry
                                        value={editedInfo.newPassword}
                                        onChangeText={(text) => setEditedInfo({...editedInfo, newPassword: text})}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Yeni Şifre (Tekrar)"
                                        secureTextEntry
                                        value={editedInfo.confirmPassword}
                                        onChangeText={(text) => setEditedInfo({...editedInfo, confirmPassword: text})}
                                    />
                                </>
                            )}

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity 
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => {
                                        setIsEditing(false);
                                        setShowPasswordFields(false);
                                        setEditedInfo({
                                            fullName: userInfo.fullName || '',
                                            phone: userInfo.phone || '',
                                            address: userInfo.address || '',
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                    }}
                                >
                                    <Text style={styles.buttonText}>İptal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.button, styles.saveButton]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.buttonText}>Kaydet</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.infoContainer}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Ad Soyad:</Text>
                                    <Text style={styles.infoValue}>{userInfo?.fullName || '-'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>E-posta:</Text>
                                    <Text style={styles.infoValue}>{userInfo?.email || '-'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Telefon:</Text>
                                    <Text style={styles.infoValue}>{userInfo?.phone || '-'}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Adres:</Text>
                                    <Text style={styles.infoValue}>{userInfo?.address || '-'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.editButton}
                                onPress={() => setIsEditing(true)}
                            >
                                <Text style={styles.buttonText}>Düzenle</Text>
                            </TouchableOpacity>
                        </View>
                    )}
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
        width: 30,
    },
    section: {
        backgroundColor: '#FFF',
        margin: 15,
        borderRadius: 15,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    editForm: {
        marginTop: 10,
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 12,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    saveButton: {
        backgroundColor: '#FF6B6B',
    },
    cancelButton: {
        backgroundColor: '#666',
    },
    editButton: {
        backgroundColor: '#FF6B6B',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    infoLabel: {
        flex: 1,
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    infoValue: {
        flex: 2,
        fontSize: 16,
        color: '#333333',
    },
    passwordButton: {
        padding: 12,
        alignItems: 'center',
    },
    passwordButtonText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SettingsScreen; 