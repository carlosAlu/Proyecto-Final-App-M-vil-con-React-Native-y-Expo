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

export default function Cilindros() {
  // ... (Estados y Referencias sin cambios)
  const [diametro, setDiametro] = useState('');
  const [carga, setCarga] = useState('');
  const [fc, setFc] = useState('');

  const [resistencia, setResistencia] = useState<number | null>(null);
  const [area, setArea] = useState<number | null>(null);
  const [error, setError] = useState('');

  const scrollRef = useRef<ScrollView>(null);

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
      // Modificado para mostrar la unidad en el error (resistencia debería ser un porcentaje)
      setError('Por favor ingresa valores válidos y mayores a cero.');
      return;
    }

    // Calcular el área del cilindro: π * d^2 / 4
    const areaCalc = (Math.PI * d ** 2) / 4;
    setArea(areaCalc);

    // La resistencia es Carga / Área
    const resistenciaSimple = c / areaCalc;
    
    // Resistencia en porcentaje: (Resistencia real / F'c) * 100
    const resistenciaFinal = (resistenciaSimple / fcValue) * 100;

    setResistencia(resistenciaFinal);

    // Desplazar scroll hacia abajo para mostrar resultados
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    // Se envolvió en SafeAreaView para la apariencia
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
          <Text style={styles.title}>Cálculo de Resistencia de Cilindros</Text>

          {/* Sección para ingresar datos (Tarjeta de Entradas) */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>1. Datos de Entrada</Text>
            {/* Campos de entrada personalizados */}
            <CustomInput label="Diámetro (cm)" value={diametro} setValue={setDiametro} />
            <CustomInput label="Carga (kg)" value={carga} setValue={setCarga} />
            <CustomInput label="Resistencia f'c" value={fc} setValue={setFc} />

            {/* Botón para iniciar cálculo */}
            <TouchableOpacity 
                style={[styles.button, { backgroundColor: COLOR_ACCENT }]} 
                onPress={handleCalcular}
            >
              <Text style={[styles.buttonText, { color: COLOR_PRIMARY }]}>CALCULAR RESISTENCIA</Text>
            </TouchableOpacity>
          </View>

          {/* Sección de resultados (Tarjeta de Salida) */}
          <View style={styles.cardResult}>
            <Text style={styles.sectionTitle}>2. Resultados</Text>
            {/* Mostrar error si existe */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <>
                {/* Mostrar área calculada */}
                {area !== null && (
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Área del Cilindro:</Text>
                    <Text style={styles.resultValue}>{area.toFixed(2)} cm²</Text>
                  </View>
                )}
                {/* Mostrar resistencia calculada */}
                {resistencia !== null && (
                  <>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Resistencia (f'c):</Text>
                        <Text style={styles.resultValueMajor}>
                            {area ? (parseFloat(carga) / area).toFixed(2) : '0'} kgf/cm²
                        </Text>
                    </View>
                    <View style={[styles.resultRow, styles.finalResultRow]}>
                        <Text style={styles.resultLabelFinal}>% de Resistencia Obtenida:</Text>
                        <Text style={styles.resultValueFinal}>
                           {resistencia.toFixed(2)} %
                        </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
        placeholder={`Ej: ${label.includes('f\'c') ? '210' : '15.2'}`} // Placeholders más útiles
        placeholderTextColor="#999"
        returnKeyType="done"
      />
    </View>
  );
}

// =========================================================================
// CAMBIOS DE ESTILO (LÍNEA POR LÍNEA)
// =========================================================================
const styles = StyleSheet.create({
  // Modificado: Usar el fondo muy claro para el ScrollView, y el azul oscuro en el SafeAreaView para la barra de estado
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND, // Fondo suave
  },
  container: {
    flexGrow: 1,
    backgroundColor: COLOR_BACKGROUND, // Fondo suave
    alignItems: 'center',
    padding: 20, // Padding ligeramente menor
    paddingBottom: 40,
  },
  // Mejorado: Título más grande, con color de marca y más impacto
  title: {
    fontSize: 24, // Tamaño ajustado para ser elegante
    color: COLOR_PRIMARY, // Color Azul de Marca
    fontWeight: '900', // Extra bold
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1.5,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  // Mejorado: Card más prominente, color blanco puro
  card: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, // Radio un poco más suave
    padding: 20,
    width: '100%',
    maxWidth: 400, // Max width ajustado
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 }, // Sombra más profunda
    shadowRadius: 10,
    elevation: 8,
  },
  // Mejorado: Card de resultado separada de la de entrada
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
    alignItems: 'stretch', // Alineación cambiada para resultados
  },
  // Mejorado: Título de sección más claro con línea separadora
  sectionTitle: {
    fontSize: 18,
    color: COLOR_PRIMARY,
    fontWeight: '700',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 2, // Línea separadora
    borderBottomColor: COLOR_ACCENT, // Color dorado en la línea
    textAlign: 'left', // Alineado a la izquierda para un look más formal
  },
  // Pequeño ajuste de margen
  inputGroup: {
    marginBottom: 18,
  },
  // Mejorado: Etiqueta con fuente más oscura
  inputLabel: {
    color: COLOR_PRIMARY,
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '500', // Menos negrita que el título, más legible
  },
  // Mejorado: Input con fondo blanco y borde más sutil
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF', // Fondo blanco, el contraste lo da el padding
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    textAlign: 'left', // Alineación a la izquierda para facilidad de ingreso
    borderWidth: 2,
    borderColor: '#E0E0E0', // Borde gris claro sutil
    fontWeight: '500',
  },
  // Modificado: El botón usa el color dorado (COLOR_ACCENT) y texto azul (COLOR_PRIMARY)
  button: {
    // backgroundColor: COLOR_PRIMARY, // Esto se sobrescribe inline para usar COLOR_ACCENT
    paddingVertical: 14,
    borderRadius: 30, // Más redondeado (pastilla)
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 }, // Sombra más notoria para el botón
    shadowRadius: 6,
    elevation: 6,
  },
  // Modificado: El texto del botón usa el color azul (COLOR_PRIMARY)
  buttonText: {
    // color: '#fff', // Esto se sobrescribe inline para usar COLOR_PRIMARY
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Nuevo: Estilo para la fila de resultado (etiqueta y valor)
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // Separador sutil
    flexWrap: 'wrap',
  },
  finalResultRow: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: COLOR_ACCENT, // Separador final dorado
    borderBottomWidth: 0,
  },
  // Nuevo: Etiqueta de resultado (texto normal)
  resultLabel: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  // Nuevo: Etiqueta de resultado final
  resultLabelFinal: {
    color: COLOR_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  // Modificado: Valor de resultado (la cifra)
  resultValue: {
    color: COLOR_PRIMARY, // Azul oscuro
    fontWeight: '600',
    fontSize: 17,
    flex: 1,
    textAlign: 'right',
  },
  // Nuevo: Valor de resistencia simple
  resultValueMajor: {
    color: COLOR_PRIMARY, // Azul Oscuro
    fontWeight: '700',
    fontSize: 18,
    flex: 1,
    textAlign: 'right',
  },
  // Nuevo: Valor de resultado final (el porcentaje)
  resultValueFinal: {
    color: COLOR_ERROR, // Rojo fuerte para el valor importante
    fontWeight: '900', // Muy negrita
    fontSize: 24, // ¡Destacado!
    flex: 1,
    textAlign: 'right',
  },
  // Mejorado: Error en color de marca
  errorText: {
    color: COLOR_ERROR,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 5,
    padding: 10,
    backgroundColor: '#FFEBEE', // Fondo rojo claro para el error
    borderRadius: 8,
    textAlign: 'center',
  },
});