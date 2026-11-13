const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Configuración del Pool de conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_citas',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para verificar la conexión al iniciar el servidor
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ [MySQL] Conexión establecida exitosamente con la base de datos '${process.env.DB_NAME || 'hospital_citas'}'.`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [MySQL] Error al conectar con la base de datos MySQL:');
    console.error(`   Detalle: ${error.message}`);
    console.error('   Sugerencia: Verifica que el servicio MySQL esté iniciado y las credenciales en .env sean correctas.');
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
