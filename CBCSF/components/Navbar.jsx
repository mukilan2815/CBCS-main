"use client"
import React from "react";
import Image from "next/image";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ffffff",
    },
  },
});

const Navbar = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Box display="flex" alignItems="center">
              <Image
                src="https://admission.kahedu.edu.in/assets/img/logo-ftr.png"
                width={150}
                height={40}
                alt="KAHE logo"
                style={{ marginRight: "16px" }}
              />
              <Box>
                <Typography variant="h6" component="div" color="textPrimary">
                  Faculty of Engineering
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Course Registration
                </Typography>
              </Box>
            </Box>
            <Image
              src="https://metaverse-portal.vercel.app/static/media/metaverselogo.aab67fbf864e9682cbe5.jpg"
              width={50}
              height={50}
              alt="Metaverse logo"
              style={{ borderRadius: "50%" }}
            />
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
