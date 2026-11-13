/**
 * Servicio de comunicación con la API RESTful de Express y MySQL.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.mensaje || data.error || `Error en la petición: ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }
  return data;
};

// ==================== PACIENTES API ====================
export const pacientesApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/pacientes`);
    return handleResponse(res);
  },
  getByDocumento: async (documento) => {
    const res = await fetch(`${API_BASE_URL}/pacientes/${documento}`);
    return handleResponse(res);
  },
  create: async (paciente) => {
    const res = await fetch(`${API_BASE_URL}/pacientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paciente)
    });
    return handleResponse(res);
  },
  update: async (documento, paciente) => {
    const res = await fetch(`${API_BASE_URL}/pacientes/${documento}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paciente)
    });
    return handleResponse(res);
  },
  delete: async (documento) => {
    const res = await fetch(`${API_BASE_URL}/pacientes/${documento}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};

// ==================== MÉDICOS API ====================
export const medicosApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/medicos`);
    return handleResponse(res);
  },
  getByDocumento: async (documento) => {
    const res = await fetch(`${API_BASE_URL}/medicos/${documento}`);
    return handleResponse(res);
  },
  create: async (medico) => {
    const res = await fetch(`${API_BASE_URL}/medicos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medico)
    });
    return handleResponse(res);
  },
  update: async (documento, medico) => {
    const res = await fetch(`${API_BASE_URL}/medicos/${documento}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medico)
    });
    return handleResponse(res);
  },
  delete: async (documento) => {
    const res = await fetch(`${API_BASE_URL}/medicos/${documento}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};

// ==================== HORARIOS API ====================
export const horariosApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/horarios`);
    return handleResponse(res);
  },
  getById: async (id_sala) => {
    const res = await fetch(`${API_BASE_URL}/horarios/${id_sala}`);
    return handleResponse(res);
  },
  create: async (horario) => {
    const res = await fetch(`${API_BASE_URL}/horarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(horario)
    });
    return handleResponse(res);
  },
  update: async (id_sala, horario) => {
    const res = await fetch(`${API_BASE_URL}/horarios/${id_sala}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(horario)
    });
    return handleResponse(res);
  },
  delete: async (id_sala) => {
    const res = await fetch(`${API_BASE_URL}/horarios/${id_sala}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};

// ==================== DISPONIBILIDAD API ====================
export const disponibilidadApi = {
  getAll: async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.documento_medico) params.append('documento_medico', filtros.documento_medico);
    if (filtros.id_sala) params.append('id_sala', filtros.id_sala);
    if (filtros.estado !== undefined && filtros.estado !== '') params.append('estado', filtros.estado);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/disponibilidad${query}`);
    return handleResponse(res);
  },
  generar: async (documento_medico, id_sala) => {
    const res = await fetch(`${API_BASE_URL}/disponibilidad/generar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento_medico, id_sala: Number(id_sala) })
    });
    return handleResponse(res);
  },
  cambiarEstado: async (documento_medico, id_sala, horario_atencion, nuevo_estado) => {
    const encodedHorario = encodeURIComponent(horario_atencion);
    const res = await fetch(
      `${API_BASE_URL}/disponibilidad/${documento_medico}/${id_sala}/${encodedHorario}/estado`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevo_estado: Number(nuevo_estado) })
      }
    );
    return handleResponse(res);
  },
  delete: async (documento_medico, id_sala, horario_atencion) => {
    const encodedHorario = encodeURIComponent(horario_atencion);
    const res = await fetch(
      `${API_BASE_URL}/disponibilidad/${documento_medico}/${id_sala}/${encodedHorario}`,
      {
        method: 'DELETE'
      }
    );
    return handleResponse(res);
  }
};

// ==================== CITAS API ====================
export const citasApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/citas`);
    return handleResponse(res);
  },
  getById: async (id_cita) => {
    const res = await fetch(`${API_BASE_URL}/citas/${id_cita}`);
    return handleResponse(res);
  },
  create: async (citaData) => {
    const res = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(citaData)
    });
    return handleResponse(res);
  },
  cancelar: async (id_cita) => {
    const res = await fetch(`${API_BASE_URL}/citas/${id_cita}/cancelar`, {
      method: 'PATCH'
    });
    return handleResponse(res);
  },
  delete: async (id_cita) => {
    const res = await fetch(`${API_BASE_URL}/citas/${id_cita}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};

// ==================== HEALTH CHECK ====================
export const checkApiHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    const data = await handleResponse(res);
    return data.status === 'online';
  } catch (error) {
    return false;
  }
};
