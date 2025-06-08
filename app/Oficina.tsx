import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';

// Definición del arreglo de botones con id, etiqueta y ruta de imagen
const buttons = [
  { id: 1, label: 'Ensayar Muestra Suelos', image: require('../assets/images/LogoEnsayarSuelos.jpg') },
  { id: 2, label: 'Ensayar Muestra Concreto', image: require('../assets/images/LogoEnsayarConcretos.jpg') },
  { id: 3, label: 'Resis. Comp. Cilindros', image: require('../assets/images/LogoCilindros.jpeg') },
  { id: 4, label: 'Resis. Comp. vigas', image: require('../assets/images/LogoVigas.jpeg') },
  { id: 5, label: 'Resis. Comp. Morteros', image: require('../assets/images/LogoMorteros.jpeg') },
];

export default function LaboratorioScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Oculta el header nativo de la navegación al montar el componente
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /**
   * Maneja la navegación según el botón presionado
   * @param buttonIndex - id del botón presionado
   */
  const handlePress = (buttonIndex: number) => {
    switch (buttonIndex) {
      case 1:
        router.push('/CalculosOficina/EnsayarSuelos');
        break;
      case 2:
        router.push('/CalculosOficina/EnsayarConcretos');
        break;
      case 3:
        router.push('/CalculosOficina/Cilindros');
        break;
      case 4:
        router.push('/CalculosOficina/Vigas');
        break;
      case 5:
        router.push('/CalculosOficina/Morteros');
        break;
      default:
        console.log(`Botón ${buttonIndex} presionado sin ruta definida.`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header con logo centrado */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/LogoLasCaliforniasApp.png')}
          style={styles.logo}
          accessibilityLabel="Logo Las Californias"
        />
      </View>

      {/* Título principal de la pantalla */}
      <Text style={styles.title}>Oficina</Text>

      {/* Contenedor scrollable para los botones */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {buttons.map(({ id, label, image }) => (
            <View key={id} style={styles.item}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress(id)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <Image source={image} style={styles.image} />
              </TouchableOpacity>
              <Text style={styles.label}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos organizados y comentados
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0057B7', // Fondo azul corporativo
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
    aspectRatio: 1, // Mantiene proporción cuadrada
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4, // Sombra para Android
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
