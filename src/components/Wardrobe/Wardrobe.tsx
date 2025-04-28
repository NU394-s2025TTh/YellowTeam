// src/components/Wardrobe/Wardrobe.tsx
// src/components/Wardrobe/Wardrobe.tsx
import './Wardrobe.css';

import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { DEFAULT_ITEM } from 'src/constants/wardrobeValues';
import { useWardrobeContext } from 'src/providers/WardrobeProvider';
import { GearCategory, WardrobeItem } from 'src/types/WardrobeItem';

import { app, getData, setData } from '../../firebase/utils';

const auth = getAuth(app);

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
  const { items, setItems } = useWardrobeContext();
  const [newItem, setNewItem] = useState<WardrobeItem>(DEFAULT_ITEM);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // 🛠 Load wardrobe from Firebase
  useEffect(() => {
    (async () => {
      try {
        if (user) {
          console.log('loading wardrobe for user:', user.uid);
          const snap = await getData(`users/${user.uid}/wardrobe`);
          console.log('fetched wardrobe snapshot', snap.val());
          const saved: Record<GearCategory, string[]> = snap.val() || {};
          const loaded: WardrobeItem[] = [];
          categories.forEach((cat) => {
            (saved[cat] || []).forEach((name) => {
              loaded.push({ name, category: cat, warmth: 3 }); // Default warmth
            });
          });
          setItems(loaded);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [setItems, user]);

  // 🛠 Save wardrobe to Firebase
  useEffect(() => {
    (async () => {
      try {
        if (user && items.length > 0) {
          console.log('saving wardrobe for user: ', user.uid);
          const wardrobeByCategory: Record<GearCategory, string[]> = {
            'Base Layers': [],
            'Mid Layers': [],
            'Outer Layers': [],
            Accessories: [],
          };
          items.forEach((item) => {
            wardrobeByCategory[item.category].push(item.name);
          });
          console.log('saving wardrobe data:', wardrobeByCategory);
          await setData(`users/${user.uid}/wardrobe`, wardrobeByCategory);
        } else {
          console.log('no user when trying to save wardrobe or wardrobe empty');
        }
      } catch (error) {
        console.error('Failed to save wardrobe', error);
      }
    })();
  }, [items, user]);

  const handleAdd = () => {
    const name = newItem.name.trim();
    if (!name || !newItem.category) return;
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
