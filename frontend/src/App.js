// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/common/PrivateRoute';
import Unauthorized from './components/common/Unauthorized';

// Auth Components
import Login from './components/auth/Login';

// Admin Components
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import DepartmentManagement from './components/admin/DepartmentManagement';
import Statistics from './components/admin/Statistics';

// Teacher Components
import CreatePrintRequest from './components/teacher/CreatePrintRequest';

// Department Head Components
import ApprovePrintRequests from './components/dept_head/ApprovePrintRequests';

// Printing Staff Components
import ProcessPrintRequests from './components/printing_staff/ProcessPrintRequests';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="container">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Dashboard - accessible to all authenticated users */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute 
                    component={Dashboard} 
                    roles={['admin', 'teacher', 'dept_head', 'printing_staff']} 
                  />
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/users" 
                element={
                  <PrivateRoute 
                    component={UserManagement} 
                    roles={['admin']} 
                  />
                } 
              />
              
              <Route 
                path="/departments" 
                element={
                  <PrivateRoute 
                    component={DepartmentManagement} 
                    roles={['admin']} 
                  />
                } 
              />
              
              <Route 
                path="/stats" 
                element={
                  <PrivateRoute 
                    component={Statistics} 
                    roles={['admin']} 
                  />
                } 
              />
              
              {/* Teacher Routes */}
              <Route 
                path="/create-request" 
                element={
                  <PrivateRoute 
                    component={CreatePrintRequest} 
                    roles={['teacher']} 
                  />
                } 
              />
              
              {/* Department Head Routes */}
              <Route 
                path="/department-requests" 
                element={
                  <PrivateRoute 
                    component={ApprovePrintRequests} 
                    roles={['dept_head']} 
                  />
                } 
              />
              
              {/* Printing Staff Routes */}
              <Route 
                path="/process-requests" 
                element={
                  <PrivateRoute 
                    component={ProcessPrintRequests} 
                    roles={['printing_staff']} 
                  />
                } 
              />
              
              {/* Redirect to login or dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;