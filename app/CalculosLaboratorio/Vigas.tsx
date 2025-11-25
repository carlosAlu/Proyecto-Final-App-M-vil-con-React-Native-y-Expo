import { useNavigation } from 'expo-router';
import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
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
const COLOR_ERROR = '#D32F2F'; // Rojo de Error
const COLOR_TEXT_DARK = '#333333'; // Texto oscuro para fondo claro

export default function Vigas() {
  // ... (Estados y Referencias sin cambios)
  const [carga, setCarga] = useState('');
  const [resultado, setResultado] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [tipo, setTipo] = useState<'centro' | 'lateral'>('centro');

  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

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
      setError('Por favor ingresa un valor válido y mayor a cero para la Carga.');
      return;
    }
    
    // Determina el factor según el tipo seleccionado
    const factor = tipo === 'centro' ? 42 : 45;
    
    // Realiza el cálculo usando la fórmula dada: (75 / carga) / factor
    const resultadoFinal = (75 / c) / factor;
    
    // Guarda el resultado multiplicado por 100000 (el mismo factor que tenías)
    setResultado(resultadoFinal * 100000);
    
    // Hace scroll automático al final para mostrar el resultado
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    // Usa SafeAreaView y el color de marca
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR_PRIMARY }}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Título principal con estilo de marca */}
          <Text style={styles.title}>Cálculo de Módulo de Ruptura (Vigas)</Text>
          
          {/* Sección para ingresar datos (Tarjeta de Entradas) */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Datos de Entrada</Text>
            
            {/* Input personalizado para la carga con mejor etiqueta */}
            <CustomInput label="Carga (kg)" value={carga} setValue={setCarga} />

            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Factor de Módulo de Ruptura:</Text>
            
            {/* Selector mejorado para elegir el tipo de módulo de ruptura */}
            <View style={styles.selectorContainer}>
              <TouchableOpacity
                style={[styles.selector, tipo === 'centro' && styles.selectorSelected]}
                onPress={() => setTipo('centro')}
              >
                <Text
                  style={[
                    styles.selectorSubtext,
                    tipo === 'centro' && styles.selectorSubtextSelected
                  ]}
                >
                  Ruptura al Centro
                </Text>
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
                    styles.selectorSubtext,
                    tipo === 'lateral' && styles.selectorSubtextSelected
                  ]}
                >
                  Ruptura Lateral
                </Text>
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

            {/* Botón de cálculo, con estilo Dorado y texto Azul */}
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: COLOR_ACCENT }]} 
                onPress={handleCalcular}
            >
              <Text style={[styles.buttonText, { color: COLOR_PRIMARY }]}>CALCULAR RESISTENCIA</Text>
            </TouchableOpacity>
          </View>

          {/* Área para mostrar el resultado o mensaje de error */}
          <View style={styles.cardResult}>
            <Text style={styles.sectionTitle}>2. Resultado</Text>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              resultado !== null && (
                <View style={styles.finalResultRow}>
                    <Text style={styles.resultLabelFinal}>% de Resistencia Obtenida:</Text>
                    <Text style={styles.resultValueFinal}>
                        {resultado.toFixed(2)} %
                    </Text>
                </View>
              )
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Componente reutilizable para inputs numéricos con etiqueta (modificado)
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
        placeholder={`Ej: 3000`} // Placeholder más útil
        placeholderTextColor="#999"
        returnKeyType="done"
      />
    </View>
  );
}

// =========================================================================
// ESTILOS MODIFICADOS
// =========================================================================
const styles = StyleSheet.create({
  // Modificado: Usar las constantes de marca
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND,
  },
  selectorSubtextSelected: {
  color: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLOR_BACKGROUND,
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  // Título: Estilo de marca (Azul Oscuro, Extra Bold, Dorado)
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
  // Tarjetas (Cards): Fondo blanco, bordes suaves y sombra profunda
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
  cardResult: {
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
    alignItems: 'stretch',
  },
  // Título de Sección: Azul Oscuro, negrita, con separador Dorado
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
  // Input Group y Label
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    color: COLOR_PRIMARY,
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '500',
  },
  // Input: Fondo blanco, borde sutil, alineado a la izquierda
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    textAlign: 'left',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    fontWeight: '500',
    color: COLOR_TEXT_DARK,
  },
  // Selector: Diseño mejorado
  selectorContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    justifyContent: 'space-between', // Separación en lugar de centrado
    width: '100%',
    gap: 10,
  },
  selector: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fondo blanco por defecto
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2, // Borde más notorio
    borderColor: '#E0E0E0',
  },
  selectorSelected: {
    backgroundColor: COLOR_PRIMARY, // Azul oscuro al seleccionar
    borderColor: COLOR_PRIMARY,
  },
  selectorSubtext: { // Texto pequeño para la descripción
    color: COLOR_TEXT_DARK,
    fontSize: 12,
    marginBottom: 3,
  },
  selectorText: { // El valor (42 o 45)
    color: COLOR_PRIMARY,
    fontSize: 20,
    fontWeight: '900',
  },
  selectorTextSelected: {
    color: COLOR_ACCENT, // Dorado para el valor seleccionado
  },
  // Botón: Dorado con texto Azul Oscuro, redondeado, con sombra
  button: {
    // backgroundColor se establece inline con COLOR_ACCENT
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    // color se establece inline con COLOR_PRIMARY
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Resultados: Fila de resultado final
  finalResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: COLOR_ACCENT, // Separador final dorado
    flexWrap: 'wrap',
  },
  resultLabelFinal: {
    color: COLOR_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  resultValueFinal: {
    color: COLOR_ERROR, // Color de alto impacto para el valor clave
    fontWeight: '900',
    fontSize: 24,
  },
  // Error: Estilo de error de marca
  errorText: {
    color: COLOR_ERROR,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 5,
    padding: 10,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    textAlign: 'center',
  },
});