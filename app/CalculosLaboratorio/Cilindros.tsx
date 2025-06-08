import React, { useState, useRef, useLayoutEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from 'expo-router';

export default function Cilindros() {
  // Estados para los valores de entrada
  const [diametro, setDiametro] = useState('');
  const [carga, setCarga] = useState('');
  const [fc, setFc] = useState('');

  // Estados para resultados calculados y error
  const [resistencia, setResistencia] = useState<number | null>(null);
  const [area, setArea] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Referencia para controlar el scroll del ScrollView
  const scrollRef = useRef<ScrollView>(null);

  // Hook para manipular opciones de navegación (ocultar header)
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /**
   * Función para validar entradas, calcular área y resistencia,
   * y actualizar los estados correspondientes.
   */
  const handleCalcular = () => {
    // Limpiar mensajes y resultados previos
    setError('');
    setResistencia(null);
    setArea(null);

    // Parsear valores de texto a números flotantes
    const d = parseFloat(diametro);
    const c = parseFloat(carga);
    const fcValue = parseFloat(fc);

    // Validar que los valores sean números y mayores que cero
    if (isNaN(d) || isNaN(c) || isNaN(fcValue) || d <= 0 || c <= 0 || fcValue <= 0) {
      setError('Por favor ingresa valores válidos y mayores a cero.');
      return;
    }

    // Calcular el área del cilindro: π * d^2 / 4
    const areaCalc = (Math.PI * d ** 2) / 4;
    setArea(areaCalc);

    // Calcular resistencia: (carga / área) / fc
    const resistenciaFinal = (c / areaCalc) / fcValue;
    // Convertir a porcentaje y guardar
    setResistencia(resistenciaFinal * 100);

    // Desplazar scroll hacia abajo para mostrar resultados
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
        {/* Título principal */}
        <Text style={styles.title}>Cálculo de Cilindros</Text>

        {/* Sección para ingresar datos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de entrada</Text>
          {/* Campos de entrada personalizados */}
          <CustomInput label="Diámetro" value={diametro} setValue={setDiametro} />
          <CustomInput label="Carga" value={carga} setValue={setCarga} />
          <CustomInput label="F'C" value={fc} setValue={setFc} />

          {/* Botón para iniciar cálculo */}
          <TouchableOpacity style={styles.button} onPress={handleCalcular}>
            <Text style={styles.buttonText}>Calcular</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de resultados */}
        <View style={styles.cardResult}>
          <Text style={styles.sectionTitle}>Resultados</Text>
          {/* Mostrar error si existe */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              {/* Mostrar área calculada */}
              {area !== null && (
                <Text style={styles.resultText}>
                  Área: <Text style={styles.resultValue}>{area.toFixed(2)}</Text>
                </Text>
              )}
              {/* Mostrar resistencia calculada */}
              {resistencia !== null && (
                <Text style={styles.resultText}>
                  Resistencia:{' '}
                  <Text style={styles.resultValue}>{resistencia.toFixed(4)}</Text>
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Componente reutilizable para campo de texto con etiqueta
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
      {/* Etiqueta del campo */}
      <Text style={styles.inputLabel}>{label}</Text>
      {/* Entrada numérica */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        placeholder={`Escribe ${label.toLowerCase()}`}
        placeholderTextColor="#aaa"
        returnKeyType="done"
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
