import React from 'react';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/common/StatCard';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { formatearFecha } from '../../utils/timeUtils';

const DashboardView = ({ setActiveTab }) => {
  const { pacientes, medicos, disponibilidades, citas, getCitasEnriquecidas } = useApp();

  const citasProgramadas = citas.filter((c) => c.estado_cita === 'Programada');
  const turnosDisponibles = disponibilidades.filter((d) => Number(d.estado) === 0);
  const turnosOcupados = disponibilidades.filter((d) => Number(d.estado) === 1);
  const proximasCitas = getCitasEnriquecidas().filter((c) => c.estado_cita === 'Programada');

  return (
    <div className="dashboard-view">
      {/* Tarjetas de Métricas Solicitadas */}
      <div className="stats-grid">
        <StatCard
          icon={Users}
          label="Total Pacientes"
          value={pacientes.length}
          color="#2563eb"
          bgColor="#eff6ff"
        />
        <StatCard
          icon={UserCheck}
          label="Total Médicos"
          value={medicos.length}
          color="#7c3aed"
          bgColor="#f5f3ff"
        />
        <StatCard
          icon={CalendarCheck}
          label="Citas Programadas"
          value={citasProgramadas.length}
          color="#0284c7"
          bgColor="#e0f2fe"
        />
        <StatCard
          icon={CheckCircle2}
          label="Turnos Disponibles"
          value={turnosDisponibles.length}
          color="#057a55"
          bgColor="#def7ec"
        />
        <StatCard
          icon={XCircle}
          label="Turnos Ocupados"
          value={turnosOcupados.length}
          color="#dc2626"
          bgColor="#fef2f2"
        />
      </div>

      {/* Acciones Rápidas */}
      <div
        style={{
          background: 'white',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h4 style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1rem' }}>
            Acciones Rápidas del Hospital
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Accede rápidamente a los flujos operativos más comunes.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setActiveTab('citas')}>
            <CalendarCheck size={16} />
            <span>Reservar Cita Médica</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('disponibilidad')}>
            <Clock size={16} />
            <span>Generar Turnos (30 min)</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('pacientes')}>
            <Users size={16} />
            <span>Registrar Paciente</span>
          </button>
        </div>
      </div>

      {/* Tabla de Próximas Citas */}
      <div className="section-header">
        <div className="section-title-wrap">
          <h3>Próximas Citas Médicas</h3>
          <p>Listado de las citas programadas en las diferentes salas y consultorios.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('agenda')}>
          <span>Ver toda la agenda</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID Cita</th>
                <th>Paciente</th>
                <th>Médico & Especialidad</th>
                <th>Lugar / Sala</th>
                <th>Fecha & Hora</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {proximasCitas.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay citas programadas actualmente.
                  </td>
                </tr>
              ) : (
                proximasCitas.slice(0, 5).map((cita) => (
                  <tr key={cita.id_cita}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        #{cita.id_cita}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{cita.paciente_nombre}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Doc: {cita.documento_paciente}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{cita.medico_nombre}</div>
                        <span className="badge badge-especialidad">{cita.medico_especialidad}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="var(--text-muted)" />
                        <span>{cita.lugar}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                          <Calendar size={13} color="var(--primary)" />
                          <span>{formatearFecha(cita.fecha)}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {cita.horario_atencion}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-disponible">
                        Programada
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
