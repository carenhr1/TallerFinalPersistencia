# SISTEMA DE GESTIÓN DE CITAS MÉDICAS - HOSPITAL
> **Proyecto Académico** desarrollado con **React (Create React App)**, **Node.js**, **Express** y **MySQL Relacional**.

---

## 📌 1. Descripción del Proyecto
El **Sistema de Gestión de Citas Médicas** es una plataforma web hospitalaria completa basada en una **Arquitectura en 3 Capas (Three-Tier Architecture)**:
1. **Frontend (Capa de Presentación):** Desarrollado en React 18 (Create React App), JavaScript puro y CSS modular.
2. **Backend (Capa de Lógica de Negocio):** API RESTful desarrollada con Node.js, Express, `mysql2` y CORS.
3. **Persistencia (Capa de Datos):** Base de datos relacional MySQL (`hospital_citas`) con transacciones atómicas y clave primaria compuesta en disponibilidad.

---

## 🛠️ 2. Tecnologías Utilizadas
- **Frontend:** React 18, JavaScript ES6+, CSS3 Modular, `lucide-react`.
- **Backend:** Node.js, Express 4.x, `mysql2/promise`, `dotenv`, `cors`.
- **Base de Datos:** MySQL Server 8.x / MariaDB.
- **Herramientas de entorno:** Create React App (`react-scripts`), Vercel (preparado).

---

## 🗄️ 3. Estructura de la Base de Datos Relacional (`hospital_citas`)

El script de creación y semillas se encuentra en:
👉 `backend/database/schema.sql`

```sql
-- TABLA PACIENTE
CREATE TABLE PACIENTE (
    documento_identidad VARCHAR(20) PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    genero ENUM('Masculino', 'Femenino', 'Otro') NOT NULL
);

-- TABLA MEDICO
CREATE TABLE MEDICO (
    documento_identidad VARCHAR(20) PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    especialidad VARCHAR(100) NOT NULL
);

-- TABLA HORARIO
CREATE TABLE HORARIO (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    lugar VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL,
    hora_inicial TIME NOT NULL,
    hora_final TIME NOT NULL
);

-- TABLA DISPONIBILIDAD (Clave Primaria Compuesta)
CREATE TABLE DISPONIBILIDAD (
    documento_medico VARCHAR(20) NOT NULL,
    id_sala INT NOT NULL,
    horario_atencion VARCHAR(30) NOT NULL,
    estado TINYINT(1) DEFAULT 0, -- 0: Disponible, 1: Ocupado
    PRIMARY KEY (documento_medico, id_sala, horario_atencion),
    FOREIGN KEY (documento_medico) REFERENCES MEDICO(documento_identidad) ON DELETE CASCADE,
    FOREIGN KEY (id_sala) REFERENCES HORARIO(id_sala) ON DELETE CASCADE
);

-- TABLA CITA
CREATE TABLE CITA (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    documento_paciente VARCHAR(20) NOT NULL,
    documento_medico VARCHAR(20) NOT NULL,
    id_sala INT NOT NULL,
    horario_atencion VARCHAR(30) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(255),
    estado_cita ENUM('Programada', 'Cancelada', 'Atendida') DEFAULT 'Programada',
    FOREIGN KEY (documento_paciente) REFERENCES PACIENTE(documento_identidad),
    FOREIGN KEY (documento_medico, id_sala, horario_atencion) 
        REFERENCES DISPONIBILIDAD(documento_medico, id_sala, horario_atencion)
);
```

> [!IMPORTANT]
> **Integridad y Concurrencia:**
> - **Clave primaria compuesta en `DISPONIBILIDAD`:** `(documento_medico, id_sala, horario_atencion)` impide físicamente duplicar turnos para un mismo médico y sala.
> - **Transacciones Atómicas con Bloqueo Pesimista (`FOR UPDATE`):** Al reservar una cita, el backend bloquea el registro en MySQL. Si el turno ya está ocupado (`estado = 1`), hace `ROLLBACK` y rechaza la solicitud evitando colisiones entre múltiples pacientes.

---

## 🌐 4. Endpoints de la API RESTful (Backend: Puerto 5000)

| Módulo | Método | Endpoint | Descripción |
|---|---|---|---|
| **Salud** | `GET` | `/api/health` | Estado del backend y MySQL |
| **Pacientes** | `GET` | `/api/pacientes` | Listar todos los pacientes |
| **Pacientes** | `GET` | `/api/pacientes/:documento` | Consultar paciente |
| **Pacientes** | `POST` | `/api/pacientes` | Registrar paciente |
| **Pacientes** | `PUT` | `/api/pacientes/:documento` | Modificar paciente |
| **Pacientes** | `DELETE` | `/api/pacientes/:documento` | Eliminar paciente |
| **Médicos** | `GET` | `/api/medicos` | Listar todos los médicos |
| **Médicos** | `POST` | `/api/medicos` | Registrar médico |
| **Médicos** | `PUT` | `/api/medicos/:documento` | Modificar médico |
| **Médicos** | `DELETE` | `/api/medicos/:documento` | Eliminar médico |
| **Horarios** | `GET` | `/api/horarios` | Listar horarios y salas |
| **Horarios** | `POST` | `/api/horarios` | Registrar horario de sala |
| **Horarios** | `PUT` | `/api/horarios/:id_sala` | Modificar horario |
| **Horarios** | `DELETE` | `/api/horarios/:id_sala` | Eliminar horario |
| **Disponibilidad** | `GET` | `/api/disponibilidad` | Listar turnos con filtros |
| **Disponibilidad** | `POST` | `/api/disponibilidad/generar` | Generar turnos de 30 min |
| **Disponibilidad** | `PATCH` | `/api/disponibilidad/:medico/:sala/:horario/estado` | Alternar estado manual |
| **Disponibilidad** | `DELETE` | `/api/disponibilidad/:medico/:sala/:horario` | Eliminar turno libre |
| **Citas** | `GET` | `/api/citas` | Listar citas enriquecidas |
| **Citas** | `POST` | `/api/citas` | Reservar cita (Transacción) |
| **Citas** | `PATCH` | `/api/citas/:id_cita/cancelar` | Cancelar y liberar turno |
| **Citas** | `DELETE` | `/api/citas/:id_cita` | Eliminar cita y liberar turno |

---

## 🚀 5. Cómo Ejecutar el Proyecto Completo

### Paso 1: Iniciar el Servidor Backend (Express + MySQL)
1. Abre una terminal y navega a la carpeta `backend`:
   ```bash
   cd backend
   npm run dev
   ```
2. El servidor arrancará en `http://localhost:5000` y confirmará la conexión a MySQL:
   ```text
   ✅ [MySQL] Conexión establecida exitosamente con la base de datos 'hospital_citas'.
   ```

### Paso 2: Iniciar el Frontend (React)
1. Abre una **segunda terminal** en la raíz del proyecto (`TallerFinalPersistencia`):
   ```bash
   npm start
   ```
2. La aplicación se abrirá en tu navegador en `http://localhost:3000`.
3. En la barra superior verás el indicador verde **"MySQL Conectado"**. Cualquier paciente, médico, sala o cita que registres se guardará de forma inmediata y persistente en la base de datos MySQL.
