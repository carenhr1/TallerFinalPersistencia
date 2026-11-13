const { pool } = require('../config/db');

// Obtener todos los médicos
const obtenerMedicos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM MEDICO ORDER BY nombre_completo ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ mensaje: 'Error al obtener los médicos', error: error.message });
  }
};

// Obtener un médico por su documento de identidad
const obtenerMedicoPorDocumento = async (req, res) => {
  const { documento_identidad } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM MEDICO WHERE documento_identidad = ?',
      [documento_identidad]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: `No se encontró el médico con documento ${documento_identidad}` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener médico:', error);
    res.status(500).json({ mensaje: 'Error al consultar el médico', error: error.message });
  }
};

// Registrar un nuevo médico
const crearMedico = async (req, res) => {
  const { documento_identidad, nombre_completo, telefono, especialidad } = req.body;

  if (!documento_identidad || !nombre_completo || !telefono || !especialidad) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
  }

  try {
    const [existente] = await pool.query(
      'SELECT documento_identidad FROM MEDICO WHERE documento_identidad = ?',
      [documento_identidad]
    );

    if (existente.length > 0) {
      return res.status(400).json({ mensaje: `El médico con documento ${documento_identidad} ya está registrado.` });
    }

    await pool.query(
      'INSERT INTO MEDICO (documento_identidad, nombre_completo, telefono, especialidad) VALUES (?, ?, ?, ?)',
      [documento_identidad.trim(), nombre_completo.trim(), telefono.trim(), especialidad.trim()]
    );

    res.status(201).json({
      mensaje: 'Médico registrado exitosamente.',
      medico: { documento_identidad, nombre_completo, telefono, especialidad }
    });
  } catch (error) {
    console.error('Error al crear médico:', error);
    res.status(500).json({ mensaje: 'Error al registrar el médico', error: error.message });
  }
};

// Modificar datos de un médico
const actualizarMedico = async (req, res) => {
  const { documento_identidad } = req.params;
  const { nombre_completo, telefono, especialidad } = req.body;

  if (!nombre_completo || !telefono || !especialidad) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios para actualizar.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE MEDICO SET nombre_completo = ?, telefono = ?, especialidad = ? WHERE documento_identidad = ?',
      [nombre_completo.trim(), telefono.trim(), especialidad.trim(), documento_identidad]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Médico no encontrado.' });
    }

    res.json({
      mensaje: 'Médico actualizado exitosamente.',
      medico: { documento_identidad, nombre_completo, telefono, especialidad }
    });
  } catch (error) {
    console.error('Error al actualizar médico:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el médico', error: error.message });
  }
};

// Eliminar un médico
const eliminarMedico = async (req, res) => {
  const { documento_identidad } = req.params;

  try {
    const [citasActivas] = await pool.query(
      'SELECT id_cita FROM CITA WHERE documento_medico = ? AND estado_cita = "Programada"',
      [documento_identidad]
    );

    if (citasActivas.length > 0) {
      return res.status(400).json({
        mensaje: 'No se puede eliminar el médico porque tiene citas médicas activas programadas.'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM MEDICO WHERE documento_identidad = ?',
      [documento_identidad]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Médico no encontrado.' });
    }

    res.json({ mensaje: `Médico con documento ${documento_identidad} eliminado exitosamente.` });
  } catch (error) {
    console.error('Error al eliminar médico:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el médico', error: error.message });
  }
};

module.exports = {
  obtenerMedicos,
  obtenerMedicoPorDocumento,
  crearMedico,
  actualizarMedico,
  eliminarMedico
};
