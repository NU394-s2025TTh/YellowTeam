// src/components/Wardrobe/Wardrobe.tsx
import './Wardrobe.css';

import React, { useEffect, useState } from 'react';
import { DEFAULT_ITEM, MAX_INPUT } from 'src/constants/wardrobeValues';
import { getData, setData } from 'src/firebase/utils';
import { useUserContext } from 'src/providers/UserProvider';
import { useWardrobeContext } from 'src/providers/WardrobeProvider';
import { GearCategory, WardrobeItem } from 'src/types/WardrobeItem';

const categories: GearCategory[] = [
  'Base Layers',
  'Mid Layers',
  'Outer Layers',
  'Accessories',
];

const gearOptions: Record<GearCategory, string[]> = {
  'Base Layers': ['Thermal Shirt', 'Thermal Pants', 'Base Layer Socks'],
  'Mid Layers': ['Fleece Jacket', 'Sweater'],
  'Outer Layers': ['Ski Jacket', 'Snow Pants'],
  Accessories: ['Gloves', 'Beanie', 'Goggles', 'Neck Gaiter'],
};

// ─── helper to call OpenAI directly
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
  return json.choices[0].message.content.trim();
}

export default function Wardrobe() {
  const { user } = useUserContext();
  const { items, setItems } = useWardrobeContext();

  const [newItem, setNewItem] = useState<WardrobeItem>(DEFAULT_ITEM);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Load existing from Firebase
  useEffect(() => {
    (async () => {
      try {
        const snap = await getData(`users/${user.id}/wardrobe`);
        const saved: Record<GearCategory, string[]> = snap.val() || {};
        const loaded: WardrobeItem[] = [];
        categories.forEach((cat) => {
          (saved[cat] || []).forEach((name) => {
            loaded.push({ name, category: cat, warmth: 3 });
          });
        });
        setItems(loaded);
      } catch {
        /* ignore load errors */
      }
    })();
  }, [user.id, setItems]);

  // ─── Add new item (in-memory + persist)
  const handleAdd = async () => {
    const name = newItem.name.trim();
    if (!name || !newItem.category) return;

    const updated = [...items, newItem];
    setItems(updated);
    setNewItem(DEFAULT_ITEM);

    try {
      const toSave: Record<GearCategory, string[]> = {};
      updated.forEach((it) => {
        toSave[it.category] = toSave[it.category] || [];
        toSave[it.category].push(it.name);
      });
      await setData(`users/${user.id}/wardrobe`, toSave);
    } catch (err) {
      console.error('Failed to save wardrobe:', err);
    }
  };

  const updateItem = (
    index: number,
    updates: Partial<Pick<WardrobeItem, 'category' | 'warmth'>>
  ) => {
    const modified = items.map((it, i) =>
      i === index ? { ...it, ...updates } : it
    );
    setItems(modified);
    // optionally persist here as well
  };

  const removeItem = (index: number) => {
    const filtered = items.filter((_, i) => i !== index);
    setItems(filtered);
    // optionally persist here as well
  };

  // ─── Generate AI report
  const handleGenerateReport = async () => {
    setLoading(true);
    setReport(null);
    setError(null);
    try {
      const text = await fetchPackingReport(items);
      setReport(text);
    } catch (err) {
      console.error(err);
      setError('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wardrobe-page">
      {/* ─── Add New Item */}
      <div className="wardrobe-input">
        <h3>Add New Gear</h3>
        <select
          value={newItem.category}
          onChange={(e) =>
            setNewItem((prev) => ({
              ...prev,
              category: e.target.value as GearCategory,
              name: '',
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

        {newItem.category && (
          <select
            value={newItem.name}
            onChange={(e) =>
              setNewItem((prev) => ({ ...prev, name: e.target.value }))
            }
          >
            <option value="">Select Item</option>
            {gearOptions[newItem.category].map((gear) => (
              <option key={gear} value={gear}>
                {gear}
              </option>
            ))}
          </select>
        )}

        <label htmlFor="warmth">Warmth (1–5)</label>
        <input
          id="warmth"
          type="range"
          min={1}
          max={5}
          step={1}
          value={newItem.warmth}
          onChange={(e) =>
            setNewItem((prev) => ({ ...prev, warmth: Number(e.target.value) }))
          }
        />

        <button
          onClick={handleAdd}
          disabled={!newItem.category || !newItem.name}
        >
          Add to Wardrobe
        </button>
      </div>

      {/* ─── Inventory */}
      <div className="inventory-section">
        <h3>Your Gear</h3>
        {items.map((item, idx) => (
          <div className="inventory-item" key={idx}>
            <span>{item.name}</span>
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
              onChange={(e) =>
                updateItem(idx, { warmth: Number(e.target.value) })
              }
            />
            <button
              className="remove-button"
              onClick={() => removeItem(idx)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* ─── Generate Packing Report */}
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
