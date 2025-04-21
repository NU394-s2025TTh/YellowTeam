import React, { useEffect, useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import ResortInfo from '../ResortInfo/ResortInfo';
import HourlyForecast from '../HourlyForecast/HourlyForecast';
import FiveDayForecast from '../FiveDayForecast/FiveDayForecast';
import TempChart from '../TempChart/TempChart';

import { useNavigate } from 'react-router-dom';

import {
  getData,
  getSnowConditions,
  getHourlyForecast,
  getFiveDayForecast,
} from '../../firebase/utils';

// type GearCategory = 'Layering' | 'Accessories' | 'Equipment';

type SnowConditionData = {
  name: string;
  topSnowDepth: string;
  botSnowDepth: string;
  lastSnowfallDate: string;
  url: string;
};

const SearchPage: React.FC = () => {
    const navigate = useNavigate();

  const [location, setLocation] = useState('');
  const [resortData, setResortData] = useState<SnowConditionData | null>(null);
  const [forecastList, setForecastList] = useState<any[]>([]);
  const [fiveDayForecast, setFiveDayForecast] = useState<any[]>([]);
  const [chartData, setChartData] = useState<
    { day: string; maxTemp: number; minTemp: number }[]
  >([]);
  const [gearChecked, setGearChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [showGearInput, setShowGearInput] = useState(false);

  useEffect(() => {
    setChartData(
      fiveDayForecast.map((day) => ({
        day: day.dayOfWeek,
        maxTemp: parseInt(day.am?.maxTemp.replace(/[^0-9]/g, '') || '0'),
        minTemp: parseInt(day.am?.minTemp.replace(/[^0-9]/g, '') || '0'),
      }))
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

  return (
    <div>
      <SearchBar
        location={location}
        onChange={(e) => setLocation(e.target.value)}
        onSearch={handleSearch}
        onToggleWardrobe={() => navigate('/wardrobe')}
        showWardrobe={showGearInput}
      />

      {resortData && (
        <ResortInfo data={resortData} checked={gearChecked} onToggle={toggleCheckbox} />
      )}
      {forecastList.length > 0 && <HourlyForecast list={forecastList} />}
      {fiveDayForecast.length > 0 && <FiveDayForecast days={fiveDayForecast} />}
      {chartData.length > 0 && <TempChart data={chartData} />}
    </div>
  );
};

export default SearchPage;
