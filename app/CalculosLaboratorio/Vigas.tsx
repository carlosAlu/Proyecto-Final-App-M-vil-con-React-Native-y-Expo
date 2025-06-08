import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from 'expo-router';

export default function Vigas() {
  // Estado para almacenar la carga ingresada por el usuario
  const [carga, setCarga] = useState('');
  // Estado para almacenar el resultado del cálculo
  const [resultado, setResultado] = useState<number | null>(null);
  // Estado para almacenar un mensaje de error si la entrada es inválida
  const [error, setError] = useState('');
  // Estado para seleccionar el tipo de módulo de ruptura ('centro' o 'lateral')
  const [tipo, setTipo] = useState<'centro' | 'lateral'>('centro');

  // Referencia para el ScrollView para poder hacer scroll automático al resultado
  const scrollRef = useRef<ScrollView>(null);
  // Hook para la navegación (ocultar el header)
  const navigation = useNavigation();

  // Oculta el header de la pantalla cuando se monta el componente
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Función que se ejecuta al presionar el botón Calcular
  const handleCalcular = () => {
    setError('');
    setResultado(null);
    const c = parseFloat(carga);
    // Validación para que la carga sea un número mayor que 0
    if (isNaN(c) || c <= 0) {
      setError('Por favor ingresa un valor válido y mayor a cero.');
      return;
    }
    // Determina el factor según el tipo seleccionado
    const factor = tipo === 'centro' ? 42 : 45;
    // Realiza el cálculo usando la fórmula dada
    const resultadoFinal = (75 / c) / factor;
    // Guarda el resultado multiplicado por 100000
    setResultado(resultadoFinal * 100000);
    // Hace scroll automático al final para mostrar el resultado
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    // KeyboardAvoidingView para manejar el teclado y evitar que tape inputs
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0057B7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Cálculo de Vigas</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de entrada</Text>
          {/* Input personalizado para la carga */}
          <CustomInput label="Carga" value={carga} setValue={setCarga} />

          <Text style={styles.inputLabel}>Módulo de ruptura:</Text>
          {/* Selector para elegir el tipo de módulo de ruptura */}
          <View style={styles.selectorContainer}>
            <TouchableOpacity
              style={[styles.selector, tipo === 'centro' && styles.selectorSelected]}
              onPress={() => setTipo('centro')}
            >
              <Text
                style={[
                  styles.selectorText,
                  tipo === 'centro' && styles.selectorTextSelected,
                ]}
              >
                42
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selector, tipo === 'lateral' && styles.selectorSelected]}
              onPress={() => setTipo('lateral')}
            >
              <Text
                style={[
                  styles.selectorText,
                  tipo === 'lateral' && styles.selectorTextSelected,
                ]}
              >
                45
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón para disparar el cálculo */}
          <TouchableOpacity style={styles.button} onPress={handleCalcular}>
            <Text style={styles.buttonText}>Calcular</Text>
          </TouchableOpacity>
        </View>

        {/* Área para mostrar el resultado o mensaje de error */}
        <View style={styles.cardResult}>
          <Text style={styles.sectionTitle}>Resultado</Text>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            resultado !== null && (
              <Text style={styles.resultText}>
                % resistencia: <Text style={styles.resultValue}>{resultado.toFixed(2)}</Text>
              </Text>
            )
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Componente reutilizable para inputs numéricos con etiqueta
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
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  selector: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C3D1E6',
  },
  selectorSelected: {
    backgroundColor: '#0057B7',
    borderColor: '#0057B7',
  },
  selectorText: {
    color: '#0057B7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectorTextSelected: {
    color: '#fff',
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
