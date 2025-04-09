import './App.css';

import React, { useState } from 'react';

import parkcity from './parkcity.jpg';

function App() {
  type ResortData = {
    name: string;
    temperature: string;
    snowfall: string;
    precipitation: string;
    wind: string;
    openLifts: number;
    totalLifts: number;
    trailsOpen: number;
    totalTrails: number;
    checklist: string[];
  };

  const [location, setLocation] = useState('');
  const [resortData, setResortData] = useState<ResortData | null>(null);
  const [gearChecked, setGearChecked] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleSearch = () => {
    console.log(`Searching weather and slope data for: ${location}`);

    if (location.toLowerCase().includes('park city')) {
      const dummyData = {
        name: 'Park City Mountain Resort',
        temperature: '15°F',
        snowfall: '8 inches projected in next 24h',
        precipitation: '90% chance',
        wind: '12 mph',
        openLifts: 14,
        totalLifts: 16,
        trailsOpen: 85,
        totalTrails: 120,
        checklist: [
          'Warm waterproof jacket',
          'Snow pants',
          'Thermal base layers',
          'Ski goggles',
          'Hand warmers',
          'Waterproof gloves',
          'Helmet',
          'Sunscreen (yes, even in the snow!)',
        ],
      };

      // pull this from firebase instead
      const userOwnedGear = ['Ski goggles', 'Helmet', 'Snow pants'];

      const preChecked: Record<string, boolean> = {};
      dummyData.checklist.forEach((item) => {
        preChecked[item] = userOwnedGear.includes(item);
      });

      setGearChecked(preChecked);
      setResortData(dummyData);
    } else {
      setResortData(null);
      alert('Sorry, we only have data for Park City right now!');
    }
  };

  const toggleCheckbox = (item: string) => {
    setGearChecked((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${parkcity})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      <header className="App-header">
        <p className="header">PowderPrep</p>

        <div className="body">
          <input
            type="text"
            placeholder="Enter a location"
            value={location}
            onChange={handleChange}
            className="location-input"
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>

          {resortData && (
            <div className="resort-info">
              <h2>{resortData.name}</h2>
              <p>🌡️ Temperature: {resortData.temperature}</p>
              <p>❄️ Snowfall: {resortData.snowfall}</p>
              <p>🌧️ Precipitation: {resortData.precipitation}</p>
              <p>💨 Wind: {resortData.wind}</p>
              <p>
                🚡 Lifts Open: {resortData.openLifts} / {resortData.totalLifts}
              </p>
              <p>
                🎿 Trails Open: {resortData.trailsOpen} / {resortData.totalTrails}
              </p>

              <h3>Recommended Gear Checklist:</h3>
              <ul>
                {resortData.checklist.map((item: string, index: number) => (
                  <li key={index}>
                    <label>
                      <input
                        type="checkbox"
                        checked={gearChecked[item] || false}
                        onChange={() => toggleCheckbox(item)}
                      />
                      {item}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
