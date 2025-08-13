import React, { useState } from 'react';

export function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <div 
        className="section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="section-title">{title}</span>
        <span className="section-toggle">{isOpen ? '▼' : '▶'}</span>
      </div>
      
      {isOpen && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
} 