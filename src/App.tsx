import './App.css';
import React, { useEffect, useState } from 'react';
import { getData, setData } from './firebase/utils';
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

  const gearCategories = {
    Layering: '',
    Accessories: '',
    Equipment: '',
  } as const;

  type GearCategory = keyof typeof gearCategories;

  const [wardrobeInputs, setWardrobeInputs] =
    useState<Record<GearCategory, string>>(gearCategories);
  const [showGearInput, setShowGearInput] = useState(false);
  const [isEditingWardrobe, setIsEditingWardrobe] = useState(false);
  const [location, setLocation] = useState('');
  const [resortData, setResortData] = useState<ResortData | null>(null);
  const [gearChecked, setGearChecked] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleSearch = async () => {
    const normalizedLocation = location.trim().toLowerCase();
    console.log(`Searching weather and slope data for: ${location}`);

    if (normalizedLocation.includes('park city')) {
      const dummyData: ResortData = {
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

      try {
        const userData = await getData('users/testUser123/wardrobe');
        const wardrobeData: string[][] = Object.values(userData.val());

        const userOwnedGear = wardrobeData
          ? wardrobeData.flatMap((arr) => arr.map((item) => item.toLowerCase()))
          : [];

        const preChecked: Record<string, boolean> = {};
        dummyData.checklist.forEach((item) => {
          preChecked[item] = userOwnedGear.includes(item.toLowerCase());
        });

        setGearChecked(preChecked);
        setResortData(dummyData);
      } catch (err) {
        console.error('Failed to load wardrobe data from Firebase:', err);
        setResortData(dummyData); // fallback
      }
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
  useEffect(() => {
    const loadWardrobe = async () => {
      if (showGearInput) {
        try {
          const snapshot = await getData('users/testUser123/wardrobe');
          const wardrobeData = snapshot.val();

          if (wardrobeData) {
            const formattedInputs: Record<GearCategory, string> = {
              Layering: '',
              Accessories: '',
              Equipment: '',
            };

            (Object.keys(wardrobeData) as GearCategory[]).forEach((category) => {
              formattedInputs[category] = wardrobeData[category].join(', ');
            });

            setWardrobeInputs(formattedInputs);
          }
        } catch (error) {
          console.error('Error loading wardrobe data:', error);
        }
      }
    };

    loadWardrobe();
  }, [showGearInput]);
  const saveWardrobe = async () => {
    const formatted: Record<string, string[]> = {};

    for (const [category, text] of Object.entries(wardrobeInputs)) {
      formatted[category] = text
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item !== '');
    }

    try {
      await setData('users/testUser123/wardrobe', formatted);
      alert('Wardrobe saved successfully!');
      setWardrobeInputs(gearCategories);
      setIsEditingWardrobe(false);
    } catch (error) {
      console.error('Error saving wardrobe:', error);
      alert('Failed to save wardrobe. Check console for details.');
    }
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
          <div className="search-gear-bar">
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
            <button
              onClick={() => {
                setShowGearInput((prev) => !prev);
                setIsEditingWardrobe(false); // reset to view mode
              }}
              className="search-button add-gear-button"
            >
              {showGearInput ? 'Hide Wardrobe' : 'My Wardrobe'}
            </button>
          </div>

          {showGearInput && (
            <div className="wardrobe-section">
              <h3>Your Gear Wardrobe</h3>

              {!isEditingWardrobe ? (
                <>
                  {Object.entries(wardrobeInputs).map(([category, items]) => (
                    <div key={category} className="wardrobe-category">
                      <strong>{category}</strong>
                      <ul style={{ paddingLeft: '1rem' }}>
                        {items
                          .split(',')
                          .map((item) => item.trim())
                          .filter((item) => item)
                          .map((item, idx) => (
                            <li key={idx}> {item}</li>
                          ))}
                      </ul>
                    </div>
                  ))}
                  <button
                    onClick={() => setIsEditingWardrobe(true)}
                    className="search-button"
                    style={{ marginTop: '1rem' }}
                  >
                    Edit Wardrobe
                  </button>
                </>
              ) : (
                <>
                  <p>Enter the gear you own under each category (comma-separated):</p>
                  {(Object.keys(wardrobeInputs) as GearCategory[]).map((category) => (
                    <div key={category} className="wardrobe-category">
                      <label className="wardrobe-label">{category}</label>
                      <textarea
                        rows={2}
                        placeholder="e.g., Ski goggles, Helmet"
                        value={wardrobeInputs[category]}
                        onChange={(e) =>
                          setWardrobeInputs((prev) => ({
                            ...prev,
                            [category]: e.target.value,
                          }))
                        }
                        className="wardrobe-textarea"
                      />
                    </div>
                  ))}
                  <button
                    onClick={saveWardrobe}
                    className="search-button"
                    style={{ marginTop: '1rem' }}
                  >
                    Save Wardrobe
                  </button>
                </>
              )}
            </div>
          )}

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
                {resortData.checklist.map((item, index) => (
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
