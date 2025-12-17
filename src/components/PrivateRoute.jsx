import React from "react";
// Import Outlet alongside Navigate
import { Navigate, Outlet } from "react-router-dom"; 

export default function PrivateRoute() {
  // Check the authentication status (Token existence is a good basic check)
  const token = localStorage.getItem("token"); 

  // If authenticated, render the Outlet. 
  // Outlet is where the nested routes (like EtfEpfProcess) will be rendered.
  // If not authenticated, redirect to the login page.
  return token ? <Outlet /> : <Navigate to="/" replace />;
}

// Note: We remove the { children } prop from the function signature 
// because it is not needed for this RRDv6 pattern.