const { pool } = require('../config/db');

// Obtener todas las citas médicas (con información enriquecida para el frontend y agenda)
const obtenerCitas = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id_cita,
        c.documento_paciente,
        c.documento_medico,
        c.id_sala,
        c.horario_atencion,
        DATE_FORMAT(c.fecha_registro, '%Y-%m-%d %H:%i') AS fecha_registro,
        c.motivo,
        c.estado_cita,
        p.nombre_completo AS paciente_nombre,
        p.telefono AS paciente_telefono,
        m.nombre_completo AS medico_nombre,
        m.especialidad AS medico_especialidad,
        h.lugar,
        DATE_FORMAT(h.fecha, '%Y-%m-%d') AS fecha
      FROM CITA c
      INNER JOIN PACIENTE p ON c.documento_paciente = p.documento_identidad
      INNER JOIN MEDICO m ON c.documento_medico = m.documento_identidad
      INNER JOIN HORARIO h ON c.id_sala = h.id_sala
      ORDER BY h.fecha ASC, c.horario_atencion ASC
    `;

    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ mensaje: 'Error al obtener las citas médicas', error: error.message });
  }
};

// Obtener una cita médica por ID
const obtenerCitaPorId = async (req, res) => {
  const { id_cita } = req.params;

  try {
    const query = `
      SELECT 
        c.id_cita,
        c.documento_paciente,
        c.documento_medico,
        c.id_sala,
        c.horario_atencion,
        DATE_FORMAT(c.fecha_registro, '%Y-%m-%d %H:%i') AS fecha_registro,
        c.motivo,
        c.estado_cita,
        p.nombre_completo AS paciente_nombre,
        p.telefono AS paciente_telefono,
        m.nombre_completo AS medico_nombre,
        m.especialidad AS medico_especialidad,
        h.lugar,
        DATE_FORMAT(h.fecha, '%Y-%m-%d') AS fecha
      FROM CITA c
      INNER JOIN PACIENTE p ON c.documento_paciente = p.documento_identidad
      INNER JOIN MEDICO m ON c.documento_medico = m.documento_identidad
      INNER JOIN HORARIO h ON c.id_sala = h.id_sala
      WHERE c.id_cita = ?
    `;

    const [rows] = await pool.query(query, [id_cita]);
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: `No se encontró la cita con ID #${id_cita}` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({ mensaje: 'Error al consultar la cita', error: error.message });
  }
};

/**
 * Reservar una nueva cita médica.
 * Utiliza una TRANSACCIÓN ATÓMICA en MySQL con bloqueo 'FOR UPDATE'
 * para evitar de forma absoluta que dos pacientes reserven el mismo turno.
 */
const crearCita = async (req, res) => {
  const { documento_paciente, documento_medico, id_sala, horario_atencion, motivo } = req.body;

  if (!documento_paciente || !documento_medico || !id_sala || !horario_atencion) {
    return res.status(400).json({ mensaje: 'Todos los campos de la reserva son obligatorios.' });
  }

  // Obtenemos una conexión dedicada del Pool para la transacción
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Validar que el paciente exista
    const [pacientes] = await connection.query(
      'SELECT documento_identidad FROM PACIENTE WHERE documento_identidad = ?',
      [documento_paciente]
    );

    if (pacientes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'El paciente seleccionado no está registrado.' });
    }

    // 2. Consultar el turno con bloqueo pesimista (FOR UPDATE)
    const [turnos] = await connection.query(
      `SELECT estado FROM DISPONIBILIDAD 
       WHERE documento_medico = ? AND id_sala = ? AND horario_atencion = ? 
       FOR UPDATE`,
      [documento_medico, Number(id_sala), horario_atencion]
    );

    if (turnos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'El turno solicitado no existe en la disponibilidad.' });
    }

    // 3. Regla crítica: Evitar reservar turnos ocupados
    if (Number(turnos[0].estado) === 1) {
      await connection.rollback();
      return res.status(409).json({
        mensaje: 'El turno seleccionado YA SE ENCUENTRA OCUPADO por otra reserva. Por favor elige otro horario.'
      });
    }

    // 4. Validar que el paciente no tenga ya una cita activa a la misma fecha y hora
    const [citasSolapadas] = await connection.query(
      `SELECT c.id_cita 
       FROM CITA c
       INNER JOIN HORARIO h ON c.id_sala = h.id_sala
       INNER JOIN HORARIO h_solicitado ON h_solicitado.id_sala = ?
       WHERE c.documento_paciente = ? 
         AND c.estado_cita = 'Programada'
         AND h.fecha = h_solicitado.fecha
         AND c.horario_atencion = ?`,
      [Number(id_sala), documento_paciente, horario_atencion]
    );

    if (citasSolapadas.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        mensaje: 'El paciente ya cuenta con otra cita médica programada en esa misma fecha y franja horaria.'
      });
    }

    // 5. Insertar la cita
    const [resultadoCita] = await connection.query(
      `INSERT INTO CITA (documento_paciente, documento_medico, id_sala, horario_atencion, motivo, estado_cita) 
       VALUES (?, ?, ?, ?, ?, 'Programada')`,
      [documento_paciente, documento_medico, Number(id_sala), horario_atencion, (motivo || 'Consulta médica').trim()]
    );

    // 6. Marcar el turno como OCUPADO (estado = 1)
    await connection.query(
      `UPDATE DISPONIBILIDAD 
       SET estado = 1 
       WHERE documento_medico = ? AND id_sala = ? AND horario_atencion = ?`,
      [documento_medico, Number(id_sala), horario_atencion]
    );

    // Confirmar la transacción
    await connection.commit();

    res.status(201).json({
      mensaje: '¡Cita médica reservada exitosamente! El turno quedó registrado como ocupado (estado = 1).',
      id_cita: resultadoCita.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al reservar cita médica:', error);
    res.status(500).json({ mensaje: 'Error al procesar la reserva de cita', error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Cancelar una cita médica y liberar el turno en DISPONIBILIDAD (estado = 0).
 */
const cancelarCita = async (req, res) => {
  const { id_cita } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [cita] = await connection.query('SELECT * FROM CITA WHERE id_cita = ?', [id_cita]);

    if (cita.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    const c = cita[0];

    // Cambiar estado de la cita
    await connection.query('UPDATE CITA SET estado_cita = "Cancelada" WHERE id_cita = ?', [id_cita]);

    // Liberar el turno asociado en disponibilidad (estado = 0)
    await connection.query(
      `UPDATE DISPONIBILIDAD 
       SET estado = 0 
       WHERE documento_medico = ? AND id_sala = ? AND horario_atencion = ?`,
      [c.documento_medico, c.id_sala, c.horario_atencion]
    );

    await connection.commit();
    res.json({ mensaje: `Cita #${id_cita} cancelada. El turno ha quedado nuevamente disponible (estado = 0).` });
  } catch (error) {
    await connection.rollback();
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ mensaje: 'Error al cancelar la cita', error: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Eliminar el registro de una cita médica y liberar su turno.
 */
const eliminarCita = async (req, res) => {
  const { id_cita } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [cita] = await connection.query('SELECT * FROM CITA WHERE id_cita = ?', [id_cita]);

    if (cita.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Cita no encontrada.' });
    }

    const c = cita[0];

    // Eliminar cita
    await connection.query('DELETE FROM CITA WHERE id_cita = ?', [id_cita]);

    // Liberar turno si estaba ocupada
    await connection.query(
      `UPDATE DISPONIBILIDAD 
       SET estado = 0 
       WHERE documento_medico = ? AND id_sala = ? AND horario_atencion = ?`,
      [c.documento_medico, c.id_sala, c.horario_atencion]
    );

    await connection.commit();
    res.json({ mensaje: `Cita #${id_cita} eliminada y turno liberado.` });
  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la cita', error: error.message });
  } finally {
    connection.release();
  }
};

module.exports = {
  obtenerCitas,
  obtenerCitaPorId,
  crearCita,
  cancelarCita,
  eliminarCita
};
