import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./auth"; // Importez votre fonction d'authentification depuis un fichier approprié
import ProtectedRoute from "./ProtectedRoute"; // Importez votre composant ProtectedRoute

const AppRoutes = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.key}
          path={route.route}
          element={<ProtectedRoute component={route.component} {...route} />} // Utilisez ProtectedRoute pour envelopper les routes
        />
      ))}
    </Routes>
  );
};

export default AppRoutes;
