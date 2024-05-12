import { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import reportsLineChartData from "./data/reportsLineChartData";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setDirection } from "context";

function RTL() {
  const [, dispatch] = useMaterialUIController();
  const { sales, tasks } = reportsLineChartData;

  // Changing the direction to rtl
  useEffect(() => {
    setDirection(dispatch, "rtl");

    return () => setDirection(dispatch, "ltr");
  }, []);

  // State for the pipeline input
  const [pipeline, setPipeline] = useState("");

  // Function to handle adding a pipeline
  const handleAddPipeline = () => {
    // Add logic here to handle adding the pipeline
    console.log("Pipeline added:", pipeline);
    // Clear the input field after adding the pipeline
    setPipeline("");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Only keeping the card with input and button */}
          <Grid item xs={12} md={12} lg={12}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Ajouter un pipeline"
                      variant="outlined"
                      value={pipeline}
                      onChange={(e) => setPipeline(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddPipeline}
                    >
                      Ajouter
                    </Button>
                  </Grid>
                </Grid>
              </ComplexStatisticsCard>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RTL;
