import Grid from "@mui/material/Grid";
import { Card } from "@mui/material";

import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <VuiBox p={3}>
                <VuiTypography variant="h4" color="white" fontWeight="bold" mb="3">
                  Welcome to OverDue Dashboard
                </VuiTypography>
                <VuiTypography variant="body1" color="text">
                  Your personal productivity dashboard foundation is ready. This is a clean starting point for building your custom dashboard features.
                </VuiTypography>
                <VuiBox mt={3}>
                  <VuiTypography variant="h6" color="white" mb="2">
                    Next Steps:
                  </VuiTypography>
                  <VuiTypography variant="body2" color="text" component="ul" sx={{ pl: 2 }}>
                    <li>Set up authentication with AWS Cognito</li>
                    <li>Design your data models and API structure</li>
                    <li>Add task management features</li>
                    <li>Implement grade tracking</li>
                    <li>Build note-taking capabilities</li>
                  </VuiTypography>
                </VuiBox>
              </VuiBox>
            </Card>
          </Grid>
        </Grid>
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
