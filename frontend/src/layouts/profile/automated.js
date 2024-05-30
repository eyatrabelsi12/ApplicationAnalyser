import React, { useState, useEffect } from "react";

import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import Header from "layouts/profile/components/Header";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DescriptionIcon from "@mui/icons-material/Description";
import { FaBug, FaUsers } from 'react-icons/fa';
import InputAdornment from "@mui/material/InputAdornment";
import WarningIcon from '@mui/icons-material/Warning';

import Box from '@mui/material/Box';







function Automated() {
  const [scenario, setScenario] = useState("");
  const [testCases, setTestCases] = useState("");
  const [bugsOnJira, setBugsOnJira] = useState("");
  const [selectedSprint, setSelectedSprint] = useState("");
  const [suite, setsuite] = useState("");
  const [fauxBugsNumber, setFauxBugsNumber] = useState("");
  const [token, setToken] = useState("");
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      window.location.href = '/authentication/sign-in';
    } else {
      setToken(storedToken);
    }
  }, []);

  const handleScenarioChange = (event) => {
    setScenario(event.target.value);
  };

  const handleTestCasesChange = (event) => {
    setTestCases(event.target.value);
  };

  const handleBugsOnJiraChange = (event) => {
    setBugsOnJira(event.target.value);
  };

  const handleSprintChange = (event) => {
    setSelectedSprint(event.target.value);
  };

  const handlesuiteChange = (event) => {
    setsuite(event.target.value);
  };

 
  const handleFauxBugsNumberChange = (event) => {
    const value = event.target.value;
    if (value === '' || (parseInt(value) <= 10 && parseInt(value) >= 0)) {
      setFauxBugsNumber(value);
    }
  };
  
  const handleSubmitForm = async (event) => {
    event.preventDefault();

  
  
    // Vérifier si tous les champs sont remplis
    if (scenario && testCases && bugsOnJira && selectedSprint && suite && fauxBugsNumber) {
      try {
        const response = await fetch("http://localhost:3008/automated", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            scenario,
            testCases,
            bugsOnJira,
            selectedSprint,
            suite,
            fauxBugsNumber,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to submit data: ${response.status}`);
        }
  
        const data = await response.json();
        if (data.success) {
          const alertDiv = document.createElement('div');
          alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
          alertDiv.innerHTML = `
          Data submitted successfully
            <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
          `;
          document.body.appendChild(alertDiv);
         
  
          // Réinitialiser les champs du formulaire après la soumission réussie
          setScenario("");
          setTestCases("");
          setBugsOnJira("");
          setSelectedSprint("");
          setsuite("");
          setFauxBugsNumber("");
        } else {
          alert("Failed to submit data");
        }
      } catch (error) {
        console.error("Error submitting data:", error.message);
        const alertDiv = document.createElement('div');
        alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
        alertDiv.innerHTML = `
          Une erreur s'est produite lors de la soumission des données
          <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
        `;
        document.body.appendChild(alertDiv);
      }
    } else {
      const alertDiv = document.createElement('div');
      alertDiv.setAttribute('style', 'position: fixed; top: 11%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); border-radius: 5px; z-index: 9999; font-family: italic;');
      alertDiv.innerHTML = `
      Please fill in all fields
        <button style="width: 20%; background-color: black; color: white; font-family: italic; border-color: #1de9b6; margin-left: 75%;" onclick="this.parentNode.remove()">OK</button>
      `;
      document.body.appendChild(alertDiv);
     
    }
  };
  
  

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={-1} />
      <Header>
        <MDBox mt={3} mb={3}>
          <Grid container spacing={1}>
            <Grid
              item
              xs={12}
              md={1}
              mt={-7}
              xl={7}
              className="custom-grid" // Ajoutez la classe CSS personnalisée ici
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 1,
                height: "49vh",
              // Ajoutez cette ligne pour ajuster la hauteur de la carte
              }}
             
            >
              <form onSubmit={handleSubmitForm}>


              <FormControl fullWidth>
                  <InputLabel id="sprint-label">
                    <FaUsers  /> Select Sprint
                  </InputLabel>
                  <Select
                    labelId="sprint-label"
                    id="sprint"
                    value={selectedSprint}
                    onChange={handleSprintChange}
                   
                    sx={{
                      "&:focused": {
                        borderColor: "black",
                     
                      },
                    }}
                  >
                    {Array.from({ length: 100 }, (_, i) => (
                      <MenuItem key={i + 1} value={`Sprint ${i + 1}`}>
                        Sprint {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box mt={2} /> 
                <FormControl fullWidth>
                  <TextField
                    id="scenario"
                    label="Automated Scenario"
                    type="number"
                    value={scenario}
                    onChange={handleScenarioChange}
                    InputProps={{
                      startAdornment: (
                        <ListAltIcon style={{ color: "gray" }} />
                      ),
                      sx: {
                        "&:focused": {
                          borderColor: "black",
                        },
                      },
                    }}
                  />
                </FormControl>
                <MDBox mt={2} />
                <FormControl fullWidth>
                  <TextField
                    id="test-cases"
                    label="Automated Test Cases"
                    type="number"
                    value={testCases}
                    onChange={handleTestCasesChange}
                    InputProps={{
                        startAdornment: (
                          <DescriptionIcon style={{ color: "gray" }} />
                        ),
                        sx: {
                            "&:focused": {
                              borderColor: "black",
                            },
                          },
                        }}
                  />
                </FormControl>
                <MDBox mt={2} />
                <FormControl fullWidth>
                  <TextField
                    id="bugs-on-jira"
                    label="Raised_Bugs"
                    type="number"
                    value={bugsOnJira}
                    onChange={handleBugsOnJiraChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaBug />
                        </InputAdornment>
                      ),
                    }}
                  />
                </FormControl>
                <MDBox mt={2} />
              
                <MDBox mt={2} />
              <FormControl fullWidth>
              <InputLabel id="sprint-label">
                    <DescriptionIcon  /> Suite
                  </InputLabel>
  <Select
  
    labelId="suite"
    id="suite"
    value={suite}
    onChange={handlesuiteChange}
    sx={{
      "&:focused": {
        borderColor: "black",
      },
    }}
      
  >
    <MenuItem value="WEB-UI">WEB-UI</MenuItem>
    <MenuItem value="Data-Management">Data-Management</MenuItem>
    <MenuItem value="Rest">Rest</MenuItem>
    <MenuItem value="Navigation">Navigation</MenuItem>
  </Select>
</FormControl>

                <MDBox mt={2} />
                <FormControl fullWidth>
      <TextField
        id="faux-bugs-number"
        label="false_positive"
        type="number"
        value={fauxBugsNumber}
        onChange={handleFauxBugsNumberChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <WarningIcon />
            </InputAdornment>
          ),
        }}
      />
    </FormControl>
                <MDBox mt={2} />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ color: "rgb(7, 198, 163)", backgroundColor: "black" }}
                >
                  Submit
                </Button>
              </form>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
    </DashboardLayout>
  );
}

export default Automated;
