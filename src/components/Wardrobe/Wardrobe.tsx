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

// helper to call OpenAI directly
// MAKE A .ENV IN ROOT, ADD VITE_OPENAI_KEY=yourkey
async function fetchPackingReport(items: WardrobeItem[]): Promise<string> {
  const bulletList = items
    .map((i) => `- ${i.name} (${i.category}, warmth ${i.warmth}/5)`)
    .join('\n');

  const body = {
    model: 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 300,
    messages: [
      { role: 'system', content: 'You’re a ski-packing assistant.' },
      {
        role: 'user',
        content: `They already have:\n${bulletList}\n\nWhat else should they pack for a week-long ski trip? Reply as a bulleted list.`,
      },
    ],
  };

  console.log('OPENAI KEY:', import.meta.env.VITE_OPENAI_KEY);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`OpenAI error ${res.status}`);
  }
  const json = await res.json();
  return json.choices[0].message.content as string;
}

export default function Wardrobe() {
  const { items } = useWardrobeContext();
  const [newItem, setNewItem] = useState<WardrobeItem>(DEFAULT_ITEM);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const handleGenerateReport = async () => {
    setLoading(true);
    setReport(null);
    setError(null);
    try {
      const text = await fetchPackingReport(items);
      setReport(text.trim());
    } catch (err) {
      console.error(err);
      setError('Failed to generate report.');
    } finally {
      setLoading(false);
    }
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

      {/* ─── Generate report */}
      <button
        className="generate-button"
        onClick={handleGenerateReport}
        disabled={loading}
      >
        {loading ? 'Thinking…' : 'Generate My Packing Report'}
      </button>

      {error && <p className="error-text">{error}</p>}

      {report && (
        <div className="packing-report">
          <h3>Suggested Additional Items</h3>
          <pre>{report}</pre>
        </div>
      )}
    </div>
  );
}
