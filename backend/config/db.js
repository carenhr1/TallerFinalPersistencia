const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuración del Pool para Neon (PostgreSQL Serverless)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hospital_citas',
      port: Number(process.env.DB_PORT) || 5432,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

// Prueba de conexión al iniciar
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as now, current_database() as db');
    console.log(`✅ [Neon / PostgreSQL] Conectado exitosamente a la base de datos '${res.rows[0].db}'. Hora BD: ${res.rows[0].now}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ [Neon / PostgreSQL] Error al conectar con la base de datos:');
    console.error(`   Detalle: ${error.message}`);
    console.error('   Sugerencia: Verifica que la variable DATABASE_URL en .env sea la cadena de conexión de Neon.');
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
