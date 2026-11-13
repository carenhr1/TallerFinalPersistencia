import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Filter,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Calendar,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { formatearFecha } from '../../utils/timeUtils';

const AgendaView = () => {
  const { getCitasEnriquecidas, medicos } = useApp();

  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroMedico, setFiltroMedico] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const todasLasCitas = getCitasEnriquecidas();

  const citasFiltradas = todasLasCitas.filter((cita) => {
    if (filtroFecha && cita.fecha !== filtroFecha) {
      return false;
    }
    if (filtroMedico && String(cita.documento_medico) !== String(filtroMedico)) {
      return false;
    }
    if (filtroEstado !== 'todas' && cita.estado_cita !== filtroEstado) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        cita.paciente_nombre.toLowerCase().includes(term) ||
        cita.documento_paciente.toLowerCase().includes(term) ||
        cita.medico_nombre.toLowerCase().includes(term) ||
        cita.lugar.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="module-container">
      {/* Encabezado */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h3>Agenda Médica y Cronograma</h3>
          <p>Consulta organizada de las citas médicas programadas en el hospital.</p>
        </div>
      </div>

      {/* Barra de Filtros de Agenda */}
      <div
        style={{
          background: 'white',
          padding: '1.25rem',
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
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtrar agenda:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fecha:</label>
          <input
            type="date"
            style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
          {filtroFecha && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setFiltroFecha('')}
              style={{ fontSize: '0.75rem' }}
            >
              Limpiar
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Médico:</label>
          <select
            style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            value={filtroMedico}
            onChange={(e) => setFiltroMedico(e.target.value)}
          >
            <option value="">Todos los médicos</option>
            {medicos.map((m) => (
              <option key={m.documento_identidad} value={m.documento_identidad}>
                {m.nombre_completo}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estado:</label>
          <select
            style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="todas">Todos los estados</option>
            <option value="Programada">Solo Programadas</option>
            <option value="Cancelada">Solo Canceladas</option>
          </select>
        </div>

        <div className="search-box" style={{ width: '240px', marginLeft: 'auto' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Agenda en Formato Tarjeta / Línea de Tiempo */}
      {citasFiltradas.length === 0 ? (
        <div
          style={{
            background: 'white',
            padding: '3rem 2rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <CalendarDays size={42} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
          <h4>No se encontraron citas en la agenda</h4>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Prueba cambiando o limpiando los filtros de fecha o médico.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {citasFiltradas.map((cita) => {
            const isProgramada = cita.estado_cita === 'Programada';

            return (
              <div
                key={cita.id_cita}
                style={{
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative'
                }}
              >
                {/* Cabecera de la cita */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                    <span>Cita #{cita.id_cita}</span>
                  </div>
                  {isProgramada ? (
                    <span className="badge badge-disponible">
                      <CheckCircle2 size={12} />
                      <span>Programada</span>
                    </span>
                  ) : (
                    <span className="badge badge-ocupado">
                      <XCircle size={12} />
                      <span>Cancelada</span>
                    </span>
                  )}
                </div>

                {/* Paciente */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <User size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cita.paciente_nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Doc: {cita.documento_paciente} | Tel: {cita.paciente_telefono}
                    </div>
                  </div>
                </div>

                {/* Médico */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#f3e8ff',
                      color: '#7e22ce',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cita.medico_nombre}</div>
                    <span className="badge badge-especialidad" style={{ fontSize: '0.7rem' }}>
                      {cita.medico_especialidad}
                    </span>
                  </div>
                </div>

                {/* Horario y Lugar */}
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <Calendar size={14} color="var(--primary)" />
                    <span>{formatearFecha(cita.fecha)}</span>
                    <Clock size={14} color="var(--primary)" style={{ marginLeft: '0.5rem' }} />
                    <span style={{ fontFamily: 'monospace' }}>{cita.horario_atencion}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} />
                    <span>{cita.lugar}</span>
                  </div>
                </div>

                {/* Motivo */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  "{cita.motivo}"
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgendaView;
