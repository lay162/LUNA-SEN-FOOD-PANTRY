import React from 'react';
import { X } from 'lucide-react';

export default function AdminPanelModal({ isOpen, onClose, title, children, wide }) {
  if (!isOpen) return null;
  return (
    <div className="admin-panel__modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`admin-panel__modal ${wide ? 'admin-panel__modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'admin-modal-title' : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="admin-panel__modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={22} />
        </button>
        {title ? (
          <h3 id="admin-modal-title" className="admin-panel__modal-title">
            {title}
          </h3>
        ) : null}
        <div className="admin-panel__modal-body">{children}</div>
      </div>
    </div>
  );
}
