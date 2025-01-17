import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Alert,
    ScrollView,
    ActivityIndicator,
    Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../services/api';

const ProfileSettingsScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [editingField, setEditingField] = useState(null);
    const [originalValues, setOriginalValues] = useState({});

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            const response = await api.getUserInfo();
            setUserInfo(response);
            setFullName(response.fullName || '');
            setEmail(response.email || '');
            setPhone(response.phone || '');
            setAddress(response.address || '');
            setOriginalValues({
                fullName: response.fullName || '',
                email: response.email || '',
                phone: response.phone || '',
                address: response.address || ''
            });
        } catch (error) {
            Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (field) => {
        try {
            const updateData = {
                [field]: {
                    fullName,
                    email,
                    phone,
                    address
                }[field]
            };

            await api.updateProfile(updateData);
            Alert.alert('Başarılı', 'Bilgi güncellendi');
            setEditingField(null);
            setOriginalValues(prev => ({
                ...prev,
                [field]: updateData[field]
            }));
        } catch (error) {
            Alert.alert('Hata', 'Güncelleme başarısız oldu');
        }
    };

    const renderInputWithConfirm = (field, value, setValue, label, icon, keyboardType = 'default') => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWithButton}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Icon name={icon} size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={(text) => {
                            setValue(text);
                            setEditingField(field);
                        }}
                        placeholder={label}
                        placeholderTextColor="#999"
                        keyboardType={keyboardType}
                    />
                </View>
                {editingField === field && value !== originalValues[field] && (
                    <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={() => handleUpdate(field)}
                    >
                        <Icon name="checkmark" size={20} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Hata', 'Lütfen ad soyad giriniz');
            return;
        }

        setSaving(true);
        try {
            await api.updateProfile({
                fullName,
                email,
                phone
            });
            Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
            loadUserInfo(); // Bilgileri yenile
        } catch (error) {
            Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Hata', 'Yeni şifreler eşleşmiyor');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır');
            return;
        }

        try {
            await api.changePassword({
                currentPassword,
                newPassword
            });
            Alert.alert('Başarılı', 'Şifreniz başarıyla güncellendi');
            setShowPasswordModal(false);
            // Şifre alanlarını temizle
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Alert.alert('Hata', error.message || 'Şifre değiştirme işlemi başarısız oldu');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profil Ayarları</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Icon name="person" size={50} color="#FFF" />
                    </View>
                    <Text style={styles.avatarText}>{fullName}</Text>
                </View>

                <View style={styles.formSection}>
                    {renderInputWithConfirm('fullName', fullName, setFullName, 'Ad Soyad', 'person-outline')}
                    {renderInputWithConfirm('email', email, setEmail, 'E-posta', 'mail-outline', 'email-address')}
                    {renderInputWithConfirm('phone', phone, setPhone, 'Telefon', 'call-outline', 'phone-pad')}
                    {renderInputWithConfirm('address', address, setAddress, 'Adres', 'location-outline')}
                </View>

                <TouchableOpacity 
                    style={styles.changePasswordButton}
                    onPress={() => setShowPasswordModal(true)}
                >
                    <View style={styles.changePasswordContent}>
                        <Icon name="lock-closed" size={24} color="#FFF" />
                        <Text style={styles.changePasswordText}>Şifre Değiştir</Text>
                    </View>
                    <Icon name="chevron-forward" size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.statsSection}>
                    <View style={styles.statCard}>
                        <Icon name="star" size={24} color="#FFD700" />
                        <Text style={styles.statValue}>{userInfo?.points || 0}</Text>
                        <Text style={styles.statLabel}>Toplam Puan</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Icon name="cube" size={24} color="#4CAF50" />
                        <Text style={styles.statValue}>{userInfo?.toyCount || 0}</Text>
                        <Text style={styles.statLabel}>Oyuncaklarım</Text>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={showPasswordModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Şifre Değiştir</Text>
                                <TouchableOpacity 
                                    style={styles.closeButton}
                                    onPress={() => setShowPasswordModal(false)}
                                >
                                    <Icon name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalBody}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Mevcut Şifre</Text>
                                    <View style={styles.inputContainer}>
                                        <Icon name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={currentPassword}
                                            onChangeText={setCurrentPassword}
                                            placeholder="Mevcut şifreniz"
                                            secureTextEntry
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Yeni Şifre</Text>
                                    <View style={styles.inputContainer}>
                                        <Icon name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            placeholder="Yeni şifre"
                                            secureTextEntry
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                    <Text style={styles.passwordHint}>En az 6 karakter olmalıdır</Text>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Yeni Şifre Tekrar</Text>
                                    <View style={styles.inputContainer}>
                                        <Icon name="key-outline" size={20} color="#666" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            placeholder="Yeni şifre tekrar"
                                            secureTextEntry
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowPasswordModal(false)}
                                >
                                    <Icon name="close-circle-outline" size={20} color="#FFF" />
                                    <Text style={styles.modalButtonText}>İptal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={handleChangePassword}
                                >
                                    <Icon name="checkmark-circle-outline" size={20} color="#FFF" />
                                    <Text style={styles.modalButtonText}>Değiştir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#FF6B6B',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        flex: 1,
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 34,
    },
    headerRight: {
        width: 24,
    },
    content: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    formSection: {
        backgroundColor: '#FFF',
        padding: 15,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        marginLeft: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    statsSection: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginVertical: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'transparent',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    modalBody: {
        gap: 15,
    },
    passwordHint: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        marginLeft: 5,
        fontStyle: 'italic',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#FF6B6B',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    inputIcon: {
        marginRight: 10,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        marginLeft: 5,
        fontWeight: '500',
    },
    inputWithButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePasswordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2196F3',
        margin: 15,
        padding: 15,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    changePasswordContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    changePasswordText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#EEE',
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 8,
    },
});

export default ProfileSettingsScreen; 