/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import './App.css';

import React, { useEffect, useState } from 'react';

import FiveDayForecast from './components/FiveDayForecast/FiveDayForecast';
import HourlyForecast from './components/HourlyForecast/HourlyForecast';
import ResortInfo from './components/ResortInfo/ResortInfo';
import SearchBar from './components/SearchBar/SearchBar';
import TempChart from './components/TempChart/TempChart';
import Wardrobe from './components/Wardrobe/Wardrobe';
import {
  getData,
  getFiveDayForecast,
  getHourlyForecast,
  getSnowConditions,
  setData,
} from './firebase/utils';
import parkcity from './parkcity.jpg';

type GearCategory = 'Layering' | 'Accessories' | 'Equipment';
type SnowConditionData = {
  name: string;
  topSnowDepth: string;
  botSnowDepth: string;
  lastSnowfallDate: string;
  url: string;
};

export default function App() {
  const initialGear: Record<GearCategory, string> = {
    Layering: '',
    Accessories: '',
    Equipment: '',
  };

  const [location, setLocation] = useState('');
  const [resortData, setResortData] = useState<SnowConditionData | null>(null);
  const [forecastList, setForecastList] = useState<any[]>([]);
  const [fiveDayForecast, setFiveDayForecast] = useState<any[]>([]);
  const [chartData, setChartData] = useState<
    { day: string; maxTemp: number; minTemp: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [wardrobeInputs, setWardrobeInputs] = useState(initialGear);
  const [showGearInput, setShowGearInput] = useState(false);
  const [isEditingWardrobe, setIsEditingWardrobe] = useState(false);
  const [gearChecked, setGearChecked] = useState<Record<string, boolean>>({});

  // Whenever fiveDayForecast updates, rebuild chartData
  useEffect(() => {
    setChartData(
      fiveDayForecast.map((day) => ({
        day: day.dayOfWeek,
        maxTemp: parseInt(day.am?.maxTemp.replace(/[^0-9]/g, '') || '0'),
        minTemp: parseInt(day.am?.minTemp.replace(/[^0-9]/g, '') || '0'),
      })),
    );
  }, [fiveDayForecast]);

  const handleSearch = async () => {
    const q = location.trim().toLowerCase();
    if (!q) return;
    setLoading(true);
    setResortData(null);
    setForecastList([]);
    setFiveDayForecast([]);

    const snow = await getSnowConditions(q);
    const hours = await getHourlyForecast(q);
    const days = await getFiveDayForecast(q);
    setLoading(false);

    if (!snow) {
      alert('No snow data found for that resort.');
      return;
    }

    setResortData({
      name: snow.basicInfo?.name || q,
      topSnowDepth: snow.topSnowDepth || 'N/A',
      botSnowDepth: snow.botSnowDepth || 'N/A',
      lastSnowfallDate: snow.lastSnowfallDate || 'N/A',
      url: snow.basicInfo?.url || '#',
    });
    setForecastList(hours);
    setFiveDayForecast(days);

    // load checklist from firebase
    try {
      const snap = await getData('users/testUser123/wardrobe');
      const arrs: string[][] = Object.values(snap.val() || {});
      const owned = new Set(arrs.flat().map((s) => s.toLowerCase()));
      const defaultList = [
        'Warm waterproof jacket',
        'Snow pants',
        'Thermal base layers',
        'Ski goggles',
        'Hand warmers',
        'Waterproof gloves',
        'Helmet',
        'Sunscreen (yes, even in the snow!)',
      ];
      const checks: Record<string, boolean> = {};
      defaultList.forEach((item) => {
        checks[item] = owned.has(item.toLowerCase());
      });
      setGearChecked(checks);
    } catch (err) {
      console.error('Failed to load wardrobe:', err);
    }
  };

  const toggleCheckbox = (item: string) =>
    setGearChecked((prev) => ({ ...prev, [item]: !prev[item] }));

  const saveWardrobe = async () => {
    const payload: Record<string, string[]> = {};
    Object.entries(wardrobeInputs).forEach(([cat, txt]) => {
      payload[cat] = txt
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
    });
    try {
      await setData('users/testUser123/wardrobe', payload);
      alert('Wardrobe saved!');
      setIsEditingWardrobe(false);
    } catch {
      alert('Save failed');
    }
  };

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
      <header className="App-header">
        <p className="header">PowderPrep</p>

        <SearchBar
          location={location}
          onChange={(e) => setLocation(e.target.value)}
          onSearch={handleSearch}
          onToggleWardrobe={() => {
            setShowGearInput((show) => !show);
            setIsEditingWardrobe(false);
          }}
          showWardrobe={showGearInput}
        />

        <Wardrobe
          inputs={wardrobeInputs}
          show={showGearInput}
          editing={isEditingWardrobe}
          onEdit={() => setIsEditingWardrobe(true)}
          onChange={(cat, val) => setWardrobeInputs((prev) => ({ ...prev, [cat]: val }))}
          onSave={saveWardrobe}
        />

        {resortData && (
          <ResortInfo data={resortData} checked={gearChecked} onToggle={toggleCheckbox} />
        )}

        {forecastList.length > 0 && <HourlyForecast list={forecastList} />}
        {fiveDayForecast.length > 0 && <FiveDayForecast days={fiveDayForecast} />}
        {chartData.length > 0 && <TempChart data={chartData} />}
      </header>
    </div>
  );
}
