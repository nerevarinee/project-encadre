import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherPage from './pages/TeacherPage';
import DeptHeadDashboard from './pages/DeptHeadDashboard';
import PrintingStaffDashboard from './pages/PrintingStaffDashboard';

export const AuthContext = createContext();

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/teacher" element={user?.role === 'teacher' ? <TeacherPage /> : <Navigate to="/" />} />
          <Route path="/dept-head" element={user?.role === 'department_head' ? <DeptHeadDashboard /> : <Navigate to="/" />} />
          <Route path="/printing-staff" element={user?.role === 'printing_staff' ? <PrintingStaffDashboard /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
