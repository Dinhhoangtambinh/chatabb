import React, { useState, useEffect } from 'react'
import { Button, Space } from 'antd';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
// Animation
import Aos from 'aos';

export default function App() {
  useEffect(() => {
    Aos.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
    });
  }, []);

  return (
    <div className="w-full max-w-md min-h-screen mx-auto">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </div>
  );
}