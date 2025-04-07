import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your API URL

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleLogin = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      const { token, role } = response.data.data;

      // Store the token (e.g., in localStorage or a cookie)
      localStorage.setItem('token', token);

      // Redirect based on role
      switch (role) {
        case 'admin':
          navigate('/admin-dashboard'); // Replace with your admin route
          break;
        case 'teacher':
          navigate('/teacher-dashboard'); // Replace with your teacher route
          break;
        case 'dept_head':
          navigate('/dept-head-dashboard'); // Replace with your department head route
          break;
        case 'printing_staff':
          navigate('/printing-staff-dashboard'); // Replace with your printing staff route
          break;
        default:
          navigate('/'); // Redirect to a default page if role is unknown
          break;
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default LoginPage;