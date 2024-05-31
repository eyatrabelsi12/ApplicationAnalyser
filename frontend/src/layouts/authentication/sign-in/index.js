import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/neoxam.jpg";
import './style.css';
import { useAuth } from 'context/authContext';
import { useLocation } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isAccountLocked, setIsAccountLocked] = useState(false);
    const [lockMessage, setLockMessage] = useState("");
    const [lockTime, setLockTime] = useState(0);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const { login } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (lockTime > 0) {
            const timer = setInterval(() => {
                setLockTime(prevTime => prevTime - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setIsAccountLocked(false);
            setLockMessage("");
        }
    }, [lockTime]);
 
    useEffect(() => {
        if (isAccountLocked && lockTime > 0) {
            showAlert(lockMessage.replace(/\d+ seconds/, `${lockTime} seconds`));
        }
    }, [lockTime]);
 
    useEffect(() => {
        if (loginSuccess) {
            navigate("/dashboard");
        }
    }, [loginSuccess, navigate]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('verified') === 'true') {
            showAlert('Your email has been verified. Please log in.');
            navigate('/login'); // Rediriger vers la page de connexion après la vérification
        }
    }, [location, navigate]);
    

 
    const handleLogin = async (e) => {
        e.preventDefault();
      
        if (isAccountLocked) {
          showAlert(lockMessage.replace(/\d+ seconds/, `${lockTime} seconds`));
          return;
        }
      
        const url = "http://localhost:3003/login";
        const data = { email, password };
      
        try {
          const response = await axios.post(url, data);
          console.log(response.data);
      
          if (!response.data.is_verified) {
            showAlert("Your email is not verified. Please check your email to verify your account.");
            return;
          }
          
          setLoginSuccess(true);
          const { token, role } = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("role", role);
          login();
          navigate('/dashboard');
        } catch (error) {
          if (error.response) {
            console.error("Erreur de réponse du serveur:", error.response.data);
            const errorMessage = `Error: ${error.response.data.message}`;
            setLockMessage(errorMessage);
      
            if (error.response.data.message.includes('locked')) {
              const match = error.response.data.message.match(/(\d+) seconds/);
              if (match) {
                const lockDuration = parseInt(match[1], 10);
                setLockTime(lockDuration);
                setIsAccountLocked(true);
              }
            }
      
            showAlert(errorMessage.replace(/\d+ seconds/, `${lockTime} seconds`));
          } else if (error.request) {
            console.error("Aucune réponse du serveur reçue.");
            const errorMessage = "Error: The server did not respond. Please try again later.";
            showAlert(errorMessage);
          } else {
            console.error("Erreur lors de la configuration de la requête:", error.message);
            const errorMessage = "Error: An error occurred while setting up the request. Please check your connection and try again.";
            showAlert(errorMessage);
          }
        }
      };
    
    const showAlert = (message) => {
        const existingAlert = document.querySelector(".custom-alert");
        if (existingAlert) {
            existingAlert.remove();
        }
 
        const alertContainer = document.createElement("div");
        alertContainer.classList.add("custom-alert");
        alertContainer.textContent = message;
   
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
        alertContainer.style.backgroundColor = 'white';
        alertContainer.style.color = 'black';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '10%';
        alertContainer.style.left = '50%';
        alertContainer.style.transform = 'translate(-50%, -50%)';
        alertContainer.style.padding = '20px';
        alertContainer.style.borderRadius = '5px';
        alertContainer.style.zIndex = '9999';
        alertContainer.style.fontFamily = 'italic';
       
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
                    mt={-5}
                    p={3}
                    mb={1}
                    textAlign="center"
                >
                    <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
                        DataHub Analyzer And KPI
                    </MDTypography>
                </MDBox>
                <MDBox pt={4} pb={3} px={3}>
                    <MDBox component="form" role="form" onSubmit={handleLogin}>
                        <MDBox mb={2}>
                            <MDInput
                                type="email"
                                label="Email"
                                fullWidth
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isAccountLocked}
                                style={{ borderColor: isAccountLocked ? 'grey' : 'black' }}
                            />
                        </MDBox>
                        <MDBox mb={2}>
                            <MDInput
                                type="password"
                                label="Password"
                                fullWidth
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isAccountLocked}
                                style={{ borderColor: isAccountLocked ? 'grey' : 'black' }}
                            />
                        </MDBox>
                        <MDBox mt={4} mb={1}>
                            <MDButton variant="gradient" color="success" fullWidth type="submit">
                                Sign in
                            </MDButton>
                        </MDBox>
                        <MDBox mt={3} mb={1} textAlign="center">
                            <MDTypography variant="button" color="text">
                                Don't have an account?{" "}
                                <MDTypography
                                    component={Link}
                                    to="/authentication/sign-up"
                                    variant="button"
                                    color="success"
                                    fontWeight="medium"
                                    textGradient
                                >
                                    Sign up
                                </MDTypography><br />
                                <MDTypography
                                    component={Link}
                                    to="/authentication/forgot"
                                    variant="button"
                                    color="success"
                                    fontWeight="medium"
                                    textGradient
                                >
                                    Forgot Your Password
                                </MDTypography><br />
                            </MDTypography>
                        </MDBox>
                    </MDBox>
                </MDBox>
            </Card>
        </CoverLayout>
    );
};
 
export default Login;

