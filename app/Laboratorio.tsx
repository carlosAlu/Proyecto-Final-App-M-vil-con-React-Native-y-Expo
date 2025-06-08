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

// Lista de botones disponibles
const BUTTONS = [
  {
    id: 1,
    label: 'Resis. Comp. Cilindros',
    image: require('../assets/images/LogoCilindros.jpeg'),
  },
  {
    id: 2,
    label: 'Resis. Comp. Vigas',
    image: require('../assets/images/LogoVigas.jpeg'),
  },
  {
    id: 3,
    label: 'Resis. Comp. Morteros',
    image: require('../assets/images/LogoMorteros.jpeg'),
  },
  // {
  //   id: 4,
  //   label: 'Resis. Comp. Pastillas',
  //   image: require('../assets/images/LogoPastillas.jpeg'),
  // },
  {
    id: 4,
    label: 'Granulometria',
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
    }
    // Ruta futura descomentable cuando esté disponible
    // else if (buttonIndex === 4) {
    //   router.push('/CalculosLaboratorio/Pastillas');
    // }
    else if (buttonIndex === 4) {
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
      </View>
      <Text style={styles.title}>Laboratorio</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {BUTTONS.map((btn) => (
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
    marginTop: 0,
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
    padding: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#1E88E5',
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
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
