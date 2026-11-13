const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

// ==================== RUTAS DE LA API ====================
app.use('/api/pacientes', require('./routes/pacienteRoutes'));
app.use('/api/medicos', require('./routes/medicoRoutes'));
app.use('/api/horarios', require('./routes/horarioRoutes'));
app.use('/api/disponibilidad', require('./routes/disponibilidadRoutes'));
app.use('/api/citas', require('./routes/citaRoutes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    motor: 'Neon (PostgreSQL Serverless)',
    sistema: 'API Sistema de Gestión de Citas Médicas',
    fecha: new Date().toISOString()
  });
});

// Manejo 404
app.use((req, res) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado en el servidor:', err);
  res.status(500).json({
    mensaje: 'Error interno del servidor',
    error: err.message
  });
});

// ==================== INICIO DEL SERVIDOR ====================
// Si no estamos en Vercel (ejecución local), iniciamos el listener HTTP
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log('========================================================');
    console.log(`🚀 [Backend] Servidor Express ejecutándose en el puerto ${PORT}`);
    console.log(`🌐 URL base: http://localhost:${PORT}/api`);
    console.log('========================================================');
    await testConnection();
  });
}

module.exports = app;
