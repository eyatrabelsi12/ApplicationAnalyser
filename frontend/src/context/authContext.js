import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
 
const AuthContext = createContext(null);
 
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
 
  // Simuler une méthode de connexion
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);
 
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
 
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
 
export const useAuth = () => useContext(AuthContext);
