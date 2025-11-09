import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, SafeAreaView } from 'react-native';

// *** CONSTANTES DE MARCA ***
const COLOR_PRIMARY = '#003366'; // Azul Oscuro de Marca
const COLOR_ACCENT = '#FFD700'; // Dorado/Amarillo de Contraste
const COLOR_BACKGROUND = '#F5F5F5'; // Fondo Suave
const COLOR_TEXT_DARK = '#333333';
const COLOR_LIGHT_GRAY = '#E0E0E0'; // Borde sutil

// Función para sanitizar la entrada (permite números y punto decimal)
const cleanDecimalInput = (text: string) => {
    let clean = text.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    return clean;
};

export default function EnsayarConcretos() {
    // Variables para cada label (manteniendo la lógica y estados originales)
    const [obra, setObra] = useState('');
    const [claveReporte, setClaveReporte] = useState('');
    const [fecha, setFecha] = useState('');
    const [noMuestra, setNoMuestra] = useState('');
    const [noEspecimenes, setNoEspecimenes] = useState('');
    const [noRemision, setNoRemision] = useState('');
    const [elementoColado, setElementoColado] = useState('');
    const [fc, setFc] = useState('');
    const [revenimientoProyecto, setRevenimientoProyecto] = useState('');
    const [revenimientoObra, setRevenimientoObra] = useState('');
    const [equipoMezclado, setEquipoMezclado] = useState('');
    const [nombreConcretera, setNombreConcretera] = useState('');
    const [cementoMarcaTipo, setCementoMarcaTipo] = useState('');
    const [aditivo, setAditivo] = useState('');
    const [vibradorUtilizado, setVibradorUtilizado] = useState('');
    const [claveEquipoUtilizado, setClaveEquipoUtilizado] = useState('');
    const [diasRuptura, setDiasRuptura] = useState('');
    const [horaInicioColado, setHoraInicioColado] = useState('');
    const [horaTerminoColado, setHoraTerminoColado] = useState('');
    const [horaElaboracionEspecimen, setHoraElaboracionEspecimen] = useState('');
    const [camionRevolvedor, setCamionRevolvedor] = useState('');
    const [temperaturaConcreto, setTemperaturaConcreto] = useState('');
    const [temperaturaAmbiente, setTemperaturaAmbiente] = useState('');
    const [tipoEspecimen, setTipoEspecimen] = useState('');
    
    const scrollRef = useRef<ScrollView>(null);
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Función para guardar el ensaye (SIN CAMBIOS FUNCIONALES)
    const guardarEnsaye = async () => {
        try {
            // Validar rango de especímenes
            const cantidad = parseInt(noEspecimenes, 10) || 1;
            if (cantidad < 1 || cantidad > 5) {
                Alert.alert('Error', 'El número de especímenes debe ser entre 1 y 5.');
                return;
            }

            // Obtener el último ID de EnsayesConcreto y EnsayesSuelos
            const lastIdConcretoStr = await AsyncStorage.getItem('EnsayesConcreto_lastId');
            const lastIdConcreto = lastIdConcretoStr ? parseInt(lastIdConcretoStr, 10) : 0;

            const lastIdSuelosStr = await AsyncStorage.getItem('EnsayesSuelos_lastId');
            const lastIdSuelos = lastIdSuelosStr ? parseInt(lastIdSuelosStr, 10) : 0;

            // Usar el mayor de ambos y sumarle 1
            let newId = Math.max(lastIdConcreto, lastIdSuelos) + 1;

            // Obtener la tabla actual
            const tablaStr = await AsyncStorage.getItem('EnsayesConcreto');
            const tabla = tablaStr ? JSON.parse(tablaStr) : [];

            // Guardar cada espécimen con un ID único
            for (let i = 0; i < cantidad; i++) {
                const datos = {
                    id: newId,
                    obra, claveReporte, fecha, noMuestra, noEspecimenes, noRemision,
                    elementoColado, fc, revenimientoProyecto, revenimientoObra,
                    equipoMezclado, nombreConcretera, cementoMarcaTipo, aditivo,
                    vibradorUtilizado, claveEquipoUtilizado, diasRuptura,
                    horaInicioColado, horaTerminoColado, horaElaboracionEspecimen,
                    camionRevolvedor, temperaturaConcreto, temperaturaAmbiente,
                    tipoEspecimen,
                };
                tabla.push(datos);
                newId++;
            }

            // Guardar la tabla y el nuevo lastId
            await AsyncStorage.setItem('EnsayesConcreto', JSON.stringify(tabla));
            await AsyncStorage.setItem('EnsayesConcreto_lastId', (newId - 1).toString());

            // Mostrar alerta con el rango de ensayes
            const primerId = newId - cantidad;
            const ultimoId = newId - 1;
            Alert.alert(
                '¡Guardado!',
                cantidad === 1
                    ? `El número de ensaye es: ${primerId}`
                    : `Los números de ensaye son: ${primerId} al ${ultimoId}`
            );

            // Limpiar los campos después de guardar
            setObra(''); setClaveReporte(''); setFecha(''); setNoMuestra('');
            setNoEspecimenes(''); setNoRemision(''); setElementoColado('');
            setFc(''); setRevenimientoProyecto(''); setRevenimientoObra('');
            setEquipoMezclado(''); setNombreConcretera(''); setCementoMarcaTipo('');
            setAditivo(''); setVibradorUtilizado(''); setClaveEquipoUtilizado('');
            setDiasRuptura(''); setHoraInicioColado(''); setHoraTerminoColado('');
            setHoraElaboracionEspecimen(''); setCamionRevolvedor('');
            setTemperaturaConcreto(''); setTemperaturaAmbiente(''); setTipoEspecimen('');
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar el ensaye.');
        }
    };

    // Nueva función para limitar el valor de noEspecimenes (lógica simplificada)
    const handleNoEspecimenesChange = (text: string) => {
        let value = text.replace(/[^0-9]/g, '');
        if (value) {
            let num = parseInt(value, 10);
            if (num < 1) num = 1;
            if (num > 5) num = 5;
            setNoEspecimenes(num.toString());
        } else {
            setNoEspecimenes('');
        }
    };
    
    // Función de limpieza para inputs de texto (no numéricos)
    const cleanTextInput = (text: string) => text;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLOR_PRIMARY }}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Registro de Ensayes de Concreto</Text>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Datos de Trazabilidad</Text>
                        
                        {/* Grupo 1: Datos de Identificación */}
                        <View style={styles.inputGroupContainer}>
                            <CustomInput label="Obra" value={obra} setValue={setObra} cleanInput={cleanTextInput} />
                            <CustomInput label="Clave reporte" value={claveReporte} setValue={setClaveReporte} cleanInput={cleanTextInput} />
                            <CustomInput label="Fecha" value={fecha} setValue={setFecha} cleanInput={cleanTextInput} placeholder="dd/mm/aaaa"/>
                        </View>
                        
                        {/* Grupo 2: Datos de Colado y Resistencia */}
                        <Text style={styles.sectionSubtitle}>Datos de Colado y Muestra</Text>
                        <View style={styles.inputGroupContainer}>
                            <CustomInput label="No. Muestra" value={noMuestra} setValue={setNoMuestra} cleanInput={cleanDecimalInput} />
                            <CustomInput label="No. Especímenes (máx. 5)" value={noEspecimenes} setValue={handleNoEspecimenesChange} cleanInput={cleanDecimalInput} />
                            <CustomInput label="Tipo de espécimen (Cilindro, Viga o Mortero)" value={tipoEspecimen} setValue={setTipoEspecimen} cleanInput={cleanTextInput} />
                            <CustomInput label="Elemento colado" value={elementoColado} setValue={setElementoColado} cleanInput={cleanTextInput} />
                            <CustomInput label="F´C (kg/cm²)" value={fc} setValue={setFc} cleanInput={cleanDecimalInput} />
                            <CustomInput label="Días para ruptura" value={diasRuptura} setValue={setDiasRuptura} cleanInput={cleanDecimalInput} />
                        </View>
                        
                        {/* Grupo 3: Datos de Mezcla y Control */}
                        <Text style={styles.sectionSubtitle}>Datos de Mezcla y Equipos</Text>
                        <View style={styles.inputGroupContainer}>
                            <CustomInput label="Revenimiento del proyecto (cm)" value={revenimientoProyecto} setValue={setRevenimientoProyecto} cleanInput={cleanDecimalInput} />
                            <CustomInput label="Revenimiento en obra (cm)" value={revenimientoObra} setValue={setRevenimientoObra} cleanInput={cleanDecimalInput} />
                            <CustomInput label="Temperatura del concreto (°C)" value={temperaturaConcreto} setValue={setTemperaturaConcreto} cleanInput={cleanDecimalInput} />
                            <CustomInput label="Temperatura ambiente (°C)" value={temperaturaAmbiente} setValue={setTemperaturaAmbiente} cleanInput={cleanDecimalInput} />
                            <CustomInput label="Nombre de la concretera" value={nombreConcretera} setValue={setNombreConcretera} cleanInput={cleanTextInput} />
                            <CustomInput label="No.Remision" value={noRemision} setValue={setNoRemision} cleanInput={cleanTextInput} />
                            <CustomInput label="Camión revolvedor" value={camionRevolvedor} setValue={setCamionRevolvedor} cleanInput={cleanTextInput} />
                            <CustomInput label="Equipo de mezclado" value={equipoMezclado} setValue={setEquipoMezclado} cleanInput={cleanTextInput} />
                            <CustomInput label="Clave de equipo utilizado" value={claveEquipoUtilizado} setValue={setClaveEquipoUtilizado} cleanInput={cleanTextInput} />
                            <CustomInput label="Vibrador utilizado" value={vibradorUtilizado} setValue={setVibradorUtilizado} cleanInput={cleanTextInput} />
                            <CustomInput label="Cemento marca y tipo" value={cementoMarcaTipo} setValue={setCementoMarcaTipo} cleanInput={cleanTextInput} />
                            <CustomInput label="Aditivo" value={aditivo} setValue={setAditivo} cleanInput={cleanTextInput} />
                        </View>
                        
                        {/* Grupo 4: Horarios */}
                        <Text style={styles.sectionSubtitle}>Horarios</Text>
                        <View style={styles.inputGroupContainer}>
                            <CustomInput label="Hora de inicio del colado" value={horaInicioColado} setValue={setHoraInicioColado} cleanInput={cleanTextInput} placeholder="HH:MM"/>
                            <CustomInput label="Hora de termino del colado" value={horaTerminoColado} setValue={setHoraTerminoColado} cleanInput={cleanTextInput} placeholder="HH:MM"/>
                            <CustomInput label="Hora de elaboración del espécimen" value={horaElaboracionEspecimen} setValue={setHoraElaboracionEspecimen} cleanInput={cleanTextInput} placeholder="HH:MM"/>
                        </View>


                        {/* Botón final de acción */}
                        <TouchableOpacity style={[styles.button, { backgroundColor: COLOR_ACCENT }]} onPress={guardarEnsaye}>
                            <Text style={[styles.buttonText, { color: COLOR_PRIMARY }]}>GUARDAR ENSAYE</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Componente CustomInput estandarizado
function CustomInput({
    label,
    value,
    setValue,
    cleanInput,
    placeholder,
}: {
    label: string;
    value: string;
    setValue: (v: string) => void;
    cleanInput: (t: string) => string;
    placeholder?: string;
}) {
    // La lógica de validación min/max se ha movido al componente padre (handleNoEspecimenesChange)
    const handleChange = (text: string) => {
        setValue(cleanInput(text));
    };

    // Determina el tipo de teclado basado en la función de limpieza (si limpia decimales, es numérico)
    const isNumeric = cleanInput.name === 'cleanDecimalInput' || label.includes('No.');

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={handleChange}
                placeholder={placeholder || `Escribe ${label.toLowerCase()}`}
                placeholderTextColor="#999"
                keyboardType={isNumeric ? 'numeric' : 'default'}
                returnKeyType="next"
            />
        </View>
    );
}

// Estilos estandarizados de la marca
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
    // Tarjeta Flotante
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
    // Título principal de la tarjeta
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
    // Subtítulo para dividir grandes secciones del formulario
    sectionSubtitle: {
        fontSize: 16,
        color: COLOR_TEXT_DARK,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 10,
        paddingBottom: 2,
        borderBottomWidth: 1,
        borderBottomColor: COLOR_LIGHT_GRAY,
        textAlign: 'left',
    },
    // Contenedor de inputs
    inputGroupContainer: {
        // Puede usarse para estilos de cuadrícula si fuera necesario, aquí mantiene un listado vertical limpio
        marginBottom: 5, 
    },
    inputGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        color: COLOR_PRIMARY,
        fontSize: 15,
        marginBottom: 6,
        fontWeight: '500',
    },
    // Input Estandarizado
    input: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 14,
        fontSize: 17,
        textAlign: 'left',
        borderWidth: 2,
        borderColor: COLOR_LIGHT_GRAY,
        fontWeight: '500',
        color: COLOR_TEXT_DARK,
    },
    // Botón de Acción Principal (Dorado/Azul)
    button: {
        paddingVertical: 14,
        borderRadius: 30,
        marginTop: 25,
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
    // Estilos de resultados/errores (no usados en esta pantalla, pero mantenidos por consistencia)
    cardResult: {},
    resultText: {},
    resultValue: {},
    errorText: {},
});