import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wardrobe from './Wardrobe';
import { getData, setData } from '../../firebase/utils';

type GearCategory = 'Layering' | 'Accessories' | 'Equipment';

const WardrobePage: React.FC = () => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<Record<GearCategory, string>>({
    Layering: '',
    Accessories: '',
    Equipment: '',
  });
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getData('users/testUser123/wardrobe');
        const saved = snap.val() || {};
        setInputs({
          Layering: (saved.Layering || []).join(', '),
          Accessories: (saved.Accessories || []).join(', '),
          Equipment: (saved.Equipment || []).join(', '),
        });
      } catch (err) {
        console.error('Failed to load wardrobe:', err);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const payload: Record<string, string[]> = {};
    Object.entries(inputs).forEach(([cat, val]) => {
      payload[cat] = val.split(',').map((s) => s.trim()).filter(Boolean);
    });
    try {
      await setData('users/testUser123/wardrobe', payload);
      alert('Wardrobe saved!');
      navigate('/search');
    } catch {
      alert('Save failed');
    }
  };

  return (
    <div>
      <Wardrobe
        inputs={inputs}
        show={true}
        editing={editing}
        onEdit={() => setEditing(true)}
        onChange={(cat, val) => setInputs((prev) => ({ ...prev, [cat]: val }))}
        onSave={handleSave}
      />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={() => navigate('/search')} className="search-button">
          Back to Search
        </button>
      </div>
    </div>
  );
};

export default WardrobePage;
