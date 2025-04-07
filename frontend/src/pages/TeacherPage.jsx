import React, { useEffect, useState } from 'react';

const TeacherPage = () => {
  const [description, setDescription] = useState('');
  const [copies, setCopies] = useState(1);
  const [requests, setRequests] = useState([]);

  // Fetch teacher's requests on load
  useEffect(() => {
    const fetchRequests = async () => {
      const response = await fetch('http://localhost:5000/api/print-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('user')}` },
      });
      const data = await response.json();
      setRequests(data);
    };
    fetchRequests();
  }, []);

  // Submit a new print request
  const submitRequest = async () => {
    if (!description || copies < 1) return alert('Please fill in all fields with valid data!');

    const response = await fetch('http://localhost:5000/api/print-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('user')}`,
      },
      body: JSON.stringify({ description, copies }),
    });

    if (response.ok) {
      alert('Request submitted!');
      const updatedRequests = await fetch('http://localhost:5000/api/print-requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('user')}` },
      });
      setRequests(await updatedRequests.json());
    } else alert('Failed to submit request');
  };

  return (
    <div className="teacher-container">
      <h2>Teacher Page</h2>

      <h3>Submit a Print Request</h3>
      <input
        type="text"
        placeholder="Request Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Number of Copies"
        value={copies}
        onChange={(e) => setCopies(Number(e.target.value))}
      />
      <button onClick={submitRequest}>Submit Request</button>

      <h3>Your Requests</h3>
      <ul>
        {requests.map((req) => (
          <li key={req._id}>
            {req.description} — {req.copies} copies — <strong>{req.status}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherPage;
