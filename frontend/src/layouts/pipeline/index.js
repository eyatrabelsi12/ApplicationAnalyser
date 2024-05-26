import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
import successSound from './success3.mp3';
import errorSound from './error4.wav';


// Créez des instances de Audio
const successAudio = new Audio(successSound);
const errorAudio = new Audio(errorSound);

function Pipeline() {
  const [suiteName, setSuiteName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [otherInputValue, setOtherInputValue] = useState("");
  const [suiteNameToDelete, setSuiteNameToDelete] = useState(""); 
  const userRole = getUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    // Check user role and redirect if not admin
    if (userRole !== "admin") {
      navigate("/dashboard"); // Redirect to dashboard if not admin
    }
  }, [userRole, navigate]);

  const handleSuiteNameChange = (event) => {
    setSuiteName(event.target.value);
    // Mise à jour de suiteNameToDelete avec la nouvelle valeur de suiteName
    setSuiteNameToDelete(event.target.value); 
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleOtherInputChange = (event) => {
    const suiteNameValue = event.target.value;
    setOtherInputValue(suiteNameValue);
    setSuiteNameToDelete(suiteNameValue); 
  };

const handleSubmit = (event) => {
  event.preventDefault();
  
  // Check if both fields are filled
  if (!suiteName || !selectedDate) {
    const alertDiv = document.createElement('div');
    alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
    alertDiv.innerHTML = `
      Please fill in both fields.
      <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
    `;
    document.body.appendChild(alertDiv);
    errorAudio.play();
    return;
  }
  
  fetch("http://localhost:3008/submit-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ suiteName, selectedDate, otherInputValue }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.success) {
        const alertDiv = document.createElement('div');
        alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
        alertDiv.innerHTML = `
          Data saved successfully!
          <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
        `;
        document.body.appendChild(alertDiv);
        successAudio.play();

        // Reset form fields after successful submission
        setSuiteName("");
        setSelectedDate("");
        setOtherInputValue("");
        setSuiteNameToDelete("");
      } else {
        const alertDiv = document.createElement('div');
        alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
        alertDiv.innerHTML = `
          An error occurred while saving data.
          <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
        `;
        document.body.appendChild(alertDiv);
      }
    })
    .catch((error) => {
      console.error("Error submitting form data", error);
      const alertDiv = document.createElement('div');
      alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
      alertDiv.innerHTML = `
        An error occurred while submitting form data.
        <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
      `;
      document.body.appendChild(alertDiv);
    });
};

const handleDelete = async () => {
  // Check if the Name_of_Suite field is filled
  if (!suiteNameToDelete) {
    const alertDiv = document.createElement('div');
    alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
    alertDiv.innerHTML = `
      Please fill in the Name_of_Suite field.
      <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
    `;
    document.body.appendChild(alertDiv);
    errorAudio.play();
    return;
  }

  try {
    const response = await fetch(`http://localhost:3008/suite-options/${suiteNameToDelete}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (response.ok) {
      const alertDiv = document.createElement('div');
      alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
      alertDiv.innerHTML = `
        ${data.message}
        <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
      `;
      document.body.appendChild(alertDiv);
      successAudio.play();
    
    } else {
      const alertDiv = document.createElement('div');
      alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
      alertDiv.innerHTML = `
        An error occurred while deleting data: ${data.message}
        <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
      `;
      document.body.appendChild(alertDiv);
    }
  } catch (error) {
    console.error("Error deleting data", error);
    const alertDiv = document.createElement('div');
    alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
    alertDiv.innerHTML = `
      An error occurred while deleting data: ${error.message}
      <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
    `;
    document.body.appendChild(alertDiv);
  }
};



  

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={1} />
      <Header>
        <MDBox mt={-5} mb={-2} style={{ color: "rgb(242, 242, 242)" }}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: "white" }} style={{ height: "90%" }}>
                <CardContent>
                  <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <TextField
                      id="nom"
                      label="Name_of_Suite"
                      type="text"
                      value={suiteName}
                      onChange={handleSuiteNameChange}
                      style={{
                        marginTop: "20px",
                      }}
                      InputProps={{
                        startAdornment: <ListAltIcon style={{ color: "black" }} />,
                        sx: {
                          "&:focused": {
                            borderColor: "black",
                          },
                        },
                      }}
                    />
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      id="date"
                      label="Select Date"
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      style={{
                        marginTop: "20px",
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
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
                    onClick={handleSubmit}
                  >
                    Add Suite
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDelete}
                    style={{
                      color: "rgb(7, 198, 163)",
                      backgroundColor: "black",
                      marginLeft: "20px",
                      marginBottom: "-20px",
                    }}
                  >
                    Delete Suite
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

export default Pipeline;
