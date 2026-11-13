import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirmar eliminación'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Eliminar
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div
          style={{
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            padding: '0.75rem',
            borderRadius: '50%',
            display: 'flex'
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
          {message || '¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.'}
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
