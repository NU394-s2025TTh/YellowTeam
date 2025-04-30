import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFiveDayForecast,
  getHourlyForecast,
  getSnowConditions,
} from 'src/api/snowApi';
import { useWardrobeContext } from 'src/providers/WardrobeProvider';

import { getCurrentUser } from '../../firebase/user';
import { saveViewedLocation } from '../../firebase/utils';
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
  const { items } = useWardrobeContext();

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

    try {
      const snow = await getSnowConditions(q);
      const hours = await getHourlyForecast(q);
      const days = await getFiveDayForecast(q);

      if (!snow) {
        alert('No snow data found for that resort.');
        setLoading(false);
        return;
      }

      setResortData({
        name: snow.basicInfo?.name || q,
        topSnowDepth: snow.topSnowDepth || 'N/A',
        botSnowDepth: snow.botSnowDepth || 'N/A',
        lastSnowfallDate: snow.lastSnowfallDate || 'N/A',
        url: snow.basicInfo?.url || '#',
      });
      const user = getCurrentUser();
      // await saveViewedLocation('testUser123', snow.basicInfo?.name || q);
      if (user) {
        await saveViewedLocation(user.uid, snow.basicInfo?.name || q);
      } else {
        console.warn('No user signed in, skipping saveViewedLocation.');
      }
      setForecastList(hours);
      setFiveDayForecast(days);

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
      const masterList = items.length > 0 ? items.map((i) => i.name) : defaultList;
      const checks: Record<string, boolean> = {};
      masterList.forEach((name) => {
        checks[name] = false;
      });
      setGearChecked(checks);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }

    setLoading(false);
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
        loading={isLoading} // <<--- ADD THIS!!!
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
