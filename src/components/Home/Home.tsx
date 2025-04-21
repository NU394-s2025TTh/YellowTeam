import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Welcome to PowderPrep</h1>
      <p>
        Your personalized ski trip assistant. Get live forecasts, plan your gear, and hit the slopes
        stress-free.
      </p>
      <button onClick={() => navigate('/search')} className="search-button">
        Start Planning
      </button>
    </div>
  );
};

export default Home;
