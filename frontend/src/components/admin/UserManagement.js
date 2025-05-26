// src/components/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'teacher',
    department: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, deptsRes] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/departments')
        ]);
        setUsers(usersRes.data.data);
        setDepartments(deptsRes.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api/register', formData);
      setUsers([...users, response.data.data]);

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'teacher',
        department: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.delete(`/api/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="add-user">
        <h2>Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="teacher">Teacher</option>
              <option value="dept_head">Department Head</option>
              <option value="printing_staff">Printing Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {formData.role !== 'admin' && (
            <div className="form-group">
              <label htmlFor="department">Department ID</label>
              <input
                type="text"
                id="department"
                name="department"
                placeholder="Enter department _id"
                value={formData.department}
                onChange={handleChange}
                required={formData.role !== 'admin'}
              />
              <small style={{ fontSize: '0.8em', color: '#666' }}>
                You can copy the ID from the Department Management page
              </small>
            </div>
          )}
          
          <button type="submit" className="btn-submit">Add User</button>
        </form>
      </div>
      
      <div className="users-list">
        <h2>Users</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button 
                      className="btn-action delete" 
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
