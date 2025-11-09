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

// *** CONSTANTES DE MARCA ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND = '#F5F5F5'; // Fondo Suave
const COLOR_DANGER = '#D32F2F'; // Rojo de Error/Peligro
const COLOR_TEXT_DARK = '#333333';
const COLOR_LIGHT_GRAY = '#E0E0E0';
const COLOR_SUCCESS = '#388E3C'; // Verde para aceptar

// Configuración de botones del menú con íconos y etiquetas
const buttons = [
  { id: 1, label: 'Cámara y Geolocalización', route: 'Camera', image: require('../assets/images/LogoCamara.png') },
  { id: 2, label: 'Módulo Laboratorio', route: '/Laboratorio', image: require('../assets/images/LogoLaboratorio.png') },
  { id: 3, label: 'Módulo Obra', route: '/Obra', image: require('../assets/images/LogoObra.png') },
  { id: 4, label: 'Acceso a Oficina', route: '/Oficina', image: require('../assets/images/LogoOficina.png'), needsCode: true },
  { id: 5, label: 'Dashboard y Trazabilidad', route: '/Dashboard', image: require('../assets/images/LogoEstadisticas.png') },
  { id: 6, label: 'Cerrar Sesión', route: '/Login', image: require('../assets/images/LogoCerrarSesion.png'), isLogout: true },
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

  // Controla el botón físico "back" para evitar salida accidental (SIN CAMBIOS FUNCIONALES)
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

  // Función para abrir la cámara, guardar en galería y obtener ubicación y fecha/hora (SIN CAMBIOS FUNCIONALES)
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
   */
  const handlePress = async (btn: typeof buttons[0]) => {
    if (btn.isLogout) {
      await AsyncStorage.removeItem('usuarioLogueado');
      router.push(btn.route as any);
      return;
    }

    if (btn.needsCode) {
      setModalVisible(true);
      setCodigo('');
      setErrorCodigo('');
      return;
    }
    
    // Abrir cámara
    if (btn.id === 1) {
        openCamera();
        return;
    }

    router.push(btn.route as any);
  };

  /**
   * Verifica el código de acceso a Oficina
   */
  const verificarCodigo = () => {
    if (codigo === '010324') { // Código de acceso (manteniendo el original)
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
        <Text style={styles.headerTitle}>Menú Principal</Text>
      </View>

      {/* Grid de botones */}
      <View style={styles.grid}>
        {buttons.map((btn) => (
          <View key={btn.id} style={styles.item}>
            <TouchableOpacity
              style={[
                styles.button,
                btn.isLogout && styles.logoutButton, // Estilo para cerrar sesión
                btn.id === 1 && styles.cameraButton, // Estilo para la cámara
              ]}
              onPress={() => handlePress(btn)}
              activeOpacity={0.7}
            >
              <Image 
                source={btn.image} 
                style={styles.image} 
              />
            </TouchableOpacity>
            <Text 
                style={[
                    styles.label, 
                    btn.isLogout && styles.logoutLabel,
                    btn.id === 4 && styles.officeLabel // Etiqueta destacada para Oficina
                ]}
            >
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
          <View style={styles.photoModalContent}>
            <Text style={styles.modalTitle}>📸 Foto Capturada y Geolocalizada</Text>
            {/* Logo arriba de la foto */}
            <Image
              source={require('../assets/images/LogoLasCaliforniasApp.png')}
              style={styles.photoModalLogo}
            />
            {photoUri && (
              <Image
                source={{ uri: photoUri }}
                style={styles.photoModalImage}
              />
            )}
            <View style={styles.photoModalData}>
                {photoDate && (
                <Text style={styles.photoModalText}>
                    **Fecha y Hora:** {photoDate}
                </Text>
                )}
                {photoLocation && (
                <Text style={styles.photoModalText}>
                    **Ubicación:** {photoLocation.latitude.toFixed(6)}, {photoLocation.longitude.toFixed(6)}
                </Text>
                )}
            </View>
            <TouchableOpacity
              style={[styles.button, styles.modalAcceptButton, styles.closeButton]}
              onPress={() => {
                setPhotoUri(null);
                setPhotoLocation(null);
                setPhotoDate(null);
              }}
            >
              <Text style={styles.buttonText}>CERRAR</Text>
            </TouchableOpacity>
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
            <Text style={[styles.modalTitle, {color: COLOR_PRIMARY}]}>🔒 Acceso Restringido: Oficina</Text>
            <Text style={styles.modalText}>
              Ingresa el código para acceder a la sección de Oficina(010324).
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Código de verificación"
              placeholderTextColor="#999"
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
                style={[styles.button, styles.modalButton, styles.buttonCancel]}
                onPress={() => {
                  setModalVisible(false);
                  setCodigo('');
                  setErrorCodigo('');
                }}
              >
                <Text style={styles.buttonText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.modalButton, styles.buttonSuccess]}
                onPress={verificarCodigo}
              >
                <Text style={styles.buttonText}>ACEPTAR</Text>
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
            <Text style={[styles.modalTitle, {color: COLOR_DANGER}]}>
              ⚠️ ¿Seguro que quieres salir de la aplicación?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.button, styles.modalButton, styles.buttonDanger]}
                onPress={handleBackConfirm}
              >
                <Text style={styles.buttonText}>SALIR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.modalButton, styles.buttonPrimary]}
                onPress={handleBackCancel}
              >
                <Text style={styles.buttonText}>CANCELAR</Text>
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
  // --- LAYOUT Y ENCABEZADO ---
  safeArea: {
    flex: 1,
    backgroundColor: COLOR_PRIMARY, // Fondo primario para todo el área
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingTop: 15,
    backgroundColor: COLOR_PRIMARY, // Asegura que el header sea azul oscuro
  },
  headerTitle: {
    fontSize: 24,
    color: COLOR_ACCENT, // Título principal en Dorado
    fontWeight: '900',
    marginBottom: 5,
  },
  logo: {
    width: 350,
    height: 100,
    resizeMode: 'contain',
  },
  // --- GRID DE BOTONES ---
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // Mejor espaciado
    width: '90%',
    marginTop: 10,
  },
  item: {
    width: '45%', // Ligeramente más ancho para mejor visualización
    alignItems: 'center',
    marginBottom: 25,
  },
  // Botón: Estilo de Tarjeta Flotante
  button: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF', // Fondo blanco para todos por defecto
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20, // Bordes suaves
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2, // Sombra más prominente
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: COLOR_ACCENT, // Borde dorado para todos los botones
  },
  cameraButton: {
    // Se mantiene vacío pero se conserva por si se necesitan otros estilos específicos
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
  label: {
    marginTop: 0,
    fontSize: 16,
    color: '#FFFFFF', // Etiquetas en blanco sobre fondo azul oscuro
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoutLabel: {
    color: COLOR_DANGER, // Texto rojo para Cerrar Sesión
    fontWeight: 'bold',
    fontSize: 18,
  },
  officeLabel: {
    color: COLOR_ACCENT, // Texto Dorado para Acceso a Oficina
    fontWeight: 'bold',
  },
  // --- MODAL GENERAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Fondo más oscuro
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { // Modal de Código/Salida
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    width: 300,
    elevation: 10,
  },
  modalTitle: {
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: COLOR_TEXT_DARK,
  },
  input: { // Input estandarizado para modales
    borderWidth: 2,
    borderColor: COLOR_LIGHT_GRAY,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: '#F7F7F7',
    color: COLOR_PRIMARY,
    fontWeight: 'bold',
  },
  errorText: {
    color: COLOR_DANGER,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalButton: {
    width: 110,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
  buttonCancel: { // Botón Cancelar (Gris)
    backgroundColor: '#999999',
  },
  modalAcceptButton: {
    backgroundColor: COLOR_SUCCESS,
  },
  buttonSuccess: { // Botón Aceptar (Verde)
    backgroundColor: COLOR_SUCCESS,
  },
  buttonPrimary: { // Botón Aceptar Salida (Azul)
    backgroundColor: COLOR_PRIMARY,
  },
  buttonDanger: { // Botón Salir (Rojo)
    backgroundColor: COLOR_DANGER,
  },
  closeButton: {
    width: 150,
    backgroundColor: COLOR_PRIMARY,
    borderRadius: 30,
    paddingVertical: 10,
    marginTop: 15,
  },
  // --- MODAL DE FOTO ---
  photoModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    width: 300,
    elevation: 10,
    alignItems: 'center',
  },
  photoModalLogo: {
    width: 180, 
    height: 50, 
    resizeMode: 'contain', 
    alignSelf: 'center', 
    marginBottom: 10
  },
  photoModalImage: {
    width: 250, 
    height: 200, 
    borderRadius: 8, 
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLOR_ACCENT,
  },
  photoModalData: {
    alignSelf: 'stretch',
    paddingHorizontal: 5,
  },
  photoModalText: {
    textAlign: 'left', 
    marginBottom: 3,
    fontSize: 12,
    color: COLOR_TEXT_DARK
  }
});