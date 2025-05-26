// src/utils/helpers.js
// Format date
export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status color for badges
  export const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#F9A825'; // Amber
      case 'approved':
        return '#43A047'; // Green
      case 'printing':
        return '#1E88E5'; // Blue
      case 'completed':
        return '#5E35B1'; // Deep Purple
      default:
        return '#757575'; // Grey
    }
  };
  
  // Check if user has permission
  export const hasPermission = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
  };