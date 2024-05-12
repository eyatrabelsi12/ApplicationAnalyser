// auth.js

// Fonction qui vérifie si l'utilisateur est authentifié
export const isAuthenticated = () => {
  // Vous pouvez mettre ici votre logique d'authentification
  // Par exemple, vérification de la présence d'un jeton d'authentification valide dans le stockage local
  const authToken = localStorage.getItem("authToken");
  return !!authToken; // Retourne true si un jeton est présent, sinon false
};
