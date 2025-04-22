import './ResortInfo.css';

import React from 'react';

interface SnowConditionData {
  name: string;
  topSnowDepth: string;
  botSnowDepth: string;
  lastSnowfallDate: string;
  url: string;
}

interface Props {
  data: SnowConditionData;
  checked: Record<string, boolean>;
  onToggle: (item: string) => void;
}

export default function ResortInfo({ data, checked, onToggle }: Props) {
  return (
    <div className="resort-info">
      <h2>{data.name}</h2>
      <p>❄️ Top Snow Depth: {data.topSnowDepth}</p>
      <p>❄️ Bottom Snow Depth: {data.botSnowDepth}</p>
      <p>📅 Last Snowfall: {data.lastSnowfallDate}</p>
      <a href={data.url} target="_blank" rel="noreferrer">
        🔗 View Full Forecast
      </a>

      <h3 style={{ marginTop: '1.5rem' }}>Recommended Gear Checklist:</h3>
      <ul>
        {Object.keys(checked).map((item) => (
          <li key={item}>
            <label>
              <input
                type="checkbox"
                checked={checked[item]}
                onChange={() => onToggle(item)}
              />
              {item}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
