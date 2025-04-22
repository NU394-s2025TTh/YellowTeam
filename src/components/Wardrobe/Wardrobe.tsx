import './Wardrobe.css';

import React, { useEffect, useState } from 'react';
import { DEFAULT_ITEM, MAX_INPUT } from 'src/constants/wardrobeValues';
import { useWardrobeContext } from 'src/providers/WardrobeProvider';
import { GearCategory, WardrobeItem } from 'src/types/WardrobeItem';

import { getData } from '../../firebase/utils';

const categories: GearCategory[] = ['Layering', 'Accessories', 'Equipment'];

export default function Wardrobe() {
  const { items, setItems } = useWardrobeContext();

  const [newItem, setNewItem] = useState<WardrobeItem>(DEFAULT_ITEM);

  useEffect(() => {
    (async () => {
      try {
        const wardrobeSnapshot = await getData('users/testUser123/wardrobe');
        const saved: Record<GearCategory, string[]> = wardrobeSnapshot.val() || {};
        const loaded: WardrobeItem[] = [];
        categories.forEach((cat) => {
          (saved[cat] || []).forEach((name) => {
            loaded.push({ name, category: cat, warmth: 0 });
          });
        });
        setItems(loaded);
      } catch {
        // ignore if no data
      }
    })();
  }, []);

  const handleAdd = () => {
    const name = newItem.name.trim();
    if (!name) return;
    setItems((prev) => [...prev, { name, category: categories[0], warmth: 0 }]);
    setNewItem({ ...newItem, name: name });
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
    // TODO: hook up report generation
  };

  return (
    <div className="wardrobe-page">
      <div className="wardrobe-input">
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          max={MAX_INPUT}
          onChange={(inputVal) => setNewItem({ ...newItem, name: inputVal.target.value })}
        />
        <select name="item" id="item-category">
          <option value="baseLayers">Base Layers</option>
          <option value="midLayers">Mid Layers</option>
          <option value="outerLayer">Outer Layer</option>
          <option value="accessories">Accessories</option>
        </select>
        <input type="range" id="warmth" min={0} max={5} step={1}></input>
        <button onClick={handleAdd}>Add</button>
      </div>
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
              min={0}
              max={10}
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

      {/* 3) Generate report */}
      <button className="generate-button" onClick={handleGenerateReport}>
        Generate My Packing Report
      </button>
    </div>
  );
}
