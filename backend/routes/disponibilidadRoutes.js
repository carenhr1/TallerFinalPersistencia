const express = require('express');
const router = express.Router();
const {
  obtenerDisponibilidades,
  generarTurnos,
  cambiarEstadoTurno,
  eliminarTurno
} = require('../controllers/disponibilidadController');

// Rutas base: /api/disponibilidad
router.get('/', obtenerDisponibilidades);
router.post('/generar', generarTurnos);
router.patch('/:documento_medico/:id_sala/:horario_atencion/estado', cambiarEstadoTurno);
router.delete('/:documento_medico/:id_sala/:horario_atencion', eliminarTurno);

module.exports = router;
