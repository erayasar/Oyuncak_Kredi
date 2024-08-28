import React, { useState } from 'react';
import { Image, Text, Alert, View, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const navigation = useNavigation();

  const handleLogin = () => {
    if (username === 'eray' && password === '1234') {
      Alert.alert('Başarılı', 'Giriş başarılı!');
      navigation.navigate('Home');
    } else {
      Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <ImageBackground source={require('../../assets/arkaplan.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../../assets/logo.jpg')} style={styles.overlayImage} />
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı Adı"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Giriş</Text>
          </TouchableOpacity>
          
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: '100%',
    width: '100%',
  },
  overlayImage: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: '130%',
    height: '20%',
    resizeMode: 'cover',
    opacity: 0.3,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
  },
  button: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#d35400',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
