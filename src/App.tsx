/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css';

import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getData,
  getFiveDayForecast,
  getHourlyForecast,
  getSnowConditions,
  setData,
} from './firebase/utils';
import parkcity from './parkcity.jpg';

function App() {
  const gearCategories = {
    Layering: '',
    Accessories: '',
    Equipment: '',
  } as const;
  type GearCategory = keyof typeof gearCategories;

  type SnowConditionData = {
    name: string;
    topSnowDepth: string;
    botSnowDepth: string;
    lastSnowfallDate: string;
    url: string;
  };

  const [location, setLocation] = useState('');
  const [resortData, setResortData] = useState<SnowConditionData | null>(null);
  const [forecastList, setForecastList] = useState<any[]>([]);
  const [fiveDayForecast, setFiveDayForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [wardrobeInputs, setWardrobeInputs] =
    useState<Record<GearCategory, string>>(gearCategories);
  const [showGearInput, setShowGearInput] = useState(false);
  const [isEditingWardrobe, setIsEditingWardrobe] = useState(false);
  const [gearChecked, setGearChecked] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleSearch = async () => {
    const input = location.trim().toLowerCase();
    if (!input) return;

    setLoading(true);
    setResortData(null);
    setForecastList([]);
    setFiveDayForecast([]);

    const snow = await getSnowConditions(input);
    const forecast = await getHourlyForecast(input);
    const forecast5day = await getFiveDayForecast(input);

    setLoading(false);

    if (!snow) {
      alert('No snow data found for that resort.');
      return;
    }

    setResortData({
      name: snow.basicInfo?.name || input,
      topSnowDepth: snow.topSnowDepth || 'N/A',
      botSnowDepth: snow.botSnowDepth || 'N/A',
      lastSnowfallDate: snow.lastSnowfallDate || 'N/A',
      url: snow.basicInfo?.url || '#',
    });

    setForecastList(forecast);
    setFiveDayForecast(forecast5day);

    // Load wardrobe
    try {
      const userData = await getData('users/testUser123/wardrobe');
      const wardrobeData: string[][] = Object.values(userData.val() || {});
      const userOwnedGear = wardrobeData.flatMap((arr) =>
        arr.map((item) => item.toLowerCase()),
      );

      const dummyChecklist = [
        'Warm waterproof jacket',
        'Snow pants',
        'Thermal base layers',
        'Ski goggles',
        'Hand warmers',
        'Waterproof gloves',
        'Helmet',
        'Sunscreen (yes, even in the snow!)',
      ];

      const preChecked: Record<string, boolean> = {};
      dummyChecklist.forEach((item) => {
        preChecked[item] = userOwnedGear.includes(item.toLowerCase());
      });
      setGearChecked(preChecked);
    } catch (err) {
      console.error('Failed to load wardrobe:', err);
    }
  };

  const toggleCheckbox = (item: string) => {
    setGearChecked((prev) => ({ ...prev, [item]: !prev[item] }));
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
          console.error('Error loading wardrobe:', error);
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
      setIsEditingWardrobe(false);
    } catch (err) {
      alert('Failed to save wardrobe');
      console.error(err);
    }
  };

  const chartData = fiveDayForecast.map((day: any) => ({
    day: day.dayOfWeek,
    maxTemp: parseInt(day.am?.maxTemp?.replace(/[^0-9]/g, '') || '0'),
    minTemp: parseInt(day.am?.minTemp?.replace(/[^0-9]/g, '') || '0'),
  }));

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
        <div className="search-gear-bar">
          <input
            type="text"
            placeholder="Enter resort name (e.g., Park City)"
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
              setIsEditingWardrobe(false);
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
                          <li key={idx}>{item}</li>
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
            <p>❄️ Top Snow Depth: {resortData.topSnowDepth}</p>
            <p>❄️ Bottom Snow Depth: {resortData.botSnowDepth}</p>
            <p>📅 Last Snowfall: {resortData.lastSnowfallDate}</p>
            <a href={resortData.url} target="_blank" rel="noreferrer">
              🔗 View Full Forecast
            </a>
            <h3 style={{ marginTop: '1.5rem' }}>Recommended Gear Checklist:</h3>
            <ul>
              {Object.keys(gearChecked).map((item, index) => (
                <li key={index}>
                  <label>
                    <input
                      type="checkbox"
                      checked={gearChecked[item]}
                      onChange={() => toggleCheckbox(item)}
                    />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(forecastList.length > 0 ||
          fiveDayForecast.length > 0 ||
          chartData.length > 0) && (
          <div className="weather-grid">
            {forecastList.length > 0 && (
              <div className="resort-info">
                <h3>Hourly Forecast (Top Elevation)</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {forecastList.slice(0, 6).map((f, i) => (
                    <li key={i} style={{ marginBottom: '0.75rem' }}>
                      <strong>{f.time}</strong> | {f.summary}, {f.maxTemp}, Wind:{' '}
                      {f.windSpeed}, Chill: {f.windChill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fiveDayForecast.length > 0 && (
              <div className="resort-info">
                <h3>5-Day Forecast (AM/PM/Night)</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {fiveDayForecast.map((day, i) => (
                    <li key={i} style={{ marginBottom: '1rem' }}>
                      <strong>{day.dayOfWeek.toUpperCase()}</strong>
                      <div>
                        🌅 AM: {day.am.summary}, Snow: {day.am.snow}, Temp:{' '}
                        {day.am.maxTemp}
                      </div>
                      <div>
                        ☀️ PM: {day.pm.summary}, Snow: {day.pm.snow}, Temp:{' '}
                        {day.pm.maxTemp}
                      </div>
                      <div>
                        🌙 Night: {day.night.summary}, Snow: {day.night.snow}, Temp:{' '}
                        {day.night.maxTemp}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="resort-info">
                <h3>📊 AM Temperature (5-Day)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis unit="°F" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="maxTemp"
                      stroke="#ff7300"
                      name="Max Temp"
                    />
                    <Line
                      type="monotone"
                      dataKey="minTemp"
                      stroke="#387908"
                      name="Min Temp"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
