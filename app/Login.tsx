import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';

// *** CONSTANTES DE MARCA ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND_LIGHT = '#F7F7F7'; // Fondo sutil para inputs
const COLOR_TEXT_DARK = '#333333';
const COLOR_SUCCESS = '#388E3C'; // Verde para el botón secundario (Crear Perfil)

// Pantalla de inicio de sesión
export default function Login() {
  const router = useRouter();
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const user = await AsyncStorage.getItem('usuarioLogueado');
      if (user) {
        router.push('/MenuPrincipal');
      }
    };
    checkLoggedIn();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa nombre y contraseña');
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
        Alert.alert('Error de Acceso', 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCuenta = () => {
    router.push('/CrearLogin');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo de la app con Círculo Flotante (Patrón CrearLogin) */}
        <View style={styles.logoCircle}>
          <Image
            source={require('../assets/images/LogoLogin.png')} // ¡CAMBIO AQUÍ!
            style={styles.logo}
          />
        </View>

        {/* Título de pantalla */}
        <Text style={styles.title}>Iniciar Sesión</Text>

        {/* Campo de entrada para el nombre */}
        <TextInput
          style={styles.input}
          placeholder="Nombre de Usuario"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
        />

        {/* Campo de entrada para la contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
          maxLength={10}
        />

        {/* Botones de acción */}
        <View style={styles.buttonColumn}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLOR_PRIMARY} />
            ) : (
              <Text style={styles.buttonText}>ENTRAR</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleCrearCuenta}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: COLOR_ACCENT }]}>CREAR PERFIL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Estilos replicados de CrearLogin.tsx
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLOR_PRIMARY,
  },
  container: {
    flex: 1,
    backgroundColor: COLOR_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  logoCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  logo: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    backgroundColor: COLOR_BACKGROUND_LIGHT,
    borderRadius: 15,
    padding: 18,
    marginBottom: 20,
    fontSize: 17,
    color: COLOR_TEXT_DARK,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    textAlign: 'center',
  },
  buttonColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
    gap: 15,
    alignItems: 'center',
  },
  button: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 5,
    marginTop: 0,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLOR_ACCENT,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLOR_ACCENT,
    marginTop: 0, 
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLOR_PRIMARY,
    letterSpacing: 0.5,
  },
  loading: {
    marginTop: 20,
  },
});