import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from 'src/providers/UserProvider';

import { fetchViewedLocations } from '../../firebase/utils';

const Home: React.FC = () => {
  const { user } = useUserContext();
  const uid = user?.uid;

  const navigate = useNavigate();
  const [viewedLocations, setViewedLocations] = useState<string[]>([]);
  useEffect(() => {
    if (!uid) return;

    (async () => {
      try {
        const locs = await fetchViewedLocations(uid);
        locs.reverse();
        setViewedLocations(locs.slice(0, 4));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [uid]);

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
      <button onClick={() => navigate('/search')} className="search-button">
        Start Planning
      </button>
    </div>
  );
};

export default Home;
