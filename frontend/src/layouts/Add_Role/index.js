import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
 
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import Header from "layouts/profile/components/Header1";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { getUserRole } from "../utils/authUtils";




const [token, setToken] = useState("");
function Add_Role() {
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [message, setMessage] = useState("");
  const userRole = getUserRole();
  const navigate = useNavigate();
  useEffect(() => {
    // Check user role and redirect if not admin
    if (userRole !== "admin") {
      navigate("/dashboard"); // Redirect to dashboard if not admin
    }
  }, [userRole, navigate]);
  const handleChangeRole = async () => {
    // Utilisez le token ici pour l'envoyer dans la requête fetch
    try {
      const response = await fetch("http://localhost:3003/change-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, newRole }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`Role changed successfully: ${data.role}`);
        console.log("Playing success sound");
  
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message}`);
        console.log("Playing error sound");

      }
      
    } catch (err) {
      console.error(err);
      setMessage("Error changing role");
    }
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={1} />
      <Header>
        <MDBox mt={-5} mb={-2} style={{ color: "rgb(242, 242, 242)" }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "white" }} style={{ height: "90%" }}>
                <CardContent>
                  <FormControl fullWidth>
                    <TextField
                      id="email"
                      label="User Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ marginTop: "20px" }}
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      id="newRole"
                      label="New Role"
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      required
                      style={{ marginTop: "30px" }}
                    />
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    style={{
                      color: "rgb(7, 198, 163)",
                      backgroundColor: "black",
                      marginTop: "40px",
                      marginBottom: "20px",
                    }}
                    onClick={handleChangeRole}
                  >
                    Change Role
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
    </DashboardLayout>
  );
}
 
export default Add_Role;