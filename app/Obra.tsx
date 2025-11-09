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

// Botones con imágenes y etiquetas para el menú de "Obra"
const buttons = [
  { id: 1, label: '% Compactación (Método del Cono)', route: '/CalculosCampo/Compactacion', image: require('../assets/images/LogoCalas.jpeg') },
  { id: 2, label: '% Compactación (Método del Cono V2)', route: '/CalculosCampo/CompactacionCono', image: require('../assets/images/LogoCompactacionCono.jpg') },
  { id: 3, label: 'Contenido de Asfalto', route: '/CalculosCampo/ContenidoAsfalto', image: require('../assets/images/LogoAsfalto.jpg') },
];

export default function Obra() {
  const router = useRouter();
  const navigation = useNavigation();

  // Oculta el header predeterminado para esta pantalla
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Navega según el botón presionado
  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Usamos el logo para mantener el branding en el encabezado */}
        <Image
          source={require('../assets/images/LogoLasCaliforniasApp.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Módulo de Obra</Text>
        <Text style={styles.subtitle}>Selecciona el cálculo a realizar en campo</Text>
      </View>

      {/* Scroll con grid de botones */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {buttons.map((btn) => (
            <View key={btn.id} style={styles.item}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress(btn.route)}
                activeOpacity={0.7}
              >
                <Image source={btn.image} style={styles.image} />
              </TouchableOpacity>
              {/* Etiqueta de botón con mejor estilo */}
              <Text style={styles.label}>{btn.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Modificado: Usa el color primario en el SafeAreaView (barra superior)
  safeArea: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND, // Fondo claro para el cuerpo
  },
  // Header: Utiliza el patrón de encabezado Azul Oscuro/Dorado
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
  subtitle: { // Nuevo: Subtítulo descriptivo
    fontSize: 16,
    color: '#B0C4DE',
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
    marginTop: 8, // Más margen
    fontSize: 16,
    color: COLOR_TEXT_DARK, // Texto oscuro para mejor lectura sobre el fondo claro
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 5,
  },
});