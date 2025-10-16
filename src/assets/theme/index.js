/*!

=========================================================
* Vision UI Free React - v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/vision-ui-free-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com/)
* Licensed under MIT (https://github.com/creativetimofficial/vision-ui-free-react/blob/master LICENSE.md)

* Design and Coded by Simmmple & Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

// @mui material components
import { createTheme } from "@mui/material/styles";

// Vision UI Dashboard React base styles
import colors from "./base/colors";
import breakpoints from "./base/breakpoints";
import typography from "./base/typography";
import boxShadows from "./base/boxShadows";
import borders from "./base/borders";

// Vision UI Dashboard React helper functions
import pxToRem from "./functions/pxToRem";
import linearGradient from "./functions/linearGradient";

export default createTheme({
  breakpoints: { ...breakpoints },
  palette: { ...colors },
  typography: { ...typography },
  boxShadows: { ...boxShadows },
  borders: { ...borders },
  functions: {
    pxToRem,
    linearGradient,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0f0f23",
          color: "#ffffff",
        },
      },
    },
    // Minimal component overrides to avoid theme dependency issues
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(31, 41, 55, 0.9)",
          backdropFilter: "blur(10px)",
        },
      },
    },
  },
});
