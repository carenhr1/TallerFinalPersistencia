import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/common/Modal';
import {
  PlusCircle,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Trash2,
  Layers
} from 'lucide-react';
import { formatearFecha } from '../../utils/timeUtils';

const DisponibilidadView = () => {
  const {
    disponibilidades,
    medicos,
    horarios,
    generarTurnosParaMedico,
    cambiarEstadoTurnoManual,
    eliminarDisponibilidad
  } = useApp();

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedMedicoDoc, setSelectedMedicoDoc] = useState('');
  const [selectedIdSala, setSelectedIdSala] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtros de visualización
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroSala, setFiltroSala] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos', '0', '1'

  const handleOpenGenerate = () => {
    setSelectedMedicoDoc(medicos.length > 0 ? medicos[0].documento_identidad : '');
    setSelectedIdSala(horarios.length > 0 ? String(horarios[0].id_sala) : '');
    setErrorMsg('');
    setSuccessMsg('');
    setIsGenerateOpen(true);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedMedicoDoc || !selectedIdSala) {
      setErrorMsg('Por favor selecciona tanto el médico como el horario/sala.');
      return;
    }

    try {
      const cantidad = await generarTurnosParaMedico(selectedMedicoDoc, selectedIdSala);
      setSuccessMsg(`¡Éxito! Se generaron ${cantidad} turnos de 30 minutos disponibles (estado = 0).`);
      setTimeout(() => {
        setIsGenerateOpen(false);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteTurno = async (disp) => {
    if (window.confirm('¿Deseas eliminar este turno de atención?')) {
      try {
        await eliminarDisponibilidad(disp);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Filtrado reactivo de las disponibilidades
  const turnosFiltrados = disponibilidades.filter((disp) => {
    if (filtroMedico && String(disp.documento_medico) !== String(filtroMedico)) {
      return false;
    }
    if (filtroSala && Number(disp.id_sala) !== Number(filtroSala)) {
      return false;
    }
    if (filtroEstado !== 'todos' && Number(disp.estado) !== Number(filtroEstado)) {
      return false;
    }
    return true;
  });

  const totalDisponibles = disponibilidades.filter((d) => Number(d.estado) === 0).length;
  const totalOcupados = disponibilidades.filter((d) => Number(d.estado) === 1).length;

  return (
    <div className="module-container">
      {/* Encabezado */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h3>Módulo de Disponibilidad</h3>
          <p>
            Generación y gestión de turnos de 30 minutos según la hora inicial y final configurada.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenGenerate}>
          <PlusCircle size={16} />
          <span>Generar Turnos Automáticos (30 min)</span>
        </button>
      </div>

      {/* Resumen de estados 0 y 1 */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid var(--border-color)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '200px'
          }}
        >
          <Layers size={22} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL DE TURNOS</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{disponibilidades.length}</div>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #31c48d',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '200px'
          }}
        >
          <CheckCircle2 size={22} color="#057a55" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#057a55', fontWeight: 600 }}>
              ESTADO 0: DISPONIBLES
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#057a55' }}>
              {totalDisponibles}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            border: '1px solid #f98080',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: '1',
            minWidth: '200px'
          }}
        >
          <XCircle size={22} color="#dc2626" />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
              ESTADO 1: OCUPADOS (RESERVADOS)
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#dc2626' }}>
              {totalOcupados}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div
        style={{
          background: 'white',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
          <Filter size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtrar por:</span>
        </div>

        <select
          style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
          value={filtroMedico}
          onChange={(e) => setFiltroMedico(e.target.value)}
        >
          <option value="">Todos los Médicos</option>
          {medicos.map((m) => (
            <option key={m.documento_identidad} value={m.documento_identidad}>
              {m.nombre_completo} ({m.especialidad})
            </option>
          ))}
        </select>

        <select
          style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
          value={filtroSala}
          onChange={(e) => setFiltroSala(e.target.value)}
        >
          <option value="">Todas las Salas / Horarios</option>
          {horarios.map((h) => (
            <option key={h.id_sala} value={h.id_sala}>
              Sala #{h.id_sala} - {h.lugar} ({formatearFecha(h.fecha)})
            </option>
          ))}
        </select>

        <select
          style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los Estados</option>
          <option value="0">Solo Estado 0 (Disponible)</option>
          <option value="1">Solo Estado 1 (Ocupado)</option>
        </select>
      </div>

      {/* Grilla / Matriz de Turnos de 30 min */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Médico (FK: documento_medico)</th>
                <th>Sala & Lugar (FK: id_sala)</th>
                <th>Fecha de Atención</th>
                <th>Horario de Atención (Turno 30m)</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {turnosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No hay turnos que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                turnosFiltrados.map((disp) => {
                  const medico = medicos.find((m) => String(m.documento_identidad) === String(disp.documento_medico));
                  const sala = horarios.find((h) => Number(h.id_sala) === Number(disp.id_sala));
                  const isDisponible = Number(disp.estado) === 0;

                  return (
                    <tr key={disp.id_disponibilidad || `${disp.documento_medico}-${disp.id_sala}-${disp.horario_atencion}`}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {medico ? medico.nombre_completo : `Médico Doc: ${disp.documento_medico}`}
                          </div>
                          <span className="badge badge-especialidad" style={{ fontSize: '0.7rem' }}>
                            {medico ? medico.especialidad : 'Especialidad'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={13} color="var(--primary)" />
                            <span>Sala #{disp.id_sala}</span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {sala ? sala.lugar : 'Lugar no especificado'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>
                          {sala ? formatearFecha(sala.fecha) : 'Fecha N/A'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={14} color="var(--primary)" />
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}>
                            {disp.horario_atencion}
                          </span>
                        </div>
                      </td>
                      <td>
                        {isDisponible ? (
                          <span className="badge badge-disponible">
                            <CheckCircle2 size={12} />
                            <span>0 - DISPONIBLE</span>
                          </span>
                        ) : (
                          <span className="badge badge-ocupado">
                            <XCircle size={12} />
                            <span>1 - OCUPADO</span>
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          {/* Botón para alternar estado manualmente si no hay cita vinculada */}
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                            onClick={() =>
                              cambiarEstadoTurnoManual(
                                disp,
                                isDisponible ? 1 : 0
                              )
                            }
                            title="Alternar estado manualmente (0 <-> 1)"
                          >
                            Cambiar a {isDisponible ? '1' : '0'}
                          </button>

                          <button
                            className="btn-icon-only btn-icon-delete"
                            onClick={() => handleDeleteTurno(disp)}
                            title="Eliminar turno"
                            disabled={!isDisponible}
                          >
                            <Trash2 size={15} />
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

      {/* MODAL: Generador Automático de Turnos */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generador Automático de Turnos de 30 Minutos"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsGenerateOpen(false)}>
              Cerrar
            </button>
            <button className="btn btn-primary" onClick={handleGenerate}>
              Generar Turnos Automáticos
            </button>
          </>
        }
      >
        <form onSubmit={handleGenerate}>
          {errorMsg && <div className="form-alert form-alert-error">{errorMsg}</div>}
          {successMsg && <div className="form-alert form-alert-success">{successMsg}</div>}

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Selecciona el médico y el horario/sala. El algoritmo fraccionará automáticamente la hora
            inicial y final en intervalos de 30 minutos y los creará con estado <strong>0 (Disponible)</strong>.
          </p>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Seleccionar Médico (FK: documento_medico) *</label>
            <select
              value={selectedMedicoDoc}
              onChange={(e) => setSelectedMedicoDoc(e.target.value)}
              required
            >
              {medicos.map((m) => (
                <option key={m.documento_identidad} value={m.documento_identidad}>
                  {m.nombre_completo} - {m.especialidad} (Cédula: {m.documento_identidad})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Seleccionar Horario / Sala (FK: id_sala) *</label>
            <select
              value={selectedIdSala}
              onChange={(e) => setSelectedIdSala(e.target.value)}
              required
            >
              {horarios.map((h) => (
                <option key={h.id_sala} value={h.id_sala}>
                  Sala #{h.id_sala}: {h.lugar} ({formatearFecha(h.fecha)} de {h.hora_inicial} a {h.hora_final})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DisponibilidadView;
