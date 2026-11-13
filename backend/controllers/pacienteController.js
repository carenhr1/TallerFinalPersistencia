const { pool } = require('../config/db');

// Obtener todos los pacientes
const obtenerPacientes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM PACIENTE ORDER BY nombre_completo ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ mensaje: 'Error al obtener los pacientes', error: error.message });
  }
};

// Obtener un paciente por su documento de identidad
const obtenerPacientePorDocumento = async (req, res) => {
  const { documento_identidad } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM PACIENTE WHERE documento_identidad = ?',
      [documento_identidad]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: `No se encontró el paciente con documento ${documento_identidad}` });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    res.status(500).json({ mensaje: 'Error al consultar el paciente', error: error.message });
  }
};

// Registrar un nuevo paciente
const crearPaciente = async (req, res) => {
  const { documento_identidad, nombre_completo, telefono, direccion, genero } = req.body;

  if (!documento_identidad || !nombre_completo || !telefono || !direccion || !genero) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
  }

  try {
    // Validar si ya existe
    const [existente] = await pool.query(
      'SELECT documento_identidad FROM PACIENTE WHERE documento_identidad = ?',
      [documento_identidad]
    );

    if (existente.length > 0) {
      return res.status(400).json({ mensaje: `El paciente con documento ${documento_identidad} ya está registrado.` });
    }

    await pool.query(
      'INSERT INTO PACIENTE (documento_identidad, nombre_completo, telefono, direccion, genero) VALUES (?, ?, ?, ?, ?)',
      [documento_identidad.trim(), nombre_completo.trim(), telefono.trim(), direccion.trim(), genero]
    );

    res.status(201).json({
      mensaje: 'Paciente registrado exitosamente.',
      paciente: { documento_identidad, nombre_completo, telefono, direccion, genero }
    });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ mensaje: 'Error al registrar el paciente', error: error.message });
  }
};

// Modificar datos de un paciente
const actualizarPaciente = async (req, res) => {
  const { documento_identidad } = req.params;
  const { nombre_completo, telefono, direccion, genero } = req.body;

  if (!nombre_completo || !telefono || !direccion || !genero) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios para actualizar.' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE PACIENTE SET nombre_completo = ?, telefono = ?, direccion = ?, genero = ? WHERE documento_identidad = ?',
      [nombre_completo.trim(), telefono.trim(), direccion.trim(), genero, documento_identidad]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado.' });
    }

    res.json({
      mensaje: 'Paciente actualizado exitosamente.',
      paciente: { documento_identidad, nombre_completo, telefono, direccion, genero }
    });
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el paciente', error: error.message });
  }
};

// Eliminar un paciente
const eliminarPaciente = async (req, res) => {
  const { documento_identidad } = req.params;

  try {
    // Verificar si tiene citas activas programadas
    const [citasActivas] = await pool.query(
      'SELECT id_cita FROM CITA WHERE documento_paciente = ? AND estado_cita = "Programada"',
      [documento_identidad]
    );

    if (citasActivas.length > 0) {
      return res.status(400).json({
        mensaje: 'No se puede eliminar el paciente porque tiene citas médicas activas programadas.'
      });
    }

    const [result] = await pool.query(
      'DELETE FROM PACIENTE WHERE documento_identidad = ?',
      [documento_identidad]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado.' });
    }

    res.json({ mensaje: `Paciente con documento ${documento_identidad} eliminado exitosamente.` });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    res.status(500).json({ mensaje: 'Error al eliminar el paciente', error: error.message });
  }
};

module.exports = {
  obtenerPacientes,
  obtenerPacientePorDocumento,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
};
