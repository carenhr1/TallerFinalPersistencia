const express = require('express');
const router = express.Router();
const {
  obtenerMedicos,
  obtenerMedicoPorDocumento,
  crearMedico,
  actualizarMedico,
  eliminarMedico
} = require('../controllers/medicoController');

// Rutas base: /api/medicos
router.get('/', obtenerMedicos);
router.get('/:documento_identidad', obtenerMedicoPorDocumento);
router.post('/', crearMedico);
router.put('/:documento_identidad', actualizarMedico);
router.delete('/:documento_identidad', eliminarMedico);

module.exports = router;
