// src/components/common/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">University Print System</Link>
      </div>
      
      {user && (
        <div className="navbar-menu">
          <Link to="/dashboard">Dashboard</Link>
          
          {user.role === 'admin' && (
            <>
              <Link to="/users">Users</Link>
              <Link to="/departments">Departments</Link>
              <Link to="/stats">Statistics</Link>
            </>
          )}
          
          {user.role === 'teacher' && (
            <Link to="/create-request">New Print Request</Link>
          )}
          
          {user.role === 'dept_head' && (
            <Link to="/department-requests">Department Requests</Link>
          )}
          
          {user.role === 'printing_staff' && (
            <Link to="/process-requests">Process Requests</Link>
          )}
          
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;