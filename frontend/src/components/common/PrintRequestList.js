// src/components/common/PrintRequestList.js
import React from 'react';
import { formatDate } from '../../utils/helpers';
import RequestStatusBadge from './RequestStatusBadge';

const PrintRequestList = ({ requests, actionButtons }) => {
  if (!requests || requests.length === 0) {
    return <p>No print requests found.</p>;
  }

  return (
    <div className="request-list">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Copies</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request._id}>
              <td>{request.description}</td>
              <td>{request.copies}</td>
              <td>
                <RequestStatusBadge status={request.status} />
              </td>
              <td>{formatDate(request.createdAt)}</td>
              <td>
                {actionButtons && actionButtons(request)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrintRequestList;