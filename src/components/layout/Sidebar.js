import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Clock,
  CalendarRange,
  CalendarCheck,
  CalendarDays,
  RotateCcw,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { pacientes, medicos, citas, reiniciarDatosFicticios } = useApp();

  const handleReset = () => {
    if (window.confirm('¿Deseas reiniciar todos los datos a los valores ficticios iniciales?')) {
      reiniciarDatosFicticios();
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      icon: Users,
      badge: pacientes.length
    },
    {
      id: 'medicos',
      label: 'Médicos',
      icon: UserCheck,
      badge: medicos.length
    },
    {
      id: 'horarios',
      label: 'Horarios / Salas',
      icon: Clock,
      badge: null
    },
    {
      id: 'disponibilidad',
      label: 'Disponibilidad (30m)',
      icon: CalendarRange,
      badge: null
    },
    {
      id: 'citas',
      label: 'Citas Médicas',
      icon: CalendarCheck,
      badge: citas.filter((c) => c.estado_cita === 'Programada').length
    },
    {
      id: 'agenda',
      label: 'Agenda de Citas',
      icon: CalendarDays,
      badge: null
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Activity size={22} />
        </div>
        <div className="sidebar-title">
          <h1>SISTEMA MÉDICO</h1>
          <span>Gestión Hospitalaria</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navegación Principal</div>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
              {item.badge !== null && item.badge > 0 && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-reset-demo" onClick={handleReset} title="Restablecer datos ficticios">
          <RotateCcw size={14} />
          <span>Restablecer Datos Demo</span>
        </button>
        <span style={{ textAlign: 'center', marginTop: '0.25rem' }}>
          Proyecto Académico &copy; 2026
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
