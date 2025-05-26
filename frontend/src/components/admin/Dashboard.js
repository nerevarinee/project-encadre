// src/components/admin/Dashboard.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import PrintRequestList from '../common/PrintRequestList';
import StatusChart from '../printing_staff/StatusChart';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch appropriate data based on user role
        if (user.role === 'admin') {
          // Admin sees all requests and stats
          const [requestsRes, statsRes] = await Promise.all([
            api.get('/api/print-requests'),
            api.get('/api/stats/requests/by-status') // Fixed stats endpoint
          ]);
          setRequests(requestsRes.data.data);
          setStats(statsRes.data.data);
        } else if (user.role === 'dept_head') {
          // Department head sees pending requests for approval
          const response = await api.get('/api/print-requests/pending/my-department');
          setRequests(response.data.data);
        } else if (user.role === 'printing_staff') {
          // Printing staff sees approved and printing requests (queue)
          const response = await api.get('/api/print-requests/queue');
          setRequests(response.data.data);
        } else if (user.role === 'teacher') {
          // Teacher endpoint (already working correctly)
          const response = await api.get('/api/print-requests/teacher');
          setRequests(response.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Define action buttons based on user role
  const getActionButtons = (request) => {
    if (user.role === 'dept_head' && request.status === 'pending') {
      return (
        <button
          className="btn-action approve"
          onClick={() => handleApprove(request._id)}
        >
          Approve
        </button>
      );
    }

    if (user.role === 'printing_staff') {
      if (request.status === 'approved') {
        return (
          <button 
            className="btn-action process" 
            onClick={() => handleProcess(request._id)}
          >
            Start Printing
          </button>
        );
      }
      
      if (request.status === 'printing') {
        return (
          <button 
            className="btn-action complete" 
            onClick={() => handleComplete(request._id)}
          >
            Mark Completed
          </button>
        );
      }
    }

    return null;
  };

  // Handle approve action
  const handleApprove = async (id) => {
    try {
      const response = await api.put(`/api/print-requests/${id}/approve`);
      // Update the request in the list with the response data to ensure consistency
      setRequests(requests.map(req =>
        req._id === id ? response.data.data : req
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  // Handle process action
  const handleProcess = async (id) => {
    try {
      const response = await api.put(`/api/print-requests/${id}/process`);
      // Update the request in the list with the response data
      setRequests(requests.map(req =>
        req._id === id ? response.data.data : req
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
    }
  };

  // Handle complete action
  const handleComplete = async (id) => {
    try {
      const response = await api.put(`/api/print-requests/${id}/complete`);
      // Update the request in the list with the response data
      setRequests(requests.map(req =>
        req._id === id ? response.data.data : req
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete request');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>{user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')} Dashboard</h1>

      {error && <div className="error-message">{error}</div>}
      
      {user.role === 'admin' && stats && (
        <div className="stats-summary">
          <h2>Print Request Statistics</h2>
          
          <StatusChart data={stats} />

          <div className="stats-grid">
            {stats.map(stat => (
              <div className="stat-card" key={stat._id}>
                <h3>{stat._id}</h3>
                <p className="stat-value">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="request-section">
        <h2>Print Requests</h2>
        {requests.length > 0 ? (
          <PrintRequestList 
            requests={requests} 
            actionButtons={getActionButtons} 
          />
        ) : (
          <p>No print requests available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;