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
import { useLayoutEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Componente para crear un nuevo usuario y almacenarlo en AsyncStorage.
 * Maneja nombre y contraseña, con validaciones básicas y feedback de carga.
 */
export default function CrearLogin() {
  const router = useRouter();
  const navigation = useNavigation();

  // Estado para nombre de usuario, contraseña y estado de carga
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Oculta el header de navegación al montar el componente
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /**
   * Maneja la creación del usuario:
   * - Valida campos
   * - Revisa existencia previa en AsyncStorage
   * - Guarda el nuevo usuario o muestra alertas de error
   */
  const handleLogin = async () => {
    if (!username || !password) {
      alert('Por favor ingresa nombre y contraseña');
      return;
    }

    setLoading(true);

    try {
      const usersData = await AsyncStorage.getItem('usuarios');
      const users = usersData ? JSON.parse(usersData) : [];

      // Verifica si ya existe un usuario con el mismo nombre
      const exists = users.some((u: any) => u.nombre === username);

      if (exists) {
        alert('El usuario ya existe');
      } else {
        users.push({
          nombre: username,
          password,
          creado: new Date(),
        });

        await AsyncStorage.setItem('usuarios', JSON.stringify(users));
        alert('Usuario creado correctamente');
        router.push('/Login');
      }
    } catch (error) {
      alert('Error al crear usuario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Image
          source={require('../assets/images/LogoLogin.png')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Crear Perfil</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre Completo"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Crear</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0057B7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoCircle: {
    width: 210,
    height: 210,
    borderRadius: 110,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
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
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    elevation: 3,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
  },
});
