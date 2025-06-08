import React, { useState, useRef, useLayoutEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { useNavigation } from 'expo-router';

/**
 * Componente principal para cálculo de morteros
 */
export default function Morteros() {
  // Estado para carga ingresada por el usuario
  const [carga, setCarga] = useState('');

  // Estado para resistencia característica (fc)
  const [fc, setFc] = useState('');

  // Estado para resultado calculado (resistencia final)
  const [resistencia, setResistencia] = useState<number | null>(null);

  // Estado para mensajes de error de validación
  const [error, setError] = useState('');

  // Referencia para controlar el ScrollView
  const scrollRef = useRef<ScrollView>(null);

  // Hook para ocultar header de navegación
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /**
   * Función que valida entradas y calcula la resistencia
   */
  const handleCalcular = () => {
    setError('');
    setResistencia(null);

    const cargaNum = parseFloat(carga);
    const fcNum = parseFloat(fc);
    const areaConstante = 25;

    if (isNaN(cargaNum) || isNaN(fcNum) || cargaNum <= 0 || fcNum <= 0) {
      setError('Por favor ingresa valores válidos y mayores a cero.');
      return;
    }

    const division = cargaNum / areaConstante;
    const resistenciaFinal = division / fcNum;

    setResistencia(resistenciaFinal * 100);

    // Scroll hacia el resultado después de calcular
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Cálculo de Morteros</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de entrada</Text>
          <CustomInput label="Carga" value={carga} setValue={setCarga} />
          <CustomInput label="F'C" value={fc} setValue={setFc} />

          <TouchableOpacity style={styles.button} onPress={handleCalcular}>
            <Text style={styles.buttonText}>Calcular</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardResult}>
          <Text style={styles.sectionTitle}>Resultado</Text>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            resistencia !== null && (
              <Text style={styles.resultText}>
                Resistencia:{' '}
                <Text style={styles.resultValue}>{resistencia.toFixed(4)}</Text>
              </Text>
            )
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Componente reutilizable para entrada numérica con etiqueta
 */
function CustomInput({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        placeholder={`Escribe ${label.toLowerCase()}`}
        placeholderTextColor="#aaa"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#0057B7',
  },
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
    shadowOpacity: 0.1,
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
    shadowOpacity: 0.1,
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
    color: '#000',
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
