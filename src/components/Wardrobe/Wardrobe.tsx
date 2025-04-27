// src/components/Wardrobe/Wardrobe.tsx
import './Wardrobe.css';

import React, { useState } from 'react';
import { DEFAULT_ITEM, MAX_INPUT } from 'src/constants/wardrobeValues';
import { setData } from 'src/firebase/utils';
import { useWardrobeContext } from 'src/providers/WardrobeProvider';
import { Categories, GearCategory, WardrobeItem } from 'src/types/WardrobeItem';

export default function Wardrobe() {
  const { items } = useWardrobeContext();
  const [newItem, setNewItem] = useState<WardrobeItem>(DEFAULT_ITEM);

  const handleAdd = async () => {
    const name = newItem.name.trim();
    if (!name) return;

    setData(`/wardrobes/testingUser123`, [...items, newItem]);
    setNewItem({ ...DEFAULT_ITEM });
  };

  const updateItem = (
    index: number,
    updates: Partial<Pick<WardrobeItem, 'category' | 'warmth' | 'name'>>,
  ) => {
    const updatedItems = items.map((it, i) => (i === index ? { ...it, ...updates } : it));
    setData(`/wardrobes/testingUser123`, updatedItems);
  };

  const removeItem = (index: number) => {
    const newList = items.filter((item, i) => i !== index);
    setData(`/wardrobes/testingUser123`, newList);
  };

  const handleGenerateReport = () => {
    // TODO
  };

  return (
    <div className="wardrobe-page">
      {/* ─── Add new item */}
      <div className="wardrobe-input">
        <input
          type="text"
          placeholder="Item Name"
          maxLength={MAX_INPUT}
          value={newItem.name}
          onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
        />

        <select
          value={newItem.category}
          onChange={(e) =>
            setNewItem((prev) => ({
              ...prev,
              category: e.target.value as GearCategory,
            }))
          }
        >
          {Categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="slider-wrapper">
          <label htmlFor="warmth">Warmth Level (1–5)</label>
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

        <button onClick={handleAdd}>Add</button>
      </div>

      {/* ─── Inventory */}
      <div className="inventory-section">
        <h3>Inventory</h3>
        {items.map((item, idx) => (
          <div className="inventory-item" key={idx}>
            <input
              type="text"
              defaultValue={item.name}
              onChange={(item) => updateItem(idx, { name: item.target.value })}
            />

            <select
              value={item.category}
              onChange={(e) =>
                updateItem(idx, { category: e.target.value as GearCategory })
              }
            >
              {Categories.map((cat) => (
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

      {/* ─── Generate report */}
      <button className="generate-button" onClick={handleGenerateReport}>
        Generate My Packing Report
      </button>
    </div>
  );
}
