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

// *** CONSTANTES DE MARCA (Para consistencia) ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND = '#F5F5F5'; // Fondo Suave
const COLOR_TEXT_DARK = '#333333'; // Texto oscuro para fondo claro

// Definición del arreglo de botones con id, etiqueta y ruta de imagen
const buttons = [
  { id: 1, label: 'Ensayar Muestra Suelos', route: '/CalculosOficina/EnsayarSuelos', image: require('../assets/images/LogoEnsayarSuelos.jpg') },
  { id: 2, label: 'Ensayar Muestra Concreto', route: '/CalculosOficina/EnsayarConcretos', image: require('../assets/images/LogoEnsayarConcretos.jpg') },
  { id: 3, label: 'Resistencia a Compresión (Cilindros)', route: '/CalculosOficina/Cilindros', image: require('../assets/images/LogoCilindros.jpeg') },
  { id: 4, label: 'Resistencia a Flexión (Vigas)', route: '/CalculosOficina/Vigas', image: require('../assets/images/LogoVigas.jpeg') },
  { id: 5, label: 'Resistencia a Compresión (Morteros)', route: '/CalculosOficina/Morteros', image: require('../assets/images/LogoMorteros.jpeg') },
];

export default function OficinaScreen() { // Renombrado internamente para claridad
  const router = useRouter();
  const navigation = useNavigation();

  // Oculta el header nativo de la navegación al montar el componente
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /**
   * Maneja la navegación según el botón presionado
   */
  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    // Usa el color de marca para la barra superior, fondo claro para el cuerpo
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Header con logo centrado */}
        <Image
          source={require('../assets/images/LogoLasCaliforniasApp.png')}
          style={styles.logo}
          accessibilityLabel="Logo Las Californias"
        />
        {/* Título y Subtítulo de la pantalla */}
        <Text style={styles.title}>Módulo de Oficina</Text>
        <Text style={styles.subtitle}>Selecciona el informe o cálculo a gestionar</Text>
      </View>

      {/* Contenedor scrollable para los botones */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {buttons.map(({ id, label, image, route }) => (
            <View key={id} style={styles.item}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress(route)}
                activeOpacity={0.7} // Opacidad más notoria al presionar
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <Image source={image} style={styles.image} />
              </TouchableOpacity>
              {/* Etiqueta de botón con mejor estilo */}
              <Text style={styles.label}>{label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos estandarizados de la marca
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND, // Fondo claro para el cuerpo
  },
  // Header: Estilo de encabezado Azul Oscuro con bordes redondeados
  header: {
    backgroundColor: COLOR_PRIMARY,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    paddingTop: 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 10,
    elevation: 5,
  },
  logo: {
    width: 300,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    color: COLOR_ACCENT, // Dorado para el título principal
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 5,
  },
  subtitle: { // Subtítulo descriptivo
    fontSize: 16,
    color: '#B0C4DE', // Color claro para subtítulo
    fontWeight: '500',
    marginBottom: 5,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '47%', // Ancho ajustado para mejor espaciado
    alignItems: 'center',
    marginBottom: 20,
  },
  // Botón: Estilo de tarjeta flotante
  button: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLOR_PRIMARY, // Fondo del botón en Azul Oscuro
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20, // Bordes más suaves
    padding: 10,
    // Sombra más prominente para un efecto flotante
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 0,
  },
  image: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    borderRadius: 15, // Bordes suaves a la imagen
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    color: COLOR_TEXT_DARK, // Texto oscuro para mejor lectura sobre el fondo claro
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 5,
  },
});