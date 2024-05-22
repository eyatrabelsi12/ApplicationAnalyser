import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { FaCheckSquare, FaRegSquare } from 'react-icons/fa';
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/neoxam.jpg";
 
const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
 
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
 
    if (!email || !password || !confirmPassword) {
      setRegistrationError(
        <div style={{ position: 'fixed', top: '11%', left: '53%', transform: 'translate(-50%, -50%)', padding: '20px', backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)', borderRadius: '5px', zIndex: '9999', fontFamily: 'italic', width: '25%' }}>
          Please fill in all fields.
          <button onClick={() => setRegistrationError(null)} style={{ width: '20%', backgroundColor: 'black', color: 'white', fontFamily: 'italic', borderColor: '#1de9b6', marginLeft: '75%' }}>OK</button>
        </div>
      );
      return;
    }
 
    if (password !== confirmPassword) {
      setRegistrationError(
        <div style={{ position: 'fixed', top: '11%', left: '52.1%', transform: 'translate(-50%, -50%)', padding: '20px', backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)', borderRadius: '5px', zIndex: '9999', fontFamily: 'italic', width: '25%' }}>
          Passwords do not match.
          <button onClick={() => setRegistrationError(null)} style={{ width: '20%', backgroundColor: 'black', color: 'white', fontFamily: 'italic', borderColor: '#1de9b6', marginLeft: '75%' }}>OK</button>
        </div>
      );
      return;
    }
 
    if (password.length < 16) {
      setRegistrationError(
        <div style={{ position: 'fixed', top: '11%', left: '52.1%', transform: 'translate(-50%, -50%)', padding: '20px', backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)', borderRadius: '5px', zIndex: '9999', fontFamily: 'italic', width: '25%' }}>
          Password must be at least 16 characters long.
          <button onClick={() => setRegistrationError(null)} style={{ width: '20%', backgroundColor: 'black', color: 'white', fontFamily: 'italic', borderColor: '#1de9b6', marginLeft: '75%' }}>OK</button>
        </div>
      );
      return;
    }
 
    const conditions = checkPasswordConditions(password);
    if (!conditions.every(condition => condition.condition)) {
        const unmetConditions = conditions.filter(condition => !condition.condition);
        const unmetMessages = unmetConditions.map(condition => `- ${condition.message}`).join("\n");
        alertWithBackground(`Password must meet the requirements. Your password must contain:\n${unmetMessages}`);
        return;
    }
 
    if (!email.includes('@gmail.com')) {
      alertWithBackground('Email must contain "@gmail.com".');
      return;
    }
    const fullName = username.split('@')[0];
    const usernameValid = fullName.includes('.');
    if (!usernameValid) {
      alertWithBackground('Username must be between the first name and last name separated by a dot (.)');
      return;
    }
 
    const url = 'http://localhost:3003/register';
    const data = { username, email, password };
 
    try {
      const response = await axios.post(url, data);
      console.log(response.data);
      setRegistrationSuccess(true);
 
      setTimeout(() => {
        navigate('/authentication/sign-in');
      }, 3000);  // Délai de 3 secondes avant la navigation vers la page de connexion
    } catch (error) {
      console.error('Error during registration:', error);
      if (error.response && error.response.data && error.response.data.message === 'This email is already registered.') {
        alertWithBackground('This email is already registered.');
      } else {
        alertWithBackground('Unable to register. Please try again.');
      }
    }
  };
 
  const passwordConditions = checkPasswordConditions(password);
 
  const alertWithBackground = (message) => {
    const alertContainer = document.createElement("div");
    alertContainer.classList.add("custom-alert");
    alertContainer.textContent = message;
    alertContainer.style.backgroundColor = 'white';
    alertContainer.style.padding = '10px';
    alertContainer.style.color = 'black';
    alertContainer.style.borderRadius = '5px';
    alertContainer.style.marginTop = '-20%';
    alertContainer.style.fontFamily = 'italic';
    alertContainer.style.width = '25%';
    alertContainer.style.marginLeft = '3%';
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
      <Card style={{ marginTop: '-140px', marginRight: '-18%' }}>
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
        <MDBox pt={1} pb={0} px={3}>
          <MDBox component="form" role="form" onSubmit={handleRegister}>
            <MDBox mb={1}>
              <MDInput
                type="Username"
                label="Username"
                fullWidth
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </MDBox>
            <MDBox mb={1} style={{ position: 'relative' }}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={1}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            <MDBox mb={1}>
              <MDInput
                type="password"
                label="Confirm Password"
                fullWidth
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </MDBox>
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
      {registrationSuccess && (
        <div style={{ position: 'fixed', top: '11%', left: '52.1%', transform: 'translate(-50%, -50%)', padding: '20px', backgroundColor: 'rgb(255, 255, 255)', color: 'rgb(0, 0, 0)', borderRadius: '5px', zIndex: '9999', fontFamily: 'italic' }}>
          Success! Registered successfully.
          <button onClick={() => navigate('/authentication/sign-in')} style={{ width: '20%', backgroundColor: 'black', color: "white", fontFamily: 'italic', borderColor: '#1de9b6', marginLeft: '75%' }}>OK</button>
        </div>
      )}
      {registrationError && registrationError}
    </CoverLayout>
  );
};
 
export default Register;