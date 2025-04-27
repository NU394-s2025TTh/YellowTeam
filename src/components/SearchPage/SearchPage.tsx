import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFiveDayForecast,
  getHourlyForecast,
  getSnowConditions,
} from 'src/api/snowApi';

import { getData } from '../../firebase/utils';
import type { Forecast } from '../../types/Forecast';
import { FiveDayForecast } from '../FiveDayForecast/FiveDayForecast';
import HourlyForecast from '../HourlyForecast/HourlyForecast';
import ResortInfo from '../ResortInfo/ResortInfo';
import SearchBar from '../SearchBar/SearchBar';
import TempChart from '../TempChart/TempChart';

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
  const [forecastList, setForecastList] = useState([]);
  const [fiveDayForecast, setFiveDayForecast] = useState<Forecast[]>([]);
  const [chartData, setChartData] = useState<
    { day: string; maxTemp: number; minTemp: number }[]
  >([]);
  const [gearChecked, setGearChecked] = useState<Record<string, boolean>>({});
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showGearInput] = useState(false);

  // REMOVE LATER
  console.log(isLoading);

  useEffect(() => {
    setChartData(
      fiveDayForecast.map((day: Forecast) => ({
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
