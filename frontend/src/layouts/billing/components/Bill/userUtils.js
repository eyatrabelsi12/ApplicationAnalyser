// Importez jwt
const jwt = require('jsonwebtoken');

// Implémentez la fonction getUserRole pour extraire le rôle à partir du jeton
const getUserRole = (token) => {
  // Vérifiez si le jeton est valide
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role;
  } catch (err) {
    console.error(err);
    return null; // Retourne null si le jeton est invalide ou s'il n'y a pas de rôle dans le jeton
  }
};
