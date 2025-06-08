import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

  // Carga los ensayes de AsyncStorage al enfocar la pantalla
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

  // Filtrar concreto
  useEffect(() => {
    if (busquedaConcreto.trim() === '') {
      setFiltradosConcreto(ensayes);
    } else {
      setFiltradosConcreto(
        ensayes.filter((item) =>
          Object.values(item)
            .join(' ')
            .toLowerCase()
            .includes(busquedaConcreto.toLowerCase())
        )
      );
    }
  }, [busquedaConcreto, ensayes]);

  // Filtrar suelos
  useEffect(() => {
    if (busquedaSuelos.trim() === '') {
      setFiltradosSuelos(ensayosSuelos);
    } else {
      setFiltradosSuelos(
        ensayosSuelos.filter((item) =>
          Object.values(item)
            .join(' ')
            .toLowerCase()
            .includes(busquedaSuelos.toLowerCase())
        )
      );
    }
  }, [busquedaSuelos, ensayosSuelos]);

  // Calcula los ensayes por día del mes actual para las gráficas
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

    // Extrae el día de la fecha en distintos formatos
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

    // Cuenta ensayes por día
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

    // Prepara los datos para las gráficas
    const arrConcreto: { day: number; count: number }[] = [];
    const arrSuelo: { day: number; count: number }[] = [];
    for (let d = 1; d <= lastDay; d++) {
      arrConcreto.push({ day: d, count: countsConcreto[d] });
      arrSuelo.push({ day: d, count: countsSuelo[d] });
    }

    setDailyConcreto(arrConcreto);
    setDailySuelo(arrSuelo);
  }, [ensayes, ensayosSuelos]);

  // Ensayes agrupados por fecha
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

  // Borra todos los datos de AsyncStorage y limpia los estados
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

  // Muestra el modal para confirmar borrado
  const handleVaciarTablas = () => {
    setModalVisible(true);
    setCodigo('');
    setErrorCodigo('');
  };

  // Verifica el código antes de borrar los datos
  const verificarCodigo = () => {
    if (codigo === '010324') {
      vaciarTablas();
    } else {
      setErrorCodigo('Código incorrecto. Intenta de nuevo.');
    }
  };

  // Encabezados de las tablas
  const headersConcreto = [
    'ID',
    'Obra',
    'Clave',
    'Fecha',
    'No. Muestra',
    'No. Especimenes',
    'No. Remisión',
    'Elemento Colado',
    "F'C",
    'Rev. Proyecto',
    'Rev. Obra',
    'Equipo Mezclado',
    'Concretera',
    'Cemento',
    'Aditivo',
    'Vibrador',
    'Clave Equipo',
    'Días Ruptura',
    'Hora Inicio',
    'Hora Término',
    'Hora Especimen',
    'Camión',
    'Temp. Concreto',
    'Temp. Ambiente',
    'Tipo Especimen',
  ];

  const headersSuelos = ['ID', 'Fecha', 'Obra', 'Cliente', 'Muestra', 'Ubicación', 'Técnico'];

  // Cálculo de máximos para las gráficas
  const maxConcreto = Math.max(...dailyConcreto.map((d) => d.count), 1);
  const maxSuelo = Math.max(...dailySuelo.map((d) => d.count), 1);

  // Ancho de las gráficas de barras
  const barContainerWidth = dailyConcreto.length * 18;
  const barWidth = 10;

  return (
    // Contenedor principal que ajusta el teclado y centra todo
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
          {/* Dashboard de conteo de ensayes */}
          <View style={[styles.dashboardContainer, { alignSelf: 'center', justifyContent: 'center' }]}>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Concreto</Text>
              <Text style={styles.dashboardCount}>{ensayes.length}</Text>
              <Text style={styles.dashboardLabel}>ensayes</Text>
            </View>
            <View style={styles.dashboardCard}>
              <Text style={styles.dashboardTitle}>Suelos</Text>
              <Text style={styles.dashboardCount}>{ensayosSuelos.length}</Text>
              <Text style={styles.dashboardLabel}>ensayes</Text>
            </View>
          </View>

          {/* Dashboard de ensayes por día */}
          <View style={[styles.dashboardPorDiaContainer, { alignSelf: 'center', justifyContent: 'center' }]}>
            <View style={styles.dashboardPorDiaCard}>
              <Text style={styles.dashboardTitle}>Concretos ensayados hoy</Text>
              {Object.keys(ensayesPorDia).length === 0 ? (
                <Text style={styles.dashboardPorDiaNoData}>Sin datos</Text>
              ) : (
                Object.entries(ensayesPorDia).map(([fecha, cantidad]) => (
                  <Text key={fecha} style={styles.dashboardPorDiaItem}>
                    {fecha}: <Text style={{ fontWeight: 'bold' }}>{String(cantidad)}</Text>
                  </Text>
                ))
              )}
            </View>
            <View style={styles.dashboardPorDiaCard}>
              <Text style={styles.dashboardTitle}>Suelos ensayados hoy</Text>
              {Object.keys(ensayosSuelosPorDia).length === 0 ? (
                <Text style={styles.dashboardPorDiaNoData}>Sin datos</Text>
              ) : (
                Object.entries(ensayosSuelosPorDia).map(([fecha, cantidad]) => (
                  <Text key={fecha} style={styles.dashboardPorDiaItem}>
                    {fecha}: <Text style={{ fontWeight: 'bold' }}>{String(cantidad)}</Text>
                  </Text>
                ))
              )}
            </View>
          </View>

          {/* Gráfica de barras de concreto */}
          <Text style={styles.chartTitle}>Ensayes de Concreto - Mes Actual</Text>
          <ScrollView
            horizontal
            contentContainerStyle={{
              width: Math.max(barContainerWidth, screenWidth),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={[styles.chartContainer, { alignSelf: 'center', justifyContent: 'center' }]}>
              {dailyConcreto.map((data) => {
                const barHeight = (data.count / maxConcreto) * 70 + 5;
                return (
                  <View
                    key={data.day}
                    style={{ alignItems: 'center', width: barWidth, marginHorizontal: 2, justifyContent: 'center' }}
                  >
                    <View
                      style={{
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: '#1E90FF',
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                        alignSelf: 'center',
                      }}
                    />
                    <Text style={styles.barLabel}>{data.day}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Gráfica de barras de suelos */}
          <Text style={styles.chartTitle}>Ensayes de Suelos - Mes Actual</Text>
          <ScrollView
            horizontal
            contentContainerStyle={{
              width: Math.max(barContainerWidth, screenWidth),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View style={[styles.chartContainer, { alignSelf: 'center', justifyContent: 'center' }]}>
              {dailySuelo.map((data) => {
                const barHeight = (data.count / maxSuelo) * 70 + 5;
                return (
                  <View
                    key={data.day}
                    style={{ alignItems: 'center', width: barWidth, marginHorizontal: 2, justifyContent: 'center' }}
                  >
                    <View
                      style={{
                        height: barHeight,
                        width: barWidth,
                        backgroundColor: '#FF8C00',
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                        alignSelf: 'center',
                      }}
                    />
                    <Text style={styles.barLabel}>{data.day}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Tabla de concreto */}
          <Text style={styles.title}>Ensayes de especimenes de concreto</Text>
          <TextInput
            style={[styles.input, { marginBottom: 4, width: 180, alignSelf: 'center' }]}
            placeholder="Buscar en concreto..."
            value={busquedaConcreto}
            onChangeText={setBusquedaConcreto}
          />
          <View style={[styles.table, { alignSelf: 'center' }]}>
            <ScrollView horizontal contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
              <View>
                <View style={styles.tableRowHeader}>
                  {headersConcreto.map((header, idx) => (
                    <Text key={idx} style={styles.tableHeader}>
                      {header}
                    </Text>
                  ))}
                </View>
                {filtradosConcreto.length === 0 ? (
                  <Text style={styles.noData}>No hay ensayes registrados.</Text>
                ) : (
                  filtradosConcreto.map((item, idx) => (
                    <View key={item.id ?? idx} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.id}</Text>
                      <Text style={styles.tableCell}>{item.obra}</Text>
                      <Text style={styles.tableCell}>{item.claveReporte}</Text>
                      <Text style={styles.tableCell}>{item.fecha}</Text>
                      <Text style={styles.tableCell}>{item.noMuestra}</Text>
                      <Text style={styles.tableCell}>{item.noEspecimenes}</Text>
                      <Text style={styles.tableCell}>{item.noRemision}</Text>
                      <Text style={styles.tableCell}>{item.elementoColado}</Text>
                      <Text style={styles.tableCell}>{item.fc}</Text>
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
          <Text style={styles.title}>Ensayes de Suelos</Text>
          <TextInput
            style={[styles.input, { marginBottom: 4, width: 180, alignSelf: 'center' }]}
            placeholder="Buscar en suelos..."
            value={busquedaSuelos}
            onChangeText={setBusquedaSuelos}
          />
          <View style={{ alignItems: 'center', width: '100%', justifyContent: 'center', alignSelf: 'center' }}>
            <View style={[styles.table, { alignSelf: 'center' }]}>
              <ScrollView horizontal contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
                <View>
                  <View style={styles.tableRowHeader}>
                    {headersSuelos.map((header, idx) => (
                      <Text key={idx} style={styles.tableHeader}>
                        {header}
                      </Text>
                    ))}
                  </View>
                  {filtradosSuelos.length === 0 ? (
                    <Text style={styles.noData}>No hay ensayes guardados.</Text>
                  ) : (
                    filtradosSuelos.map((item, idx) => (
                      <View key={item.id ?? idx} style={styles.tableRow}>
                        <Text style={styles.tableCell}>{item.id}</Text>
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
          </View>

          {/* Botón para regresar */}
          <TouchableOpacity style={[styles.button, { alignSelf: 'center' }]} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Regresar</Text>
          </TouchableOpacity>

          {/* Botón para vaciar tablas */}
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger, { alignSelf: 'center' }]}
            onPress={handleVaciarTablas}
          >
            <Text style={styles.buttonText}>Vaciar todas las tablas</Text>
          </TouchableOpacity>

          {/* Modal de verificación para vaciar tablas */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { alignSelf: 'center', alignItems: 'center' }]}>
                <Text style={styles.modalTitle}>Confirmar borrado</Text>
                <Text style={styles.modalText}>
                  Ingresa el código para confirmar el borrado de todas las tablas.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Código de verificación"
                  value={codigo}
                  onChangeText={setCodigo}
                  keyboardType="numeric"
                  secureTextEntry
                  textAlign="center"
                />
                {errorCodigo ? (
                  <Text style={styles.errorText}>{errorCodigo}</Text>
                ) : null}
                <View style={[styles.modalButtons, { alignSelf: 'center', justifyContent: 'center' }]}>
                  <TouchableOpacity
                    style={[styles.button, styles.modalButton, { alignSelf: 'center' }]}
                    onPress={verificarCodigo}
                  >
                    <Text style={styles.buttonText}>Aceptar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.modalButton, styles.modalButtonCancel, { alignSelf: 'center' }]}
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
  );
}

// Estilos para todos los elementos del Dashboard
const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#f5f8fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f8fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    paddingBottom: 10,
    width: '100%',
  },
  // Dashboard styles
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
    gap: 6,
    alignSelf: 'center',
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    minWidth: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    borderWidth: 0.5,
    borderColor: '#e0e6ed',
    alignSelf: 'center',
  },
  dashboardTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0057B7',
    marginBottom: 1,
    textAlign: 'center',
    alignSelf: 'center',
  },
  dashboardCount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E90FF',
    textAlign: 'center',
    alignSelf: 'center',
  },
  dashboardLabel: {
    fontSize: 8,
    color: '#0057B7',
    marginTop: 1,
    textAlign: 'center',
    alignSelf: 'center',
  },
  // Dashboard por día styles
  dashboardPorDiaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
    gap: 6,
    alignSelf: 'center',
  },
  dashboardPorDiaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    minWidth: 70,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    borderWidth: 0.5,
    borderColor: '#e0e6ed',
    alignSelf: 'center',
  },
  dashboardPorDiaItem: {
    fontSize: 8,
    color: '#0057B7',
    marginBottom: 1,
    textAlign: 'center',
    alignSelf: 'center',
  },
  dashboardPorDiaNoData: {
    fontSize: 8,
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 10,
    color: '#0057B7',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: 0.5,
    width: '100%',
    marginTop: 7,
    alignSelf: 'center',
  },
  table: {
    borderWidth: 0.5,
    borderColor: '#C3D1E6',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 7,
    minWidth: 400,
    maxHeight: 110,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#0057B7',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    alignSelf: 'center',
  },
  tableHeader: {
    flex: 1,
    paddingVertical: 1,
    paddingHorizontal: 1,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 6,
    borderRightWidth: 0.5,
    borderRightColor: '#C3D1E6',
    textAlign: 'center',
    minWidth: 30,
    alignSelf: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#C3D1E6',
    backgroundColor: '#F0F4F8',
    alignSelf: 'center',
  },
  tableCell: {
    flex: 1,
    paddingVertical: 1,
    paddingHorizontal: 1,
    fontSize: 5,
    color: '#0057B7',
    borderRightWidth: 0.5,
    borderRightColor: '#C3D1E6',
    textAlign: 'center',
    minWidth: 30,
    alignSelf: 'center',
  },
  noData: {
    color: '#0057B7',
    fontSize: 8,
    marginTop: 7,
    textAlign: 'center',
    fontWeight: '600',
    padding: 7,
    width: '100%',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#1E90FF',
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 7,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
    width: 90,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonDanger: {
    backgroundColor: '#FF4136',
  },
  buttonText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'center',
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: 170,
    elevation: 6,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
    alignSelf: 'center',
  },
  modalText: {
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 8,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#C3D1E6',
    borderRadius: 6,
    padding: 4,
    marginBottom: 6,
    fontSize: 9,
    backgroundColor: '#F0F4F8',
    textAlign: 'center',
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 8,
    alignSelf: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    width: 45,
    marginTop: 0,
    paddingVertical: 4,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#aaa',
  },
  // Estilos para gráficas
  chartTitle: {
    fontSize: 9,
    color: '#0057B7',
    fontWeight: 'bold',
    marginTop: 7,
    marginBottom: 3,
    textAlign: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    paddingBottom: 6,
    paddingHorizontal: 2,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  barLabel: {
    fontSize: 5,
    color: '#0057B7',
    marginTop: 1,
    textAlign: 'center',
    alignSelf: 'center',
  },
});