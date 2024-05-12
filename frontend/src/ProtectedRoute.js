import React from "react";
import { Route, Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, element: Element, ...rest }) => {
  return (
    <Route
      {...rest}
      element={isAuthenticated ? <Element /> : <Navigate to="/authentication/sign-in" />}
    />
  );
};

export default ProtectedRoute;
