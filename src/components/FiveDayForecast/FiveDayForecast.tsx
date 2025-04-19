import './FiveDayForecast.css';

import React from 'react';

interface DayForecast {
  dayOfWeek: string;
  am: { summary: string; snow: string; maxTemp: string };
  pm: { summary: string; snow: string; maxTemp: string };
  night: { summary: string; snow: string; maxTemp: string };
}

interface Props {
  days: DayForecast[];
}

export default function FiveDayForecast({ days }: Props) {
  return (
    <div className="resort-info">
      <h3>5‑Day Forecast (AM/PM/Night)</h3>
      <ul className="forecast-list">
        {days.map((day, i) => (
          <li key={i}>
            <strong>{day.dayOfWeek.toUpperCase()}</strong>
            <div>
              🌅 AM: {day.am.summary}, Snow: {day.am.snow}, Temp: {day.am.maxTemp}
            </div>
            <div>
              ☀️ PM: {day.pm.summary}, Snow: {day.pm.snow}, Temp: {day.pm.maxTemp}
            </div>
            <div>
              🌙 Night: {day.night.summary}, Snow: {day.night.snow}, Temp:{' '}
              {day.night.maxTemp}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
