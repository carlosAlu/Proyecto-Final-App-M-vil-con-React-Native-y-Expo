import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView, // Añadido para mejor manejo del área segura
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// *** CONSTANTES DE MARCA ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND_LIGHT = '#F7F7F7'; // Fondo sutil para inputs
const COLOR_TEXT_DARK = '#333333';

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
   */
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error de Registro', 'Por favor ingresa nombre y una contraseña.');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Error de Contraseña', 'La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const usersData = await AsyncStorage.getItem('usuarios');
      const users = usersData ? JSON.parse(usersData) : [];

      // Verifica si ya existe un usuario con el mismo nombre
      const exists = users.some((u: any) => u.nombre === username);

      if (exists) {
        Alert.alert('Registro Fallido', 'El usuario ya existe. Intenta con otro nombre.');
      } else {
        users.push({
          nombre: username,
          password,
          creado: new Date(),
        });

        await AsyncStorage.setItem('usuarios', JSON.stringify(users));
        Alert.alert('¡Éxito!', 'Perfil creado correctamente. Ya puedes iniciar sesión.');
        router.push('/Login');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al crear usuario. Inténtalo de nuevo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para regresar a la pantalla de login
  const handleGoBack = () => {
    router.push('/Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        <View style={styles.logoCircle}>
            <Image
            source={require('../assets/images/LogoLogin.png')}
            style={styles.logo}
            />
        </View>

        <Text style={styles.title}>Crear Nuevo Perfil</Text>

        <TextInput
            style={styles.input}
            placeholder="Nombre de Usuario"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
        />

        <TextInput
            style={styles.input}
            placeholder="Contraseña (4+ dígitos)"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'} // Mejor teclado en iOS
            maxLength={10}
        />

        {/* Botón para crear */}
        <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator size="small" color={COLOR_PRIMARY} />
            ) : (
                <Text style={styles.buttonText}>REGISTRAR PERFIL</Text>
            )}
        </TouchableOpacity>

        {/* Botón para ir al login */}
        <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoBack}
            disabled={loading}
            activeOpacity={0.8}
        >
            <Text style={[styles.buttonText, { color: COLOR_ACCENT }]}>Ya tengo perfil</Text>
        </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

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
  // Logo Circle (Blanco con sombra fuerte)
  logoCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    // Sombra más prominente para efecto flotante
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
  // Inputs estilizados
  input: {
    width: '90%',
    backgroundColor: COLOR_BACKGROUND_LIGHT,
    borderRadius: 15, // Más redondeado
    padding: 18,
    marginBottom: 20,
    fontSize: 17,
    color: COLOR_TEXT_DARK,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    textAlign: 'center',
  },
  // Botones base
  button: {
    width: '90%',
    paddingVertical: 18,
    borderRadius: 30, // Botón tipo pastilla
    elevation: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra sutil de botón
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  // Botón Principal: Dorado con texto Azul Oscuro
  primaryButton: {
    backgroundColor: COLOR_ACCENT,
  },
  // Botón Secundario: Transparente con borde/texto Dorado
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLOR_ACCENT,
    marginTop: 15,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLOR_PRIMARY, // Texto Azul Oscuro por defecto (para primary)
    letterSpacing: 0.5,
  },
});