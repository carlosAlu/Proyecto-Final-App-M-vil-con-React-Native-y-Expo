import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
    <View style={styles.container}>
      <Image source={LOGO_IMAGE} style={styles.logo} />
      <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
        <Text style={styles.buttonText}>Iniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos
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
    height: 300,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
