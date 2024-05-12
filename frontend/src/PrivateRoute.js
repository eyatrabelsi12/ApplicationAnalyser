import React from "react";
import { Route, Navigate } from "react-router-dom";

// Fonction de vérification d'authentification (simulée)
const isAuthenticated = true; // À remplacer par votre logique d'authentification réelle

const PrivateRoute = ({ component: Component, isPrivate, ...rest }) => {
  return isPrivate && !isAuthenticated ? (
    <Navigate to="/authentication/sign-in" />
  ) : (
    <Route {...rest} element={<Component />} />
  );
};

export default PrivateRoute;
