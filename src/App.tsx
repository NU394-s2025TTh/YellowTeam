/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css';

import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import Home from './components/Home/Home';
import SearchBar from './components/SearchBar/SearchBar';
import SearchPage from './components/SearchPage/SearchPage';
import Wardrobe from './components/Wardrobe/Wardrobe';
import WardrobePage from './components/Wardrobe/WardrobePage';
import parkcity from './parkcity.jpg';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${parkcity})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div className="top-nav-wrapper">
        <div className="tab-nav">
          <button
            className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </button>
          <button
            className={`nav-button ${location.pathname === '/search' ? 'active' : ''}`}
            onClick={() => navigate('/search')}
          >
            Search
          </button>
          <button
            className={`nav-button ${location.pathname === '/wardrobe' ? 'active' : ''}`}
            onClick={() => navigate('/wardrobe')}
          >
            Wardrobe
          </button>
        </div>
      </div>

      <header className="App-header">
        <p className="header">PowderPrep</p>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
        </Routes>
      </header>
    </div>
  );
}
