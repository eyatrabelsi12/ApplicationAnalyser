// authUtils.js

export const getUserRole = () => {
    // Get user role from local storage or any other source
    return localStorage.getItem("role"); // Assuming role is stored in local storage
  };
  