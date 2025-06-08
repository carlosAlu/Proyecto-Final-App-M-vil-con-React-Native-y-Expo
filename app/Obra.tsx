import { useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Botones con imágenes y etiquetas para el menú de "Obra"
const buttons = [
  { id: 1, label: '% Compactacion', image: require('../assets/images/LogoCalas.jpeg') },
  { id: 2, label: '% Compactacion con Cono', image: require('../assets/images/LogoCompactacionCono.jpg') },
  { id: 3, label: 'Contenido de Asfalto', image: require('../assets/images/LogoAsfalto.jpg') },
];

export default function Obra() {
  const router = useRouter();
  const navigation = useNavigation();

  // Oculta el header predeterminado para esta pantalla
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Navega según el botón presionado
  const handlePress = (buttonIndex: number) => {
    switch (buttonIndex) {
      case 1:
        router.push('/CalculosCampo/Compactacion');
        break;
      case 2:
        router.push('/CalculosCampo/CompactacionCono');
        break;
      case 3:
        router.push('/CalculosCampo/ContenidoAsfalto');
        break;
      default:
        console.log(`Botón ${buttonIndex} presionado`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Logo principal */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/LogoLasCaliforniasApp.png')}
          style={styles.logo}
        />
      </View>

      {/* Título de la pantalla */}
      <Text style={styles.title}>Obra</Text>

      {/* Scroll con grid de botones */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {buttons.map((btn) => (
            <View key={btn.id} style={styles.item}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress(btn.id)}
                activeOpacity={0.8}
              >
                <Image source={btn.image} style={styles.image} />
              </TouchableOpacity>
              <Text style={styles.label}>{btn.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0057B7',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
  },
  logo: {
    width: 320,
    height: 90,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '94%',
    marginBottom: 20,
  },
  item: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    padding: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  label: {
    marginTop: 2,
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: '#0002',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
