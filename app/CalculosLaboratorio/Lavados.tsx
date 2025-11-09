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

const SIEVES = [
  { id: '10', label: 'No.10' }, // Modificado la etiqueta para mayor claridad
  { id: '20', label: 'No.20' },
  { id: '40', label: 'No.40' },
  { id: '60', label: 'No.60' },
  { id: '100', label: 'No.100' },
  { id: '200', label: 'No.200' },
  { id: 'Pasa200', label: 'Pasa No.200' },
];

export default function Lavados() {
  const [Paso4, setPaso4] = useState('');
  const [retained, setRetained] = useState(
    SIEVES.reduce((acc, s) => ({ ...acc, [s.id]: '0' }), {} as Record<string, string>)
  );

  const scrollRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Calcular el valor de "Pasa 200" automáticamente
  const autoRetained = useMemo<Record<string, string>>(() => {
    const sum = SIEVES
      .filter(s => s.id !== 'Pasa200')
      .reduce((acc, s) => acc + (parseFloat(retained[s.id]) || 0), 0);
    // Asumiendo que el peso total de la muestra es 200g (de ahí la fórmula original)
    const pesoMuestra = 200; 
    const pasa200 = (pesoMuestra - sum);
    return { ...retained, Pasa200: pasa200.toFixed(2) };
  }, [retained]);

  const rows = useMemo(() => {
    let prevPassed = 100;
    const paso4Num = parseFloat(Paso4) || 0;
    
    // Suma acumulada para el cálculo de % Pasa
    let sumPctRetenido = 0;

    return SIEVES.map((sieve, idx) => {
      const w = parseFloat(autoRetained[sieve.id]) || 0;
      
      // % retenido parcial respecto a los 200g de muestra de lavado: (w / 200) * 100
      const pctRetenidoParcial = (w / 200) * 100;
      
      // % Retenido: Se aplica el % Paso 4 de la granulometría: (% Retenido Parcial * Paso4) / 100
      const pctRaw = (pctRetenidoParcial * paso4Num) / 100;

      // Usamos el % Retenido acumulado para calcular el % Pasa
      sumPctRetenido += pctRaw;
      
      const passed = paso4Num - sumPctRetenido;
      
      // El último % Pasa debe ser 0, ya que es la suma de los que pasan el No.200
      const finalPassed = sieve.id === 'Pasa200' ? '0.00' : passed.toFixed(2);


      return {
        id: sieve.id,
        label: sieve.label,
        peso: w.toFixed(2), // Peso Retenido
        pct: pctRaw.toFixed(2), // % Retenido (respecto al total original)
        pctRounded: sumPctRetenido.toFixed(2), // % Retenido Acumulado
        passed: finalPassed, // % Pasa
      };
    });
  }, [autoRetained, Paso4]);

  // Permitir solo números y un punto decimal
  const cleanDecimalInput = (text: string) => {
    let clean = text.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    return clean;
  };

  const onChangeRetained = (id: string, text: string) => {
    if (id === 'Pasa200') return; // No permitir edición directa
    setRetained(r => ({ ...r, [id]: cleanDecimalInput(text) }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR_PRIMARY }}>
        <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {/* Título principal con estilo de marca */}
            <Text style={styles.title}>Cálculo de Lavados</Text>
            
            {/* Tarjeta de Entrada de Datos */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>1. Dato de Entrada</Text>
                <LabelledInput
                    label="% Que pasó el tamiz No.4 (de Granulometría)"
                    value={Paso4}
                    onChange={text => setPaso4(cleanDecimalInput(text))}
                    placeholder="Ej: 98.5"
                />
            </View>

            {/* Tarjeta de la Tabla */}
            <View style={styles.cardTable}>
                <Text style={styles.sectionTitle}>2. Tabla de Análisis por Lavado</Text>
                
                {/* Encabezado de tabla (MANTENIENDO ESTRUCTURA) */}
                <View style={styles.tableHeader}>
                    {['Malla', 'Retenido', '% Retenido Parc.', '% Retenido acum.', '% Pasa'].map(t => (
                        <Text key={t} style={styles.cellHeader}>
                            {t}
                        </Text>
                    ))}
                </View>

                {/* Filas de la tabla (MANTENIENDO ESTRUCTURA) */}
                {rows.map(item => (
                    <View key={item.id} style={[styles.row, item.id === 'Pasa200' && styles.rowFinal]}>
                        <Text style={[styles.cell, item.id === 'Pasa200' && styles.finalLabel]}>{item.label}</Text>
                        
                        {/* Campo de Retenido */}
                        {item.id === 'Pasa200' ? (
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
                        
                        {/* Mostrar porcentajes */}
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
        keyboardType="decimal-pad"
        inputMode="decimal"
        value={value}
        onChangeText={onChange}
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
  // Modificado: Usar el fondo claro y SafeAreaView
  keyboardAvoiding: {
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
    borderColor: COLOR_LIGHT_GRAY, // Gris claro
    fontWeight: '500',
    color: COLOR_TEXT_DARK,
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
    backgroundColor: '#FFFAE6', // Fondo ligeramente dorado/claro para la última fila
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
    color: COLOR_ACCENT, // Dorado para la columna de % Pasa final
    fontWeight: '700',
  },
  finalLabel: {
    fontWeight: 'bold',
    color: COLOR_PRIMARY,
  }
});