
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import Cookies from 'js-cookie';

import {
  MDBContainer,
  MDBRow,
  MDBCol,
} from 'mdb-react-ui-kit';

import './Home.css';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post('https://x-gen-backend.vercel.app/login', { email, password });
      const { status, token } = response.data;

      if (status === "Success") {
        // Store the token in cookies
        Cookies.set('token', token, { expires: 7 }); // Set the cookie to expire in 7 days

        navigate('/home');
      } else {
        alert("Wrong username or password");
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert("An error occurred during login");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  return (

    <MDBContainer fluid className='p-4 background-radial-gradient overflow-hidden vh-100'>

    <MDBRow>

      <MDBCol md='6' className='text-center text-md-start d-flex flex-column justify-content-center'>
      <img href="src/assets/xgen.png" alt="Login Image" style={{ width: '20%', position: "relative", bottom: 30, left: 240 }} />

        <h1 className="my-3 display-3 fw-bold ls-tight px-3" style={{ color: 'hsl(218, 81%, 95%)' }}>
          Elevating Excellence in<br />
          <span style={{ color: 'hsl(218, 81%, 75%)' }}>Expense Management</span>
        </h1>

        <p className='px-3' style={{ color: 'hsl(218, 81%, 85%)' }}>
        XGEN Company excels in streamlined expense management, employing cutting-edge tools and 
        processes to optimizefinancial efficiency. Our robust system ensures meticulous tracking,
        timely approvals, and comprehensive reporting, empowering the organization to make informed 
        decisions and maintain fiscal discipline.
        </p>

      </MDBCol>

      <MDBCol md='6' className='position-relative '>

        <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
        <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>


    <div className="d-flex justify-content-center align-items-center bg-secondary vh-100" 
    style={{ background: 'linear-gradient(to right, #6522c3, #2dfd80)' }}>
      
      <div className=" p-4 rounded w-50 " style={{marginLeft: 50, backgroundColor: 'hsl(218, 81%, 75%)' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} >
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              autoComplete="off"
              name="email"
              className="form-control rounded-0"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password</strong>
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                name="password"
                className="form-control rounded-0"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button style={{marginLeft: '10px', backgroundColor: 'beige'}}
                type="button"
                className="btn"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-0" style={{ marginTop: '20px'}}>
            Login
          </button>
        </form>

        {/* <p>Don't have an account?</p>
        <Link to="/register" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none" >
          Sign Up
        </Link> */}
      </div>
    </div>
    </MDBCol>

      </MDBRow>

    </MDBContainer>
  );
}

export default Login;
