// src/components/teacher/CreatePrintRequest.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import PrintRequestList from '../common/PrintRequestList';

const CreatePrintRequest = () => {
  const [formData, setFormData] = useState({
    copies: 1,
    description: ''
  });
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Ideally, we would have an API endpoint to get the current user's requests
    // Since we don't have that endpoint, this is left as a placeholder
    setLoading(false);
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
      const response = await api.post('/api/print-requests', formData);
      setMyRequests([response.data.data, ...myRequests]);
      setSuccess('Print request created successfully!');
      
      // Reset form
      setFormData({
        copies: 1,
        description: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create print request');
    }
  };

  return (
    <div className="create-print-request">
      <h1>Create Print Request</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <div className="request-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="copies">Number of Copies</label>
            <input
              type="number"
              id="copies"
              name="copies"
              value={formData.copies}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please describe what you need printed"
              rows="4"
              required
            ></textarea>
          </div>
          
          <button type="submit" className="btn-submit">Submit Print Request</button>
        </form>
      </div>
      
      <div className="my-requests">
        <h2>My Print Requests</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <PrintRequestList requests={myRequests} />
        )}
      </div>
    </div>
  );
};

export default CreatePrintRequest;