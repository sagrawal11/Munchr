import React from 'react';
import './FilterChips.css';

const CHIP_OPTIONS = [
  { id: 'nearby', label: '📍 Nearby', category: null, special: 'nearby' },
  { id: 'drinks', label: '🥤 Drinks', category: 'Sodas & Drinks' },
  { id: 'energy', label: '⚡ Energy', category: 'Energy/Electrolyte Drinks' },
  { id: 'chips', label: '🍿 Chips', category: 'Chips & Savory Snacks' },
  { id: 'candy', label: '🍬 Candy', category: 'Candy & Sweets' },
  { id: 'healthy', label: '🥜 Healthy', category: 'Healthy Snacks' },
];

const FilterChips = ({ activeChip, onChipClick, locationEnabled }) => {
  return (
    <div className="filter-chips" role="group" aria-label="Quick category filters">
      {CHIP_OPTIONS.map(chip => {
        if (chip.special === 'nearby' && !locationEnabled) return null;
        const isActive = activeChip === chip.id;
        return (
          <button
            key={chip.id}
            className={`filter-chip ${isActive ? 'filter-chip--active' : ''}`}
            onClick={() => onChipClick(isActive ? null : chip.id)}
            aria-pressed={isActive}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};

export { CHIP_OPTIONS };
export default FilterChips;
