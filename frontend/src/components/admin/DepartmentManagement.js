import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null); // for showing "Copied!"

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/departments');
        setDepartments(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch departments');
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    
    if (!newDepartment.trim()) return;
    
    try {
      const response = await api.post('/api/departments', { name: newDepartment });
      setDepartments([...departments, response.data.data]);
      setNewDepartment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await api.delete(`/api/departments/${id}`);
      setDepartments(departments.filter(dept => dept._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500); // reset after 1.5 seconds
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="department-management">
      <h1>Department Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="add-department">
        <h2>Add New Department</h2>
        <form onSubmit={handleAddDepartment}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Department Name"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-submit">Add Department</button>
        </form>
      </div>
      
      <div className="departments-list">
        <h2>Departments</h2>
        {departments.length === 0 ? (
          <p>No departments found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
                      {dept._id}
                    </span>
                    <button
                      style={{
                        marginLeft: '8px',
                        padding: '2px 6px',
                        fontSize: '0.75em',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleCopy(dept._id)}
                    >
                      Copy
                    </button>
                    {copiedId === dept._id && (
                      <span style={{ marginLeft: '6px', color: 'green', fontSize: '0.75em' }}>
                        Copied!
                      </span>
                    )}
                  </td>
                  <td>{dept.name}</td>
                  <td>
                    <button 
                      className="btn-action delete" 
                      onClick={() => handleDeleteDepartment(dept._id)}
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

export default DepartmentManagement;
