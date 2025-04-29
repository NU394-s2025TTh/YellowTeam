import './SearchBar.css';

import React from 'react';

interface Props {
  location: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onToggleWardrobe: () => void;
  showWardrobe: boolean;
  loading: boolean; // <-- NEW
}

export default function SearchBar({
  location,
  onChange,
  onSearch,
  onToggleWardrobe,
  showWardrobe,
  loading, // <-- NEW
}: Props) {
  return (
    <div className="search-gear-bar">
      <input
        type="text"
        placeholder="Enter resort name (e.g., Park City)"
        value={location}
        onChange={onChange}
        className="location-input"
      />
      <button
        onClick={onSearch}
        className="search-button"
        disabled={loading} // disable button while loading
      >
        {loading ? 'Loading...' : 'Search'}
      </button>
      <button onClick={onToggleWardrobe} className="search-button add-gear-button">
        {showWardrobe ? 'Hide Wardrobe' : 'My Wardrobe'}
      </button>
    </div>
  );
}
