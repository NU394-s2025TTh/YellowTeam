// src/components/Wardrobe/Wardrobe.tsx
// src/components/Wardrobe/Wardrobe.tsx
import './Wardrobe.css';

import React, { useState } from 'react';
import { DEFAULT_ITEM } from 'src/constants/wardrobeValues';
import { useUserContext } from 'src/providers/UserProvider';
import { useWardrobeContext } from 'src/providers/WardrobeProvider';
import { GearCategory, WardrobeItem } from 'src/types/WardrobeItem';

import { setData } from '../../firebase/utils';

const categories: GearCategory[] = [
  'Base Layers',
  'Mid Layers',
  'Outer Layers',
  'Accessories',
];

// 🛠 Predefined gear options by category
const gearOptions: Record<GearCategory, string[]> = {
  'Base Layers': ['Thermal Shirt', 'Thermal Pants', 'Base Layer Socks'],
  'Mid Layers': ['Fleece Jacket', 'Sweater'],
  'Outer Layers': ['Ski Jacket', 'Snow Pants'],
  Accessories: ['Gloves', 'Beanie', 'Goggles', 'Neck Gaiter'],
};

export default function Wardrobe() {
  const { items } = useWardrobeContext();
  const [newItem, setNewItem] = useState<WardrobeItem>(DEFAULT_ITEM);
  const { user } = useUserContext();

  const handleAdd = () => {
    const name = newItem.name.trim();
    if (!name || !newItem.category) return;

    setData(`/wardrobes/${user?.uid}`, [...items, newItem]);
    setNewItem({ ...DEFAULT_ITEM });
  };

  const updateItem = (
    index: number,
    updates: Partial<Pick<WardrobeItem, 'category' | 'warmth'>>,
  ) => {
    const modifiedItems = items.map((it, i) =>
      i === index ? { ...it, ...updates } : it,
    );
    setData(`/wardrobes/${user?.uid}`, modifiedItems);
  };

  const removeItem = (index: number) => {
    const modifiedItems = items.filter((item, i) => i !== index);
    setData(`/wardrobes/${user?.uid}`, modifiedItems);
  };

  const handleGenerateReport = () => {
    // TODO
  };

  return (
    <div className="wardrobe-page">
      {/* ─── Add New Item Section */}
      <div className="wardrobe-input">
        {/* Category select */}
        <h3>Add New Gear</h3>
        <select
          value={newItem.category}
          onChange={(e) =>
            setNewItem((prev) => ({
              ...prev,
              category: e.target.value as GearCategory,
              name: '', // reset gear selection when category changes
            }))
          }
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Gear item select (dependent on category) */}
        {newItem.category && (
          <select
            value={newItem.name}
            onChange={(e) =>
              setNewItem((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          >
            <option value="">Select Gear Item</option>
            {gearOptions[newItem.category].map((gear) => (
              <option key={gear} value={gear}>
                {gear}
              </option>
            ))}
          </select>
        )}

        {/* Warmth level slider */}
        <div className="slider-wrapper">
          <label htmlFor="warmth">Set Warmth Level (1–5)</label>
          <input
            type="range"
            id="warmth"
            min={1}
            max={5}
            step={1}
            value={newItem.warmth}
            onChange={(e) =>
              setNewItem((prev) => ({
                ...prev,
                warmth: Number(e.target.value),
              }))
            }
          />
        </div>

        {/* Add item button */}
        <button onClick={handleAdd} disabled={!newItem.category || !newItem.name}>
          Add to Wardrobe
        </button>
      </div>

      {/* ─── Inventory Section */}
      <div className="inventory-section">
        <h3>Inventory</h3>
        {items.map((item, idx) => (
          <div className="inventory-item" key={idx}>
            <input type="text" value={item.name} readOnly />

            <select
              value={item.category}
              onChange={(e) =>
                updateItem(idx, { category: e.target.value as GearCategory })
              }
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input
              type="number"
              min={1}
              max={5}
              value={item.warmth}
              onChange={(e) => updateItem(idx, { warmth: Number(e.target.value) })}
            />

            <button
              className="remove-button"
              onClick={() => removeItem(idx)}
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* ─── Generate Report */}
      <button className="generate-button" onClick={handleGenerateReport}>
        Generate My Packing Report
      </button>
    </div>
  );
}
