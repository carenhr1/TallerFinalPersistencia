import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Layers
} from 'lucide-react';
import { generarTurnos30Min, formatearFecha } from '../../utils/timeUtils';

const HorariosView = () => {
  const {
    horarios,
    registrarHorario,
    modificarHorario,
    eliminarHorario,
    disponibilidades
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    lugar: '',
    fecha: '',
    hora_inicial: '08:00',
    hora_final: '12:00'
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      lugar: '',
      fecha: new Date().toISOString().split('T')[0],
      hora_inicial: '08:00',
      hora_final: '12:00'
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (horario) => {
    setEditingId(horario.id_sala);
    setFormData({
      lugar: horario.lugar,
      fecha: horario.fecha,
      hora_inicial: horario.hora_inicial,
      hora_final: horario.hora_final
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenConsult = (horario) => {
    setSelectedHorario(horario);
    setIsConsultOpen(true);
  };

  const handleOpenDelete = (horario) => {
    setSelectedHorario(horario);
    setIsDeleteOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.lugar.trim() || !formData.fecha || !formData.hora_inicial || !formData.hora_final) {
      setErrorMsg('Por favor completa todos los campos del horario.');
      return;
    }

    if (formData.hora_inicial >= formData.hora_final) {
      setErrorMsg('La hora inicial debe ser estrictamente menor que la hora final.');
      return;
    }

    const bloques = generarTurnos30Min(formData.hora_inicial, formData.hora_final);
    if (bloques.length === 0) {
      setErrorMsg('El rango de tiempo debe ser de al menos 30 minutos para generar turnos válidos.');
      return;
    }

    try {
      if (editingId) {
        await modificarHorario(editingId, formData);
      } else {
        await registrarHorario(formData);
      }
      setIsFormOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedHorario) return;
    try {
      await eliminarHorario(selectedHorario.id_sala);
      setIsDeleteOpen(false);
      setSelectedHorario(null);
    } catch (err) {
      alert(err.message);
      setIsDeleteOpen(false);
    }
  };

  const filteredHorarios = horarios.filter((h) => {
    const term = searchTerm.toLowerCase();
    return (
      String(h.id_sala).includes(term) ||
      h.lugar.toLowerCase().includes(term) ||
      h.fecha.toLowerCase().includes(term)
    );
  });

  // Turnos calculados para el horario consultado
  const turnosCalculados = selectedHorario
    ? generarTurnos30Min(selectedHorario.hora_inicial, selectedHorario.hora_final)
    : [];

  const turnosGeneradosEnBD = selectedHorario
    ? disponibilidades.filter((d) => Number(d.id_sala) === Number(selectedHorario.id_sala))
    : [];

  return (
    <div className="module-container">
      {/* Encabezado */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h3>Módulo de Horarios y Salas</h3>
          <p>Registro de salas, lugares físicos, fechas de jornada y ventanas horarias.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Buscar por ID sala o lugar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Registrar Horario / Sala</span>
          </button>
        </div>
      </div>

      {/* Tabla de Horarios */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID Sala (PK Autoincrement)</th>
                <th>Lugar / Espacio Físico</th>
                <th>Fecha</th>
                <th>Hora Inicial</th>
                <th>Hora Final</th>
                <th>Turnos Calculables</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredHorarios.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No se encontraron horarios registrados.
                  </td>
                </tr>
              ) : (
                filteredHorarios.map((horario) => {
                  const turnos = generarTurnos30Min(horario.hora_inicial, horario.hora_final);
                  return (
                    <tr key={horario.id_sala}>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          #{horario.id_sala}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <MapPin size={14} color="var(--primary)" />
                          <span>{horario.lugar}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} color="var(--text-muted)" />
                          <span>{formatearFecha(horario.fecha)}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {horario.hora_inicial}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {horario.hora_final}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#334155' }}>
                          {turnos.length} turnos de 30m
                        </span>
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button
                            className="btn-icon-only btn-icon-view"
                            onClick={() => handleOpenConsult(horario)}
                            title="Consultar franjas y turnos"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon-only btn-icon-edit"
                            onClick={() => handleOpenEdit(horario)}
                            title="Modificar horario"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon-only btn-icon-delete"
                            onClick={() => handleOpenDelete(horario)}
                            title="Eliminar horario"
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

      {/* MODAL: Registrar / Modificar Horario */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? `Modificar Horario (#${editingId})` : 'Registrar Nuevo Horario y Sala'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmitForm}>
              {editingId ? 'Guardar Cambios' : 'Registrar Horario'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm}>
          {errorMsg && <div className="form-alert form-alert-error">{errorMsg}</div>}

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Lugar o Sala de Atención *</label>
            <input
              type="text"
              placeholder="Ej: Consultorio 301 - Bloque Materno Infantil"
              value={formData.lugar}
              onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Fecha de Atención *</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hora Inicial (HH:mm) *</label>
              <input
                type="time"
                value={formData.hora_inicial}
                onChange={(e) => setFormData({ ...formData, hora_inicial: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Hora Final (HH:mm) *</label>
              <input
                type="time"
                value={formData.hora_final}
                onChange={(e) => setFormData({ ...formData, hora_final: e.target.value })}
                required
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#f8fafc',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}
          >
            <strong>Regla automática:</strong> El lapso entre la hora inicial y final se fragmentará
            automáticamente en bloques de 30 minutos cuando se configure la disponibilidad.
          </div>
        </form>
      </Modal>

      {/* MODAL: Consultar Horario Detallado */}
      {selectedHorario && (
        <Modal
          isOpen={isConsultOpen}
          onClose={() => setIsConsultOpen(false)}
          title={`Detalles de Horario - Sala #${selectedHorario.id_sala}`}
          footer={
            <button className="btn btn-secondary" onClick={() => setIsConsultOpen(false)}>
              Cerrar
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {selectedHorario.lugar}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Fecha: <strong>{formatearFecha(selectedHorario.fecha)}</strong> | Rango:{' '}
                <strong>
                  {selectedHorario.hora_inicial} a {selectedHorario.hora_final}
                </strong>
              </p>
            </div>

            <div>
              <h5
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Layers size={16} color="var(--primary)" />
                <span>Bloques de 30 Minutos Calculados ({turnosCalculados.length}):</span>
              </h5>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {turnosCalculados.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#f1f5f9',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.8rem',
                      fontFamily: 'monospace'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Estado en Disponibilidad: {turnosGeneradosEnBD.length} turnos ya vinculados a médicos.
              </span>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Eliminar Horario */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Horario de Sala"
        message={`¿Estás seguro de que deseas eliminar el horario de la Sala #${selectedHorario?.id_sala} (${selectedHorario?.lugar})?`}
      />
    </div>
  );
};

export default HorariosView;
