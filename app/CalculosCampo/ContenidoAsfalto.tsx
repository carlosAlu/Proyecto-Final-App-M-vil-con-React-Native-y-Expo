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
} from 'react-native';

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
        peso: w,
        pct: pctRaw.toFixed(2),
        pctRounded: pctRounded.toString(),
        passed: passed.toString(),
      };
    });
  }, [retained, net]);

  // Función para manejar cambios en los pesos retenidos, solo números
  const onChangeRetained = (id: string, text: string) => {
    setRetained(r => ({ ...r, [id]: text.replace(/[^0-9]/g, '') }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0057B7' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Contenido de asfalto</Text>

        {/* Sección de entrada de datos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de entrada</Text>
          <LabelledInput label="Peso Bruto (g)" value={gross} onChange={setGross} />
          <LabelledInput label="Tara (g)" value={tare} onChange={setTare} />
          <LabelledInput label="Volumen (L)" value={volume} onChange={setVolume} />
          <Text style={styles.result}>
            Peso Neto: <Text style={styles.resultValue}>{net.toFixed(2)} g</Text>
          </Text>
          <Text style={styles.result}>
            Peso Volumétrico: <Text style={styles.resultValue}>{volumetric.toFixed(2)} g</Text>
          </Text>
        </View>

        {/* Tabla de resultados */}
        <View style={styles.cardTable}>
          <Text style={styles.sectionTitle}>Tabla de resultados</Text>
          <View style={styles.tableHeader}>
            {['Malla', 'Retenido', '% Retenido Parc.', '% Retenido acum.', '% Pasa'].map(t => (
              <Text key={t} style={styles.cellHeader}>
                {t}
              </Text>
            ))}
          </View>
          {/* Lista de filas de resultados */}
          {rows.map(item => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.cell}>{item.label}</Text>
              {item.id === 'PasaNo4' ? (
                <Text style={styles.cell}>{item.peso}</Text>
              ) : (
                <TextInput
                  style={styles.cellInput}
                  keyboardType="numeric"
                  value={item.peso.toString()}
                  editable
                  onChangeText={t => onChangeRetained(item.id, t)}
                />
              )}
              <Text style={styles.cell}>{item.pct}</Text>
              <Text style={styles.cell}>{item.pctRounded}</Text>
              <Text style={styles.cell}>{item.passed}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Componente reutilizable para input con etiqueta
 * @param label Texto de la etiqueta
 * @param value Valor del input
 * @param onChange Función para manejar cambios en el input
 */
function LabelledInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
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
  cardTable: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxWidth: 420,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
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
  result: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#0057B7',
    fontSize: 16,
  },
  resultValue: {
    color: '#1E88E5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
  cellHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0057B7',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    backgroundColor: '#F0F4F8',
    borderRadius: 6,
    marginBottom: 4,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#0057B7',
    fontSize: 15,
    paddingVertical: 6,
  },
  cellInput: {
    flex: 1,
    borderWidth: 1,
    padding: 4,
    textAlign: 'center',
    color: '#0057B7',
    borderColor: '#C3D1E6',
    backgroundColor: '#fff',
    borderRadius: 6,
    fontSize: 15,
  },
});