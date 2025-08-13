import React from 'react';
//import { CollapsibleSection } from './CollapsibleSection';

export function ExportSection({ onSaveImage}) {//, onDebugInfo }) {
  return (
    <div>
    <div className="control-group">
    <button 
        className="btn btn-success" 
        onClick={onSaveImage}
    >
        Save Image
    </button>
    </div>
    {/* <div className="control-group">
    <button 
        className="btn btn-info" 
        onClick={onDebugInfo}
    >
        Debug Info
    </button>
    </div> */}
    </div>
  );
} 