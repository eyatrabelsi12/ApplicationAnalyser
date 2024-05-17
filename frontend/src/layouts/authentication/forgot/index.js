import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/neoxam.jpg";
 
// Fonction pour générer un mot de passe aléatoire
function generateRandomPassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}
 
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
 
  const handleSubmit = async (e) => {
    e.preventDefault();
   
   
 
    const url = 'http://localhost:3003/forgot-password';
    const data = { email: email };
 
    try {
      const response = await axios.post(url, data, {
        headers: {
            'Content-Type': 'application/json',
        }
      });
 
      console.log(response.data);
      alertWithBackground('Reset instructions sent to your email address.'); // Assuming setSuccessMessage is replaced with alert for simplification
 
    } catch (error) {
      if (error.response) {
        console.error('Erreur de réponse du serveur:', error.response.data);
        alertWithBackground(`Error: ${error.response.data.error}`); // Assuming the server sends back an 'error' key in the data object
      } else if (error.request) {
        console.error('Aucune réponse du serveur reçue.');
        alertWithBackground('Error: The server did not respond. Please try again later.');
      } else {
        console.error('Erreur lors de la configuration de la requête:', error.message);
        alertWithBackground('Error: An error occurred while setting up the request. Please check your connection and try again.');
      }
    }
};
const alertWithBackground = (message, backgroundColor) => {
  const alertContainer = document.createElement("div");
  alertContainer.classList.add("custom-alert");
  alertContainer.textContent = message;
  alertContainer.style.backgroundColor = 'white'; // Définir la couleur de fond
  alertContainer.style.padding = '10px'; // Ajouter un padding pour une meilleure apparence
  alertContainer.style.color = 'black'; // Définir la couleur du texte pour contraster avec le fond
  alertContainer.style.borderRadius = '5px'; // Ajouter un peu de bordure arrondie
  alertContainer.style.marginTop = '-20%';
  alertContainer.style.fontFamily = 'italic';
  alertContainer.style.width = '25%';
  const okButton = document.createElement("button");
  okButton.textContent = "OK";
  okButton.style.width = '20%';
  okButton.style.backgroundColor = 'black';
  okButton.style.color = 'white';
  okButton.style.fontFamily = 'italic';
  okButton.style.borderColor = '#1de9b6';
  okButton.style.marginLeft = '75%';
  okButton.addEventListener("click", () => {
      document.body.removeChild(alertContainer);
  });
 
  alertContainer.appendChild(okButton);
  document.body.appendChild(alertContainer);
};
 
 
  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="success"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Forgot Password
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email to receive a password reset link
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
               
              />
            </MDBox>
   
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="success" fullWidth type="submit">
                Reset Password
              </MDButton>
            </MDBox>
            {successMessage && (
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="body1" color="success">
                  {successMessage}
                </MDTypography>
              </MDBox>
            )}
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Remember your password?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="success"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}
 
export default ForgotPassword;