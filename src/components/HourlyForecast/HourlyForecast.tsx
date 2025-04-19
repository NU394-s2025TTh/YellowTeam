import './HourlyForecast.css';

import React from 'react';

interface ForecastItem {
  time: string;
  summary: string;
  maxTemp: string;
  windSpeed: string;
  windChill: string;
}

interface Props {
  list: ForecastItem[];
}

export default function HourlyForecast({ list }: Props) {
  return (
    <div className="resort-info">
      <h3>Hourly Forecast (Top Elevation)</h3>
      <ul className="forecast-list">
        {list.slice(0, 6).map((f, i) => (
          <li key={i}>
            <strong>{f.time}</strong> | {f.summary}, {f.maxTemp}, Wind: {f.windSpeed},
            Chill: {f.windChill}
          </li>
        ))}
      </ul>
    </div>
  );
}
