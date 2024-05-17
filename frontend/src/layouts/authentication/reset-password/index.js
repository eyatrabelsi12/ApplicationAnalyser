import React, { useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/neoxam.jpg";
import { Link, useParams } from "react-router-dom";
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
 
    try {
      const response = await axios.post(`http://localhost:3003/reset-password/${token}`, { email, password: newPassword });
      setMessage(response.data.message);
      alertWithBackground('Password reset successfully.');
    } catch (error) {
      console.log('Error during query:', error.message);
      setMessage(error.response?.data?.error || 'An error occurred');
      alertWithBackground(`Erreur: ${error.message}`);
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
            Enter your email and new password
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="New Password"
                fullWidth
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirm Password"
                fullWidth
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="success" fullWidth type="submit">
                Reset Password
              </MDButton>
            </MDBox>
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