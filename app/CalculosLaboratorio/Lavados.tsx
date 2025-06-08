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

const SIEVES = [
  { id: '10', label: '10' },
  { id: '20', label: '20' },
  { id: '40', label: '40' },
  { id: '60', label: '60' },
  { id: '100', label: '100' },
  { id: '200', label: '200' },
  { id: 'Pasa200', label: 'Pasa 200' },
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
    const pasa200 = (200 - sum).toFixed(2);
    return { ...retained, Pasa200: pasa200 };
  }, [retained]);

  const rows = useMemo(() => {
    let prevPassed = 100;

    return SIEVES.map((sieve, idx) => {
      const w = parseFloat(autoRetained[sieve.id]) || 0;
      const paso4Num = parseFloat(Paso4) || 0;
      const pctRaw = (w / 200) * paso4Num;
      const pctRounded = Math.round(pctRaw);
      const passed = idx === 0 ? paso4Num - pctRounded : prevPassed - pctRounded;
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
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Lavados</Text>
        <View style={styles.card}>
          <LabelledInput
            label="% Que pasó la malla 4 en granulometría"
            value={Paso4}
            onChange={text => setPaso4(cleanDecimalInput(text))}
          />
        </View>

        <View style={styles.cardTable}>
          <Text style={styles.sectionTitle}>Tabla de resultados</Text>
          <View style={styles.tableHeader}>
            {['Malla', 'Retenido', '% Retenido Parc.', '% Retenido acum.', '% Pasa'].map(t => (
              <Text key={t} style={styles.cellHeader}>
                {t}
              </Text>
            ))}
          </View>

          {rows.map(item => (
            <View key={item.id} style={styles.row}>
              <Text style={styles.cell}>{item.label}</Text>
              {item.id === 'Pasa200' ? (
                <Text style={[styles.cell, styles.cellCalculated]}>{autoRetained['Pasa200']}</Text>
              ) : (
                <TextInput
                  style={styles.cellInput}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  value={retained[item.id]}
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
        keyboardType="decimal-pad"
        inputMode="decimal"
        value={value}
        onChangeText={onChange}
        placeholderTextColor="#aaa"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
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
  cellCalculated: {
    backgroundColor: 'transparent',
    color: '#0057B7',
    fontWeight: 'bold',
    borderWidth: 0,
    textAlign: 'center',
    padding: 4,
  },
});
