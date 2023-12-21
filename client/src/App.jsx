import React from "react";
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './Signup.jsx'; // Ensure correct file path
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx'
import Home from "./Home.jsx";
import Expenses from "./Expenses.jsx";
// import edit_button from "./buttons/edit_button.jsx";
import Edit_button from "./buttons/Edit_button.jsx";
import add_button from "./buttons/add_button.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/Edit_button" element={<Edit_button />} />
        <Route path="/add_button" element={<add_button />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
