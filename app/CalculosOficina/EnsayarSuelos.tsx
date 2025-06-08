import React, { useState, useRef, useLayoutEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Función para guardar el ensayo evitando repetir id entre ambas tablas
  const guardarEnsayo = async () => {
    try {
      // Obtener el último ID de ambas tablas
      const lastIdSuelosStr = await AsyncStorage.getItem('EnsayesSuelos_lastId');
      const lastIdConcretoStr = await AsyncStorage.getItem('EnsayesConcreto_lastId');
      const lastIdSuelos = lastIdSuelosStr ? parseInt(lastIdSuelosStr, 10) : 0;
      const lastIdConcreto = lastIdConcretoStr ? parseInt(lastIdConcretoStr, 10) : 0;
      const newId = Math.max(lastIdSuelos, lastIdConcreto) + 1;

      // Crear el objeto de datos
      const datos = {
        id: newId,
        fecha,
        obra,
        cliente,
        muestra,
        ubicacion,
        tecnico,
      };

      // Obtener la tabla actual
      const tablaStr = await AsyncStorage.getItem('EnsayesSuelos');
      const tabla = tablaStr ? JSON.parse(tablaStr) : [];

      // Agregar el nuevo registro
      tabla.push(datos);

      // Guardar la tabla y el nuevo lastId
      await AsyncStorage.setItem('EnsayesSuelos', JSON.stringify(tabla));
      await AsyncStorage.setItem('EnsayesSuelos_lastId', newId.toString());

      // Mostrar alerta con el número de ensayo
      Alert.alert('¡Guardado!', `El número de ensayo es: ${newId}`);

      // Limpiar los campos después de guardar (fecha se vuelve a poner la actual)
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0057B7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Ensayar Suelos</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de entrada</Text>
          <CustomInput label="Fecha:" value={fecha} setValue={setFecha} editable={false} />
          <CustomInput label="Obra:" value={obra} setValue={setObra} />
          <CustomInput label="Cliente o empresa:" value={cliente} setValue={setCliente} />
          <CustomInput label="Muestra de:" value={muestra} setValue={setMuestra} />
          <CustomInput label="Ubicación de muestreo:" value={ubicacion} setValue={setUbicacion} />
          <CustomInput label="Técnico:" value={tecnico} setValue={setTecnico} />
          <TouchableOpacity style={styles.button} onPress={guardarEnsayo}>
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function CustomInput({
  label,
  value,
  setValue,
  numeric,
  editable = true,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  numeric?: boolean;
  editable?: boolean;
}) {
  const handleChange = (text: string) => {
    if (numeric) {
      setValue(text.replace(/[^0-9]/g, ''));
    } else {
      setValue(text);
    }
  };

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        placeholder={`Escribe ${label.toLowerCase()}`}
        placeholderTextColor="#aaa"
        keyboardType={numeric ? 'numeric' : 'default'}
        editable={editable}
        selectTextOnFocus={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0057B7',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardResult: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#0057B7',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: '#0057B7',
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#C3D1E6',
  },
  button: {
    backgroundColor: '#0057B7',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resultText: {
    color: '#0057B7',
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  resultValue: {
    color: '#1E88E5',
    fontWeight: 'bold',
    fontSize: 18,
  },
  errorText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
});