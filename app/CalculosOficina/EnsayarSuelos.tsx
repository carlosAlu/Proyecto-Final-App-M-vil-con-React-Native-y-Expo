import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// *** CONSTANTES DE MARCA ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND = '#F5F5F5'; // Fondo Suave
const COLOR_TEXT_DARK = '#333333';
const COLOR_LIGHT_GRAY = '#E0E0E0'; // Borde sutil

export default function EnsayarSuelos() {
  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  
  // Variables para cada label visible en el formulario
  const [fecha, setFecha] = useState(getToday());
  const [obra, setObra] = useState('');
  const [cliente, setCliente] = useState('');
  const [muestra, setMuestra] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [tecnico, setTecnico] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Función de limpieza para inputs de texto (no numéricos)
  const cleanTextInput = (text: string) => text;

  // Verifica si un texto contiene solo números o es vacío
  const isOnlyNumbers = (text: string) => {
    return /^[0-9]+$/.test(text);
  };


  // Función para guardar el ensayo (SIN CAMBIOS FUNCIONALES)
  const guardarEnsayo = async () => {
  try {
    // --- VALIDACIONES ---

    // Validar fecha (que no sea menor a hoy)
    const today = new Date(getToday());
    const inputDate = new Date(fecha);

    if (inputDate < today) {
      Alert.alert("Fecha inválida", "La fecha no puede ser menor al día de hoy.");
      return;
    }

    // Validar campos vacíos
    if (!obra || !cliente || !muestra || !ubicacion || !tecnico) {
      Alert.alert("Campos incompletos", "Todos los campos deben estar llenos.");
      return;
    }

    // Validar que los textos NO sean solo números
    const campos = [
      { label: "Obra", value: obra },
      { label: "Cliente", value: cliente },
      { label: "Muestra", value: muestra },
      { label: "Ubicación", value: ubicacion },
      { label: "Técnico", value: tecnico },
    ];

    for (const campo of campos) {
      if (isOnlyNumbers(campo.value)) {
        Alert.alert(
          "Dato inválido",
          `${campo.label} no puede contener solo números.`
        );
        return;
      }
    }

    // -----------------------------------------------

    const lastIdSuelosStr = await AsyncStorage.getItem('EnsayesSuelos_lastId');
    const lastIdConcretoStr = await AsyncStorage.getItem('EnsayesConcreto_lastId');
    const lastIdSuelos = lastIdSuelosStr ? parseInt(lastIdSuelosStr, 10) : 0;
    const lastIdConcreto = lastIdConcretoStr ? parseInt(lastIdConcretoStr, 10) : 0;
    const newId = Math.max(lastIdSuelos, lastIdConcreto) + 1;

    const datos = {
      id: newId,
      fecha,
      obra,
      cliente,
      muestra,
      ubicacion,
      tecnico,
    };

    const tablaStr = await AsyncStorage.getItem('EnsayesSuelos');
    const tabla = tablaStr ? JSON.parse(tablaStr) : [];

    tabla.push(datos);

    await AsyncStorage.setItem('EnsayesSuelos', JSON.stringify(tabla));
    await AsyncStorage.setItem('EnsayesSuelos_lastId', newId.toString());

    Alert.alert('¡Guardado!', `El número de ensayo es: ${newId}`);

    setFecha(getToday());
    setObra('');
    setCliente('');
    setMuestra('');
    setUbicacion('');
    setTecnico('');
  } catch (error) {
    Alert.alert('Error', 'No se pudo guardar el ensayo.');
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR_PRIMARY }}>
        <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Registro de Ensayes de Suelos</Text>
            
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Datos de Muestra y Trazabilidad</Text>
                
                {/* Campos de entrada */}
                <CustomInput 
                    label="Fecha de muestreo:" 
                    value={fecha} 
                    setValue={setFecha} 
                    cleanInput={cleanTextInput} 
                    editable={false} 
                    placeholder={getToday()}
                    highlightReadOnly={true}
                />
                <CustomInput label="Obra:" value={obra} setValue={setObra} cleanInput={cleanTextInput} placeholder="Nombre o clave de la obra" />
                <CustomInput label="Cliente o empresa:" value={cliente} setValue={setCliente} cleanInput={cleanTextInput} placeholder="Ej: Constructora Delta" />
                <CustomInput label="Muestra de:" value={muestra} setValue={setMuestra} cleanInput={cleanTextInput} placeholder="Ej: Base hidráulica, Tepetate" />
                <CustomInput label="Ubicación de muestreo:" value={ubicacion} setValue={setUbicacion} cleanInput={cleanTextInput} placeholder="Ej: Eje 3, KM 5+200" />
                <CustomInput label="Técnico a cargo:" value={tecnico} setValue={setTecnico} cleanInput={cleanTextInput} placeholder="Nombre del técnico" />
                
                <TouchableOpacity style={[styles.button, { backgroundColor: COLOR_ACCENT }]} onPress={guardarEnsayo}>
                    <Text style={[styles.buttonText, { color: COLOR_PRIMARY }]}>GUARDAR ENSAYE</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Componente CustomInput estandarizado y mejorado
function CustomInput({
  label,
  value,
  setValue,
  numeric,
  editable = true,
  cleanInput = (t: string) => t,
  placeholder,
  highlightReadOnly = false,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  numeric?: boolean;
  editable?: boolean;
  cleanInput?: (t: string) => string;
  placeholder?: string;
  highlightReadOnly?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          !editable && (highlightReadOnly ? styles.readOnlyHighlight : styles.readOnly),
        ]}
        value={value}
        onChangeText={(text) => setValue(cleanInput(text))}
        placeholder={placeholder || `Escribe ${label.toLowerCase()}`}
        placeholderTextColor="#999"
        keyboardType={numeric ? 'numeric' : 'default'}
        editable={editable}
        selectTextOnFocus={editable}
        returnKeyType="next"
      />
    </View>
  );
}

// Estilos estandarizados de la marca
const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND,
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLOR_BACKGROUND,
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    color: COLOR_PRIMARY,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1.5,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  // Tarjeta Flotante
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
  },
  // Título principal de la tarjeta
  sectionTitle: {
    fontSize: 18,
    color: COLOR_PRIMARY,
    fontWeight: '700',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: COLOR_ACCENT,
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: COLOR_PRIMARY,
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '500',
  },
  // Input Estandarizado
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    textAlign: 'left',
    borderWidth: 2,
    borderColor: COLOR_LIGHT_GRAY,
    fontWeight: '500',
    color: COLOR_TEXT_DARK,
  },
  readOnly: {
    backgroundColor: '#F7F7F7',
    borderColor: '#C3D1E6',
    color: '#888',
  },
  readOnlyHighlight: {
    backgroundColor: '#FFFAE6', // Fondo amarillo suave
    borderColor: COLOR_ACCENT,
    fontWeight: '600',
    color: COLOR_TEXT_DARK,
  },
  // Botón de Acción Principal (Dorado/Azul)
  button: {
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Estilos de resultados/errores (mantenidos por consistencia)
  cardResult: {},
  resultText: {},
  resultValue: {},
  errorText: {},
});