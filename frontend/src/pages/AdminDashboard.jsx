import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css'; // Create a CSS file for styling

const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your API URL

const AdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from local storage
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [printRequests, setPrintRequests] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, requestsByStatus: [] });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'teacher', department: '' });
  const [newDepartment, setNewDepartment] = useState({ name: '' });
  const [createUserError, setCreateUserError] = useState('');
  const [createDepartmentError, setCreateDepartmentError] = useState('');

  // Function to handle API requests
  const apiRequest = async (url, method = 'GET', body = null) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const options = {
        method,
        headers
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await axios(url, options);
      return response.data;
    } catch (error) {
      console.error('API request error:', error.response ? error.response.data : error.message);
      throw error.response ? error.response.data : error;
    }
  };

  // Function to populate the department select dropdown
  const populateDepartmentSelect = async () => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/departments`);
      setDepartments(data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Handle error (e.g., display a message to the user)
    }
  };

  // Function to fetch and display users
  const fetchAndDisplayUsers = async () => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/users`);
      setUsers(data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Handle error
    }
  };

  // Function to handle user creation
  const handleUserCreation = async (event) => {
    event.preventDefault();
    setCreateUserError(''); // Clear previous errors

    try {
      const data = await apiRequest(`${API_BASE_URL}/register`, 'POST', newUser);
      console.log('User created:', data);
      fetchAndDisplayUsers(); // Refresh user list
      setNewUser({ name: '', email: '', password: '', role: 'teacher', department: '' }); // Reset form
    } catch (error) {
      console.error('Error creating user:', error);
      setCreateUserError(error.message || 'Could not create user');
    }
  };

  // Function to handle user input change
  const handleNewUserChange = (event) => {
    setNewUser({ ...newUser, [event.target.name]: event.target.value });
  };

  // Function to delete a user
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiRequest(`${API_BASE_URL}/users/${userId}`, 'DELETE');
        fetchAndDisplayUsers(); // Refresh user list
      } catch (error) {
        console.error('Error deleting user:', error);
        // Handle error
      }
    }
  };

  // Function to fetch and display departments
  const fetchAndDisplayDepartments = async () => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/departments`);
      setDepartments(data.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Handle error
    }
  };

  // Function to handle department creation
  const handleDepartmentCreation = async (event) => {
    event.preventDefault();
    setCreateDepartmentError(''); // Clear previous errors

    try {
      const data = await apiRequest(`${API_BASE_URL}/departments`, 'POST', newDepartment);
      console.log('Department created:', data);
      fetchAndDisplayDepartments(); // Refresh department list
      populateDepartmentSelect(); // Refresh dropdown list
      setNewDepartment({ name: '' }); // Reset form
    } catch (error) {
      console.error('Error creating department:', error);
      setCreateDepartmentError(error.message || 'Could not create department');
    }
  };

  // Function to handle department input change
  const handleNewDepartmentChange = (event) => {
    setNewDepartment({ ...newDepartment, [event.target.name]: event.target.value });
  };

  // Function to delete a department
  const deleteDepartment = async (deptId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await apiRequest(`${API_BASE_URL}/departments/${deptId}`, 'DELETE');
        fetchAndDisplayDepartments(); // Refresh department list
        populateDepartmentSelect(); // Refresh dropdown list
      } catch (error) {
        console.error('Error deleting department:', error);
        // Handle error
      }
    }
  };

  // Function to fetch and display print requests
  const fetchAndDisplayPrintRequests = async () => {
    try {
      const data = await apiRequest(`${API_BASE_URL}/print-requests`);
      setPrintRequests(data.data);
    } catch (error) {
      console.error('Error fetching print requests:', error);
      // Handle error
    }
  };

  // Function to fetch and display statistics
  const fetchAndDisplayStatistics = async () => {
    try {
      const totalRequestsData = await apiRequest(`${API_BASE_URL}/stats/requests`);
      const requestsByStatusData = await apiRequest(`${API_BASE_URL}/stats/requests/status`);
      setStats({
        totalRequests: totalRequestsData.data.totalRequests,
        requestsByStatus: requestsByStatusData.data
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Handle error
    }
  };

  useEffect(() => {
    // Initial data loading
    populateDepartmentSelect();
    fetchAndDisplayUsers();
    fetchAndDisplayDepartments();
    fetchAndDisplayPrintRequests();
    fetchAndDisplayStatistics();
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <section id="user-management">
        <h2>User Management</h2>

        <form id="create-user-form" onSubmit={handleUserCreation}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={newUser.name} onChange={handleNewUserChange} required />

          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={newUser.email} onChange={handleNewUserChange} required />

          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" value={newUser.password} onChange={handleNewUserChange} required />

          <label htmlFor="role">Role:</label>
          <select id="role" name="role" value={newUser.role} onChange={handleNewUserChange} required>
            <option value="teacher">Teacher</option>
            <option value="dept_head">Department Head</option>
            <option value="printing_staff">Printing Staff</option>
            <option value="admin">Admin</option>
          </select>

          <label htmlFor="department">Department:</label>
          <select id="department" name="department" value={newUser.department} onChange={handleNewUserChange}>
            <option value="">None</option>
            {departments.map(dept => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>

          <button type="submit">Create User</button>
          {createUserError && <p className="error">{createUserError}</p>}
        </form>

        <h3>Existing Users</h3>
        <table id="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.department ? user.department.name : 'N/A'}</td>
                <td><button className="delete-user" onClick={() => deleteUser(user._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="department-management">
        <h2>Department Management</h2>

        <form id="create-department-form" onSubmit={handleDepartmentCreation}>
          <label htmlFor="department-name">Department Name:</label>
          <input type="text" id="department-name" name="name" value={newDepartment.name} onChange={handleNewDepartmentChange} required />
          <button type="submit">Create Department</button>
          {createDepartmentError && <p className="error">{createDepartmentError}</p>}
        </form>

        <h3>Existing Departments</h3>
        <table id="department-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept._id}>
                <td>{dept.name}</td>
                <td><button className="delete-department" onClick={() => deleteDepartment(dept._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="print-request-management">
        <h2>Print Request Management</h2>

        <h3>Print Requests</h3>
        <table id="print-request-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Department</th>
              <th>Copies</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {printRequests.map(req => (
              <tr key={req._id}>
                <td>{req.teacher.name}</td>
                <td>{req.department.name}</td>
                <td>{req.copies}</td>
                <td>{req.description}</td>
                <td>{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="statistics">
        <h2>Statistics</h2>
        <div id="statistics-container">
          <p>Total Print Requests: {stats.totalRequests}</p>
          <h3>Requests by Status:</h3>
          <ul>
            {stats.requestsByStatus.map(stat => (
              <li key={stat._id}>{stat._id}: {stat.count}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;