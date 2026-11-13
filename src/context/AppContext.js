import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  pacientesApi,
  medicosApi,
  horariosApi,
  disponibilidadApi,
  citasApi,
  checkApiHealth
} from '../services/api';
import {
  INITIAL_PACIENTES,
  INITIAL_MEDICOS,
  INITIAL_HORARIOS,
  INITIAL_DISPONIBILIDADES,
  INITIAL_CITAS
} from './mockData';
import { generarTurnos30Min } from '../utils/timeUtils';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [citas, setCitas] = useState([]);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Función para recargar todos los datos desde MySQL
  const cargarDatosDesdeMySQL = useCallback(async () => {
    try {
      setIsLoading(true);
      const online = await checkApiHealth();
      setIsServerOnline(online);

      if (online) {
        const [pacientesRes, medicosRes, horariosRes, dispRes, citasRes] = await Promise.all([
          pacientesApi.getAll(),
          medicosApi.getAll(),
          horariosApi.getAll(),
          disponibilidadApi.getAll(),
          citasApi.getAll()
        ]);

        setPacientes(pacientesRes);
        setMedicos(medicosRes);
        setHorarios(horariosRes);
        // Asegurar que cada disponibilidad tenga un identificador único para las keys de React
        setDisponibilidades(
          dispRes.map((d) => ({
            ...d,
            id_disponibilidad: d.id_disponibilidad || `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}`
          }))
        );
        setCitas(citasRes);
      } else {
        // Modo local de respaldo si el backend no estuviese activo
        console.warn('⚠️ [Frontend] Backend no detectado. Cargando datos locales de respaldo.');
        const savedPacientes = localStorage.getItem('hospital_pacientes');
        setPacientes(savedPacientes ? JSON.parse(savedPacientes) : INITIAL_PACIENTES);
        const savedMedicos = localStorage.getItem('hospital_medicos');
        setMedicos(savedMedicos ? JSON.parse(savedMedicos) : INITIAL_MEDICOS);
        const savedHorarios = localStorage.getItem('hospital_horarios');
        setHorarios(savedHorarios ? JSON.parse(savedHorarios) : INITIAL_HORARIOS);
        const savedDisp = localStorage.getItem('hospital_disponibilidades');
        setDisponibilidades(savedDisp ? JSON.parse(savedDisp) : INITIAL_DISPONIBILIDADES);
        const savedCitas = localStorage.getItem('hospital_citas');
        setCitas(savedCitas ? JSON.parse(savedCitas) : INITIAL_CITAS);
      }
    } catch (error) {
      console.error('Error al cargar datos desde el backend:', error);
      setIsServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial al montar el componente
  useEffect(() => {
    cargarDatosDesdeMySQL();
  }, [cargarDatosDesdeMySQL]);

  // ===================== CRUD PACIENTES =====================
  const registrarPaciente = async (nuevoPaciente) => {
    if (isServerOnline) {
      await pacientesApi.create(nuevoPaciente);
      const data = await pacientesApi.getAll();
      setPacientes(data);
    } else {
      const existe = pacientes.some(
        (p) => String(p.documento_identidad).trim() === String(nuevoPaciente.documento_identidad).trim()
      );
      if (existe) {
        throw new Error(`El paciente con documento ${nuevoPaciente.documento_identidad} ya está registrado.`);
      }
      const updated = [...pacientes, nuevoPaciente];
      setPacientes(updated);
      localStorage.setItem('hospital_pacientes', JSON.stringify(updated));
    }
  };

  const modificarPaciente = async (documento, datosActualizados) => {
    if (isServerOnline) {
      await pacientesApi.update(documento, datosActualizados);
      const data = await pacientesApi.getAll();
      setPacientes(data);
    } else {
      const updated = pacientes.map((p) =>
        String(p.documento_identidad) === String(documento)
          ? { ...p, ...datosActualizados, documento_identidad: documento }
          : p
      );
      setPacientes(updated);
      localStorage.setItem('hospital_pacientes', JSON.stringify(updated));
    }
  };

  const eliminarPaciente = async (documento) => {
    if (isServerOnline) {
      await pacientesApi.delete(documento);
      const data = await pacientesApi.getAll();
      setPacientes(data);
    } else {
      const tieneCitas = citas.some(
        (c) => String(c.documento_paciente) === String(documento) && c.estado_cita === 'Programada'
      );
      if (tieneCitas) {
        throw new Error('No se puede eliminar el paciente porque tiene citas médicas activas.');
      }
      const updated = pacientes.filter((p) => String(p.documento_identidad) !== String(documento));
      setPacientes(updated);
      localStorage.setItem('hospital_pacientes', JSON.stringify(updated));
    }
  };

  // ===================== CRUD MÉDICOS =====================
  const registrarMedico = async (nuevoMedico) => {
    if (isServerOnline) {
      await medicosApi.create(nuevoMedico);
      const data = await medicosApi.getAll();
      setMedicos(data);
    } else {
      const existe = medicos.some(
        (m) => String(m.documento_identidad).trim() === String(nuevoMedico.documento_identidad).trim()
      );
      if (existe) {
        throw new Error(`El médico con documento ${nuevoMedico.documento_identidad} ya está registrado.`);
      }
      const updated = [...medicos, nuevoMedico];
      setMedicos(updated);
      localStorage.setItem('hospital_medicos', JSON.stringify(updated));
    }
  };

  const modificarMedico = async (documento, datosActualizados) => {
    if (isServerOnline) {
      await medicosApi.update(documento, datosActualizados);
      const data = await medicosApi.getAll();
      setMedicos(data);
    } else {
      const updated = medicos.map((m) =>
        String(m.documento_identidad) === String(documento)
          ? { ...m, ...datosActualizados, documento_identidad: documento }
          : m
      );
      setMedicos(updated);
      localStorage.setItem('hospital_medicos', JSON.stringify(updated));
    }
  };

  const eliminarMedico = async (documento) => {
    if (isServerOnline) {
      await medicosApi.delete(documento);
      const [mRes, dRes] = await Promise.all([medicosApi.getAll(), disponibilidadApi.getAll()]);
      setMedicos(mRes);
      setDisponibilidades(dRes);
    } else {
      const tieneCitas = citas.some(
        (c) => String(c.documento_medico) === String(documento) && c.estado_cita === 'Programada'
      );
      if (tieneCitas) {
        throw new Error('No se puede eliminar el médico porque tiene citas médicas programadas.');
      }
      const updatedM = medicos.filter((m) => String(m.documento_identidad) !== String(documento));
      setMedicos(updatedM);
      const updatedD = disponibilidades.filter((d) => String(d.documento_medico) !== String(documento));
      setDisponibilidades(updatedD);
      localStorage.setItem('hospital_medicos', JSON.stringify(updatedM));
      localStorage.setItem('hospital_disponibilidades', JSON.stringify(updatedD));
    }
  };

  // ===================== CRUD HORARIOS =====================
  const registrarHorario = async (nuevoHorario) => {
    if (isServerOnline) {
      const res = await horariosApi.create(nuevoHorario);
      const data = await horariosApi.getAll();
      setHorarios(data);
      return res.horario;
    } else {
      const maxId = horarios.reduce((max, h) => (Number(h.id_sala) > max ? Number(h.id_sala) : max), 100);
      const id_sala = nuevoHorario.id_sala ? Number(nuevoHorario.id_sala) : maxId + 1;
      const horarioFinal = { ...nuevoHorario, id_sala };
      const updated = [...horarios, horarioFinal];
      setHorarios(updated);
      localStorage.setItem('hospital_horarios', JSON.stringify(updated));
      return horarioFinal;
    }
  };

  const modificarHorario = async (id_sala, datosActualizados) => {
    if (isServerOnline) {
      await horariosApi.update(id_sala, datosActualizados);
      const data = await horariosApi.getAll();
      setHorarios(data);
    } else {
      const updated = horarios.map((h) =>
        Number(h.id_sala) === Number(id_sala)
          ? { ...h, ...datosActualizados, id_sala: Number(id_sala) }
          : h
      );
      setHorarios(updated);
      localStorage.setItem('hospital_horarios', JSON.stringify(updated));
    }
  };

  const eliminarHorario = async (id_sala) => {
    if (isServerOnline) {
      await horariosApi.delete(id_sala);
      const [hRes, dRes] = await Promise.all([horariosApi.getAll(), disponibilidadApi.getAll()]);
      setHorarios(hRes);
      setDisponibilidades(dRes);
    } else {
      const tieneCitas = citas.some(
        (c) => Number(c.id_sala) === Number(id_sala) && c.estado_cita === 'Programada'
      );
      if (tieneCitas) {
        throw new Error('No se puede eliminar este horario de sala porque tiene citas programadas.');
      }
      const updatedH = horarios.filter((h) => Number(h.id_sala) !== Number(id_sala));
      setHorarios(updatedH);
      const updatedD = disponibilidades.filter((d) => Number(d.id_sala) !== Number(id_sala));
      setDisponibilidades(updatedD);
      localStorage.setItem('hospital_horarios', JSON.stringify(updatedH));
      localStorage.setItem('hospital_disponibilidades', JSON.stringify(updatedD));
    }
  };

  // ===================== DISPONIBILIDAD (Turnos de 30 min) =====================
  const generarTurnosParaMedico = async (documento_medico, id_sala) => {
    if (isServerOnline) {
      const res = await disponibilidadApi.generar(documento_medico, id_sala);
      const dispData = await disponibilidadApi.getAll();
      setDisponibilidades(
        dispData.map((d) => ({
          ...d,
          id_disponibilidad: `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}`
        }))
      );
      return res.totalGenerados;
    } else {
      const horario = horarios.find((h) => Number(h.id_sala) === Number(id_sala));
      if (!horario) throw new Error('Horario / Sala no encontrado.');

      const bloques = generarTurnos30Min(horario.hora_inicial, horario.hora_final);
      if (bloques.length === 0) throw new Error('Rango horario inválido o menor a 30 minutos.');

      const nuevosTurnos = [];
      bloques.forEach((bloque, index) => {
        const yaExiste = disponibilidades.some(
          (d) =>
            String(d.documento_medico) === String(documento_medico) &&
            Number(d.id_sala) === Number(id_sala) &&
            d.horario_atencion === bloque
        );

        if (!yaExiste) {
          nuevosTurnos.push({
            id_disponibilidad: `DISP-${id_sala}-${Date.now()}-${index}`,
            documento_medico: String(documento_medico),
            id_sala: Number(id_sala),
            horario_atencion: bloque,
            estado: 0
          });
        }
      });

      if (nuevosTurnos.length === 0) {
        throw new Error('Todos los turnos de este horario ya se encontraban generados para este médico.');
      }

      const updated = [...disponibilidades, ...nuevosTurnos];
      setDisponibilidades(updated);
      localStorage.setItem('hospital_disponibilidades', JSON.stringify(updated));
      return nuevosTurnos.length;
    }
  };

  const cambiarEstadoTurnoManual = async (identificadorOTurno, nuevoEstado) => {
    if (isServerOnline) {
      let doc, sala, horario;
      if (typeof identificadorOTurno === 'object' && identificadorOTurno !== null) {
        doc = identificadorOTurno.documento_medico;
        sala = identificadorOTurno.id_sala;
        horario = identificadorOTurno.horario_atencion;
      } else {
        const target = disponibilidades.find(
          (d) =>
            d.id_disponibilidad === identificadorOTurno ||
            `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}` === identificadorOTurno
        );
        if (target) {
          doc = target.documento_medico;
          sala = target.id_sala;
          horario = target.horario_atencion;
        }
      }

      if (doc && sala && horario) {
        await disponibilidadApi.cambiarEstado(doc, sala, horario, nuevoEstado);
        const dispData = await disponibilidadApi.getAll();
        setDisponibilidades(
          dispData.map((d) => ({
            ...d,
            id_disponibilidad: `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}`
          }))
        );
      }
    } else {
      const updated = disponibilidades.map((d) =>
        d.id_disponibilidad === identificadorOTurno
          ? { ...d, estado: Number(nuevoEstado) }
          : d
      );
      setDisponibilidades(updated);
      localStorage.setItem('hospital_disponibilidades', JSON.stringify(updated));
    }
  };

  const eliminarDisponibilidad = async (identificadorOTurno) => {
    if (isServerOnline) {
      let doc, sala, horario;
      if (typeof identificadorOTurno === 'object' && identificadorOTurno !== null) {
        doc = identificadorOTurno.documento_medico;
        sala = identificadorOTurno.id_sala;
        horario = identificadorOTurno.horario_atencion;
      } else {
        const target = disponibilidades.find(
          (d) =>
            d.id_disponibilidad === identificadorOTurno ||
            `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}` === identificadorOTurno
        );
        if (target) {
          doc = target.documento_medico;
          sala = target.id_sala;
          horario = target.horario_atencion;
        }
      }

      if (doc && sala && horario) {
        await disponibilidadApi.delete(doc, sala, horario);
        const dispData = await disponibilidadApi.getAll();
        setDisponibilidades(
          dispData.map((d) => ({
            ...d,
            id_disponibilidad: `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}`
          }))
        );
      }
    } else {
      const turno = disponibilidades.find((d) => d.id_disponibilidad === identificadorOTurno);
      if (turno && turno.estado === 1) {
        throw new Error('No se puede eliminar un turno que actualmente está ocupado por una cita.');
      }
      const updated = disponibilidades.filter((d) => d.id_disponibilidad !== identificadorOTurno);
      setDisponibilidades(updated);
      localStorage.setItem('hospital_disponibilidades', JSON.stringify(updated));
    }
  };

  // ===================== CRUD CITAS MÉDICAS =====================
  const registrarCita = async ({
    documento_paciente,
    documento_medico,
    id_sala,
    horario_atencion,
    motivo = 'Consulta médica'
  }) => {
    if (isServerOnline) {
      const res = await citasApi.create({
        documento_paciente,
        documento_medico,
        id_sala,
        horario_atencion,
        motivo
      });

      // Recargar citas y disponibilidades actualizadas desde MySQL
      const [citasRes, dispRes] = await Promise.all([
        citasApi.getAll(),
        disponibilidadApi.getAll()
      ]);
      setCitas(citasRes);
      setDisponibilidades(
        dispRes.map((d) => ({
          ...d,
          id_disponibilidad: `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}`
        }))
      );
      return res;
    } else {
      const paciente = pacientes.find((p) => String(p.documento_identidad) === String(documento_paciente));
      if (!paciente) throw new Error('El paciente seleccionado no existe.');

      const turno = disponibilidades.find(
        (d) =>
          String(d.documento_medico) === String(documento_medico) &&
          Number(d.id_sala) === Number(id_sala) &&
          d.horario_atencion === horario_atencion
      );

      if (!turno) throw new Error('El turno seleccionado no está registrado en la disponibilidad.');
      if (Number(turno.estado) === 1) {
        throw new Error('El turno seleccionado ya se encuentra OCUPADO.');
      }

      const maxCitaId = citas.reduce((max, c) => (Number(c.id_cita) > max ? Number(c.id_cita) : max), 0);
      const nuevaCita = {
        id_cita: maxCitaId + 1,
        documento_paciente: String(documento_paciente),
        documento_medico: String(documento_medico),
        id_sala: Number(id_sala),
        horario_atencion,
        fecha_reserva: new Date().toISOString().split('T')[0],
        motivo: motivo.trim() || 'Consulta médica',
        estado_cita: 'Programada'
      };

      const updatedD = disponibilidades.map((d) =>
        String(d.documento_medico) === String(documento_medico) &&
        Number(d.id_sala) === Number(id_sala) &&
        d.horario_atencion === horario_atencion
          ? { ...d, estado: 1 }
          : d
      );

      const updatedC = [...citas, nuevaCita];
      setDisponibilidades(updatedD);
      setCitas(updatedC);
      localStorage.setItem('hospital_disponibilidades', JSON.stringify(updatedD));
      localStorage.setItem('hospital_citas', JSON.stringify(updatedC));
      return nuevaCita;
    }
  };

  const cancelarCita = async (id_cita) => {
    if (isServerOnline) {
      await citasApi.cancelar(id_cita);
      const [citasRes, dispRes] = await Promise.all([
        citasApi.getAll(),
        disponibilidadApi.getAll()
      ]);
      setCitas(citasRes);
      setDisponibilidades(
        dispRes.map((d) => ({
          ...d,
          id_disponibilidad: `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}`
        }))
      );
    } else {
      const cita = citas.find((c) => Number(c.id_cita) === Number(id_cita));
      if (!cita) throw new Error('Cita no encontrada.');

      const updatedD = disponibilidades.map((d) =>
        String(d.documento_medico) === String(cita.documento_medico) &&
        Number(d.id_sala) === Number(cita.id_sala) &&
        d.horario_atencion === cita.horario_atencion
          ? { ...d, estado: 0 }
          : d
      );

      const updatedC = citas.map((c) =>
        Number(c.id_cita) === Number(id_cita)
          ? { ...c, estado_cita: 'Cancelada' }
          : c
      );

      setDisponibilidades(updatedD);
      setCitas(updatedC);
      localStorage.setItem('hospital_disponibilidades', JSON.stringify(updatedD));
      localStorage.setItem('hospital_citas', JSON.stringify(updatedC));
    }
  };

  const eliminarCita = async (id_cita) => {
    if (isServerOnline) {
      await citasApi.delete(id_cita);
      const [citasRes, dispRes] = await Promise.all([
        citasApi.getAll(),
        disponibilidadApi.getAll()
      ]);
      setCitas(citasRes);
      setDisponibilidades(
        dispRes.map((d) => ({
          ...d,
          id_disponibilidad: `${d.documento_medico}-${d.id_sala}-${d.horario_atencion}`
        }))
      );
    } else {
      const cita = citas.find((c) => Number(c.id_cita) === Number(id_cita));
      if (cita) {
        const updatedD = disponibilidades.map((d) =>
          String(d.documento_medico) === String(cita.documento_medico) &&
          Number(d.id_sala) === Number(cita.id_sala) &&
          d.horario_atencion === cita.horario_atencion
            ? { ...d, estado: 0 }
            : d
        );
        setDisponibilidades(updatedD);
        localStorage.setItem('hospital_disponibilidades', JSON.stringify(updatedD));
      }
      const updatedC = citas.filter((c) => Number(c.id_cita) !== Number(id_cita));
      setCitas(updatedC);
      localStorage.setItem('hospital_citas', JSON.stringify(updatedC));
    }
  };

  // Helper enriquecido para citas (para mostrar nombres en tablas y agenda)
  const getCitasEnriquecidas = () => {
    return citas.map((cita) => {
      const paciente = pacientes.find((p) => String(p.documento_identidad) === String(cita.documento_paciente));
      const medico = medicos.find((m) => String(m.documento_identidad) === String(cita.documento_medico));
      const sala = horarios.find((h) => Number(h.id_sala) === Number(cita.id_sala));

      return {
        ...cita,
        paciente_nombre: cita.paciente_nombre || (paciente ? paciente.nombre_completo : 'Paciente no encontrado'),
        paciente_telefono: cita.paciente_telefono || (paciente ? paciente.telefono : ''),
        medico_nombre: cita.medico_nombre || (medico ? medico.nombre_completo : 'Médico no encontrado'),
        medico_especialidad: cita.medico_especialidad || (medico ? medico.especialidad : ''),
        lugar: cita.lugar || (sala ? sala.lugar : 'Sala desconocida'),
        fecha: cita.fecha || (sala ? sala.fecha : '')
      };
    });
  };

  const reiniciarDatosFicticios = () => {
    setPacientes(INITIAL_PACIENTES);
    setMedicos(INITIAL_MEDICOS);
    setHorarios(INITIAL_HORARIOS);
    setDisponibilidades(INITIAL_DISPONIBILIDADES);
    setCitas(INITIAL_CITAS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        pacientes,
        medicos,
        horarios,
        disponibilidades,
        citas,
        isServerOnline,
        isLoading,
        cargarDatosDesdeMySQL,
        registrarPaciente,
        modificarPaciente,
        eliminarPaciente,
        registrarMedico,
        modificarMedico,
        eliminarMedico,
        registrarHorario,
        modificarHorario,
        eliminarHorario,
        generarTurnosParaMedico,
        cambiarEstadoTurnoManual,
        eliminarDisponibilidad,
        registrarCita,
        cancelarCita,
        eliminarCita,
        reiniciarDatosFicticios,
        getCitasEnriquecidas
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
