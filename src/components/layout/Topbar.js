import React from 'react';
import { Database, WifiOff, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const titles = {
  dashboard: {
    title: 'Dashboard General',
    desc: 'Visión global de pacientes, médicos, turnos y citas'
  },
  pacientes: {
    title: 'Gestión de Pacientes',
    desc: 'Registro, consulta, actualización y eliminación de pacientes'
  },
  medicos: {
    title: 'Gestión de Médicos',
    desc: 'Control del cuerpo médico y especialidades'
  },
  horarios: {
    title: 'Horarios y Salas',
    desc: 'Definición de lugares, fechas y rangos horarios'
  },
  disponibilidad: {
    title: 'Disponibilidad y Turnos de 30 Minutos',
    desc: 'Generación automática de bloques y visualización de estados'
  },
  citas: {
    title: 'Reserva de Citas Médicas',
    desc: 'Asignación de turnos a pacientes evitando reservas duplicadas'
  },
  agenda: {
    title: 'Agenda de Citas Programadas',
    desc: 'Visualización y seguimiento de las consultas activas'
  }
};

const Topbar = ({ activeTab }) => {
  const current = titles[activeTab] || { title: 'Sistema Hospitalario', desc: '' };
  const { isServerOnline, isLoading, cargarDatosDesdeMySQL } = useApp();

  return (
    <header className="topbar">
      <div className="topbar-breadcrumb">
        <h2>{current.title}</h2>
        <p>{current.desc}</p>
      </div>

      <div className="topbar-right">
        {isServerOnline ? (
          <div
            className="badge"
            style={{
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              border: '1px solid var(--success-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
            title="Conectado a la base de datos relacional MySQL (hospital_citas)"
          >
            <Database size={15} />
            <span>MySQL Conectado</span>
          </div>
        ) : (
          <div
            className="badge"
            style={{
              backgroundColor: 'var(--warning-bg)',
              color: 'var(--warning)',
              border: '1px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
            title="Backend no detectado. Modo local activo."
          >
            <WifiOff size={15} />
            <span>Modo Local (Sin BD)</span>
          </div>
        )}

        <button
          className="btn-icon-only"
          onClick={cargarDatosDesdeMySQL}
          title="Sincronizar datos con MySQL"
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            padding: '0.45rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} color="var(--primary)" />
        </button>

        <div className="user-profile-badge">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <span className="user-name">Administrador</span>
            <span className="user-role">Hospital Central</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
