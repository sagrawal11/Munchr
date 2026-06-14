import React, { useState, useEffect, useRef } from 'react';
import { getSuggestions } from '../utils/productUtils';
import { getProductLabel } from '../data/productCategories';
import ProductImage from './ProductImage';
import { getBuildingImage } from '../utils/productImages';
import './SearchBar.css';

function SearchBar({ onSearch, inputRef, clearTrigger }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef(null);

  // Clear search when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [clearTrigger]);

  // Update suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const newSuggestions = getSuggestions(searchTerm);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [searchTerm]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex].value);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSearch(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="search-container-wrapper">
      <form className="search-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search for snacks, drinks, or buildings..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="search-input"
          ref={inputRef}
          aria-label="Search for snacks, drinks, or buildings"
          autoComplete="off"
        />
        <button type="submit" className="search-button" aria-label="Search">
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container" ref={suggestionsRef}>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.type + '-' + suggestion.value}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => selectSuggestion(suggestion.value)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="suggestion-content">
                  {suggestion.type === 'product' ? (
                    <ProductImage
                      productName={suggestion.value}
                      size="small"
                      className="suggestion-image"
                    />
                  ) : (
                    <img
                      src={getBuildingImage(suggestion.value)}
                      alt={suggestion.value}
                      className="suggestion-image"
                      style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', background: '#e5e7eb' }}
                    />
                  )}
                  <span className="suggestion-text">
                    {suggestion.value}
                    {suggestion.type === 'building' && suggestion.alias ? (
                      <span className="suggestion-alias"> ({suggestion.alias})</span>
                    ) : null}
                  </span>
                  <span className="suggestion-type">{suggestion.type === 'building' ? 'Building' : getProductLabel(suggestion.value)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchBar;