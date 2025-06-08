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

export default function CompactacionCono() {
  // Estados para almacenar los valores de entrada del usuario
  const [arenaInicial, setArenaInicial] = useState('');
  const [arenaSobrante, setArenaSobrante] = useState('');
  const [materialHumedo, setMaterialHumedo] = useState('');
  const [volArena, setVolArena] = useState('');
  const [humedad, setHumedad] = useState('');
  const [volMax, setVolMax] = useState('');

  // Estados para almacenar los resultados calculados
  const [pesoUtilizado, setPesoUtilizado] = useState<number | null>(null);
  const [volumenSondeo, setVolumenSondeo] = useState<number | null>(null);
  const [volumenMatHumedo, setVolumenMatHumedo] = useState<number | null>(null);
  const [humedadCalc, setHumedadCalc] = useState<number | null>(null);
  const [pesoVolSecLugar, setPesoVolSecLugar] = useState<number | null>(null);
  const [compactacion, setCompactacion] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Referencia para hacer scroll al final al mostrar resultados
  const scrollRef = useRef<ScrollView>(null);

  // Navegación para ocultar el header de la pantalla
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  /**
   * Función que realiza los cálculos de compactación
   * basada en los valores ingresados por el usuario.
   */
  const handleCalcular = () => {
    // Reiniciar estados de error y resultados
    setError('');
    setPesoUtilizado(null);
    setVolumenSondeo(null);
    setVolumenMatHumedo(null);
    setHumedadCalc(null);
    setPesoVolSecLugar(null);
    setCompactacion(null);

    // Parsear valores ingresados a números
    const v1 = parseFloat(arenaInicial);
    const v2 = parseFloat(arenaSobrante);
    const v3 = parseFloat(materialHumedo);
    const v4 = parseFloat(volArena);
    const v5 = parseFloat(humedad);
    const v6 = parseFloat(volMax);

    // Validar que los valores sean números válidos y no cero donde aplique
    if (
      isNaN(v1) ||
      isNaN(v2) ||
      isNaN(v3) ||
      isNaN(v4) ||
      isNaN(v5) ||
      isNaN(v6) ||
      v4 === 0 ||
      v6 === 0
    ) {
      setError('Por favor ingresa valores válidos y mayores a cero.');
      return;
    }

    // Calcular peso utilizado de arena (arena inicial - sobrante)
    const pesoArenaUtilizado = v1 - v2;
    setPesoUtilizado(pesoArenaUtilizado);

    // Calcular volumen del sondeo (peso utilizado / peso volumétrico de arena)
    const volumenSondeo = pesoArenaUtilizado / v4;
    setVolumenSondeo(volumenSondeo);

    // Calcular peso volumétrico del material húmedo (peso material húmedo / volumen sondeo)
    const volumenMatHumedo = v3 / volumenSondeo;
    setVolumenMatHumedo(volumenMatHumedo);

    // Calcular humedad ajustada (aquí se suma 100 según fórmula original)
    const humedadCalculada = v5 + 100;
    setHumedadCalc(humedadCalculada);

    // Calcular peso volumétrico seco del lugar (material húmedo / humedad calculada)
    const pesoVolSecLugarCalc = volumenMatHumedo / humedadCalculada;
    setPesoVolSecLugar(pesoVolSecLugarCalc);

    // Calcular grado de compactación (peso volumétrico seco del lugar / peso volumétrico máximo)
    const compactacionCalc = pesoVolSecLugarCalc / v6;
    setCompactacion(compactacionCalc);

    // Hacer scroll al final para mostrar resultados
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
        <Text style={styles.title}>Compactación por Cono de Arena</Text>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos de entrada</Text>

          {/* Inputs para los datos de entrada */}
          <CustomInput label="Peso de arena inicial" value={arenaInicial} setValue={setArenaInicial} />
          <CustomInput label="Peso sobrante de arena" value={arenaSobrante} setValue={setArenaSobrante} />
          <CustomInput label="Peso de material húmedo" value={materialHumedo} setValue={setMaterialHumedo} />
          <CustomInput label="Peso volumétrico de arena" value={volArena} setValue={setVolArena} />
          <CustomInput label="% de humedad" value={humedad} setValue={setHumedad} />
          <CustomInput label="Peso volumétrico máximo" value={volMax} setValue={setVolMax} />

          {/* Botón para calcular */}
          <TouchableOpacity style={styles.button} onPress={handleCalcular}>
            <Text style={styles.buttonText}>Calcular</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardResult}>
          <Text style={styles.sectionTitle}>Resultados</Text>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              {pesoUtilizado !== null && (
                <Text style={styles.resultText}>
                  Peso de arena utilizado:{' '}
                  <Text style={styles.resultValue}>{Math.round(pesoUtilizado)}</Text>
                </Text>
              )}
              {volumenSondeo !== null && (
                <Text style={styles.resultText}>
                  Volumen del sondeo:{' '}
                  <Text style={styles.resultValue}>{Math.round(volumenSondeo * 1000)}</Text>
                </Text>
              )}
              {volumenMatHumedo !== null && (
                <Text style={styles.resultText}>
                  Peso Vol. Mat. Húmedo:{' '}
                  <Text style={styles.resultValue}>{Math.round(volumenMatHumedo)}</Text>
                </Text>
              )}
              {pesoVolSecLugar !== null && (
                <Text style={styles.resultText}>
                  Peso Vol. Seco del lugar:{' '}
                  <Text style={styles.resultValue}>{Math.round(pesoVolSecLugar * 100)}</Text>
                </Text>
              )}
              {compactacion !== null && (
                <Text style={styles.resultText}>
                  Grado de compactación:{' '}
                  <Text style={styles.resultValue}>{(compactacion * 100).toFixed(2)}%</Text>
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
 * Componente reutilizable para los inputs numéricos con etiqueta.
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
        placeholder="Escribe aquí"
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
