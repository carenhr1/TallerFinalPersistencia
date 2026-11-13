/**
 * Datos ficticios iniciales que respetan la estructura relacional definida:
 * - PACIENTE (documento_identidad, nombre_completo, telefono, direccion, genero)
 * - MEDICO (documento_identidad, nombre_completo, telefono, especialidad)
 * - HORARIO (id_sala, lugar, fecha, hora_inicial, hora_final)
 * - DISPONIBILIDAD (documento_medico, id_sala, horario_atencion, estado)
 * - CITA (id_cita, documento_paciente, documento_medico, id_sala, horario_atencion, ...)
 */

export const INITIAL_PACIENTES = [
  {
    documento_identidad: "1020304050",
    nombre_completo: "Carlos Andrés Mendoza",
    telefono: "3104567890",
    direccion: "Calle 45 # 12-34, Bogotá",
    genero: "Masculino"
  },
  {
    documento_identidad: "1098765432",
    nombre_completo: "María Elena Gómez",
    telefono: "3159876543",
    direccion: "Carrera 70 # 10-15, Medellín",
    genero: "Femenino"
  },
  {
    documento_identidad: "1034567891",
    nombre_completo: "Juan Pablo Ramírez",
    telefono: "3008765432",
    direccion: "Av. Santander # 55-20, Manizales",
    genero: "Masculino"
  },
  {
    documento_identidad: "1056789012",
    nombre_completo: "Ana Lucía Torres",
    telefono: "3182345678",
    direccion: "Transversal 23 # 89-10, Cali",
    genero: "Femenino"
  },
  {
    documento_identidad: "1078901234",
    nombre_completo: "David Fernando Castro",
    telefono: "3113456789",
    direccion: "Diagonal 15 # 40-50, Bucaramanga",
    genero: "Masculino"
  }
];

export const INITIAL_MEDICOS = [
  {
    documento_identidad: "71234567",
    nombre_completo: "Dra. Sofía Martínez",
    telefono: "3001234567",
    especialidad: "Medicina General"
  },
  {
    documento_identidad: "80456789",
    nombre_completo: "Dr. Roberto Peña",
    telefono: "3017654321",
    especialidad: "Cardiología"
  },
  {
    documento_identidad: "92345678",
    nombre_completo: "Dra. Valentina Ruiz",
    telefono: "3023456789",
    especialidad: "Pediatría"
  },
  {
    documento_identidad: "75678901",
    nombre_completo: "Dr. Camilo Echeverry",
    telefono: "3045678901",
    especialidad: "Dermatología"
  },
  {
    documento_identidad: "88901234",
    nombre_completo: "Dra. Laura Morales",
    telefono: "3056789012",
    especialidad: "Ginecología"
  }
];

export const INITIAL_HORARIOS = [
  {
    id_sala: 101,
    lugar: "Consultorio 101 - Bloque A",
    fecha: "2026-11-15",
    hora_inicial: "08:00",
    hora_final: "10:00"
  },
  {
    id_sala: 102,
    lugar: "Consultorio 204 - Bloque B",
    fecha: "2026-11-15",
    hora_inicial: "14:00",
    hora_final: "16:00"
  },
  {
    id_sala: 103,
    lugar: "Sala Pediátrica 3 - Bloque C",
    fecha: "2026-11-16",
    hora_inicial: "09:00",
    hora_final: "11:00"
  },
  {
    id_sala: 104,
    lugar: "Consultorio Cardiológico - Bloque A",
    fecha: "2026-11-16",
    hora_inicial: "15:00",
    hora_final: "17:00"
  }
];

// Generación inicial de disponibilidades (turnos de 30 minutos vinculados a médico y sala)
export const INITIAL_DISPONIBILIDADES = [
  // Dra. Sofía Martínez en Sala 101 (08:00 - 10:00) -> 4 turnos
  {
    id_disponibilidad: "DISP-101-1",
    documento_medico: "71234567",
    id_sala: 101,
    horario_atencion: "08:00 - 08:30",
    estado: 1 // Ocupado (Cita 1)
  },
  {
    id_disponibilidad: "DISP-101-2",
    documento_medico: "71234567",
    id_sala: 101,
    horario_atencion: "08:30 - 09:00",
    estado: 0 // Disponible
  },
  {
    id_disponibilidad: "DISP-101-3",
    documento_medico: "71234567",
    id_sala: 101,
    horario_atencion: "09:00 - 09:30",
    estado: 1 // Ocupado (Cita 2)
  },
  {
    id_disponibilidad: "DISP-101-4",
    documento_medico: "71234567",
    id_sala: 101,
    horario_atencion: "09:30 - 10:00",
    estado: 0 // Disponible
  },

  // Dr. Roberto Peña en Sala 102 (14:00 - 16:00) -> 4 turnos
  {
    id_disponibilidad: "DISP-102-1",
    documento_medico: "80456789",
    id_sala: 102,
    horario_atencion: "14:00 - 14:30",
    estado: 0 // Disponible
  },
  {
    id_disponibilidad: "DISP-102-2",
    documento_medico: "80456789",
    id_sala: 102,
    horario_atencion: "14:30 - 15:00",
    estado: 1 // Ocupado (Cita 3)
  },
  {
    id_disponibilidad: "DISP-102-3",
    documento_medico: "80456789",
    id_sala: 102,
    horario_atencion: "15:00 - 15:30",
    estado: 0 // Disponible
  },
  {
    id_disponibilidad: "DISP-102-4",
    documento_medico: "80456789",
    id_sala: 102,
    horario_atencion: "15:30 - 16:00",
    estado: 0 // Disponible
  },

  // Dra. Valentina Ruiz en Sala 103 (09:00 - 11:00) -> 4 turnos
  {
    id_disponibilidad: "DISP-103-1",
    documento_medico: "92345678",
    id_sala: 103,
    horario_atencion: "09:00 - 09:30",
    estado: 0 // Disponible
  },
  {
    id_disponibilidad: "DISP-103-2",
    documento_medico: "92345678",
    id_sala: 103,
    horario_atencion: "09:30 - 10:00",
    estado: 0 // Disponible
  },
  {
    id_disponibilidad: "DISP-103-3",
    documento_medico: "92345678",
    id_sala: 103,
    horario_atencion: "10:00 - 10:30",
    estado: 0 // Disponible
  },
  {
    id_disponibilidad: "DISP-103-4",
    documento_medico: "92345678",
    id_sala: 103,
    horario_atencion: "10:30 - 11:00",
    estado: 0 // Disponible
  }
];

export const INITIAL_CITAS = [
  {
    id_cita: 1,
    documento_paciente: "1020304050",
    documento_medico: "71234567",
    id_sala: 101,
    horario_atencion: "08:00 - 08:30",
    fecha_reserva: "2026-11-12",
    motivo: "Consulta general por dolor abdominal recurrente",
    estado_cita: "Programada"
  },
  {
    id_cita: 2,
    documento_paciente: "1098765432",
    documento_medico: "71234567",
    id_sala: 101,
    horario_atencion: "09:00 - 09:30",
    fecha_reserva: "2026-11-12",
    motivo: "Revisión de resultados de laboratorio clínico",
    estado_cita: "Programada"
  },
  {
    id_cita: 3,
    documento_paciente: "1034567891",
    documento_medico: "80456789",
    id_sala: 102,
    horario_atencion: "14:30 - 15:00",
    fecha_reserva: "2026-11-12",
    motivo: "Control de presión arterial y electrocardiograma",
    estado_cita: "Programada"
  }
];
