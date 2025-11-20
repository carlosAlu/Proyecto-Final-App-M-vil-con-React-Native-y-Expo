import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Configuración de botones (Tu data original)
const buttons = [
  { id: 1, label: 'Cámara y Geolocalización', route: 'Camera', image: require('../assets/images/LogoCamara.jpg') },
  { id: 2, label: 'Módulo Laboratorio', route: '/Laboratorio', image: require('../assets/images/LogoLaboratorio.jpg') },
  { id: 3, label: 'Módulo Obra', route: '/Obra', image: require('../assets/images/LogoObra.jpg') },
  { id: 4, label: 'Acceso a Oficina', route: '/Oficina', image: require('../assets/images/LogoOficina.jpg'), needsCode: true },
  { id: 5, label: 'Dashboard y Trazabilidad', route: '/Dashboard', image: require('../assets/images/LogoEstadisticas.png') },
  { id: 6, label: 'Cerrar Sesión', route: '/Login', image: require('../assets/images/LogoCerrarSesion.png'), isLogout: true },
];

export default function MenuPrincipalScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // --- ESTADOS DE LÓGICA (Conservados intactos) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [backModalVisible, setBackModalVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoLocation, setPhotoLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoDate, setPhotoDate] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        setBackModalVisible(true);
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  // --- FUNCIONES LÓGICAS ---
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { alert('Permiso de cámara denegado'); return; }
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') { alert('Permiso de ubicación denegado'); return; }
    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    if (mediaStatus !== 'granted') { alert('Permiso de galería denegado'); return; }

    const location = await Location.getCurrentPositionAsync({});
    setPhotoLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });

    const now = new Date();
    setPhotoDate(now.toLocaleDateString() + ' ' + now.toLocaleTimeString());

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      await MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
    }
  };

  const handlePress = async (btn: typeof buttons[0]) => {
    if (btn.isLogout) {
      await AsyncStorage.removeItem('usuarioLogueado');
      router.push(btn.route as any);
      return;
    }
    if (btn.needsCode) {
      setModalVisible(true); setCodigo(''); setErrorCodigo('');
      return;
    }
    if (btn.id === 1) { openCamera(); return; }
    router.push(btn.route as any);
  };

  const verificarCodigo = () => {
    if (codigo === '010324') {
      setModalVisible(false); setCodigo(''); setErrorCodigo('');
      router.push('/Oficina');
    } else {
      setErrorCodigo('Código incorrecto.');
    }
  };

  // --- RENDERIZADO (Diseño adaptado al estilo Laboratorio) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header idéntico al de Laboratorio */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/LogoLasCaliforniasApp.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Menú Principal</Text>
        <Text style={styles.subtitle}>Selecciona una opción</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {buttons.map((btn) => (
            <View key={btn.id} style={styles.item}>
              <TouchableOpacity
                style={[
                   styles.button,
                   btn.isLogout && { backgroundColor: '#D32F2F' } // Única excepción: Rojo para salir, opcional
                ]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
              >
                <Image source={btn.image} style={styles.image} />
              </TouchableOpacity>
              <Text style={styles.label}>
                {btn.label} {btn.needsCode ? '🔒' : ''}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* --- MODALES (Estilos adaptados para mantener funcionalidad) --- */}
      
      {/* Modal Foto */}
      <Modal visible={!!photoUri} transparent animationType="fade" onRequestClose={() => setPhotoUri(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, {color: '#003366'}]}>📸 Evidencia Capturada</Text>
            {photoUri && <Image source={{ uri: photoUri }} style={styles.photoModalImage} />}
            <View style={{alignSelf: 'flex-start'}}>
                <Text style={{fontSize: 12}}>📅 {photoDate}</Text>
                {photoLocation && <Text style={{fontSize: 12}}>📍 {photoLocation.latitude.toFixed(5)}, {photoLocation.longitude.toFixed(5)}</Text>}
            </View>
            <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#003366', marginTop: 15}]} onPress={() => setPhotoUri(null)}>
              <Text style={styles.modalBtnText}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Código Oficina */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, {color: '#003366'}]}>🔒 Acceso Oficina</Text>
            <Text style={{textAlign:'center', marginBottom: 10}}>Ingresa el código de seguridad(010324)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Código"
              value={codigo}
              onChangeText={setCodigo}
              keyboardType="numeric"
              secureTextEntry
              textAlign="center"
            />
            {errorCodigo ? <Text style={{color: 'red', marginBottom: 10}}>{errorCodigo}</Text> : null}
            <View style={styles.modalRow}>
               <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#999'}]} onPress={() => setModalVisible(false)}>
                 <Text style={styles.modalBtnText}>CANCELAR</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#003366'}]} onPress={verificarCodigo}>
                 <Text style={styles.modalBtnText}>ENTRAR</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Salir */}
      <Modal visible={backModalVisible} transparent animationType="fade" onRequestClose={() => setBackModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, {color: '#D32F2F'}]}>⚠️ ¿Salir de la App?</Text>
            <View style={styles.modalRow}>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#003366'}]} onPress={() => setBackModalVisible(false)}>
                <Text style={styles.modalBtnText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: '#D32F2F'}]} onPress={() => BackHandler.exitApp()}>
                <Text style={styles.modalBtnText}>SALIR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// Estilos copiados y adaptados de LaboratorioScreen + Estilos para Modales
const styles = StyleSheet.create({
  // --- ESTILOS BASE (IGUAL QUE LABORATORIO) ---
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
    width: '47%', // Mantiene el tamaño de tarjetas del laboratorio
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#003366', // Bloque Azul Sólido
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },
  image: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
    borderRadius: 15,
  },
  label: {
    marginTop: 8,
    fontSize: 15, // Ligeramente ajustado para nombres largos
    color: '#333333',
    textAlign: 'center',
    fontWeight: '700',
    paddingHorizontal: 0,
  },

  // --- ESTILOS EXTRA PARA MODALES (Necesarios para MenuPrincipal) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '80%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  photoModalImage: {
    width: 250,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    width: '100%',
    padding: 10,
    marginBottom: 10,
    fontSize: 18,
    backgroundColor: '#F9F9F9',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});