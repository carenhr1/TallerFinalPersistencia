import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import AdminLayout from './components/layout/AdminLayout';
import DashboardView from './modules/Dashboard/DashboardView';
import PacientesView from './modules/Pacientes/PacientesView';
import MedicosView from './modules/Medicos/MedicosView';
import HorariosView from './modules/Horarios/HorariosView';
import DisponibilidadView from './modules/Disponibilidad/DisponibilidadView';
import CitasView from './modules/Citas/CitasView';
import AgendaView from './modules/Agenda/AgendaView';
import './styles/index.css';
import './styles/layout.css';
import './styles/components.css';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'pacientes':
        return <PacientesView />;
      case 'medicos':
        return <MedicosView />;
      case 'horarios':
        return <HorariosView />;
      case 'disponibilidad':
        return <DisponibilidadView />;
      case 'citas':
        return <CitasView />;
      case 'agenda':
        return <AgendaView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderModule()}
    </AdminLayout>
  );
}

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
