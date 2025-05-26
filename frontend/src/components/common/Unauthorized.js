// src/components/common/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized">
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/dashboard" className="btn-link">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;