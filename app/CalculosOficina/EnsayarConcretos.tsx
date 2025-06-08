import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EnsayarConcretos() {
  // Variables para cada label
  const [obra, setObra] = useState('');
  const [claveReporte, setClaveReporte] = useState('');
  const [fecha, setFecha] = useState('');
  const [noMuestra, setNoMuestra] = useState('');
  const [noEspecimenes, setNoEspecimenes] = useState('');
  const [noRemision, setNoRemision] = useState('');
  const [elementoColado, setElementoColado] = useState('');
  const [fc, setFc] = useState('');
  const [revenimientoProyecto, setRevenimientoProyecto] = useState('');
  const [revenimientoObra, setRevenimientoObra] = useState('');
  const [equipoMezclado, setEquipoMezclado] = useState('');
  const [nombreConcretera, setNombreConcretera] = useState('');
  const [cementoMarcaTipo, setCementoMarcaTipo] = useState('');
  const [aditivo, setAditivo] = useState('');
  const [vibradorUtilizado, setVibradorUtilizado] = useState('');
  const [claveEquipoUtilizado, setClaveEquipoUtilizado] = useState('');
  const [diasRuptura, setDiasRuptura] = useState('');
  const [horaInicioColado, setHoraInicioColado] = useState('');
  const [horaTerminoColado, setHoraTerminoColado] = useState('');
  const [horaElaboracionEspecimen, setHoraElaboracionEspecimen] = useState('');
  const [camionRevolvedor, setCamionRevolvedor] = useState('');
  const [temperaturaConcreto, setTemperaturaConcreto] = useState('');
  const [temperaturaAmbiente, setTemperaturaAmbiente] = useState('');
  const [tipoEspecimen, setTipoEspecimen] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Función para guardar el ensaye dependiendo del número de especímenes
  const guardarEnsaye = async () => {
    try {
      // Validar rango de especímenes
      const cantidad = parseInt(noEspecimenes, 10) || 1;
      if (cantidad < 1 || cantidad > 5) {
        Alert.alert('Error', 'El número de especímenes debe ser entre 1 y 5.');
        return;
      }

      // Obtener el último ID de EnsayesConcreto
      const lastIdConcretoStr = await AsyncStorage.getItem('EnsayesConcreto_lastId');
      const lastIdConcreto = lastIdConcretoStr ? parseInt(lastIdConcretoStr, 10) : 0;

      // Obtener el último ID de EnsayesSuelos
      const lastIdSuelosStr = await AsyncStorage.getItem('EnsayesSuelos_lastId');
      const lastIdSuelos = lastIdSuelosStr ? parseInt(lastIdSuelosStr, 10) : 0;

      // Usar el mayor de ambos y sumarle 1
      let newId = Math.max(lastIdConcreto, lastIdSuelos) + 1;

      // Obtener la tabla actual
      const tablaStr = await AsyncStorage.getItem('EnsayesConcreto');
      const tabla = tablaStr ? JSON.parse(tablaStr) : [];

      // Guardar cada espécimen con un ID único
      for (let i = 0; i < cantidad; i++) {
        const datos = {
          id: newId,
          obra,
          claveReporte,
          fecha,
          noMuestra,
          noEspecimenes,
          noRemision,
          elementoColado,
          fc,
          revenimientoProyecto,
          revenimientoObra,
          equipoMezclado,
          nombreConcretera,
          cementoMarcaTipo,
          aditivo,
          vibradorUtilizado,
          claveEquipoUtilizado,
          diasRuptura,
          horaInicioColado,
          horaTerminoColado,
          horaElaboracionEspecimen,
          camionRevolvedor,
          temperaturaConcreto,
          temperaturaAmbiente,
          tipoEspecimen,
        };
        tabla.push(datos);
        newId++;
      }

      // Guardar la tabla y el nuevo lastId
      await AsyncStorage.setItem('EnsayesConcreto', JSON.stringify(tabla));
      await AsyncStorage.setItem('EnsayesConcreto_lastId', (newId - 1).toString());

      // Mostrar alerta con el rango de ensayes
      const primerId = newId - cantidad;
      const ultimoId = newId - 1;
      Alert.alert(
        '¡Guardado!',
        cantidad === 1
          ? `El número de ensaye es: ${primerId}`
          : `Los números de ensaye son: ${primerId} al ${ultimoId}`
      );

      // Limpiar los campos después de guardar
      setObra('');
      setClaveReporte('');
      setFecha('');
      setNoMuestra('');
      setNoEspecimenes('');
      setNoRemision('');
      setElementoColado('');
      setFc('');
      setRevenimientoProyecto('');
      setRevenimientoObra('');
      setEquipoMezclado('');
      setNombreConcretera('');
      setCementoMarcaTipo('');
      setAditivo('');
      setVibradorUtilizado('');
      setClaveEquipoUtilizado('');
      setDiasRuptura('');
      setHoraInicioColado('');
      setHoraTerminoColado('');
      setHoraElaboracionEspecimen('');
      setCamionRevolvedor('');
      setTemperaturaConcreto('');
      setTemperaturaAmbiente('');
      setTipoEspecimen('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el ensaye.');
    }
  };

  // Nueva función para limitar el valor de noEspecimenes
  const handleNoEspecimenesChange = (text: string) => {
    let value = text.replace(/[^0-9]/g, '');
    if (value) {
      let num = parseInt(value, 10);
      if (num < 1) num = 1;
      if (num > 5) num = 5;
      setNoEspecimenes(num.toString());
    } else {
      setNoEspecimenes('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0057B7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Ensayar Concretos</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de entrada</Text>
          <CustomInput label="Obra" value={obra} setValue={setObra} />
          <CustomInput label="Clave reporte" value={claveReporte} setValue={setClaveReporte} />
          <CustomInput label="Fecha" value={fecha} setValue={setFecha} />
          <CustomInput label="No. Muestra" value={noMuestra} setValue={setNoMuestra} numeric />
          <CustomInput label="No. Especimenes (máximo 5)" value={noEspecimenes} setValue={handleNoEspecimenesChange} numeric min={1} max={5} />
          <CustomInput label="No.Remision" value={noRemision} setValue={setNoRemision} numeric />
          <CustomInput label="Elemento colado" value={elementoColado} setValue={setElementoColado} />
          <CustomInput label="F´C" value={fc} setValue={setFc} numeric />
          <CustomInput label="Revenimiento del proyecto" value={revenimientoProyecto} setValue={setRevenimientoProyecto} numeric />
          <CustomInput label="Revenimiento en obra" value={revenimientoObra} setValue={setRevenimientoObra} numeric />
          <CustomInput label="Equipo de mezclado" value={equipoMezclado} setValue={setEquipoMezclado} />
          <CustomInput label="Nombre de la concretera" value={nombreConcretera} setValue={setNombreConcretera} />
          <CustomInput label="Cemento marca y tipo" value={cementoMarcaTipo} setValue={setCementoMarcaTipo} />
          <CustomInput label="Aditivo" value={aditivo} setValue={setAditivo} />
          <CustomInput label="Vibrador utilizado" value={vibradorUtilizado} setValue={setVibradorUtilizado} />
          <CustomInput label="Clave de equipo utilizado" value={claveEquipoUtilizado} setValue={setClaveEquipoUtilizado} />
          <CustomInput label="Dias para ruptura" value={diasRuptura} setValue={setDiasRuptura} numeric />
          <CustomInput label="Hora de inicio del colado" value={horaInicioColado} setValue={setHoraInicioColado} />
          <CustomInput label="Hora de termino del colado" value={horaTerminoColado} setValue={setHoraTerminoColado} />
          <CustomInput label="Hora de elaboracion del especimen" value={horaElaboracionEspecimen} setValue={setHoraElaboracionEspecimen} />
          <CustomInput label="Camion revolvedor" value={camionRevolvedor} setValue={setCamionRevolvedor} />
          <CustomInput label="Temperatura del concreto" value={temperaturaConcreto} setValue={setTemperaturaConcreto} numeric />
          <CustomInput label="Temperatura ambiente" value={temperaturaAmbiente} setValue={setTemperaturaAmbiente} numeric />
          <CustomInput label="Tipo de especimen (Cilindro, viga o Mortero)" value={tipoEspecimen} setValue={setTipoEspecimen} />
          <TouchableOpacity style={styles.button} onPress={guardarEnsaye}>
            <Text style={styles.buttonText}>Ensayar</Text>
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
  min,
  max,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  numeric?: boolean;
  min?: number;
  max?: number;
}) {
  const handleChange = (text: string) => {
    if (numeric) {
      let filtered = text.replace(/[^0-9]/g, '');
      if (filtered) {
        let num = parseInt(filtered, 10);
        if (typeof min === 'number' && num < min) num = min;
        if (typeof max === 'number' && num > max) num = max;
        setValue(num.toString());
      } else {
        setValue('');
      }
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