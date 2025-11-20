import { useNavigation } from 'expo-router';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// *** CONSTANTES DE MARCA (Para consistencia) ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND = '#F5F5F5'; // Fondo Suave
const COLOR_TEXT_DARK = '#333333'; // Texto oscuro para fondo claro
const COLOR_LIGHT_GRAY = '#E0E0E0'; // Borde sutil

// Constante con las mallas de tamizado y sus etiquetas
const SIEVES = [
  { id: '2"', label: '2″' },
  { id: '1½"', label: '1 ½″' },
  { id: '1"', label: '1″' },
  { id: '¾"', label: '¾″' },
  { id: '½"', label: '½″' },
  { id: '⅜"', label: '⅜″' },
  { id: '¼"', label: '¼″' },
  { id: 'No.4', label: 'No.4' },
  { id: 'PasaNo4', label: 'Pasa No.4' },
];

export default function ContenidoAsfalto() {
  // Estados para peso bruto, tara y volumen
  const [gross, setGross] = useState('');
  const [tare, setTare] = useState('');
  const [volume, setVolume] = useState('');

  // Estado para pesos retenidos por cada malla, inicializado con ceros
  const [retained, setRetained] = useState(
    SIEVES.reduce((acc, s) => ({ ...acc, [s.id]: '0' }), {} as Record<string, string>)
  );

  // Referencia para el ScrollView
  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  // Ocultar header en la navegación
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Función para sanitizar la entrada (permite números y punto decimal)
  const cleanDecimalInput = (text: string) => {
    let clean = text.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    return clean;
  };

  // Calcular peso neto: bruto - tara
  const net = useMemo(() => (+gross || 0) - (+tare || 0), [gross, tare]);

  // Calcular peso volumétrico: (neto / volumen) * 1000 si ambos > 0
  const volumetric = useMemo(
    () => (net > 0 && +volume > 0 ? (net / +volume) * 1000 : 0),
    [net, volume]
  );

  // Generar filas para la tabla con cálculos de peso retenido y porcentajes
  const rows = useMemo(() => {
    let prevPassed = 100;
    let sumRet = 0;

    return SIEVES.map((sieve, idx) => {
      let w = 0;
      if (sieve.id === 'PasaNo4') {
        // Peso retenido en la última malla es la diferencia restante
        w = net - sumRet;
      } else {
        w = +retained[sieve.id] || 0;
        sumRet += w;
      }

      // % retenido parcial basado en peso neto
      const pctRaw = net > 0 ? (w / net) * 100 : 0;
      const pctRounded = Math.round(pctRaw);

      // % pasa calculado como diferencia acumulada de retenidos
      const passed = idx === 0 ? 100 - pctRounded : prevPassed - pctRounded;
      prevPassed = passed;

      return {
        id: sieve.id,
        label: sieve.label,
        peso: w.toFixed(2), // Usamos toFixed para consistencia
        pct: pctRaw.toFixed(2),
        pctRounded: pctRounded.toString(),
        passed: passed.toString(),
      };
    });
  }, [retained, net]);

  // Función para manejar cambios en los pesos retenidos, solo números y decimales
  const onChangeRetained = (id: string, text: string) => {
    setRetained(r => ({ ...r, [id]: cleanDecimalInput(text) }));
  };

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
            <Text style={styles.title}>Cálculo de Contenido de Asfalto</Text>

            {/* Sección de entrada de datos */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>1. Datos de la Muestra</Text>
                <LabelledInput 
                    label="Peso Bruto (g)" 
                    value={gross} 
                    onChange={setGross}
                    placeholder="Ej: 5250"
                    cleanInput={cleanDecimalInput}
                />
                <LabelledInput 
                    label="Tara (g)" 
                    value={tare} 
                    onChange={setTare}
                    placeholder="Ej: 250"
                    cleanInput={cleanDecimalInput}
                />
                <LabelledInput 
                    label="Volumen (L)" 
                    value={volume} 
                    onChange={setVolume}
                    placeholder="Ej: 2.5"
                    cleanInput={cleanDecimalInput}
                />
                <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>
                        Peso Neto: <Text style={styles.resultValue}>{net.toFixed(2)} g</Text>
                    </Text>
                    <Text style={styles.resultLabel}>
                        Peso Volumétrico: <Text style={styles.resultValue}>{volumetric.toFixed(2)} g/L</Text>
                    </Text>
                </View>
            </View>

            {/* Tabla de resultados */}
            <View style={styles.cardTable}>
                <Text style={styles.sectionTitle}>2. Tabla de Análisis de Agregados</Text>
                <View style={styles.tableHeader}>
                    {['Malla', 'Retenido (g)', '% Ret. Parc.', '% Ret. Acum.', '% Pasa'].map(t => (
                        <Text key={t} style={styles.cellHeader}>
                            {t}
                        </Text>
                    ))}
                </View>
                {/* Lista de filas de resultados */}
                {rows.map(item => (
                    <View key={item.id} style={[styles.row, item.id === 'PasaNo4' && styles.rowFinal]}>
                        <Text style={[styles.cell, item.id === 'PasaNo4' && styles.finalLabel]}>{item.label}</Text>
                        
                        {item.id === 'PasaNo4' ? (
                            <Text style={[styles.cell, styles.cellCalculated]}>{item.peso}</Text>
                        ) : (
                            <TextInput
                                style={styles.cellInput}
                                keyboardType="decimal-pad"
                                inputMode="decimal"
                                value={retained[item.id] === '0' ? '' : retained[item.id]}
                                editable
                                onChangeText={t => onChangeRetained(item.id, t)}
                                placeholder="0.00"
                            />
                        )}
                        <Text style={[styles.cell, styles.cellResult]}>{item.pct}</Text>
                        <Text style={[styles.cell, styles.cellResult]}>{item.pctRounded}</Text>
                        <Text style={[styles.cell, styles.cellResultFinal]}>{item.passed}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Componente reutilizable para input con etiqueta
 */
function LabelledInput({
  label,
  value,
  onChange,
  placeholder,
  cleanInput,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
  cleanInput: (t: string) => string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={t => onChange(cleanInput(t))} // Usa la función de limpieza
        placeholder={placeholder}
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
  cardTable: {
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
    marginBottom: 15,
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
    padding: 12,
    fontSize: 17,
    textAlign: 'left',
    borderWidth: 2,
    borderColor: COLOR_LIGHT_GRAY,
    fontWeight: '500',
    color: COLOR_TEXT_DARK,
  },
  // Resultados de Muestra (Neto y Volumétrico)
  resultContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  resultLabel: {
    marginTop: 5,
    fontWeight: '600',
    color: COLOR_PRIMARY,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resultValue: {
    color: COLOR_PRIMARY, // Dorado para los valores calculados
    fontWeight: '800',
    fontSize: 17,
    marginLeft: 5,
  },
  // ==================== ESTILOS DE TABLA (ESTILOS DE CONTENEDOR) ====================
  tableHeader: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: COLOR_PRIMARY, // Fondo azul oscuro para el header
    borderRadius: 6,
    paddingVertical: 4,
  },
  cellHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF', // Texto blanco para el header
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    backgroundColor: '#FFFFFF', // Fondo blanco para filas
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLOR_LIGHT_GRAY,
  },
  rowFinal: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 4,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: COLOR_TEXT_DARK,
    fontSize: 12,
    paddingVertical: 6,
  },
  cellInput: {
    flex: 1,
    borderWidth: 1,
    padding: 4,
    textAlign: 'center',
    color: COLOR_PRIMARY,
    borderColor: '#C3D1E6',
    backgroundColor: '#F7F7F7', // Fondo gris claro para campos de entrada
    borderRadius: 6,
    fontSize: 12,
  },
  cellCalculated: {
    backgroundColor: 'transparent',
    color: COLOR_PRIMARY,
    fontWeight: 'bold',
    borderWidth: 0,
    textAlign: 'center',
    padding: 4,
  },
  cellResult: {
    color: COLOR_PRIMARY, // Azul oscuro para porcentajes
    fontWeight: '600',
  },
  cellResultFinal: {
    color: COLOR_PRIMARY, // Dorado para la columna de % Pasa final
    fontWeight: '700',
  },
  finalLabel: {
    fontWeight: 'bold',
    color: COLOR_PRIMARY,
  }
});