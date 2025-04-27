// src/components/Wardrobe/Wardrobe.tsx
import './Wardrobe.css';

import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { DEFAULT_ITEM, MAX_INPUT } from 'src/constants/wardrobeValues';
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

export default function Wardrobe() {
  const { items, setItems } = useWardrobeContext();

  // start newItem from your default
  const [newItem, setNewItem] = useState<WardrobeItem>(DEFAULT_ITEM);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // load existing from Firebase
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
              loaded.push({ name, category: cat, warmth: 3 });
              // default saved items to mid‑warmth
            });
          });
          setItems(loaded);
        }
      } catch {
        /* ignore */
      }
    })();
  }, [setItems, user]);

  // save wardrobe to firebase
  useEffect(() => {
    (async () => {
      try {
        if (user && items.length > 0) {
          console.log('saving wardrobe for user: ', user.uid);
          // convert WardrobeItem[] back into { category: [item names] }
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
          console.log('no user when trying to save wardrobe');
        }
      } catch (error) {
        console.error('Failed to save wardrobe', error);
      }
    })();
  }, [items, user]);

  const handleAdd = () => {
    const name = newItem.name.trim();
    if (!name) return;
    // push the exact newItem object (with its category & warmth)
    setItems((prev) => [...prev, newItem]);
    // reset back to defaults
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
      <button className="generate-button" onClick={handleGenerateReport}>
        Generate My Packing Report
      </button>
    </div>
  );
}
