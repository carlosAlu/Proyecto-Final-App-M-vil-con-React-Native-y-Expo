import { useNavigation } from 'expo-router';
import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
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
const COLOR_LIGHT_GRAY = '#E0E0E0'; // Borde sutil

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
  const [pesoVolHum, setPesoVolHum] = useState<number | null>(null); // Ajustado para claridad
  const [factorHumedad, setFactorHumedad] = useState<number | null>(null); // Ajustado para claridad
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

  // Función para sanitizar la entrada (permite números y punto decimal)
  const cleanDecimalInput = (text: string) => {
    let clean = text.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    return clean;
  };

  /**
   * Función que realiza los cálculos de compactación
   * basada en los valores ingresados por el usuario.
   */
  const handleCalcular = () => {
    // Reiniciar estados de error y resultados
    setError('');
    setPesoUtilizado(null);
    setVolumenSondeo(null);
    setPesoVolHum(null);
    setFactorHumedad(null);
    setPesoVolSecLugar(null);
    setCompactacion(null);

    // Parsear valores ingresados a números
    const v1 = parseFloat(arenaInicial);
    const v2 = parseFloat(arenaSobrante);
    const v3 = parseFloat(materialHumedo);
    const v4 = parseFloat(volArena);
    const v5 = parseFloat(humedad);
    const v6 = parseFloat(volMax);

    // Validar que los valores sean números válidos y positivos
    if (
      isNaN(v1) || isNaN(v2) || isNaN(v3) ||
      isNaN(v4) || isNaN(v5) || isNaN(v6) ||
      v4 <= 0 || v6 <= 0
    ) {
          const mensaje = 'Por favor ingresa valores válidos y positivos en todos los campos requeridos.';
          setError(mensaje);
          Alert.alert('Error',mensaje)
          return;
        }
    // --- CÁLCULOS ---
    
    // 1. Peso utilizado de arena: P_arena = P_inicial - P_sobrante
    const pesoArenaUtilizado = v1 - v2;
    setPesoUtilizado(pesoArenaUtilizado);
    if (pesoArenaUtilizado <= 0) {
        setError('El peso de arena inicial debe ser mayor que el peso sobrante.');
        return;
    }

    // 2. Volumen del sondeo: V_sondeo = P_arena / P_vol_arena
    const volumenSondeoCalc = pesoArenaUtilizado / v4;
    setVolumenSondeo(volumenSondeoCalc);

    // 3. Peso volumétrico del material húmedo: P_vol_hum = P_mat_humedo / V_sondeo
    const pesoVolHumCalc = v3 / volumenSondeoCalc;
    setPesoVolHum(pesoVolHumCalc);

    // 4. Factor de Humedad: F_hum = 1 + (%Humedad / 100)
    const factorHumedadCalc = 1 + (v5 / 100); 
    setFactorHumedad(factorHumedadCalc);

    // 5. Peso Volumétrico Seco del lugar: P_vol_seco_lugar = P_vol_hum / Factor_Humedad
    const pesoVolSecLugarCalc = pesoVolHumCalc / factorHumedadCalc;
    setPesoVolSecLugar(pesoVolSecLugarCalc);

    // 6. Grado de compactación: Compactación = (P_vol_seco_lugar / P_vol_max) * 100
    const compactacionCalc = (pesoVolSecLugarCalc / v6) * 100;
    setCompactacion(compactacionCalc);

    // Hacer scroll al final para mostrar resultados
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
            <Text style={styles.title}>Cálculo de Compactación (Cono)</Text>
            
            {/* Tarjeta de Entrada de Datos */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>1. Datos de Entrada</Text>

                {/* Inputs para los datos de entrada */}
                <CustomInput label="Peso de arena inicial (g)" value={arenaInicial} setValue={setArenaInicial} cleanInput={cleanDecimalInput}/>
                <CustomInput label="Peso sobrante de arena (g)" value={arenaSobrante} setValue={setArenaSobrante} cleanInput={cleanDecimalInput}/>
                <CustomInput label="Peso de material húmedo (g)" value={materialHumedo} setValue={setMaterialHumedo} cleanInput={cleanDecimalInput}/>
                <CustomInput label="Peso volumétrico de arena (g/cm³)" value={volArena} setValue={setVolArena} cleanInput={cleanDecimalInput}/>
                <CustomInput label="% de humedad (H%)" value={humedad} setValue={setHumedad} cleanInput={cleanDecimalInput}/>
                <CustomInput label="Peso volumétrico máximo (g/cm³)" value={volMax} setValue={setVolMax} cleanInput={cleanDecimalInput}/>

                {/* Botón para calcular */}
                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: COLOR_ACCENT }]} 
                    onPress={handleCalcular}
                >
                    <Text style={[styles.buttonText, { color: COLOR_PRIMARY }]}>CALCULAR COMPACTACIÓN</Text>
                </TouchableOpacity>
            </View>

            {/* Área donde se muestran los resultados o error */}
            <View style={styles.cardResult}>
                <Text style={styles.sectionTitle}>2. Resultados Intermedios y Final</Text>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <>
                        {/* Mostrar resultados intermedios */}
                        <ResultRow label="Peso de Arena Utilizado (g):" value={pesoUtilizado} units="g" />
                        <ResultRow label="Volumen del Sondeo (cm³):" value={volumenSondeo} units="cm³" decimalPlaces={3} />
                        <ResultRow label="Peso Vol. Húmedo (g/cm³):" value={pesoVolHum} units="g/cm³" decimalPlaces={3} />
                        <ResultRow label="Factor de Humedad (1+H/100):" value={factorHumedad} units="" decimalPlaces={4} />
                        <ResultRow label="Peso Vol. Seco del Lugar (g/cm³):" value={pesoVolSecLugar} units="g/cm³" decimalPlaces={3} />
                        
                        {/* Mostrar resultado final destacado */}
                        {compactacion !== null && (
                            <View style={styles.finalResultRow}>
                                <Text style={styles.resultLabelFinal}>Grado de Compactación:</Text>
                                <Text style={styles.resultValueFinal}>
                                    {compactacion.toFixed(2)} %
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Componente reutilizable para inputs con etiqueta
function CustomInput({ label, value, setValue, cleanInput }: { label: string, value: string, setValue: (v: string) => void, cleanInput: (t: string) => string }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={text => setValue(cleanInput(text))}
        keyboardType="numeric"
        placeholder={`Ingrese el valor`}
        placeholderTextColor="#999"
        returnKeyType="done"
      />
    </View>
  );
}

// Componente para mostrar filas de resultados (reutilizado)
function ResultRow({ label, value, units = '', decimalPlaces = 2 }: { label: string, value: number | null, units?: string, decimalPlaces?: number }) {
    if (value === null) return null;
    return (
        <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>{label}</Text>
            <Text style={styles.resultValue}>
                {value.toFixed(decimalPlaces)} {units}
            </Text>
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
    alignItems: 'stretch', // Alineado a stretch para las filas de resultado
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
  // Botón: Dorado con texto Azul Oscuro, redondeado, con sombra
  button: {
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

  },
  // Etiqueta de resultado (texto normal)
  resultLabel: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  // Etiqueta de resultado final
  resultLabelFinal: {
    color: COLOR_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  // Valor de resultado (la cifra)
  resultValue: {
    color: COLOR_PRIMARY,
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  // Valor de resultado final (el porcentaje)
  resultValueFinal: {
    color: COLOR_ERROR, // Rojo de alto impacto para el porcentaje final
    fontWeight: '900',
    fontSize: 24,
    flex: 1,
    textAlign: 'right',
  },
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