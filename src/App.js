import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import logoImage from './munchrlogo.png';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        {/* Global Header */}
        <div className="hero-section">
          <div className="container">
            <div className="hero-logo">
              <img
                src={logoImage}
                alt="Munchr Logo"
                className="hero-logo-image clickable-logo"
                onClick={() => window.location.href = '/'}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <p className="hero-description">
              Your Guide to Vending Machines on Campus
            </p>
          </div>
        </div>

        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;