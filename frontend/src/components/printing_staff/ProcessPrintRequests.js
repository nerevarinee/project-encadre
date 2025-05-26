// src/components/printing_staff/ProcessPrintRequests.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PrintRequestList from '../common/PrintRequestList';

const ProcessPrintRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get('//api/stats/requests/by-status');
        // Filter for approved and printing requests
        const filteredRequests = response.data.data.filter(
          req => req.status === 'approved' || req.status === 'printing'
        );
        setRequests(filteredRequests);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch print requests');
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleProcess = async (id) => {
    try {
      await api.put(`/api/print-requests/${id}/process`);
      // Update the request in the list
      setRequests(requests.map(req => 
        req._id === id ? { ...req, status: 'printing' } : req
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/api/print-requests/${id}/complete`);
      // Update the request in the list
      setRequests(requests.map(req => 
        req._id === id ? { ...req, status: 'completed' } : req
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete request');
    }
  };

  const actionButtons = (request) => {
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
    
    return null;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="process-requests">
      <h1>Process Print Requests</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <PrintRequestList 
        requests={requests} 
        actionButtons={actionButtons} 
      />
    </div>
  );
};

export default ProcessPrintRequests;