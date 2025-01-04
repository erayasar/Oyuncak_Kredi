// Register.js
import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import api from '../services/api';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const handleRegister = async () => {
        try {
            if (!username || !email || !password || !fullName || !phone || !address) {
                Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
                return;
            }

            console.log('Gönderilecek kayıt bilgileri:', {
                username,
                email,
                password,
                fullName,
                phone,
                address
            });

            const response = await api.register({
                username,
                email,
                password,
                fullName,
                phone,
                address
            });

            console.log('Kayıt yanıtı:', response);

            Alert.alert(
                'Başarılı',
                'Kayıt işlemi başarıyla tamamlandı',
                [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            console.error('Kayıt hatası:', error);
            Alert.alert('Hata', error.message || 'Kayıt işlemi başarısız');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Kayıt Ol</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Kullanıcı Adı"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="E-posta"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Şifre"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Ad Soyad"
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Telefon"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Adres"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity 
                        style={styles.registerButton}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>Zaten hesabın var mı? Giriş yap</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 5,
        marginBottom: 15,
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    registerButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginButton: {
        marginTop: 15,
        padding: 10,
    },
    loginButtonText: {
        color: '#4CAF50',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default RegisterScreen;
