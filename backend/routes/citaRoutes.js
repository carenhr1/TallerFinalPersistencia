const express = require('express');
const router = express.Router();
const {
  obtenerCitas,
  obtenerCitaPorId,
  crearCita,
  cancelarCita,
  eliminarCita
} = require('../controllers/citaController');

// Rutas base: /api/citas
router.get('/', obtenerCitas);
router.get('/:id_cita', obtenerCitaPorId);
router.post('/', crearCita);
router.patch('/:id_cita/cancelar', cancelarCita);
router.delete('/:id_cita', eliminarCita);

module.exports = router;
