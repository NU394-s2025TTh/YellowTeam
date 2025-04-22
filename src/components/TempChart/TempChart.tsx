import './TempChart.css';

import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DataItem {
  day: string;
  maxTemp: number;
  minTemp: number;
}

interface Props {
  data: DataItem[];
}

export default function TempChart({ data }: Props) {
  return (
    <div className="resort-info">
      <h3>📊 AM Temperature (5‑Day)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis unit="°F" />
          <Tooltip />
          <Line type="monotone" dataKey="maxTemp" name="Max Temp" />
          <Line type="monotone" dataKey="minTemp" name="Min Temp" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
