// App.jsx

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login.jsx';
import Home from './Home.jsx';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route exact path='/' element={<PrivateRoute/>}>
            <Route exact path='/home' element={<Home/>}/>
          </Route>
         
          <Route exact path='/login' element={<Login/>}/>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
