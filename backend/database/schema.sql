-- =====================================================================
-- SISTEMA DE GESTIÓN DE CITAS MÉDICAS - HOSPITAL
-- Script DDL de Base de Datos Relacional para MySQL
-- Base de Datos: hospital_citas
-- =====================================================================

-- 1. Creación de la Base de Datos
CREATE DATABASE IF NOT EXISTS hospital_citas
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE hospital_citas;

-- =====================================================================
-- 2. Creación de Tablas (Orden respetando dependencias de Llaves Foráneas)
-- =====================================================================

-- TABLA: PACIENTE
CREATE TABLE IF NOT EXISTS PACIENTE (
    documento_identidad VARCHAR(20) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    genero ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    PRIMARY KEY (documento_identidad)
) ENGINE=InnoDB;

-- TABLA: MEDICO
CREATE TABLE IF NOT EXISTS MEDICO (
    documento_identidad VARCHAR(20) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    PRIMARY KEY (documento_identidad)
) ENGINE=InnoDB;

-- TABLA: HORARIO (Salas, lugares y jornadas)
CREATE TABLE IF NOT EXISTS HORARIO (
    id_sala INT AUTO_INCREMENT NOT NULL,
    lugar VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL,
    hora_inicial TIME NOT NULL,
    hora_final TIME NOT NULL,
    PRIMARY KEY (id_sala)
) ENGINE=InnoDB;

-- TABLA: DISPONIBILIDAD (Turnos fraccionados de 30 minutos)
-- LLAVE PRIMARIA COMPUESTA: (documento_medico, id_sala, horario_atencion)
-- Garantiza a nivel relacional que no se puedan duplicar franjas para el mismo médico y sala.
CREATE TABLE IF NOT EXISTS DISPONIBILIDAD (
    documento_medico VARCHAR(20) NOT NULL,
    id_sala INT NOT NULL,
    horario_atencion VARCHAR(30) NOT NULL, -- Formato: 'HH:mm - HH:mm'
    estado TINYINT(1) NOT NULL DEFAULT 0,  -- 0: Disponible, 1: Ocupado
    PRIMARY KEY (documento_medico, id_sala, horario_atencion),
    CONSTRAINT fk_disponibilidad_medico 
        FOREIGN KEY (documento_medico) 
        REFERENCES MEDICO(documento_identidad) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT fk_disponibilidad_horario 
        FOREIGN KEY (id_sala) 
        REFERENCES HORARIO(id_sala) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- TABLA: CITA (Reserva del paciente con el turno)
CREATE TABLE IF NOT EXISTS CITA (
    id_cita INT AUTO_INCREMENT NOT NULL,
    documento_paciente VARCHAR(20) NOT NULL,
    documento_medico VARCHAR(20) NOT NULL,
    id_sala INT NOT NULL,
    horario_atencion VARCHAR(30) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(255) NULL,
    estado_cita ENUM('Programada', 'Cancelada', 'Atendida') NOT NULL DEFAULT 'Programada',
    PRIMARY KEY (id_cita),
    CONSTRAINT fk_cita_paciente 
        FOREIGN KEY (documento_paciente) 
        REFERENCES PACIENTE(documento_identidad) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    CONSTRAINT fk_cita_disponibilidad 
        FOREIGN KEY (documento_medico, id_sala, horario_atencion) 
        REFERENCES DISPONIBILIDAD(documento_medico, id_sala, horario_atencion) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- =====================================================================
-- 3. Inserción de Datos Iniciales (Semillas para Pruebas Académicas)
-- =====================================================================

-- Pacientes iniciales
INSERT INTO PACIENTE (documento_identidad, nombre_completo, telefono, direccion, genero) VALUES
('1020304050', 'Carlos Andrés Mendoza', '3104567890', 'Calle 45 # 12-34, Bogotá', 'Masculino'),
('1098765432', 'María Elena Gómez', '3159876543', 'Carrera 70 # 10-15, Medellín', 'Femenino'),
('1034567891', 'Juan Pablo Ramírez', '3008765432', 'Av. Santander # 55-20, Manizales', 'Masculino'),
('1056789012', 'Ana Lucía Torres', '3182345678', 'Transversal 23 # 89-10, Cali', 'Femenino'),
('1078901234', 'David Fernando Castro', '3113456789', 'Diagonal 15 # 40-50, Bucaramanga', 'Masculino')
ON DUPLICATE KEY UPDATE nombre_completo=VALUES(nombre_completo);

-- Médicos iniciales
INSERT INTO MEDICO (documento_identidad, nombre_completo, telefono, especialidad) VALUES
('71234567', 'Dra. Sofía Martínez', '3001234567', 'Medicina General'),
('80456789', 'Dr. Roberto Peña', '3017654321', 'Cardiología'),
('92345678', 'Dra. Valentina Ruiz', '3023456789', 'Pediatría'),
('75678901', 'Dr. Camilo Echeverry', '3045678901', 'Dermatología'),
('88901234', 'Dra. Laura Morales', '3056789012', 'Ginecología')
ON DUPLICATE KEY UPDATE nombre_completo=VALUES(nombre_completo);

-- Horarios / Salas iniciales
INSERT INTO HORARIO (id_sala, lugar, fecha, hora_inicial, hora_final) VALUES
(101, 'Consultorio 101 - Bloque A', '2026-11-15', '08:00:00', '10:00:00'),
(102, 'Consultorio 204 - Bloque B', '2026-11-15', '14:00:00', '16:00:00'),
(103, 'Sala Pediátrica 3 - Bloque C', '2026-11-16', '09:00:00', '11:00:00'),
(104, 'Consultorio Cardiológico - Bloque A', '2026-11-16', '15:00:00', '17:00:00')
ON DUPLICATE KEY UPDATE lugar=VALUES(lugar);

-- Disponibilidades (Turnos de 30 min)
INSERT INTO DISPONIBILIDAD (documento_medico, id_sala, horario_atencion, estado) VALUES
-- Dra. Sofía Martínez en Sala 101
('71234567', 101, '08:00 - 08:30', 1),
('71234567', 101, '08:30 - 09:00', 0),
('71234567', 101, '09:00 - 09:30', 1),
('71234567', 101, '09:30 - 10:00', 0),
-- Dr. Roberto Peña en Sala 102
('80456789', 102, '14:00 - 14:30', 0),
('80456789', 102, '14:30 - 15:00', 1),
('80456789', 102, '15:00 - 15:30', 0),
('80456789', 102, '15:30 - 16:00', 0),
-- Dra. Valentina Ruiz en Sala 103
('92345678', 103, '09:00 - 09:30', 0),
('92345678', 103, '09:30 - 10:00', 0),
('92345678', 103, '10:00 - 10:30', 0),
('92345678', 103, '10:30 - 11:00', 0)
ON DUPLICATE KEY UPDATE estado=VALUES(estado);

-- Citas iniciales
INSERT INTO CITA (id_cita, documento_paciente, documento_medico, id_sala, horario_atencion, motivo, estado_cita) VALUES
(1, '1020304050', '71234567', 101, '08:00 - 08:30', 'Consulta general por dolor abdominal recurrente', 'Programada'),
(2, '1098765432', '71234567', 101, '09:00 - 09:30', 'Revisión de resultados de laboratorio clínico', 'Programada'),
(3, '1034567891', '80456789', 102, '14:30 - 15:00', 'Control de presión arterial y electrocardiograma', 'Programada')
ON DUPLICATE KEY UPDATE estado_cita=VALUES(estado_cita);
