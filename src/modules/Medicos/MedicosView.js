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
  Stethoscope,
  Phone,
  CalendarCheck
} from 'lucide-react';
import { formatearFecha } from '../../utils/timeUtils';

const ESPECIALIDADES = [
  'Medicina General',
  'Cardiología',
  'Pediatría',
  'Dermatología',
  'Ginecología',
  'Ortopedia',
  'Neurología',
  'Oftalmología',
  'Otorrinolaringología',
  'Psiquiatría'
];

const MedicosView = () => {
  const {
    medicos,
    registrarMedico,
    modificarMedico,
    eliminarMedico,
    getCitasEnriquecidas,
    disponibilidades
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [editingDoc, setEditingDoc] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    documento_identidad: '',
    nombre_completo: '',
    telefono: '',
    especialidad: 'Medicina General'
  });

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormData({
      documento_identidad: '',
      nombre_completo: '',
      telefono: '',
      especialidad: 'Medicina General'
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (medico) => {
    setEditingDoc(medico.documento_identidad);
    setFormData({
      documento_identidad: medico.documento_identidad,
      nombre_completo: medico.nombre_completo,
      telefono: medico.telefono,
      especialidad: medico.especialidad
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenConsult = (medico) => {
    setSelectedMedico(medico);
    setIsConsultOpen(true);
  };

  const handleOpenDelete = (medico) => {
    setSelectedMedico(medico);
    setIsDeleteOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !formData.documento_identidad.trim() ||
      !formData.nombre_completo.trim() ||
      !formData.telefono.trim() ||
      !formData.especialidad.trim()
    ) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      if (editingDoc) {
        await modificarMedico(editingDoc, formData);
      } else {
        await registrarMedico(formData);
      }
      setIsFormOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMedico) return;
    try {
      await eliminarMedico(selectedMedico.documento_identidad);
      setIsDeleteOpen(false);
      setSelectedMedico(null);
    } catch (err) {
      alert(err.message);
      setIsDeleteOpen(false);
    }
  };

  const filteredMedicos = medicos.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.documento_identidad.toLowerCase().includes(term) ||
      m.nombre_completo.toLowerCase().includes(term) ||
      m.especialidad.toLowerCase().includes(term) ||
      m.telefono.toLowerCase().includes(term)
    );
  });

  // Citas y turnos asociados al médico consultado
  const citasMedico = selectedMedico
    ? getCitasEnriquecidas().filter(
        (c) => String(c.documento_medico) === String(selectedMedico.documento_identidad)
      )
    : [];

  const turnosMedico = selectedMedico
    ? disponibilidades.filter(
        (d) => String(d.documento_medico) === String(selectedMedico.documento_identidad)
      )
    : [];

  return (
    <div className="module-container">
      {/* Encabezado */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h3>Módulo de Médicos</h3>
          <p>Registro y administración del personal médico y especialistas.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <UserPlus size={16} />
            <span>Registrar Médico</span>
          </button>
        </div>
      </div>

      {/* Tabla de Médicos */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Documento de Identidad (PK)</th>
                <th>Nombre Completo</th>
                <th>Teléfono</th>
                <th>Especialidad</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron médicos registrados con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredMedicos.map((medico) => (
                  <tr key={medico.documento_identidad}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {medico.documento_identidad}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{medico.nombre_completo}</div>
                    </td>
                    <td>{medico.telefono}</td>
                    <td>
                      <span className="badge badge-especialidad">{medico.especialidad}</span>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn-icon-only btn-icon-view"
                          onClick={() => handleOpenConsult(medico)}
                          title="Consultar agenda y detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon-only btn-icon-edit"
                          onClick={() => handleOpenEdit(medico)}
                          title="Modificar médico"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon-only btn-icon-delete"
                          onClick={() => handleOpenDelete(medico)}
                          title="Eliminar médico"
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

      {/* MODAL: Registrar / Modificar Médico */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingDoc ? 'Modificar Médico' : 'Registrar Nuevo Médico'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmitForm}>
              {editingDoc ? 'Guardar Cambios' : 'Registrar Médico'}
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
              placeholder="Ej: 71234567"
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
            <label>Nombre Completo (con título) *</label>
            <input
              type="text"
              placeholder="Ej: Dra. Andrea Castro"
              value={formData.nombre_completo}
              onChange={(e) =>
                setFormData({ ...formData, nombre_completo: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono *</label>
              <input
                type="tel"
                placeholder="Ej: 3009876543"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Especialidad *</label>
              <select
                value={formData.especialidad}
                onChange={(e) =>
                  setFormData({ ...formData, especialidad: e.target.value })
                }
              >
                {ESPECIALIDADES.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL: Consultar Médico */}
      {selectedMedico && (
        <Modal
          isOpen={isConsultOpen}
          onClose={() => setIsConsultOpen(false)}
          title="Consulta Detallada de Médico"
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
                  background: '#f3e8ff',
                  color: '#7e22ce',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Stethoscope size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {selectedMedico.nombre_completo}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <span className="badge badge-especialidad">{selectedMedico.especialidad}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Cédula: <strong>{selectedMedico.documento_identidad}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.9rem' }}>Teléfono: {selectedMedico.telefono}</span>
            </div>

            {/* Resumen de turnos configurados */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                background: '#fafafa',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Turnos Asignados:</span>
                <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>{turnosMedico.length}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Citas Programadas:</span>
                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  {citasMedico.filter((c) => c.estado_cita === 'Programada').length}
                </p>
              </div>
            </div>

            {/* Listado de Citas */}
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
                <CalendarCheck size={16} color="var(--primary)" />
                <span>Citas del Médico ({citasMedico.length})</span>
              </h5>

              {citasMedico.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  No hay citas agendadas para este médico actualmente.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {citasMedico.map((cita) => (
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
                        <strong>Paciente: {cita.paciente_nombre}</strong>
                        <span className="badge badge-disponible">{cita.estado_cita}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {formatearFecha(cita.fecha)} | {cita.horario_atencion} | {cita.lugar}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Confirmar eliminación */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Médico"
        message={`¿Estás seguro de que deseas eliminar al médico "${selectedMedico?.nombre_completo}" (Doc: ${selectedMedico?.documento_identidad})?`}
      />
    </div>
  );
};

export default MedicosView;
