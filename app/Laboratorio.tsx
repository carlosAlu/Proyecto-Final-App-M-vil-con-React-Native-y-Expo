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

// Lista de botones disponibles (sin cambios en la data)
const BUTTONS = [
  {
    id: 1,
    label: 'Resistencia a Compresión (Cilindros)',
    image: require('../assets/images/LogoCilindros.jpeg'),
  },
  {
    id: 2,
    label: 'Resistencia a Flexión (Vigas)',
    image: require('../assets/images/LogoVigas.jpeg'),
  },
  {
    id: 3,
    label: 'Resistencia a Compresión (Morteros)',
    image: require('../assets/images/LogoMorteros.jpeg'),
  },
  {
    id: 4,
    label: 'Granulometría',
    image: require('../assets/images/LogoGranulometrias.jpeg'),
  },
  {
    id: 5,
    label: 'Lavados',
    image: require('../assets/images/LogoLavados.jpg'),
  },
];

export default function LaboratorioScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handlePress = (buttonIndex: number) => {
    if (buttonIndex === 1) {
      router.push('/CalculosLaboratorio/Cilindros');
    } else if (buttonIndex === 2) {
      router.push('/CalculosLaboratorio/Vigas');
    } else if (buttonIndex === 3) {
      router.push('/CalculosLaboratorio/Morteros');
    } else if (buttonIndex === 4) {
      router.push('/CalculosLaboratorio/Granulometrias');
    } else if (buttonIndex === 5) {
      router.push('/CalculosLaboratorio/Lavados');
    } else {
      console.log(`Botón ${buttonIndex} presionado`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/LogoLasCaliforniasApp.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Módulo de Laboratorio</Text>
        <Text style={styles.subtitle}>Selecciona la prueba a realizar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {BUTTONS.map((btn) => (
            <View key={btn.id} style={styles.item}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handlePress(btn.id)}
                activeOpacity={0.7}
              >
                {/* La imagen es la que tiene el 'margen' del color del botón */}
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#003366', // Azul Oscuro
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
    color: '#FFD700', // Dorado
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 5,
  },
  subtitle: {
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
    width: '47%',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    aspectRatio: 1,
    // *** CAMBIO CLAVE AQUÍ: Azul Fuerte para el fondo del botón ***
    backgroundColor: '#003366', 
    // ************************
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
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
    borderRadius: 15,
    // Aquí podemos añadir un borde blanco o dorado alrededor de la imagen si se desea
    // borderWidth: 2, 
    // borderColor: '#FFD700', 
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 5,
  },
});