const { pool } = require('../config/db');

// Función auxiliar para fraccionar intervalos en bloques de 30 minutos
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = String(timeStr).split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}`;
};

const dividirEnTurnos30Min = (horaInicial, horaFinal) => {
  const startMin = timeToMinutes(horaInicial);
  const endMin = timeToMinutes(horaFinal);

  if (startMin >= endMin) return [];

  const turnos = [];
  let currentMin = startMin;

  while (currentMin + 30 <= endMin) {
    const inicio = minutesToTime(currentMin);
    const fin = minutesToTime(currentMin + 30);
    turnos.push(`${inicio} - ${fin}`);
    currentMin += 30;
  }

  return turnos;
};

// Obtener todas las disponibilidades con JOIN para enriquecer información
const obtenerDisponibilidades = async (req, res) => {
  const { documento_medico, id_sala, estado } = req.query;

  try {
    let query = `
      SELECT 
        d.documento_medico,
        d.id_sala,
        d.horario_atencion,
        d.estado,
        m.nombre_completo AS medico_nombre,
        m.especialidad AS medico_especialidad,
        h.lugar,
        TO_CHAR(h.fecha, 'YYYY-MM-DD') AS fecha,
        h.hora_inicial::text AS hora_inicial,
        h.hora_final::text AS hora_final
      FROM DISPONIBILIDAD d
      INNER JOIN MEDICO m ON d.documento_medico = m.documento_identidad
      INNER JOIN HORARIO h ON d.id_sala = h.id_sala
      WHERE 1=1
    `;
    const params = [];

    if (documento_medico) {
      params.push(documento_medico);
      query += ` AND d.documento_medico = $${params.length}`;
    }

    if (id_sala) {
      params.push(Number(id_sala));
      query += ` AND d.id_sala = $${params.length}`;
    }

    if (estado !== undefined && estado !== '') {
      params.push(Number(estado));
      query += ` AND d.estado = $${params.length}`;
    }

    query += ' ORDER BY h.fecha ASC, d.horario_atencion ASC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener disponibilidades:', error);
    res.status(500).json({ mensaje: 'Error al consultar disponibilidad', error: error.message });
  }
};

// Generar automáticamente turnos de 30 minutos para un médico en una sala
const generarTurnos = async (req, res) => {
  const { documento_medico, id_sala } = req.body;

  if (!documento_medico || !id_sala) {
    return res.status(400).json({ mensaje: 'El documento_medico y el id_sala son obligatorios.' });
  }

  try {
    // 1. Validar que el médico exista
    const medicos = await pool.query('SELECT documento_identidad FROM MEDICO WHERE documento_identidad = $1', [documento_medico]);
    if (medicos.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Médico no encontrado.' });
    }

    // 2. Obtener el horario de la sala
    const horarios = await pool.query('SELECT * FROM HORARIO WHERE id_sala = $1', [Number(id_sala)]);
    if (horarios.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Horario / Sala no encontrado.' });
    }

    const horario = horarios.rows[0];
    const turnosCalculados = dividirEnTurnos30Min(horario.hora_inicial, horario.hora_final);

    if (turnosCalculados.length === 0) {
      return res.status(400).json({ mensaje: 'El intervalo de tiempo del horario es menor a 30 minutos.' });
    }

    // 3. Insertar turnos respetando la clave primaria compuesta (ON CONFLICT DO NOTHING en PostgreSQL)
    let turnosInsertados = 0;
    for (const bloque of turnosCalculados) {
      const resultado = await pool.query(
        `INSERT INTO DISPONIBILIDAD (documento_medico, id_sala, horario_atencion, estado) 
         VALUES ($1, $2, $3, 0)
         ON CONFLICT (documento_medico, id_sala, horario_atencion) DO NOTHING`,
        [documento_medico, Number(id_sala), bloque]
      );
      if (resultado.rowCount > 0) {
        turnosInsertados++;
      }
    }

    if (turnosInsertados === 0) {
      return res.status(400).json({
        mensaje: 'Todos los turnos de este horario ya se encontraban registrados para este médico.'
      });
    }

    res.status(201).json({
      mensaje: `Se generaron exitosamente ${turnosInsertados} turnos disponibles (estado 0).`,
      totalGenerados: turnosInsertados
    });
  } catch (error) {
    console.error('Error al generar turnos:', error);
    res.status(500).json({ mensaje: 'Error al generar los turnos automáticos', error: error.message });
  }
};

// Cambiar el estado de un turno manualmente (0: disponible, 1: ocupado)
const cambiarEstadoTurno = async (req, res) => {
  const { documento_medico, id_sala, horario_atencion } = req.params;
  const { nuevo_estado } = req.body;

  if (nuevo_estado === undefined || ![0, 1].includes(Number(nuevo_estado))) {
    return res.status(400).json({ mensaje: 'El estado debe ser 0 (disponible) o 1 (ocupado).' });
  }

  try {
    const result = await pool.query(
      `UPDATE DISPONIBILIDAD 
       SET estado = $1 
       WHERE documento_medico = $2 AND id_sala = $3 AND horario_atencion = $4`,
      [Number(nuevo_estado), documento_medico, Number(id_sala), decodeURIComponent(horario_atencion)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Turno de disponibilidad no encontrado.' });
    }

    res.json({ mensaje: `Estado del turno actualizado a ${nuevo_estado}.` });
  } catch (error) {
    console.error('Error al cambiar estado de turno:', error);
    res.status(500).json({ mensaje: 'Error al actualizar estado del turno', error: error.message });
  }
};

// Eliminar un turno no ocupado
const eliminarTurno = async (req, res) => {
  const { documento_medico, id_sala, horario_atencion } = req.params;

  try {
    const turno = await pool.query(
      `SELECT estado FROM DISPONIBILIDAD 
       WHERE documento_medico = $1 AND id_sala = $2 AND horario_atencion = $3`,
      [documento_medico, Number(id_sala), decodeURIComponent(horario_atencion)]
    );

    if (turno.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Turno no encontrado.' });
    }

    if (Number(turno.rows[0].estado) === 1) {
      return res.status(400).json({ mensaje: 'No se puede eliminar un turno que actualmente está OCUPADO.' });
    }

    await pool.query(
      `DELETE FROM DISPONIBILIDAD 
       WHERE documento_medico = $1 AND id_sala = $2 AND horario_atencion = $3`,
      [documento_medico, Number(id_sala), decodeURIComponent(horario_atencion)]
    );

    res.json({ mensaje: 'Turno de atención eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el turno', error: error.message });
  }
};

module.exports = {
  obtenerDisponibilidades,
  generarTurnos,
  cambiarEstadoTurno,
  eliminarTurno
};
