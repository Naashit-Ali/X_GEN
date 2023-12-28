// PrivateRoute.jsx

import Cookies from 'js-cookie';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ element, ...props }) => {
  // Check if the user is authenticated, for example, based on the presence of a token

  const isAuthenticated = Cookies.get("token")?true:false;


  return isAuthenticated ? (
  <Outlet /> 
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;
