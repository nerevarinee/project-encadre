// src/components/dept_head/ApprovePrintRequests.js
import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import PrintRequestList from '../common/PrintRequestList';

const ApprovePrintRequests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        // We would need the department ID here
        // Since we don't have it in the JWT directly, we'd need to either:
        // 1. Store it when the user logs in
        // 2. Make a separate request to get the user's details including department
        
        // For now, we'll assume we have the department ID from somewhere
        const departmentId = user.department || 'placeholder-dept-id';
        
        const response = await api.get(`/api/print-requests/department/${departmentId}`);
        setRequests(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch department requests');
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/print-requests/${id}/approve`);
      // Update the request in the list
      setRequests(requests.map(req => 
        req._id === id ? { ...req, status: 'approved' } : req
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const actionButtons = (request) => {
    if (request.status === 'pending') {
      return (
        <button 
          className="btn-action approve" 
          onClick={() => handleApprove(request._id)}
        >
          Approve
        </button>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="approve-requests">
      <h1>Department Print Requests</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <PrintRequestList 
        requests={requests} 
        actionButtons={actionButtons} 
      />
    </div>
  );
};

export default ApprovePrintRequests;