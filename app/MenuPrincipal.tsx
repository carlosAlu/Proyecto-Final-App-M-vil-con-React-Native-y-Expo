import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Configuración de botones del menú con íconos y etiquetas
const buttons = [
  { id: 1, label: 'Camara', image: require('../assets/images/LogoCamara.png') },
  { id: 2, label: 'Laboratorio', image: require('../assets/images/LogoLaboratorio.png') },
  { id: 3, label: 'Obra', image: require('../assets/images/LogoObra.png') },
  { id: 4, label: 'Oficina', image: require('../assets/images/LogoOficina.png') },
  { id: 5, label: 'Dashboard', image: require('../assets/images/LogoEstadisticas.png') },
  { id: 6, label: 'Cerrar sesion', image: require('../assets/images/LogoCerrarSesion.png'), isLogout: true },
];

export default function MenuPrincipalScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Estados para manejo de modales, código de acceso y errores
  const [modalVisible, setModalVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [backModalVisible, setBackModalVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoLocation, setPhotoLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoDate, setPhotoDate] = useState<string | null>(null);

  // Oculta el header del navegador
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Controla el botón físico "back" para evitar salida accidental
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

  // Función para abrir la cámara, guardar en galería y obtener ubicación y fecha/hora
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Permiso para acceder a la cámara denegado');
      return;
    }

    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== 'granted') {
      alert('Permiso para acceder a la ubicación denegado');
      return;
    }

    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    if (mediaStatus !== 'granted') {
      alert('Permiso para guardar en la galería denegado');
      return;
    }

    // Obtiene la ubicación actual
    const location = await Location.getCurrentPositionAsync({});
    setPhotoLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    // Fecha y hora actual
    const now = new Date();
    const fechaHora = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    setPhotoDate(fechaHora);

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      aspect: [4, 3],
      base64: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);

      // Guarda la foto en la galería
      await MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
    }
  };

  /**
   * Maneja la acción al presionar un botón del menú
   * @param buttonIndex Número de botón presionado
   * @param isLogout Indica si el botón es para cerrar sesión
   */
  const handlePress = async (buttonIndex: number, isLogout?: boolean) => {
    if (buttonIndex === 6 || isLogout) {
      await AsyncStorage.removeItem('usuarioLogueado');
      router.push('/Login');
      return;
    }

    switch (buttonIndex) {
      case 1:
        openCamera();
        break;
      case 2:
        router.push('/Laboratorio');
        break;
      case 3:
        router.push('/Obra');
        break;
      case 4:
        setModalVisible(true);
        setCodigo('');
        setErrorCodigo('');
        break;
      case 5:
        router.push('/Dashboard');
        break;
      default:
        console.log(`Botón ${buttonIndex} presionado`);
    }
  };

  /**
   * Verifica el código de acceso a Oficina
   */
  const verificarCodigo = () => {
    if (codigo === '010324') {
      setModalVisible(false);
      setCodigo('');
      setErrorCodigo('');
      router.push('/Oficina');
    } else {
      setErrorCodigo('Código incorrecto. Intenta de nuevo.');
    }
  };

  /**
   * Confirma la salida de la aplicación
   */
  const handleBackConfirm = () => {
    setBackModalVisible(false);
    BackHandler.exitApp();
  };

  /**
   * Cancela la salida de la aplicación
   */
  const handleBackCancel = () => {
    setBackModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header con logo */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/LogoLasCaliforniasApp.png')}
          style={styles.logo}
        />
      </View>

      {/* Grid de botones */}
      <View style={styles.grid}>
        {buttons.map((btn) => (
          <View key={btn.id} style={styles.item}>
            <TouchableOpacity
              style={[styles.button, btn.isLogout && styles.logoutButtonGrid]}
              onPress={() => handlePress(btn.id, btn.isLogout)}
              activeOpacity={0.8}
            >
              <Image source={btn.image} style={styles.image} />
            </TouchableOpacity>
            <Text style={[styles.label, btn.isLogout && styles.logoutLabelGrid]}>
              {btn.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Modal para mostrar la foto tomada */}
      <Modal
        visible={!!photoUri}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setPhotoUri(null);
          setPhotoLocation(null);
          setPhotoDate(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Foto tomada</Text>
            {/* Logo arriba de la foto */}
            <Image
              source={require('../assets/images/LogoLasCaliforniasApp.png')}
              style={{ width: 180, height: 50, resizeMode: 'contain', alignSelf: 'center', marginBottom: 10 }}
            />
            {photoUri && (
              <Image
                source={{ uri: photoUri }}
                style={{ width: 250, height: 200, borderRadius: 8, marginBottom: 10 }}
              />
            )}
            {photoDate && (
              <Text style={{ textAlign: 'center', marginBottom: 2 }}>
                Fecha y hora: {photoDate}
              </Text>
            )}
            {photoLocation && (
              <Text style={{ textAlign: 'center', marginBottom: 10 }}>
                Ubicación: {photoLocation.latitude.toFixed(6)}, {photoLocation.longitude.toFixed(6)}
              </Text>
            )}
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.button, styles.modalAcceptButton, { width: 140 }]}
                onPress={() => {
                  setPhotoUri(null);
                  setPhotoLocation(null);
                  setPhotoDate(null);
                }}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de acceso a Oficina */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Acceso a Oficina</Text>
            <Text style={styles.modalText}>
              Ingresa el código para acceder a la sección de Oficina.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Código de verificación"
              value={codigo}
              onChangeText={setCodigo}
              keyboardType="numeric"
              secureTextEntry
              textAlign="center"
            />
            {errorCodigo ? (
              <Text style={styles.errorText}>{errorCodigo}</Text>
            ) : null}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.button, styles.modalCancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setCodigo('');
                  setErrorCodigo('');
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.modalAcceptButton]}
                onPress={verificarCodigo}
              >
                <Text style={styles.buttonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para confirmar salida */}
      <Modal
        visible={backModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleBackCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              ¿Seguro que quieres salir de la aplicación?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.button, styles.exitButton]}
                onPress={handleBackConfirm}
              >
                <Text style={styles.buttonText}>Salir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.modalAcceptButton]}
                onPress={handleBackCancel}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Estilos del componente
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0057B7',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  logo: {
    width: 350,
    height: 100,
    resizeMode: 'contain',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '94%',
    marginTop: 10,
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
  logoutButtonGrid: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  image: {
    width: 100,
    height: 100,
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
  logoutLabelGrid: {
    color: '#E53935',
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 320,
    elevation: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#C3D1E6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 18,
    backgroundColor: '#F0F4F8',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#aaa',
    width: 100,
    marginTop: 0,
  },
  modalAcceptButton: {
    backgroundColor: '#1E90FF',
    width: 100,
    marginTop: 0,
  },
  exitButton: {
    backgroundColor: '#E53935',
    width: 100,
    marginTop: 0,
  },
});