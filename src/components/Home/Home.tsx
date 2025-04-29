import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fetchViewedLocations } from '../../firebase/utils';

import { getCurrentUser } from '../../firebase/user';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [viewedLocations, setViewedLocations] = useState<string[]>([]);
  useEffect(() => {
    const loadViewedLocations = async () => {
      const user = getCurrentUser();
      if (!user) {
        console.warn('No user is signed in.');
        return;
      }
      try {
        const locations = await fetchViewedLocations(user.uid);
        locations.reverse();
        const topFourLocations = locations.slice(0, 4);
        setViewedLocations(topFourLocations);
      } catch (error) {
        console.error('Failed to load viewed locations:', error);
      }
    };

    loadViewedLocations();
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Welcome to PowderPrep</h1>
      <p>
        Your personalized ski trip assistant. Get live forecasts, plan your gear, and hit
        the slopes stress-free.
      </p>
      <h2>Recently Viewed Resorts:</h2>
      {viewedLocations.length === 0 ? (
        <p>You haven&apos;t viewed any resorts yet. Start searching!</p>
      ) : (
        <div>
          {viewedLocations.map((location, index) => (
            <div key={index}>{location}</div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/search')}
        className="search-button"
        style={{ marginTop: '3rem' }}
      >
        Start Planning
      </button>
    </div>
  );
};

export default Home;
