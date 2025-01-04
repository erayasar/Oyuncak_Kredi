// Register.js
import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Alert
} from 'react-native';
import api from '../services/api';

const RegisterScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const validateForm = () => {
        if (!username || username.length < 3) {
            Alert.alert('Hata', 'Kullanıcı adı en az 3 karakter olmalıdır!');
            return false;
        }

        if (!email || !email.includes('@') || !email.includes('.')) {
            Alert.alert('Hata', 'Geçerli bir email adresi giriniz!');
            return false;
        }

        if (!password || password.length < 6) {
            Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır!');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor!');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const response = await api.register({ username, email, password });
            Alert.alert(
                'Başarılı', 
                'Kayıt işlemi tamamlandı!', 
                [{ text: 'Tamam', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            if (error.message === 'Email already exists') {
                Alert.alert('Hata', 'Bu email adresi zaten kullanımda!');
            } else {
                Alert.alert('Hata', error.message || 'Kayıt işlemi başarısız!');
            }
        }
    };

    return (
        <ImageBackground
            source={require('../../assets/arkaplan.jpg')}
            style={styles.background}
            blurRadius={3}
        >
            <StatusBar barStyle="light-content" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Yeni Hesap Oluştur</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Kullanıcı Adı"
                            placeholderTextColor="#666"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="E-posta"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Şifre Tekrar"
                            placeholderTextColor="#666"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.registerButton}
                        onPress={handleRegister}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginText}>Zaten hesabın var mı? Giriş yap</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    input: {
        height: 50,
        color: '#333',
        fontSize: 16,
    },
    registerButton: {
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
    registerButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginButton: {
        marginTop: 15,
        padding: 10,
    },
    loginText: {
        color: '#4CAF50',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    }
});

export default RegisterScreen;
