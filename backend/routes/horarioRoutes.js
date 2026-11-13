const express = require('express');
const router = express.Router();
const {
  obtenerHorarios,
  obtenerHorarioPorId,
  crearHorario,
  actualizarHorario,
  eliminarHorario
} = require('../controllers/horarioController');

// Rutas base: /api/horarios
router.get('/', obtenerHorarios);
router.get('/:id_sala', obtenerHorarioPorId);
router.post('/', crearHorario);
router.put('/:id_sala', actualizarHorario);
router.delete('/:id_sala', eliminarHorario);

module.exports = router;
