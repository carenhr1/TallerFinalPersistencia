const express = require('express');
const router = express.Router();
const {
  obtenerPacientes,
  obtenerPacientePorDocumento,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente
} = require('../controllers/pacienteController');

// Rutas base: /api/pacientes
router.get('/', obtenerPacientes);
router.get('/:documento_identidad', obtenerPacientePorDocumento);
router.post('/', crearPaciente);
router.put('/:documento_identidad', actualizarPaciente);
router.delete('/:documento_identidad', eliminarPaciente);

module.exports = router;
