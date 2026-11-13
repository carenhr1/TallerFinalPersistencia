const { pool } = require('../config/db');

// Obtener todos los horarios y salas
const obtenerHorarios = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id_sala, lugar, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, hora_inicial::text, hora_final::text FROM HORARIO ORDER BY fecha ASC, hora_inicial ASC"
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ mensaje: 'Error al obtener los horarios', error: error.message });
  }
};

// Obtener un horario por id_sala
const obtenerHorarioPorId = async (req, res) => {
  const { id_sala } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT id_sala, lugar, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, hora_inicial::text, hora_final::text FROM HORARIO WHERE id_sala = $1",
      [Number(id_sala)]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: `No se encontró el horario con ID de sala ${id_sala}` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener horario:', error);
    res.status(500).json({ mensaje: 'Error al consultar el horario', error: error.message });
  }
};

// Registrar un nuevo horario
const crearHorario = async (req, res) => {
  const { lugar, fecha, hora_inicial, hora_final } = req.body;

  if (!lugar || !fecha || !hora_inicial || !hora_final) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
  }

  if (hora_inicial >= hora_final) {
    return res.status(400).json({ mensaje: 'La hora inicial debe ser menor a la hora final.' });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO HORARIO (lugar, fecha, hora_inicial, hora_final) VALUES ($1, $2, $3, $4) RETURNING id_sala, lugar, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, hora_inicial::text, hora_final::text",
      [lugar.trim(), fecha, hora_inicial, hora_final]
    );

    res.status(201).json({
      mensaje: 'Horario registrado exitosamente.',
      horario: rows[0]
    });
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ mensaje: 'Error al registrar el horario', error: error.message });
  }
};

// Modificar un horario existente
const actualizarHorario = async (req, res) => {
  const { id_sala } = req.params;
  const { lugar, fecha, hora_inicial, hora_final } = req.body;

  if (!lugar || !fecha || !hora_inicial || !hora_final) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios para actualizar.' });
  }

  if (hora_inicial >= hora_final) {
    return res.status(400).json({ mensaje: 'La hora inicial debe ser menor a la hora final.' });
  }

  try {
    const result = await pool.query(
      "UPDATE HORARIO SET lugar = $1, fecha = $2, hora_inicial = $3, hora_final = $4 WHERE id_sala = $5 RETURNING id_sala, lugar, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, hora_inicial::text, hora_final::text",
      [lugar.trim(), fecha, hora_inicial, hora_final, Number(id_sala)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Horario no encontrado.' });
    }

    res.json({
      mensaje: 'Horario actualizado exitosamente.',
      horario: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el horario', error: error.message });
  }
};

// Eliminar un horario
const eliminarHorario = async (req, res) => {
  const { id_sala } = req.params;

  try {
    const citasActivas = await pool.query(
      'SELECT id_cita FROM CITA WHERE id_sala = $1 AND estado_cita = $2',
      [Number(id_sala), 'Programada']
    );

    if (citasActivas.rows.length > 0) {
      return res.status(400).json({
        mensaje: 'No se puede eliminar el horario porque tiene citas médicas activas asociadas.'
      });
    }

    const result = await pool.query('DELETE FROM HORARIO WHERE id_sala = $1', [Number(id_sala)]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Horario no encontrado.' });
    }

    res.json({ mensaje: `Horario con ID de sala ${id_sala} eliminado exitosamente.` });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el horario', error: error.message });
  }
};

module.exports = {
  obtenerHorarios,
  obtenerHorarioPorId,
  crearHorario,
  actualizarHorario,
  eliminarHorario
};
