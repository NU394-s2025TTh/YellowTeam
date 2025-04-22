import './Wardrobe.css'; // make sure this import is here

import React from 'react';
import { useNavigate } from 'react-router-dom';

import Wardrobe from './Wardrobe';

const WardrobePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <Wardrobe />
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => navigate('/search')} className="generate-button">
          Back to Search
        </button>
      </div>
    </div>
  );
};

export default WardrobePage;
