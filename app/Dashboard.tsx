import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// *** CONSTANTES DE MARCA (REDEFINIDAS PARA CONSISTENCIA) ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND = '#F5F5F5'; // Fondo Suave
const COLOR_DANGER = '#D32F2F'; // Rojo de Error/Peligro
const COLOR_SUCCESS = '#388E3C'; // Verde
const COLOR_CONCRETE = '#1E88E5'; // Azul para Concreto
const COLOR_SOIL = '#FF8C00'; // Naranja/Tierra para Suelos
const COLOR_TEXT_DARK = '#333333';
const COLOR_LIGHT_GRAY = '#E0E0E0';
const MIN_CELL_WIDTH = 35;
const BAR_WIDTH_CHART = 10;
const BAR_MARGIN_CHART = 5;

// Componente principal del Dashboard
export default function Dashboard() {
  // Estados para almacenar datos y controlar la UI
  const [ensayes, setEnsayes] = useState<any[]>([]);
  const [ensayosSuelos, setEnsayosSuelos] = useState<any[]>([]);
  const [dailyConcreto, setDailyConcreto] = useState<{ day: number; count: number }[]>([]);
  const [dailySuelo, setDailySuelo] = useState<{ day: number; count: number }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [contentWidth, setContentWidth] = useState(0);
  const navigation = useNavigation();

  // Estados para búsqueda
  const [busquedaConcreto, setBusquedaConcreto] = useState('');
  const [busquedaSuelos, setBusquedaSuelos] = useState('');
  const [filtradosConcreto, setFiltradosConcreto] = useState<any[]>([]);
  const [filtradosSuelos, setFiltradosSuelos] = useState<any[]>([]);

  const screenWidth = Dimensions.get('window').width;

  // Oculta el header de navegación
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Fuerza la orientación horizontal al montar el componente
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // --- Lógica de Carga de Datos y Filtros (SIN CAMBIOS FUNCIONALES) ---
  useEffect(() => {
    const cargarEnsayes = async () => {
      const tablaStr = await AsyncStorage.getItem('EnsayesConcreto');
      setEnsayes(tablaStr ? JSON.parse(tablaStr) : []);
    };
    const cargarEnsayosSuelos = async () => {
      const tablaStr = await AsyncStorage.getItem('EnsayesSuelos');
      setEnsayosSuelos(tablaStr ? JSON.parse(tablaStr) : []);
    };
    const unsubscribe = navigation.addListener('focus', () => {
      cargarEnsayes();
      cargarEnsayosSuelos();
    });
    cargarEnsayes();
    cargarEnsayosSuelos();
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (busquedaConcreto.trim() === '') {
      setFiltradosConcreto(ensayes);
    } else {
      setFiltradosConcreto(
        ensayes.filter((item) =>
          Object.values(item).join(' ').toLowerCase().includes(busquedaConcreto.toLowerCase())
        )
      );
    }
  }, [busquedaConcreto, ensayes]);

  useEffect(() => {
    if (busquedaSuelos.trim() === '') {
      setFiltradosSuelos(ensayosSuelos);
    } else {
      setFiltradosSuelos(
        ensayosSuelos.filter((item) =>
          Object.values(item).join(' ').toLowerCase().includes(busquedaSuelos.toLowerCase())
        )
      );
    }
  }, [busquedaSuelos, ensayosSuelos]);

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    const countsConcreto: Record<number, number> = {};
    const countsSuelo: Record<number, number> = {};
    for (let d = 1; d <= lastDay; d++) {
      countsConcreto[d] = 0;
      countsSuelo[d] = 0;
    }

    const getDayFromFecha = (fechaStr: string): number | null => {
      if (!fechaStr) return null;
      const isoMatch = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (isoMatch) {
        const [_, año, mes, día] = isoMatch;
        const yearNum = parseInt(año, 10);
        const monthNum = parseInt(mes, 10) - 1;
        const dayNum = parseInt(día, 10);
        if (yearNum === currentYear && monthNum === currentMonth) {
          return dayNum;
        } else {
          return null;
        }
      }
      const dmYMatch = fechaStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (dmYMatch) {
        const [_, día, mes, año] = dmYMatch;
        const dayNum = parseInt(día, 10);
        const monthNum = parseInt(mes, 10) - 1;
        const yearNum = parseInt(año, 10);
        if (yearNum === currentYear && monthNum === currentMonth) {
          return dayNum;
        } else {
          return null;
        }
      }
      const parsed = new Date(fechaStr);
      if (!isNaN(parsed.getTime())) {
        if (
          parsed.getFullYear() === currentYear &&
          parsed.getMonth() === currentMonth
        ) {
          return parsed.getDate();
        }
      }
      return null;
    };

    ensayes.forEach((item) => {
      const day = getDayFromFecha(item.fecha);
      if (day !== null) {
        countsConcreto[day] += 1;
      }
    });

    ensayosSuelos.forEach((item) => {
      const day = getDayFromFecha(item.fecha);
      if (day !== null) {
        countsSuelo[day] += 1;
      }
    });

    const arrConcreto: { day: number; count: number }[] = [];
    const arrSuelo: { day: number; count: number }[] = [];
    for (let d = 1; d <= lastDay; d++) {
      arrConcreto.push({ day: d, count: countsConcreto[d] });
      arrSuelo.push({ day: d, count: countsSuelo[d] });
    }

    setDailyConcreto(arrConcreto);
    setDailySuelo(arrSuelo);
  }, [ensayes, ensayosSuelos]);

  const ensayesPorDia = ensayes.reduce((acc, item) => {
    const fecha = item.fecha || 'Sin fecha';
    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ensayosSuelosPorDia = ensayosSuelos.reduce((acc, item) => {
    const fecha = item.fecha || 'Sin fecha';
    acc[fecha] = (acc[fecha] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const vaciarTablas = async () => {
    await AsyncStorage.removeItem('EnsayesConcreto');
    await AsyncStorage.removeItem('EnsayesSuelos');
    await AsyncStorage.removeItem('EnsayesConcreto_lastId');
    await AsyncStorage.removeItem('EnsayesSuelos_lastId');
    setEnsayes([]);
    setEnsayosSuelos([]);
    setModalVisible(false);
    setCodigo('');
    setErrorCodigo('');
  };

  const handleVaciarTablas = () => {
    setModalVisible(true);
    setCodigo('');
    setErrorCodigo('');
  };

  const verificarCodigo = () => {
    if (codigo === '010324') {
      vaciarTablas();
    } else {
      setErrorCodigo('Código incorrecto. Intenta de nuevo.');
    }
  };
  // --- FIN Lógica de Carga de Datos y Filtros ---

  // Nombres de encabezados simplificados para mejor visualización en la tabla
  const headersConcreto = [
    'ID',
    'Obra',
    'Clave',
    'Fecha',
    'Muestra',
    'Espec.',
    'Remisión',
    'Elemento',
    "F'C",
    'Rev. Proy.',
    'Rev. Obra',
    'Eq. Mezclado',
    'Concretera',
    'Cemento',
    'Aditivo',
    'Vibrador',
    'Clave Eq.',
    'Días Rup.',
    'H. Inicio',
    'H. Tér.',
    'H. Espec.',
    'Camión',
    'Temp. Conc.',
    'Temp. Amb.',
    'Tipo Espec.',
  ];

  const headersSuelos = ['ID', 'Fecha', 'Obra', 'Cliente', 'Muestra', 'Ubicación', 'Técnico'];

  // Cálculo de máximos para las gráficas
  const maxConcreto = Math.max(...dailyConcreto.map((d) => d.count), 1);
  const maxSuelo = Math.max(...dailySuelo.map((d) => d.count), 1);

  // Ancho de las gráficas de barras
  const barContainerWidth = dailyConcreto.length * (BAR_WIDTH_CHART + BAR_MARGIN_CHART);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLOR_BACKGROUND }}>
        {/* Contenedor principal que ajusta el teclado y centra todo */}
        <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        {/* Scroll horizontal para toda la pantalla */}
        <ScrollView
            horizontal
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center' }}
            contentOffset={{
            x: contentWidth > screenWidth ? (contentWidth - screenWidth) / 2 : 0,
            y: 0,
            }}
        >
            {/* Scroll vertical para el contenido */}
            <ScrollView
            contentContainerStyle={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}
            onContentSizeChange={(w) => setContentWidth(w)}
            >
                {/* Título de la sección principal */}
                <Text style={styles.mainTitle}>Panel de Control y Trazabilidad</Text>
                
                <View style={styles.topSection}>
                    {/* Dashboard: Conteo total de ensayes */}
                    <View style={styles.dashboardContainer}>
                        <View style={styles.dashboardCard}>
                            <Text style={styles.dashboardTitle}>CONCRETO (TOTAL)</Text>
                            <Text style={[styles.dashboardCount, {color: COLOR_CONCRETE}]}>{ensayes.length}</Text>
                            <Text style={styles.dashboardLabel}>ensayes registrados</Text>
                        </View>
                        <View style={styles.dashboardCard}>
                            <Text style={styles.dashboardTitle}>SUELOS (TOTAL)</Text>
                            <Text style={[styles.dashboardCount, {color: COLOR_SOIL}]}>{ensayosSuelos.length}</Text>
                            <Text style={styles.dashboardLabel}>ensayes registrados</Text>
                        </View>
                    </View>

                    {/* Dashboard: Conteo de ensayes por día */}
                    <View style={styles.dashboardPorDiaContainer}>
                        <View style={styles.dashboardPorDiaCard}>
                            <Text style={styles.dashboardTitle}>CONCRETOS HOY</Text>
                            {Object.keys(ensayesPorDia).length === 0 ? (
                                <Text style={styles.dashboardPorDiaNoData}>Sin datos</Text>
                            ) : (
                                Object.entries(ensayesPorDia).map(([fecha, cantidad]) => (
                                    <Text key={fecha} style={styles.dashboardPorDiaItem}>
                                        {fecha}: <Text style={{ fontWeight: 'bold', color: COLOR_CONCRETE }}>{String(cantidad)}</Text>
                                    </Text>
                                ))
                            )}
                        </View>
                        <View style={styles.dashboardPorDiaCard}>
                            <Text style={styles.dashboardTitle}>SUELOS HOY</Text>
                            {Object.keys(ensayosSuelosPorDia).length === 0 ? (
                                <Text style={styles.dashboardPorDiaNoData}>Sin datos</Text>
                            ) : (
                                Object.entries(ensayosSuelosPorDia).map(([fecha, cantidad]) => (
                                    <Text key={fecha} style={styles.dashboardPorDiaItem}>
                                        {fecha}: <Text style={{ fontWeight: 'bold', color: COLOR_SOIL }}>{String(cantidad)}</Text>
                                    </Text>
                                ))
                            )}
                        </View>
                    </View>
                </View>

                {/* --- GRÁFICOS --- */}
                <View style={styles.chartSection}>
                    {/* Gráfica de barras de concreto */}
                    <View style={styles.chartWrapper}>
                        <Text style={styles.chartTitle}>Ensayes de Concreto - Mes Actual</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                width: Math.max(barContainerWidth, 300),
                                justifyContent: 'center',
                            }}
                            style={styles.chartScrollArea}
                        >
                            <View style={styles.chartContainer}>
                                {dailyConcreto.map((data) => {
                                    const barHeight = (data.count / maxConcreto) * 70 + (data.count > 0 ? 5 : 0);
                                    return (
                                    <View
                                        key={data.day}
                                        style={{ alignItems: 'center', width: BAR_WIDTH_CHART + 2, marginHorizontal: BAR_MARGIN_CHART / 2 }}
                                    >
                                        <View
                                        style={{
                                            height: barHeight,
                                            width: BAR_WIDTH_CHART,
                                            backgroundColor: COLOR_CONCRETE,
                                            borderRadius: 2,
                                            alignSelf: 'center',
                                        }}
                                        />
                                        <Text style={styles.barLabel}>{data.day}</Text>
                                    </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>

                    {/* Gráfica de barras de suelos */}
                    <View style={styles.chartWrapper}>
                        <Text style={styles.chartTitle}>Ensayes de Suelos - Mes Actual</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                width: Math.max(barContainerWidth, 300),
                                justifyContent: 'center',
                            }}
                            style={styles.chartScrollArea}
                        >
                            <View style={styles.chartContainer}>
                                {dailySuelo.map((data) => {
                                    const barHeight = (data.count / maxSuelo) * 70 + (data.count > 0 ? 5 : 0);
                                    return (
                                    <View
                                        key={data.day}
                                        style={{ alignItems: 'center', width: BAR_WIDTH_CHART + 2, marginHorizontal: BAR_MARGIN_CHART / 2 }}
                                    >
                                        <View
                                        style={{
                                            height: barHeight,
                                            width: BAR_WIDTH_CHART,
                                            backgroundColor: COLOR_SOIL,
                                            borderRadius: 2,
                                            alignSelf: 'center',
                                        }}
                                        />
                                        <Text style={styles.barLabel}>{data.day}</Text>
                                    </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    </View>
                </View>
                
                {/* --- TABLAS --- */}

                {/* Tabla de concreto */}
                <Text style={styles.sectionTitle}>Registro de Ensayes de Concreto</Text>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.input, styles.searchInput]}
                        placeholder="🔍 Buscar por Obra, Clave, Fecha..."
                        placeholderTextColor="#999"
                        value={busquedaConcreto}
                        onChangeText={setBusquedaConcreto}
                    />
                </View>
                <View style={styles.tableCard}>
                    <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 5 }}>
                        <View>
                            {/* Encabezados de la tabla de concreto (SIMPLIFICADOS) */}
                            <View style={styles.tableRowHeader}>
                                {headersConcreto.map((header, idx) => (
                                    <Text key={idx} style={[styles.tableHeader, idx === 0 && styles.firstCell]}>
                                        {header}
                                    </Text>
                                ))}
                            </View>
                            {/* Filas de datos de concreto */}
                            {filtradosConcreto.length === 0 ? (
                                <Text style={styles.noData}>No hay ensayes de concreto registrados o coincidiendo con la búsqueda.</Text>
                            ) : (
                                filtradosConcreto.map((item, idx) => (
                                    <View key={item.id ?? idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                                        <Text style={[styles.tableCell, styles.firstCell]}>{item.id}</Text>
                                        <Text style={styles.tableCell}>{item.obra}</Text>
                                        <Text style={styles.tableCell}>{item.claveReporte}</Text>
                                        <Text style={styles.tableCell}>{item.fecha}</Text>
                                        <Text style={styles.tableCell}>{item.noMuestra}</Text>
                                        <Text style={styles.tableCell}>{item.noEspecimenes}</Text>
                                        <Text style={styles.tableCell}>{item.noRemision}</Text>
                                        <Text style={styles.tableCell}>{item.elementoColado}</Text>
                                        <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{item.fc}</Text>
                                        <Text style={styles.tableCell}>{item.revenimientoProyecto}</Text>
                                        <Text style={styles.tableCell}>{item.revenimientoObra}</Text>
                                        <Text style={styles.tableCell}>{item.equipoMezclado}</Text>
                                        <Text style={styles.tableCell}>{item.nombreConcretera}</Text>
                                        <Text style={styles.tableCell}>{item.cementoMarcaTipo}</Text>
                                        <Text style={styles.tableCell}>{item.aditivo}</Text>
                                        <Text style={styles.tableCell}>{item.vibradorUtilizado}</Text>
                                        <Text style={styles.tableCell}>{item.claveEquipoUtilizado}</Text>
                                        <Text style={styles.tableCell}>{item.diasRuptura}</Text>
                                        <Text style={styles.tableCell}>{item.horaInicioColado}</Text>
                                        <Text style={styles.tableCell}>{item.horaTerminoColado}</Text>
                                        <Text style={styles.tableCell}>{item.horaElaboracionEspecimen}</Text>
                                        <Text style={styles.tableCell}>{item.camionRevolvedor}</Text>
                                        <Text style={styles.tableCell}>{item.temperaturaConcreto}</Text>
                                        <Text style={styles.tableCell}>{item.temperaturaAmbiente}</Text>
                                        <Text style={styles.tableCell}>{item.tipoEspecimen}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>
                </View>

                {/* Tabla de suelos */}
                <Text style={styles.sectionTitle}>Registro de Ensayes de Suelos</Text>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={[styles.input, styles.searchInput]}
                        placeholder="🔍 Buscar por Obra, Cliente, Ubicación..."
                        placeholderTextColor="#999"
                        value={busquedaSuelos}
                        onChangeText={setBusquedaSuelos}
                    />
                </View>
                <View style={styles.tableCard}>
                    <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 5 }}>
                        <View>
                            {/* Encabezados de la tabla de suelos */}
                            <View style={styles.tableRowHeader}>
                                {headersSuelos.map((header, idx) => (
                                    <Text key={idx} style={[styles.tableHeader, idx === 0 && styles.firstCell]}>
                                        {header}
                                    </Text>
                                ))}
                            </View>
                            {/* Filas de datos de suelos */}
                            {filtradosSuelos.length === 0 ? (
                                <Text style={styles.noData}>No hay ensayes de suelos registrados o coincidiendo con la búsqueda.</Text>
                            ) : (
                                filtradosSuelos.map((item, idx) => (
                                    <View key={item.id ?? idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                                        <Text style={[styles.tableCell, styles.firstCell]}>{item.id}</Text>
                                        <Text style={styles.tableCell}>{item.fecha}</Text>
                                        <Text style={styles.tableCell}>{item.obra}</Text>
                                        <Text style={styles.tableCell}>{item.cliente}</Text>
                                        <Text style={styles.tableCell}>{item.muestra}</Text>
                                        <Text style={styles.tableCell}>{item.ubicacion}</Text>
                                        <Text style={styles.tableCell}>{item.tecnico}</Text>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>
                </View>

                {/* Botones de acción inferiores */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.buttonPrimary]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.buttonText}>REGRESAR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonDanger]}
                        onPress={handleVaciarTablas}
                    >
                        <Text style={styles.buttonText}>VACÍAR TABLAS</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal de verificación para vaciar tablas */}
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>⚠️ CONFIRMAR BORRADO PERMANENTE</Text>
                            <Text style={styles.modalText}>
                                Ingresa el código para confirmar la **eliminación de TODOS** los datos de ensayes. Esta acción no se puede deshacer(010324).
                            </Text>
                            <TextInput
                                style={[styles.input, styles.modalInput]}
                                placeholder="Código de verificación"
                                placeholderTextColor="#999"
                                value={codigo}
                                onChangeText={setCodigo}
                                keyboardType="numeric"
                                secureTextEntry
                                textAlign="center"
                            />
                            {errorCodigo ? (
                                <Text style={styles.errorText}>{errorCodigo}</Text>
                            ) : null}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.modalButton, styles.buttonSuccess]}
                                    onPress={verificarCodigo}
                                >
                                    <Text style={styles.buttonText}>Aceptar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.modalButton, styles.buttonCancel]}
                                    onPress={() => {
                                    setModalVisible(false);
                                    setCodigo('');
                                    setErrorCodigo('');
                                    }}
                                >
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos para todos los elementos del Dashboard
const styles = StyleSheet.create({
    // --- ESTILOS GENERALES Y LAYOUT ---
    keyboardAvoidingView: {
        flex: 1,
        backgroundColor: COLOR_BACKGROUND,
        justifyContent: 'center',
    },
    container: {
        flexGrow: 1,
        backgroundColor: COLOR_BACKGROUND,
        padding: 15,
        paddingBottom: 20,
        minWidth: '100%', // Asegura que el contenido ocupe el ancho disponible en landscape
    },
    mainTitle: {
        fontSize: 14,
        color: COLOR_PRIMARY,
        fontWeight: '900',
        marginBottom: 10,
        letterSpacing: 1,
        textAlign: 'center',
        paddingHorizontal: 10,
        alignSelf: 'center',
    },
    sectionTitle: {
        fontSize: 12,
        color: COLOR_PRIMARY,
        fontWeight: '700',
        marginTop: 15,
        marginBottom: 5,
        textAlign: 'left',
        paddingHorizontal: 5,
        borderBottomWidth: 2,
        borderBottomColor: COLOR_ACCENT,
        alignSelf: 'stretch',
    },
    // --- DASHBOARD CARDS (Conteo) ---
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 5,
        marginBottom: 10,
    },
    dashboardContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'flex-start',
        paddingRight: 10,
    },
    dashboardCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
        flex: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: COLOR_LIGHT_GRAY,
    },
    dashboardTitle: {
        fontSize: 9,
        fontWeight: '700',
        color: COLOR_PRIMARY,
        textAlign: 'center',
    },
    dashboardCount: {
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
    },
    dashboardLabel: {
        fontSize: 8,
        color: COLOR_TEXT_DARK,
        marginTop: 2,
        textAlign: 'center',
    },
    // --- DASHBOARD POR DÍA (Conteo de Hoy) ---
    dashboardPorDiaContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'flex-end',
        paddingLeft: 10,
    },
    dashboardPorDiaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 8,
        alignItems: 'flex-start',
        minWidth: 120,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: COLOR_LIGHT_GRAY,
    },
    dashboardPorDiaItem: {
        fontSize: 8,
        color: COLOR_TEXT_DARK,
        marginBottom: 1,
        textAlign: 'left',
    },
    dashboardPorDiaNoData: {
        fontSize: 8,
        color: '#aaa',
        fontStyle: 'italic',
        textAlign: 'left',
    },
    // --- GRÁFICOS ---
    chartSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    chartWrapper: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: COLOR_LIGHT_GRAY,
    },
    chartTitle: {
        fontSize: 10,
        color: COLOR_PRIMARY,
        fontWeight: '700',
        marginBottom: 5,
        textAlign: 'center',
    },
    chartScrollArea: {
        height: 100, // Altura fija para el scroll de las barras
        minWidth: '100%',
        paddingVertical: 5,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: '100%',
        paddingHorizontal: 2,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    barLabel: {
        fontSize: 7,
        color: COLOR_PRIMARY,
        marginTop: 1,
        textAlign: 'center',
    },
    // --- TABLAS Y BÚSQUEDA ---
    searchContainer: {
        alignSelf: 'stretch',
        paddingHorizontal: 5,
        marginBottom: 5,
    },
    searchInput: {
        width: '100%',
        minWidth: 200,
        alignSelf: 'flex-start',
        textAlign: 'left',
        paddingHorizontal: 10,
        fontSize: 10,
        backgroundColor: '#FFFFFF',
        borderColor: COLOR_LIGHT_GRAY,
    },
    input: { // Estilo genérico de input, usado en modal/búsqueda
        borderWidth: 1,
        borderColor: '#C3D1E6',
        borderRadius: 6,
        padding: 6,
        marginBottom: 6,
        fontSize: 9,
        backgroundColor: '#F7F7F7',
        alignSelf: 'center',
    },
    tableCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 5,
        width: '100%',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: COLOR_LIGHT_GRAY,
        marginBottom: 15,
    },
    // --- ESTILOS DE CELDAS DE TABLA ---
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 4,
    },
    tableHeader: {
        paddingVertical: 3,
        paddingHorizontal: 1,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 7, // Fuente muy pequeña para las 25 columnas
        borderRightWidth: 0.5,
        borderRightColor: '#336699', // Color intermedio
        textAlign: 'center',
        minWidth: MIN_CELL_WIDTH,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: COLOR_LIGHT_GRAY,
        backgroundColor: '#FFFFFF',
    },
    tableRowEven: {
        backgroundColor: '#FAFAFA', // Fondo ligeramente diferente para filas pares
    },
    tableCell: {
        paddingVertical: 3,
        paddingHorizontal: 1,
        fontSize: 7, // Fuente muy pequeña para las 25 columnas
        color: COLOR_TEXT_DARK,
        borderRightWidth: 0.5,
        borderRightColor: COLOR_LIGHT_GRAY,
        textAlign: 'center',
        minWidth: MIN_CELL_WIDTH,
    },
    firstCell: {
        minWidth: 25, // ID es más pequeño
        fontWeight: 'bold',
        color: COLOR_PRIMARY,
    },
    noData: {
        color: COLOR_TEXT_DARK,
        fontSize: 8,
        marginTop: 7,
        textAlign: 'center',
        fontWeight: '600',
        padding: 7,
        width: '100%',
    },
    // --- BOTONES DE ACCIÓN ---
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        width: '100%',
        marginBottom: 10,
    },
    button: {
        paddingVertical: 8,
        borderRadius: 15, // Más redondeado
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 4,
        width: 130,
    },
    buttonPrimary: {
        backgroundColor: COLOR_PRIMARY,
    },
    buttonDanger: {
        backgroundColor: COLOR_DANGER,
    },
    buttonSuccess: { // Usado para aceptar en el modal
        backgroundColor: COLOR_SUCCESS,
    },
    buttonCancel: { // Usado para cancelar en el modal
        backgroundColor: '#999999',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    // --- MODAL ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        width: 250,
        elevation: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 8,
        color: COLOR_DANGER,
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 10,
        color: COLOR_TEXT_DARK,
    },
    modalInput: {
        width: '80%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    modalButton: {
        width: 80,
        paddingVertical: 6,
    },
    errorText: {
        color: COLOR_DANGER,
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '600',
    },
    
});