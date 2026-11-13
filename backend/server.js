const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================
// Configuración de CORS para autorizar el frontend en React
app.use(
  cors({
    origin: [
      'http://localhost:3000', 
      'http://127.0.0.1:3000',
      'http://localhost:3001', // <- Agregado para cuando el puerto 3000 está ocupado
      'http://127.0.0.1:3001'  // <- Agregado para cuando el puerto 3000 está ocupado
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Parseo de cuerpos en formato JSON
app.use(express.json());

// ==================== RUTAS DE LA API ====================
app.use('/api/pacientes', require('./routes/pacienteRoutes'));
app.use('/api/medicos', require('./routes/medicoRoutes'));
app.use('/api/horarios', require('./routes/horarioRoutes'));
app.use('/api/disponibilidad', require('./routes/disponibilidadRoutes'));
app.use('/api/citas', require('./routes/citaRoutes'));

// Endpoint de prueba de salud (Health Check)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    sistema: 'API Sistema de Gestión de Citas Médicas',
    fecha: new Date().toISOString()
  });
});

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado en el servidor:', err);
  res.status(500).json({
    mensaje: 'Error interno del servidor',
    error: err.message
  });
});

// ==================== INICIO DEL SERVIDOR ====================
app.listen(PORT, async () => {
  console.log('========================================================');
  console.log(`🚀 [Backend] Servidor Express ejecutándose en el puerto ${PORT}`);
  console.log(`🌐 URL base: http://localhost:${PORT}/api`);
  console.log('========================================================');
  
  // Probar la conexión con la base de datos MySQL
  await testConnection();
});