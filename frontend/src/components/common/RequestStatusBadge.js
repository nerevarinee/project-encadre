// src/components/common/RequestStatusBadge.js
import React from 'react';
import { getStatusColor } from '../../utils/helpers';

const RequestStatusBadge = ({ status }) => {
  const backgroundColor = getStatusColor(status);
  
  return (
    <span 
      className="status-badge" 
      style={{ backgroundColor }}
    >
      {status}
    </span>
  );
};

export default RequestStatusBadge;