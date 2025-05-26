// src/components/common/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { hasPermission } from '../../utils/helpers';

const PrivateRoute = ({ component: Component, roles = [], ...rest }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles.length > 0 && !hasPermission(user.role, roles)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Component {...rest} />;
};

export default PrivateRoute;