import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';

// Constantes
const LOGO_IMAGE = require('../assets/images/LogoLasCaliforniasApp.png');
const LOGIN_ROUTE = '/Login';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Oculta el header de navegación al cargar el componente
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Maneja la navegación hacia la pantalla de inicio de sesión
  const handleLoginPress = () => {
    router.push(LOGIN_ROUTE);
  };

  return (
    // Usamos SafeAreaView para asegurar que el contenido no se superponga con la barra de estado/notch
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Sección de Logo y Bienvenida */}
        <View style={styles.header}>
          <Image source={LOGO_IMAGE} style={styles.logo} />
          <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
          <Text style={styles.welcomeSubtitle}>Descubre todo lo que tenemos para ti.</Text>
        </View>

        {/* Sección del Botón */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#003366', // Un azul marino más profundo y elegante como fondo principal
  },
  container: {
    flex: 1,
    justifyContent: 'space-around', // Distribuye el espacio entre el logo y el botón
    alignItems: 'center',
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,

  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#B0C4DE',
    textAlign: 'center',
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 50, 
  },
  button: {
    backgroundColor: '#FFD700',
    width: '80%',
    paddingVertical: 18,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    fontSize: 22,
    color: '#003366',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
});