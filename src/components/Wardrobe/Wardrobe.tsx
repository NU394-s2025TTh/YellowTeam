// src/components/Wardrobe/Wardrobe.tsx
import './Wardrobe.css';

import React, { useEffect, useState } from 'react';
import { DEFAULT_ITEM, MAX_INPUT } from 'src/constants/wardrobeValues';
import { getData } from 'src/firebase/utils';
import { useWardrobeContext } from 'src/providers/WardrobeProvider';
import { GearCategory, WardrobeItem } from 'src/types/WardrobeItem';

const categories: GearCategory[] = [
  'Base Layers',
  'Mid Layers',
  'Outer Layers',
  'Accessories',
];

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
  const { items, setItems } = useWardrobeContext();
  const [newItem, setNewItem] = useState<WardrobeItem>(DEFAULT_ITEM);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // load existing from Firebase
  useEffect(() => {
    (async () => {
      try {
        const snap = await getData('users/testUser123/wardrobe');
        const saved: Record<GearCategory, string[]> = snap.val() || {};
        const loaded: WardrobeItem[] = [];
        categories.forEach((cat) => {
          (saved[cat] || []).forEach((name) => {
            loaded.push({ name, category: cat, warmth: 3 });
          });
        });
        setItems(loaded);
      } catch {
        /* ignore */
      }
    })();
  }, [setItems]);

  const handleAdd = () => {
    const name = newItem.name.trim();
    if (!name) return;
    setItems((prev) => [...prev, newItem]);
    setNewItem({ ...DEFAULT_ITEM });
  };

  const updateItem = (
    index: number,
    updates: Partial<Pick<WardrobeItem, 'category' | 'warmth'>>,
  ) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...updates } : it)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
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
          {categories.map((cat) => (
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
