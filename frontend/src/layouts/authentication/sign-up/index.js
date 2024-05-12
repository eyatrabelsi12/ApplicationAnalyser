import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { FaCheckSquare, FaRegSquare } from 'react-icons/fa'; // Importation des icônes de case à cocher
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/neoxam.jpg";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fonction pour vérifier les conditions du mot de passe
  const checkPasswordConditions = (password) => {
    const conditions = [
      { condition: password.length >= 16, message: "At least 16 characters" },
      { condition: /[a-z]/.test(password), message: "Lower case letters (a-z)" },
      { condition: /[A-Z]/.test(password), message: "Upper case letters (A-Z)" },
      { condition: /\d/.test(password), message: "Numbers (0-9)" },
      { condition: /[!@#$%^&*]/.test(password), message: "Special characters (e.g. !@#$%^&*)" },
      { condition: !/(.)\1\1/.test(password), message: "No more than 2 identical characters in a row" },
    ];
    return conditions;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
  
    // Vérifier si les champs d'entrée sont vides
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    if (password.length < 16) {
      alert('Password must be at least 16 characters long.');
      return;
    }
  
    const conditions = checkPasswordConditions(password);
  
    if (!conditions.every(condition => condition.condition)) {
      const unmetConditions = conditions.filter(condition => !condition.condition);
      const unmetMessages = unmetConditions.map(condition => `- ${condition.message}`).join("\n");
      alert(`Password must meet the requirements. Your password must contain:\n${unmetMessages}`);
      return;
    }
  
    if (!email.includes('@gmail.com')) {
      alert('Email must contain "@gmail.com".');
      return;
    }
  
    const url = 'http://localhost:3003/register';
    const data = { email, password };
  
    try {
      const response = await axios.post(url, data);
      console.log(response.data);
      alert('Success! Registered successfully.');
      navigate('/authentication/sign-in'); // Modifier ici pour rediriger vers la page de connexion
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Error: Unable to register. Please try again.');
    }
  };
  

 

  const passwordConditions = checkPasswordConditions(password);

  return (
    <CoverLayout image={bgImage}>
      <Card style={{ marginTop: '-143px' ,marginRight:'-18%'}}  >
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
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={0.1} pb={0} px={3}>

          <MDBox component="form" role="form" onSubmit={handleRegister}>
          <MDBox mb={3} style={{ position: 'relative' }}>
  <MDInput
    type="email"
    label="Email"
    fullWidth
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <span style={{ position: 'absolute', bottom: '-20px', left: '0', color: 'black', fontSize: '12px' }}>
    Veuillez utiliser un e-mail Gmail.
  </span>
</MDBox>

        
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {/* Affichage des conditions de mot de passe */}
            <MDBox display="flex" flexDirection="column">
  {passwordConditions.map((condition, index) => (
    <MDBox key={index} mb={1} display="flex" alignItems="center">
      {condition.condition ? <FaCheckSquare color="green" /> : <FaRegSquare color="black" />}
      <span style={{ marginLeft: '5px', fontSize: '12px' }}>{condition.message}</span>
    </MDBox>
  ))}
</MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="success" fullWidth type="submit">
                Sign Up
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
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
};

export default Register;
