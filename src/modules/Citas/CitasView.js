import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatearFecha } from '../../utils/timeUtils';

const CitasView = () => {
  const {
    pacientes,
    medicos,
    horarios,
    disponibilidades,
    registrarCita,
    cancelarCita,
    eliminarCita,
    getCitasEnriquecidas
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Estados del formulario paso a paso de Reserva
  const [bookingData, setBookingData] = useState({
    documento_paciente: '',
    documento_medico: '',
    id_sala: '',
    horario_atencion: '',
    motivo: ''
  });

  const handleOpenBookModal = () => {
    setBookingData({
      documento_paciente: pacientes.length > 0 ? pacientes[0].documento_identidad : '',
      documento_medico: medicos.length > 0 ? medicos[0].documento_identidad : '',
      id_sala: horarios.length > 0 ? String(horarios[0].id_sala) : '',
      horario_atencion: '',
      motivo: ''
    });
    setErrorMsg('');
    setSuccessMsg('');
    setIsBookModalOpen(true);
  };

  const handleOpenConsult = (cita) => {
    setSelectedCita(cita);
    setIsConsultOpen(true);
  };

  const handleOpenDelete = (cita) => {
    setSelectedCita(cita);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCita) return;
    try {
      await eliminarCita(selectedCita.id_cita);
      setIsDeleteOpen(false);
      setSelectedCita(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelarCita = async (id_cita) => {
    if (window.confirm('¿Deseas cancelar esta cita médica? El turno quedará nuevamente disponible (estado = 0).')) {
      try {
        await cancelarCita(id_cita);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Turnos disponibles (filtrados por el médico y sala seleccionados)
  const turnosDisponiblesParaReserva = disponibilidades.filter((d) => {
    const matchMedico = String(d.documento_medico) === String(bookingData.documento_medico);
    const matchSala = Number(d.id_sala) === Number(bookingData.id_sala);
    return matchMedico && matchSala;
  });

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (
      !bookingData.documento_paciente ||
      !bookingData.documento_medico ||
      !bookingData.id_sala ||
      !bookingData.horario_atencion
    ) {
      setErrorMsg('Debes seleccionar todos los campos y elegir un turno disponible (30 min).');
      return;
    }

    try {
      await registrarCita(bookingData);
      setSuccessMsg('¡Cita médica reservada con éxito! El turno ha sido marcado como ocupado (estado = 1).');
      setTimeout(() => {
        setIsBookModalOpen(false);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const citasEnriquecidas = getCitasEnriquecidas();

  const filteredCitas = citasEnriquecidas.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      String(c.id_cita).includes(term) ||
      c.paciente_nombre.toLowerCase().includes(term) ||
      c.documento_paciente.toLowerCase().includes(term) ||
      c.medico_nombre.toLowerCase().includes(term) ||
      c.medico_especialidad.toLowerCase().includes(term) ||
      c.lugar.toLowerCase().includes(term)
    );
  });

  return (
    <div className="module-container">
      {/* Encabezado */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h3>Módulo de Citas Médicas</h3>
          <p>
            Permite agendar citas vinculando un paciente con un turno médico disponible, evitando duplicidades.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar cita por paciente, médico o sala..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleOpenBookModal}>
            <Plus size={16} />
            <span>Reservar Cita Médica</span>
          </button>
        </div>
      </div>

      {/* Tabla de Citas */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID Cita (PK)</th>
                <th>Paciente</th>
                <th>Médico & Especialidad</th>
                <th>Lugar & Fecha</th>
                <th>Turno (30m)</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCitas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No se encontraron citas médicas registradas.
                  </td>
                </tr>
              ) : (
                filteredCitas.map((cita) => {
                  const isProgramada = cita.estado_cita === 'Programada';
                  return (
                    <tr key={cita.id_cita}>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          #{cita.id_cita}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{cita.paciente_nombre}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Doc: {cita.documento_paciente}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{cita.medico_nombre}</div>
                          <span className="badge badge-especialidad" style={{ fontSize: '0.7rem' }}>
                            {cita.medico_especialidad}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                            <Calendar size={13} color="var(--primary)" />
                            <span>{formatearFecha(cita.fecha)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <MapPin size={12} />
                            <span>{cita.lugar}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={13} color="var(--primary)" />
                          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {cita.horario_atencion}
                          </span>
                        </div>
                      </td>
                      <td>
                        {isProgramada ? (
                          <span className="badge badge-disponible">Programada</span>
                        ) : (
                          <span className="badge badge-ocupado">{cita.estado_cita}</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button
                            className="btn-icon-only btn-icon-view"
                            onClick={() => handleOpenConsult(cita)}
                            title="Consultar comprobante de cita"
                          >
                            <Eye size={16} />
                          </button>

                          {isProgramada && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', color: 'var(--danger)' }}
                              onClick={() => handleCancelarCita(cita.id_cita)}
                              title="Cancelar cita (libera el turno a estado 0)"
                            >
                              Cancelar
                            </button>
                          )}

                          <button
                            className="btn-icon-only btn-icon-delete"
                            onClick={() => handleOpenDelete(cita)}
                            title="Eliminar registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Formulario de Reserva de Cita con Bloqueo de Turnos Ocupados */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Reservar Nueva Cita Médica"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsBookModalOpen(false)}>
              Cerrar
            </button>
            <button className="btn btn-primary" onClick={handleSubmitBooking}>
              Confirmar Reserva
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitBooking}>
          {errorMsg && <div className="form-alert form-alert-error">{errorMsg}</div>}
          {successMsg && <div className="form-alert form-alert-success">{successMsg}</div>}

          {/* Paso 1: Paciente */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>1. Seleccionar Paciente (FK: documento_paciente) *</label>
            <select
              value={bookingData.documento_paciente}
              onChange={(e) =>
                setBookingData({ ...bookingData, documento_paciente: e.target.value })
              }
              required
            >
              {pacientes.map((p) => (
                <option key={p.documento_identidad} value={p.documento_identidad}>
                  {p.nombre_completo} - Doc: {p.documento_identidad} ({p.telefono})
                </option>
              ))}
            </select>
          </div>

          {/* Paso 2: Médico */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>2. Seleccionar Médico y Especialidad (FK: documento_medico) *</label>
            <select
              value={bookingData.documento_medico}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  documento_medico: e.target.value,
                  horario_atencion: ''
                })
              }
              required
            >
              {medicos.map((m) => (
                <option key={m.documento_identidad} value={m.documento_identidad}>
                  {m.nombre_completo} - {m.especialidad} (Cédula: {m.documento_identidad})
                </option>
              ))}
            </select>
          </div>

          {/* Paso 3: Lugar y Fecha (Horario) */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>3. Seleccionar Lugar y Fecha de Atención (FK: id_sala) *</label>
            <select
              value={bookingData.id_sala}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  id_sala: e.target.value,
                  horario_atencion: ''
                })
              }
              required
            >
              {horarios.map((h) => (
                <option key={h.id_sala} value={h.id_sala}>
                  Sala #{h.id_sala}: {h.lugar} ({formatearFecha(h.fecha)} de {h.hora_inicial} a {h.hora_final})
                </option>
              ))}
            </select>
          </div>

          {/* Paso 4: Selección de Turno de 30 minutos (evitando turnos ocupados) */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>4. Seleccionar Turno de Atención (30 minutos) *</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Verde: Disponible | Rojo: Ocupado
              </span>
            </label>

            {turnosDisponiblesParaReserva.length === 0 ? (
              <div
                style={{
                  padding: '1rem',
                  background: '#fef3c7',
                  color: '#92400e',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={18} />
                <span>
                  No hay turnos configurados para este médico en esta sala. Por favor genera turnos en el módulo de
                  Disponibilidad primero.
                </span>
              </div>
            ) : (
              <div className="turnos-grid">
                {turnosDisponiblesParaReserva.map((turno) => {
                  const isOcupado = Number(turno.estado) === 1;
                  const isSelected = bookingData.horario_atencion === turno.horario_atencion;

                  return (
                    <div
                      key={turno.id_disponibilidad || turno.horario_atencion}
                      className={`turno-card ${isOcupado ? 'ocupado' : 'disponible'}`}
                      style={{
                        cursor: isOcupado ? 'not-allowed' : 'pointer',
                        boxShadow: isSelected ? '0 0 0 2px #2563eb' : 'none',
                        borderWidth: isSelected ? '2px' : '1px'
                      }}
                      onClick={() => {
                        if (!isOcupado) {
                          setBookingData({
                            ...bookingData,
                            horario_atencion: turno.horario_atencion
                          });
                        }
                      }}
                    >
                      <span className="turno-hora">{turno.horario_atencion}</span>
                      <span className="turno-estado">
                        {isOcupado ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <XCircle size={10} /> Ocupado
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle size={10} /> {isSelected ? 'Elegido' : 'Libre'}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Motivo de la Cita */}
          <div className="form-group">
            <label>Motivo de la Consulta</label>
            <input
              type="text"
              placeholder="Ej: Dolor de cabeza frecuente y control médico"
              value={bookingData.motivo}
              onChange={(e) =>
                setBookingData({ ...bookingData, motivo: e.target.value })
              }
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: Consultar Detalle de Cita */}
      {selectedCita && (
        <Modal
          isOpen={isConsultOpen}
          onClose={() => setIsConsultOpen(false)}
          title={`Comprobante de Cita Médica #${selectedCita.id_cita}`}
          footer={
            <button className="btn btn-secondary" onClick={() => setIsConsultOpen(false)}>
              Cerrar
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CÓDIGO DE CITA</span>
                <h3 style={{ color: 'var(--primary)', fontWeight: 800 }}>#{selectedCita.id_cita}</h3>
              </div>
              <span className="badge badge-disponible">{selectedCita.estado_cita}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <User size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedCita.paciente_nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Cédula: {selectedCita.documento_paciente} | Tel: {selectedCita.paciente_telefono}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Stethoscope size={18} color="#7c3aed" />
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedCita.medico_nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Especialidad: {selectedCita.medico_especialidad} (Cédula: {selectedCita.documento_medico})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={18} color="#057a55" />
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedCita.lugar}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Sala ID: #{selectedCita.id_sala}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={18} color="#d97706" />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {formatearFecha(selectedCita.fecha)} a las {selectedCita.horario_atencion}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Duración estimada del turno: 30 minutos
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                background: '#f1f5f9',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Motivo registrado:
              </span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                "{selectedCita.motivo}"
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Eliminar Cita */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cita Médica"
        message={`¿Estás seguro de que deseas eliminar la cita #${selectedCita?.id_cita}? Esto liberará automáticamente el turno a estado disponible (0).`}
      />
    </div>
  );
};

export default CitasView;
