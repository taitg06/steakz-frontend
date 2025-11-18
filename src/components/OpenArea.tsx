import React, { PropsWithChildren } from 'react';
import './OpenArea.css';

const OpenArea: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="open-area-layout">
      <div className="open-area-content">
        {children}
      </div>
    </div>
  );
};

export default OpenArea;
