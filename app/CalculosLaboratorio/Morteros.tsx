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

// *** CONSTANTES DE MARCA (Para consistencia) ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND = '#F5F5F5'; // Fondo Suave
const COLOR_ERROR = '#D32F2F'; // Rojo de Error
const COLOR_TEXT_DARK = '#333333'; // Texto oscuro para fondo claro

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
    
    // Área de la pastilla de mortero (asumo 5cm x 5cm = 25 cm²)
    const areaConstante = 25; 

    if (isNaN(cargaNum) || isNaN(fcNum) || cargaNum <= 0 || fcNum <= 0) {
      setError('Por favor ingresa valores válidos y mayores a cero.');
      return;
    }

    // Cálculo de la resistencia simple: Carga / Área
    const resistenciaSimple = cargaNum / areaConstante;

    // Resistencia en porcentaje: (Resistencia simple / f'c) * 100
    const resistenciaFinal = (resistenciaSimple / fcNum) * 100;

    setResistencia(resistenciaFinal);

    // Scroll hacia el resultado después de calcular
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Se envuelve todo en SafeAreaView
  return (
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
          <Text style={styles.title}>Cálculo de Resistencia de Morteros</Text>
          
          {/* Tarjeta de Entrada de Datos */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Datos de Entrada</Text>
            
            {/* Input personalizado con mejor etiqueta */}
            <CustomInput label="Carga Máxima (kg)" value={carga} setValue={setCarga} />
            <CustomInput label="Resistencia Característica f'c (kgf/cm²)" value={fc} setValue={setFc} />

            {/* Botón de Cálculo con estilo de marca (Dorado/Azul) */}
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: COLOR_ACCENT }]} 
                onPress={handleCalcular}
            >
              <Text style={[styles.buttonText, { color: COLOR_PRIMARY }]}>CALCULAR RESISTENCIA</Text>
            </TouchableOpacity>
          </View>

          {/* Tarjeta de Resultados */}
          <View style={styles.cardResult}>
            <Text style={styles.sectionTitle}>2. Resultados</Text>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              resistencia !== null && (
                <>
                   {/* Mostramos la Resistencia Simple (Carga / Área) */}
                   <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Resistencia Simple (f'c):</Text>
                        <Text style={styles.resultValueMajor}>
                           {(parseFloat(carga) / 25).toFixed(2)} kgf/cm²
                        </Text>
                    </View>
                    {/* Mostramos el Porcentaje de Resistencia Obtenida */}
                    <View style={styles.finalResultRow}>
                        <Text style={styles.resultLabelFinal}>% de Resistencia Obtenida:</Text>
                        <Text style={styles.resultValueFinal}>
                           {resistencia.toFixed(2)} %
                        </Text>
                    </View>
                </>
              )
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
        placeholder={`Ej: ${label.includes('f\'c') ? '150' : '3800'}`} // Placeholders útiles
        placeholderTextColor="#999"
        returnKeyType="done"
      />
    </View>
  );
}

// =========================================================================
// ESTILOS ESTANDARIZADOS DE LA MARCA
// =========================================================================
const styles = StyleSheet.create({
  // Modificado: Usar el fondo claro y SafeAreaView
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
  // Título: Estilo de marca (Azul Oscuro, Extra Bold)
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
    alignItems: 'stretch', // Alineación para resultados en fila
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
  // Resultados: Fila de resultado (etiqueta y valor)
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexWrap: 'wrap',
  },
  finalResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: COLOR_ACCENT, // Separador final dorado
    flexWrap: 'wrap',
  },
  // Etiqueta de resultado (texto normal)
  resultLabel: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  // Etiqueta de resultado final
  resultLabelFinal: {
    color: COLOR_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
  },
  // Valor de resultado (la cifra)
  resultValueMajor: {
    color: COLOR_PRIMARY,
    fontWeight: '700',
    fontSize: 18,
  },
  // Valor de resultado final (el porcentaje)
  resultValueFinal: {
    color: COLOR_ERROR, // Rojo de alto impacto
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