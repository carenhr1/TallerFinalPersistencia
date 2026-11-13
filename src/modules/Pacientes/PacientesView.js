import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { formatearFecha } from '../../utils/timeUtils';

const PacientesView = () => {
  const {
    pacientes,
    registrarPaciente,
    modificarPaciente,
    eliminarPaciente,
    getCitasEnriquecidas
  } = useApp();

  // Estados de control de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null); // null si es registro nuevo
  const [errorMsg, setErrorMsg] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    documento_identidad: '',
    nombre_completo: '',
    telefono: '',
    direccion: '',
    genero: 'Masculino'
  });

  // Abrir modal de nuevo registro
  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormData({
      documento_identidad: '',
      nombre_completo: '',
      telefono: '',
      direccion: '',
      genero: 'Masculino'
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Abrir modal de edición
  const handleOpenEdit = (paciente) => {
    setEditingDoc(paciente.documento_identidad);
    setFormData({
      documento_identidad: paciente.documento_identidad,
      nombre_completo: paciente.nombre_completo,
      telefono: paciente.telefono,
      direccion: paciente.direccion,
      genero: paciente.genero
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Abrir modal de consulta
  const handleOpenConsult = (paciente) => {
    setSelectedPaciente(paciente);
    setIsConsultOpen(true);
  };

  // Abrir confirmación de eliminación
  const handleOpenDelete = (paciente) => {
    setSelectedPaciente(paciente);
    setErrorMsg('');
    setIsDeleteOpen(true);
  };

  // Guardar (registrar o modificar)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !formData.documento_identidad.trim() ||
      !formData.nombre_completo.trim() ||
      !formData.telefono.trim() ||
      !formData.direccion.trim()
    ) {
      setErrorMsg('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      if (editingDoc) {
        await modificarPaciente(editingDoc, formData);
      } else {
        await registrarPaciente(formData);
      }
      setIsFormOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedPaciente) return;
    try {
      await eliminarPaciente(selectedPaciente.documento_identidad);
      setIsDeleteOpen(false);
      setSelectedPaciente(null);
    } catch (err) {
      alert(err.message);
      setIsDeleteOpen(false);
    }
  };

  // Filtrado de pacientes
  const filteredPacientes = pacientes.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.documento_identidad.toLowerCase().includes(term) ||
      p.nombre_completo.toLowerCase().includes(term) ||
      p.telefono.toLowerCase().includes(term)
    );
  });

  // Citas del paciente consultado
  const citasPaciente = selectedPaciente
    ? getCitasEnriquecidas().filter(
        (c) => String(c.documento_paciente) === String(selectedPaciente.documento_identidad)
      )
    : [];

  return (
    <div className="module-container">
      {/* Barra de cabecera */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h3>Módulo de Pacientes</h3>
          <p>Administra el registro general de pacientes de la institución médica.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por cédula o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <UserPlus size={16} />
            <span>Registrar Paciente</span>
          </button>
        </div>
      </div>

      {/* Tabla de Pacientes */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Documento de Identidad (PK)</th>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Género</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacientes.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron pacientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredPacientes.map((paciente) => (
                  <tr key={paciente.documento_identidad}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {paciente.documento_identidad}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{paciente.nombre_completo}</div>
                    </td>
                    <td>{paciente.telefono}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="var(--text-muted)" />
                        <span>{paciente.direccion}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-genero">{paciente.genero}</span>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn-icon-only btn-icon-view"
                          onClick={() => handleOpenConsult(paciente)}
                          title="Consultar detalles y citas"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon-only btn-icon-edit"
                          onClick={() => handleOpenEdit(paciente)}
                          title="Modificar paciente"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon-only btn-icon-delete"
                          onClick={() => handleOpenDelete(paciente)}
                          title="Eliminar paciente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Registrar / Modificar Paciente */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDoc ? 'Modificar Paciente' : 'Registrar Nuevo Paciente'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmitForm}>
              {editingDoc ? 'Guardar Cambios' : 'Registrar Paciente'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm}>
          {errorMsg && <div className="form-alert form-alert-error">{errorMsg}</div>}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Documento de Identidad (Llave Primaria) *</label>
            <input
              type="text"
              placeholder="Ej: 1020304050"
              value={formData.documento_identidad}
              disabled={!!editingDoc}
              onChange={(e) =>
                setFormData({ ...formData, documento_identidad: e.target.value })
              }
              required
            />
            {editingDoc && (
              <small style={{ color: 'var(--text-muted)' }}>
                El documento de identidad es la llave primaria y no puede modificarse.
              </small>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Nombre Completo *</label>
            <input
              type="text"
              placeholder="Ej: Juan Carlos Pérez"
              value={formData.nombre_completo}
              onChange={(e) =>
                setFormData({ ...formData, nombre_completo: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label>Teléfono *</label>
              <input
                type="tel"
                placeholder="Ej: 3101234567"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Género *</label>
              <select
                value={formData.genero}
                onChange={(e) =>
                  setFormData({ ...formData, genero: e.target.value })
                }
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Dirección *</label>
            <input
              type="text"
              placeholder="Ej: Calle 10 # 20-30"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              required
            />
          </div>
        </form>
      </Modal>

      {/* MODAL: Consultar Paciente y su Historial de Citas */}
      {selectedPaciente && (
        <Modal
          isOpen={isConsultOpen}
          onClose={() => setIsConsultOpen(false)}
          title={`Consulta Detallada de Paciente`}
          footer={
            <button className="btn btn-secondary" onClick={() => setIsConsultOpen(false)}>
              Cerrar
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {selectedPaciente.nombre_completo}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span className="badge badge-genero">{selectedPaciente.genero}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Cédula: <strong>{selectedPaciente.documento_identidad}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.9rem' }}>{selectedPaciente.telefono}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '0.9rem' }}>{selectedPaciente.direccion}</span>
              </div>
            </div>

            <div>
              <h5
                style={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  marginBottom: '0.5rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Calendar size={16} color="var(--primary)" />
                <span>Citas Médicas Asociadas ({citasPaciente.length})</span>
              </h5>

              {citasPaciente.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Este paciente no registra citas médicas por el momento.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {citasPaciente.map((cita) => (
                    <div
                      key={cita.id_cita}
                      style={{
                        padding: '0.65rem 0.85rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        background: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Cita #{cita.id_cita} - {cita.medico_nombre}</strong>
                        <span className="badge badge-disponible">{cita.estado_cita}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {formatearFecha(cita.fecha)} | {cita.horario_atencion} | {cita.lugar}
                      </div>
                      <div style={{ fontStyle: 'italic', marginTop: '0.2rem', color: '#475569' }}>
                        "{cita.motivo}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Eliminar Paciente */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Paciente"
        message={`¿Estás seguro de que deseas eliminar al paciente "${selectedPaciente?.nombre_completo}" (Doc: ${selectedPaciente?.documento_identidad})?`}
      />
    </div>
  );
};

export default PacientesView;
