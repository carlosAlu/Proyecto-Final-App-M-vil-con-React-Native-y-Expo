import { useNavigation } from 'expo-router';
import React, { useState, useMemo, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';

// *** CONSTANTES DE MARCA (Para consistencia) ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND = '#F5F5F5'; // Fondo Suave
const COLOR_TEXT_DARK = '#333333'; // Texto oscuro para fondo claro

// Constante con los tipos de mallas (tamices) usados en la granulometría
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

export default function Granulometrias() {
  // Estados para peso bruto, tara y volumen ingresados por el usuario
  const [gross, setGross] = useState('');
  const [tare, setTare] = useState('');
  const [volume, setVolume] = useState('');

  // Estado para pesos retenidos en cada tamiz, inicializados en cero
  const [retained, setRetained] = useState(
    SIEVES.reduce((acc, s) => ({ ...acc, [s.id]: '0' }), {} as Record<string, string>)
  );

  // Referencia para el scroll del ScrollView
  const scrollRef = useRef<ScrollView>(null);

  // Hook para ocultar el header de navegación en esta pantalla
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Peso neto = bruto - tara, recalculado cuando cambian bruto o tara
  const net = useMemo(() => (+gross || 0) - (+tare || 0), [gross, tare]);

  // Peso volumétrico = (peso neto / volumen) * 1000 (si ambos > 0)
  const volumetric = useMemo(
    () => (net > 0 && +volume > 0 ? (net / +volume) * 1000 : 0),
    [net, volume]
  );

  /**
   * Cálculo de filas para la tabla de resultados:
   * - Calcula peso retenido, % retenido parcial y acumulado, y % pasa.
   */
  const rows = useMemo(() => {
    let prevPassed = 100; // % que pasa antes del primer tamiz
    let sumRet = 0; // suma acumulada de pesos retenidos

    return SIEVES.map((sieve, idx) => {
      let pesoRetenido = 0;

      if (sieve.id === 'PasaNo4') {
        // Para el último tamiz, calcular peso retenido como resto del neto menos lo ya sumado
        pesoRetenido = net - sumRet;
      } else {
        // Para tamices intermedios, obtener peso retenido del estado retained
        pesoRetenido = +retained[sieve.id] || 0;
        sumRet += pesoRetenido;
      }

      // % retenido parcial respecto al peso neto
      const pctRaw = net > 0 ? (pesoRetenido / net) * 100 : 0;
      const pctRounded = Math.round(pctRaw);

      // % pasa es la diferencia respecto al tamiz previo
      const passed = idx === 0 ? 100 - pctRounded : prevPassed - pctRounded;
      prevPassed = passed;

      return {
        id: sieve.id,
        label: sieve.label,
        peso: pesoRetenido.toFixed(2), // Usamos toFixed para consistencia
        pct: pctRaw.toFixed(2),
        pctRounded: pctRounded.toString(),
        passed: passed.toString(),
      };
    });
  }, [retained, net]);

  // Función para actualizar el peso retenido en un tamiz, permitiendo números y punto decimal
  const onChangeRetained = (id: string, text: string) => {
    setRetained(r => ({ ...r, [id]: text.replace(/[^\d.]/g, '') }));
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
                {/* Título principal */}
                <Text style={styles.title}>Cálculo de Granulometría</Text>

                {/* Tarjeta para datos de entrada */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>1. Datos de la Muestra</Text>
                    <LabelledInput 
                        label="Peso Bruto (g)" 
                        value={gross} 
                        onChange={setGross} 
                        placeholder="Ej: 5250"
                    />
                    <LabelledInput 
                        label="Tara (g)" 
                        value={tare} 
                        onChange={setTare}
                        placeholder="Ej: 250"
                    />
                    <LabelledInput 
                        label="Volumen (L)" 
                        value={volume} 
                        onChange={setVolume}
                        placeholder="Ej: 2.5"
                    />

                    {/* Mostrar resultados calculados */}
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultLabel}>
                            Peso Neto: <Text style={styles.resultValue}>{net.toFixed(2)} g</Text>
                        </Text>
                        <Text style={styles.resultLabel}>
                            Peso Volumétrico: <Text style={styles.resultValue}>{volumetric.toFixed(2)} g/L</Text>
                        </Text>
                    </View>
                </View>

                {/* Tarjeta para tabla de resultados */}
                <View style={styles.cardTable}>
                    <Text style={styles.sectionTitle}>2. Tabla de Resultados</Text>

                    {/* Encabezado de tabla (NO MODIFICADO) */}
                    <View style={styles.tableHeader}>
                        {['Malla', 'Retenido', '% Retenido Parc.', '% Retenido acum.', '% Pasa'].map(t => (
                            <Text key={t} style={styles.cellHeader}>
                                {t}
                            </Text>
                        ))}
                    </View>

                    {/* Lista de filas de resultados (NO MODIFICADO) */}
                    {rows.map(item => (
                        <View key={item.id} style={styles.row}>
                            <Text style={styles.cell}>{item.label}</Text>

                            {/* Campo editable para pesos retenidos (excepto último tamiz) */}
                            {item.id === 'PasaNo4' ? (
                                <Text style={styles.cell}>{item.peso}</Text>
                            ) : (
                                <TextInput
                                    style={styles.cellInput}
                                    keyboardType="numeric"
                                    value={retained[item.id] === '0' ? '' : retained[item.id]} // Mostrar vacío si es '0'
                                    editable={true}
                                    onChangeText={t => onChangeRetained(item.id, t)}
                                    placeholder="0"
                                />
                            )}

                            {/* Mostrar porcentajes */}
                            <Text style={styles.cell}>{item.pct}</Text>
                            <Text style={styles.cell}>{item.pctRounded}</Text>
                            <Text style={styles.cell}>{item.passed}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Componente reutilizable para entrada con etiqueta (ESTILOS DE MARCA APLICADOS)
 */
function LabelledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={t => onChange(t.replace(/[^\d.]/g, ''))}
        placeholder={placeholder}
        placeholderTextColor="#999"
        returnKeyType="done"
      />
    </View>
  );
}

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
    borderColor: '#E0E0E0',
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
    color: COLOR_ACCENT, // Dorado para los valores calculados
    fontWeight: '800',
    fontSize: 17,
    marginLeft: 5,
  },
  // ==================== ESTILOS DE TABLA (Manteniendo la estructura original) ====================
  tableHeader: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: COLOR_PRIMARY, // Aplicando color de marca al fondo del header
    borderRadius: 6,
    paddingVertical: 4,
  },
  cellHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF', // Texto blanco para el header
    fontSize: 12, // Reducido ligeramente para caber
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    backgroundColor: '#FFFFFF', // Fondo blanco para filas
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: COLOR_TEXT_DARK, // Texto oscuro para contenido
    fontSize: 12, // Reducido ligeramente
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
    fontSize: 12, // Reducido ligeramente
  },
});