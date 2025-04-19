import './Wardrobe.css';

import React from 'react';

type GearCategory = 'Layering' | 'Accessories' | 'Equipment';
const categories: GearCategory[] = ['Layering', 'Accessories', 'Equipment'];

interface Props {
  inputs: Record<GearCategory, string>;
  show: boolean;
  editing: boolean;
  onEdit: () => void;
  onChange: (category: GearCategory, value: string) => void;
  onSave: () => void;
}

export default function Wardrobe({
  inputs,
  show,
  editing,
  onEdit,
  onChange,
  onSave,
}: Props) {
  if (!show) return null;

  return (
    <div className="wardrobe-section">
      <h3>Your Gear Wardrobe</h3>
      {!editing ? (
        <>
          {categories.map((category) => (
            <div key={category} className="wardrobe-category">
              <strong>{category}</strong>
              <ul>
                {inputs[category]
                  .split(',')
                  .map((i) => i.trim())
                  .filter(Boolean)
                  .map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
              </ul>
            </div>
          ))}
          <button onClick={onEdit} className="search-button">
            Edit Wardrobe
          </button>
        </>
      ) : (
        <>
          <p>Enter the gear you own under each category (comma-separated):</p>
          {categories.map((category) => (
            <div key={category} className="wardrobe-category">
              <label className="wardrobe-label">{category}</label>
              <textarea
                rows={2}
                placeholder="e.g., Ski goggles, Helmet"
                value={inputs[category]}
                onChange={(e) => onChange(category, e.target.value)}
                className="wardrobe-textarea"
              />
            </div>
          ))}
          <button onClick={onSave} className="search-button">
            Save Wardrobe
          </button>
        </>
      )}
    </div>
  );
}
