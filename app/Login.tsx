import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantalla de inicio de sesión
export default function Login() {
  const router = useRouter();
  const navigation = useNavigation();

  // Estados locales para usuario, contraseña y carga
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Oculta el encabezado de navegación
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Verifica si ya hay un usuario logueado
  useEffect(() => {
    const checkLoggedIn = async () => {
      const user = await AsyncStorage.getItem('usuarioLogueado');
      if (user) {
        router.push('/MenuPrincipal');
      }
    };
    checkLoggedIn();
  }, []);

  // Maneja el inicio de sesión
  const handleLogin = async () => {
    if (!username || !password) {
      alert('Por favor ingresa nombre y contraseña');
      return;
    }

    setLoading(true);

    try {
      const usersData = await AsyncStorage.getItem('usuarios');
      const users = usersData ? JSON.parse(usersData) : [];

      const userFound = users.find(
        (u: any) => u.nombre === username && u.password === password
      );

      if (userFound) {
        await AsyncStorage.setItem('usuarioLogueado', JSON.stringify(userFound));
        router.push('/MenuPrincipal');
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      alert('Error al iniciar sesión');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Navega a la pantalla de creación de cuenta
  const handleCrearCuenta = () => {
    router.push('/CrearLogin');
  };

  return (
    <View style={styles.container}>
      {/* Logo de la app */}
      <Image
        source={require('../assets/images/LogoLasCaliforniasApp.png')}
        style={styles.logo}
      />

      {/* Título de pantalla */}
      <Text style={styles.title}>Iniciar Sesión</Text>

      {/* Campo de entrada para el nombre */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {/* Campo de entrada para la contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña numérica"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        keyboardType="numeric"
      />

      {/* Botones de acción */}
      <View style={styles.buttonColumn}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.createAccountButton]}
          onPress={handleCrearCuenta}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Crear Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de carga */}
      {loading && (
        <ActivityIndicator size="large" color="#fff" style={styles.loading} />
      )}
    </View>
  );
}

// Estilos de la pantalla
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0057B7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 18,
  },
  buttonColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    marginTop: 30,
    gap: 10,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  createAccountButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
  },
  loading: {
    marginTop: 20,
  },
});
