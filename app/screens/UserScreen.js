import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView
} from 'react-native';
import api from '../services/api';

const UserScreen = ({ navigation, route }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [userToys, setUserToys] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({
        fullName: '',
        phone: '',
        address: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    const loadUserData = async () => {
        try {
            const userData = await api.getUserInfo();
            setUserInfo(userData);
            setEditedInfo({
                fullName: userData.fullName || '',
                phone: userData.phone || '',
                address: userData.address || ''
            });
        } catch (error) {
            console.error('Profil bilgileri yüklenirken hata:', error);
        }
    };

    const loadUserToys = async () => {
        try {
            const toys = await api.getUserToys();
            console.log('Yüklenen kullanıcı oyuncakları:', toys);
            if (Array.isArray(toys)) {
                setUserToys(toys);
            } else {
                console.error('Beklenmeyen veri formatı:', toys);
                setUserToys([]);
            }
        } catch (error) {
            console.error('Oyuncaklar yüklenirken hata:', error);
            setUserToys([]);
        }
    };

    useEffect(() => {
        loadUserData();
        loadUserToys();
    }, []);

    useEffect(() => {
        if (route.params?.refresh) {
            console.log('Yenileme isteği alındı, timestamp:', route.params.timestamp);
            setTimeout(() => {
                loadUserToys();
                loadUserData();
            }, 500);
            navigation.setParams({ refresh: undefined });
        }
    }, [route.params?.refresh]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        Promise.all([loadUserData(), loadUserToys()])
            .finally(() => setRefreshing(false));
    }, []);

    const handleLogout = async () => {
        try {
            await api.logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
        }
    };

    const handleSave = async () => {
        try {
            // Sadece değiştirilmiş alanları gönder
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

            // Şifre değişikliği varsa
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

            // Eğer hiçbir değişiklik yoksa
            if (Object.keys(updateData).length === 0) {
                Alert.alert('Bilgi', 'Değişiklik yapılmadı');
                setIsEditing(false);
                setShowPasswordFields(false);
                return;
            }

            const response = await api.updateUserInfo(updateData);

            if (response.status === 'error') {
                throw new Error(response.message);
            }

            // Form alanlarını temizle
            setEditedInfo(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            setIsEditing(false);
            setShowPasswordFields(false);
            loadUserData();
            Alert.alert('Başarılı', response.message);
        } catch (error) {
            Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu');
        }
    };

    const renderToyItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.toyCard}
            onPress={() => navigation.navigate('ToyDetail', { toy: item })}
        >
            <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.toyImage}
                resizeMode="cover"
            />
            <View style={styles.toyInfo}>
                <Text style={styles.toyName}>{item.name}</Text>
                <Text style={styles.toyPrice}>{item.price} TL</Text>
                <Text style={styles.toyAge}>Yaş: {item.ageRange}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profilim</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView 
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Profil Kartı */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {userInfo?.fullName?.charAt(0) || '?'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{userInfo?.fullName}</Text>
                    <Text style={styles.userPoints}>{userInfo?.points || 0} Puan</Text>
                </View>

                {/* Profil Bilgileri */}
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
                                keyboardType="phone-pad"
                            />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Adres"
                                value={editedInfo.address}
                                onChangeText={(text) => setEditedInfo({...editedInfo, address: text})}
                                multiline
                                numberOfLines={3}
                            />
                            
                            {/* Şifre Değiştirme */}
                            <TouchableOpacity 
                                style={styles.passwordToggle}
                                onPress={() => setShowPasswordFields(!showPasswordFields)}
                            >
                                <Text style={styles.passwordToggleText}>
                                    {showPasswordFields ? '- Şifre değiştirmeyi iptal et' : '+ Şifre değiştir'}
                                </Text>
                            </TouchableOpacity>

                            {showPasswordFields && (
                                <View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mevcut Şifre"
                                        value={editedInfo.currentPassword}
                                        onChangeText={(text) => setEditedInfo({...editedInfo, currentPassword: text})}
                                        secureTextEntry
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Yeni Şifre"
                                        value={editedInfo.newPassword}
                                        onChangeText={(text) => setEditedInfo({...editedInfo, newPassword: text})}
                                        secureTextEntry
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Yeni Şifre (Tekrar)"
                                        value={editedInfo.confirmPassword}
                                        onChangeText={(text) => setEditedInfo({...editedInfo, confirmPassword: text})}
                                        secureTextEntry
                                    />
                                </View>
                            )}

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity 
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => {
                                        setIsEditing(false);
                                        setShowPasswordFields(false);
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
                        <View style={styles.infoContainer}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Ad Soyad:</Text>
                                <Text style={styles.infoValue}>{userInfo?.fullName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Email:</Text>
                                <Text style={styles.infoValue}>{userInfo?.email}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Telefon:</Text>
                                <Text style={styles.infoValue}>{userInfo?.phone || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Adres:</Text>
                                <Text style={styles.infoValue}>{userInfo?.address || '-'}</Text>
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

                {/* Oyuncaklarım */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Oyuncaklarım</Text>
                    <View style={styles.toyList}>
                        {userToys.length > 0 ? (
                            <FlatList
                                data={userToys}
                                renderItem={renderToyItem}
                                keyExtractor={item => item.id.toString()}
                                numColumns={2}
                                scrollEnabled={false}
                            />
                        ) : (
                            <Text style={styles.emptyText}>Henüz oyuncak eklemediniz.</Text>
                        )}
                    </View>
                </View>

                {/* Çıkış Yap */}
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
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
    section: {
        backgroundColor: '#fff',
        marginBottom: 10,
        padding: 15,
    },
    sectionTitle: {
        fontSize: 20,
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
    logoutButton: {
        backgroundColor: '#FF6B6B',
        padding: 15,
        margin: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    toyList: {
        marginTop: 10,
    },
    sectionHeader: {
        marginBottom: 15,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
        fontSize: 16,
        color: '#666',
    },
    toyCard: {
        flex: 1,
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#eee',
    },
    toyImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#f0f0f0',
    },
    toyInfo: {
        padding: 10,
    },
    toyName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    toyPrice: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: '600',
    },
    toyAge: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    passwordToggle: {
        padding: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    passwordToggleText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        alignItems: 'center',
        marginBottom: 15,
        borderRadius: 15,
        marginHorizontal: 15,
        marginTop: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 5,
    },
    userPoints: {
        fontSize: 16,
        color: '#FF6B6B',
        fontWeight: '600',
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
});

export default UserScreen; 