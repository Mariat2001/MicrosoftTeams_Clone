import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from './Register/Register';
import Reminder from './components/Reminder';
import Navbar from './Navabar/Navbar';
import Home from './components/Home';

import React, { useState,useEffect } from "react";
import Settings from './components/Settings';
import Goals from './components/Goals';


function App() {
  
  const [user, setUser] = useState(null);
  return (
    <BrowserRouter>
    <div className="App">
 
      <Routes>
   
        {/* <Route path="/Navbar" element={<Navbar />} /> */}
        <Route path="/Reminder" element={<Reminder />} />
        <Route path="/Home" element={<Home/>} />
        <Route path="/Settings" element={<Settings/>} />
        <Route path="/Goals" element={<Goals/>} />
        <Route path="/" element={<Register   />} />
   
      </Routes>
    </div>
  </BrowserRouter>
  );
}

export default App;
