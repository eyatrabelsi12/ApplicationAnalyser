import React, { useState } from "react";
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

function Pipeline() {
  const [suiteName, setSuiteName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [otherInputValue, setOtherInputValue] = useState("");
  const [suiteNameToDelete, setSuiteNameToDelete] = useState(""); // Nouvel état

  const handleSuiteNameChange = (event) => {
    setSuiteName(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleOtherInputChange = (event) => {
    setOtherInputValue(event.target.value);
    setSuiteNameToDelete(event.target.value); // Mettre à jour la valeur à supprimer
  };

  const handleSubmit = (event) => {
    event.preventDefault();

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
          alert("Data saved successfully!");
        } else {
          alert("An error occurred while saving data.");
        }
      })
      .catch((error) => {
        console.error("Error submitting form data", error);
        alert("An error occurred while submitting form data.");
      });
  };

  const handleDelete = () => {
    fetch("http://localhost:3008/delete-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ suiteNameToDelete }), // Envoyer la valeur à supprimer
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          alert("Data deleted successfully!"); // Alerte pour la suppression réussie
        } else {
          alert("An error occurred while deleting data.");
        }
      })
      .catch((error) => {
        console.error("Error deleting data", error);
        alert("An error occurred while deleting data.");
      });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={1} />
      <Header>
        <MDBox mt={-5} mb={-2} style={{color:'rgb(242, 242, 242)'}}>
          <Grid container spacing={3} >
            <Grid item xs={12} md={6} >
              <Card sx={{ bgcolor: "rgb(249, 247, 247)" }} style={{height:'90%'}}>
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
       // Ajout de marge en bas
    }}
    InputProps={{
      startAdornment: (
        <ListAltIcon style={{ color: "black" }} />
      ),
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
    marginBottom: "20px", // Ajout de marge en bas
  }}
  onClick={handleSubmit}
>
  Add_Suite
</Button>

                </CardContent>
              </Card>
            </Grid>
           
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: "rgb(249, 247, 247)" }} style={{height:'90%'}}>
                <CardContent>
                  <FormControl fullWidth>
                    <TextField
                      id="otherInput"
                      label="Name_of_Suite"
                      type="text"
                      value={otherInputValue}
                      onChange={handleOtherInputChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      style={
                        {
                          marginTop: "17px",
                        }
                      }
                    />
                  </FormControl>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDelete}
                    style={{
                      color: "rgb(7, 198, 163)",
                      backgroundColor: "black",
                      marginRight: "10px",
                      marginBottom:'-70px'
                    }}
                  >
                    Delete_Suite
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
