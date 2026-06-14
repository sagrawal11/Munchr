'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from '../src/components/SearchBar';
import ProductImage from '../src/components/ProductImage';
import Modal from '../src/components/Modal';
import VendingMachineItemCard from '../src/components/VendingMachineItemCard';
import VendingMachineCard from '../src/components/VendingMachineCard';
import { groupProductsByCategory } from '../src/data/productCategories';
import { vendingMachines } from '../src/data/vendingMachines';
import { calculateDistance } from '../src/utils/distance';
import { track } from '../lib/analytics';
import '../src/styles/MainPage.css';

const VendingMap = dynamic(() => import('../src/components/VendingMap'), { ssr: false });

const formatDistance = (distance) => {
  if (distance < 0.1) return `${Math.round(distance * 5280)} ft`;
  return `${distance.toFixed(1)} mi`;
};

// ============== SEARCH SYSTEM ==============

const createProductAliases = () => ({
  'purple doritos': 'doritos spicy sweet chili',
  'spicy sweet chili doritos': 'doritos spicy sweet chili',
  'spicy doritos': 'doritos spicy sweet chili',
  'sweet chili doritos': 'doritos spicy sweet chili',
  'red doritos': 'doritos nacho cheese',
  'orange doritos': 'doritos nacho cheese',
  'nacho cheese doritos': 'doritos nacho cheese',
  'classic doritos': 'doritos nacho cheese',
  'cheese doritos': 'doritos nacho cheese',
  'nacho doritos': 'doritos nacho cheese',
  'blue doritos': 'doritos cool ranch',
  'cool ranch doritos': 'doritos cool ranch',
  'ranch doritos': 'doritos cool ranch',
  'classic lays': 'lays classic',
  'original lays': 'lays classic',
  'regular lays': 'lays classic',
  'bbq lays': 'lays barbecue',
  'lays bbq': 'lays barbecue',
  'barbecue lays': 'lays barbecue',
  'sour cream and onion lays': 'lays sour cream & onion',
  'lays sour cream and onion': 'lays sour cream & onion',
  'sour cream & onion lays': 'lays sour cream & onion',
  'salt and vinegar lays': 'lays salt & vinegar',
  'lays salt and vinegar': 'lays salt & vinegar',
  'salt & vinegar lays': 'lays salt & vinegar',
  'salt lays': 'lays salt & vinegar',
  'regular cheetos': 'cheetos',
  'original cheetos': 'cheetos',
  'spicy cheetos': 'cheetos cheddar jalepeno',
  'hot cheetos': 'cheetos cheddar jalepeno',
  'cheetos cheddar & jalepeno': 'cheetos cheddar jalepeno',
  'cheetos cheddar and jalepeno': 'cheetos cheddar jalepeno',
  'cheddar and jalepeno cheetos': 'cheetos cheddar jalepeno',
  'cheddar & jalepeno cheetos': 'cheetos cheddar jalepeno',
  'coke': 'coca cola',
  'coca-cola': 'coca cola',
  'classic coke': 'coca cola',
  'diet coca cola': 'diet coke',
  'coca cola zero': 'coke zero',
  'mtn dew': 'mountain dew',
  'dew': 'mountain dew',
  'dr pepper': 'dr. pepper',
  'doctor pepper': 'dr. pepper',
  'reeses': "reese's peanut butter cups",
  'reeses cups': "reese's peanut butter cups",
  'reeses peanut butter cups': "reese's peanut butter cups",
  "reese's cups": "reese's peanut butter cups",
  'peanut butter cups': "reese's peanut butter cups",
  'chocolate peanut butter cups': "reese's peanut butter cups",
  'kit kat': 'kitkat',
  'kit-kat': 'kitkat',
  "snicker's": 'snickers',
});

const normalizeProductName = (product) =>
  product.toLowerCase().replace(/['']/g, '').replace(/[&]/g, 'and').replace(/\s+/g, ' ').trim();

class VendingMachineSearch {
  constructor(machines) {
    this.machines = machines;
    this.aliasLookup = {};
    Object.entries(createProductAliases()).forEach(([alias, canonical]) => {
      this.aliasLookup[normalizeProductName(alias)] = normalizeProductName(canonical);
    });
  }

  getCanonical(term) {
    const n = normalizeProductName(term);
    return this.aliasLookup[n] || n;
  }

  productMatches(machineProduct, searchTerm) {
    const norm = normalizeProductName(machineProduct);
    const canonical = this.getCanonical(searchTerm);
    return norm.includes(canonical) || this.getCanonical(machineProduct).includes(canonical);
  }

  search(searchTerm, userLocation = null) {
    if (!searchTerm.trim()) return { results: [], searchType: 'empty' };
    const norm = normalizeProductName(searchTerm);
    const productResults = this.searchByProduct(norm, userLocation);
    if (productResults.results.length > 0) return productResults;
    return this.searchByLocation(norm, userLocation);
  }

  searchByProduct(searchTerm, userLocation) {
    const results = [];
    this.machines.forEach(machine => {
      const matchingProducts = machine.products.filter(p => this.productMatches(p, searchTerm));
      if (matchingProducts.length > 0) {
        results.push({ machine, products: matchingProducts, searchType: 'product', relevanceScore: matchingProducts.length });
      }
    });
    if (userLocation) {
      results.forEach(r => {
        r.distance = calculateDistance(userLocation.latitude, userLocation.longitude, r.machine.location[0], r.machine.location[1]);
      });
      results.sort((a, b) => a.distance - b.distance);
    } else {
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    return { results, searchType: 'product' };
  }

  searchByLocation(locationTerm, userLocation) {
    const results = [];
    this.machines.forEach(machine => {
      if (
        normalizeProductName(machine.name).includes(locationTerm) ||
        normalizeProductName(machine.building).includes(locationTerm)
      ) {
        results.push({ machine, products: machine.products, searchType: 'location', relevanceScore: 1 });
      }
    });
    if (userLocation) {
      results.forEach(r => {
        r.distance = calculateDistance(userLocation.latitude, userLocation.longitude, r.machine.location[0], r.machine.location[1]);
      });
      results.sort((a, b) => a.distance - b.distance);
    }
    return { results, searchType: 'location' };
  }
}

// ============== MAIN COMPONENT ==============

const campusBuildings = {
  west: ['LSRC', 'Physics', 'Teer', 'Wilkinson', 'Rueben Cooke', 'Social Sciences', 'Allen', 'Perkins', 'Wu', 'BC', 'Flowers', 'Few', 'Wilson Recreation Center', 'Craven', 'Wannamaker', 'Crowell', 'Kilgo', 'Fitzpatrick', 'Keohane', 'Arts Annex', 'Rubenstein Arts Center'],
  east: ['Pegram', 'Bassett', 'Brown', 'Alspaugh', 'Giles', 'Wilson Residence', 'West House', 'Eastern Union', 'West Duke', 'Brodie', 'Blackwell', 'Randolph', 'Bell Tower', 'Trinity', 'Southgate', 'Gilbert Addoms', 'Classroom', 'Biddle', 'Friedl'],
};

export default function MainPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMachines, setVisibleMachines] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [campusFilter, setCampusFilter] = useState('both');
  const [clearTrigger, setClearTrigger] = useState(0);
  const searchInputRef = useRef(null);
  const [inlineMachineProducts, setInlineMachineProducts] = useState(null);
  const [inlineExpandedCategories, setInlineExpandedCategories] = useState({});
  const [contentAnimKey, setContentAnimKey] = useState(0);
  const [campusMismatchModal, setCampusMismatchModal] = useState({ open: false, campus: '', building: '', machines: [] });
  // Catalog: defaults to the static file, then swaps to live Supabase data once loaded.
  const [machines, setMachines] = useState(vendingMachines);

  const getMachineCampus = React.useCallback((machine) => {
    if (campusBuildings.west.some(b => machine.building.includes(b))) return 'west';
    if (campusBuildings.east.some(b => machine.building.includes(b))) return 'east';
    return 'west';
  }, []);

  const getFilteredMachines = React.useCallback((machines) => {
    if (campusFilter === 'both') return machines;
    return machines.filter(m => getMachineCampus(m) === campusFilter);
  }, [campusFilter, getMachineCampus]);

  const searchEngine = React.useMemo(() => new VendingMachineSearch(machines), [machines]);

  // Load the live catalog from Supabase; fall back to the static file on any failure.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/machines')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!cancelled && data?.machines?.length) setMachines(data.machines);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const getUserLocation = React.useCallback(() => {
    if (!navigator.geolocation) { alert('Geolocation is not supported by your browser'); return; }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setUserLocation(loc);
        setLocationPermission('granted');
        setIsLoadingLocation(false);
        track.locationEnabled();
        if (searchPerformed && searchTerm) {
          const result = searchEngine.search(searchTerm, loc);
          setSearchResults(result.results);
        }
      },
      (error) => {
        setLocationPermission('denied');
        setIsLoadingLocation(false);
        track.locationDenied();
        if (error.code === 1) alert('Location permission denied. Enable location services to see nearby vending machines.');
        else if (error.code === 2) alert('Location information is unavailable.');
        else if (error.code === 3) alert('The request to get user location timed out.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [searchPerformed, searchTerm, searchEngine]);

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(status => {
          setLocationPermission(status.state);
          if (status.state === 'granted') getUserLocation();
        })
        .catch(() => {});
    }
  }, [getUserLocation]);

  const handleSearch = (term) => {
    if (!term.trim()) { clearSearch(); return; }
    setInlineMachineProducts(null);

    const searchResult = searchEngine.search(term, userLocation);

    if (searchResult.results.length > 0 && searchResult.results[0].searchType === 'location' && campusFilter !== 'both') {
      const buildingCampus = getMachineCampus(searchResult.results[0].machine);
      if (buildingCampus !== campusFilter) {
        setCampusMismatchModal({
          open: true, campus: buildingCampus,
          building: searchResult.results[0].machine.building,
          machines: searchResult.results.map(r => r.machine),
        });
        return;
      }
    }

    const filteredResults = searchResult.results.filter(r => campusFilter === 'both' || getMachineCampus(r.machine) === campusFilter);

    setSearchResults(filteredResults);
    setSearchPerformed(true);
    setSearchTerm(term);
    setVisibleMachines(filteredResults.map(r => r.machine));
    setContentAnimKey(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track the search event
    const normalized = normalizeProductName(term);
    if (filteredResults.length === 0) {
      track.noResults(term, campusFilter);
    } else {
      track.search(term, normalized, filteredResults.length, campusFilter);
    }
  };

  const handleCampusFilterChange = (newFilter) => {
    setCampusFilter(newFilter);
    track.campusFilter(newFilter);
    if (searchPerformed && searchTerm) {
      const result = searchEngine.search(searchTerm, userLocation);
      const filtered = result.results.filter(r => newFilter === 'both' || getMachineCampus(r.machine) === newFilter);
      setSearchResults(filtered);
      setVisibleMachines(filtered.map(r => r.machine));
    } else {
      setVisibleMachines(getFilteredMachines(machines));
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setSearchPerformed(false);
    setSearchTerm('');
    setVisibleMachines(getFilteredMachines(machines));
    setInlineMachineProducts(null);
    setClearTrigger(prev => prev + 1);
    setContentAnimKey(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => setVisibleMachines(getFilteredMachines(machines)), 150);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!searchPerformed) setVisibleMachines(getFilteredMachines(machines));
  }, [campusFilter, searchPerformed, machines]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMachineClick = (machine) => {
    setInlineMachineProducts({ machine });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    track.machineClicked(String(machine.id), machine.building, campusFilter);
  };

  const renderGroupedProductList = (machine) => {
    const grouped = groupProductsByCategory(machine.products || []);
    return (
      <div className="grouped-products">
        {Object.entries(grouped).map(([category, products]) => {
          const key = `${machine.id}-${category}`;
          const isExpanded = inlineExpandedCategories[key] !== false;
          return (
            <div key={category} className="product-category">
              <div
                className="category-header"
                onClick={() => setInlineExpandedCategories(prev => ({ ...prev, [key]: !isExpanded }))}
                style={{ cursor: 'pointer' }}
              >
                <h5>{category} ({products.length})</h5>
                <span className="dropdown-icon">{isExpanded ? '▼' : '►'}</span>
              </div>
              {isExpanded && (
                <div className="category-products">
                  {products.map((product, idx) => (
                    <VendingMachineItemCard key={product + idx} product={product} machine={machine} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSearchResults = () => {
    if (inlineMachineProducts?.machine) {
      const products = inlineMachineProducts.machine.products || [];
      return (
        <div className="results-list">
          <div className="inline-header-row">
            <button className="inline-back-btn" onClick={() => setInlineMachineProducts(null)} aria-label="Back">
              <span className="inline-back-chevron">&#8249;</span>
            </button>
            <span className="inline-machine-name">{inlineMachineProducts.machine.name}</span>
            {inlineMachineProducts.machine.creditCardOnly && (
              <span className="credit-card-only-badge">Credit card only</span>
            )}
          </div>
          {products.length === 0
            ? <div style={{ color: '#64748b', textAlign: 'center', margin: '2rem 0' }}>No products found for this machine.</div>
            : renderGroupedProductList(inlineMachineProducts.machine)
          }
        </div>
      );
    }

    if (searchPerformed && searchResults.length === 0) {
      return <p className="no-results">No results found. Try a different search term.</p>;
    }

    if (searchResults.length > 0 && searchResults[0].searchType === 'location') {
      const buildingGroups = {};
      searchResults.forEach(r => {
        const b = r.machine.building;
        if (!buildingGroups[b]) buildingGroups[b] = [];
        buildingGroups[b].push(r.machine);
      });
      const buildings = Object.keys(buildingGroups);

      if (buildings.length === 1 && buildingGroups[buildings[0]].length > 1) {
        return (
          <div className="results-list">
            <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Which machine in {buildings[0]}?</h2>
            {buildingGroups[buildings[0]].map(machine => (
              <VendingMachineCard key={machine.id} machine={machine} onClick={() => handleMachineClick(machine)} />
            ))}
          </div>
        );
      }

      if (buildings.length === 1 && buildingGroups[buildings[0]].length === 1) {
        const machine = buildingGroups[buildings[0]][0];
        return (
          <div className="results-list">
            <div className="inline-header-row">
              <button className="inline-back-btn" onClick={clearSearch} aria-label="Back">
                <span className="inline-back-chevron">&#8249;</span>
              </button>
              <span className="inline-machine-name">{machine.name}</span>
              {machine.creditCardOnly && <span className="credit-card-only-badge">Credit card only</span>}
            </div>
            {renderGroupedProductList(machine)}
          </div>
        );
      }

      const allItems = [];
      searchResults.forEach(r => r.products.forEach(product => allItems.push({ product, machine: r.machine })));
      return (
        <div className="results-list">
          {allItems.map((item, idx) => (
            <VendingMachineItemCard key={item.product + idx} product={item.product} machine={item.machine} />
          ))}
        </div>
      );
    }

    if (searchResults.length > 0) {
      return (
        <div className="results-list">
          {searchResults.map((result, index) => (
            <div key={index} className="result-item">
              <div className="result-content">
                <div className="result-header">
                  <h4>{result.machine.name}</h4>
                  <div className="result-badges">
                    {result.machine.creditCardOnly && <span className="credit-card-only-badge">Credit card only</span>}
                    {result.distance !== undefined && <span className="distance-badge">{formatDistance(result.distance)}</span>}
                  </div>
                </div>
                <p><strong>Location:</strong> {result.machine.building}, {result.machine.floor}</p>
                <p><strong>Notes:</strong> {result.machine.notes}</p>
                {result.searchType === 'product' && (
                  <div className="found-products">
                    <p><strong>Found Products:</strong> {result.products.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="main-page">
      <div className="page-container">
        <div className="content-container">
          <div className="container main-content">
            <div key={contentAnimKey} className="main-content-inner" style={{ animation: 'slideUp 0.6s ease-out' }}>
              <div className="search-section">
                <h2>Find Snacks & Drinks</h2>
                <div className="search-container">
                  <SearchBar onSearch={handleSearch} inputRef={searchInputRef} clearTrigger={clearTrigger} />
                  <div className="campus-filter">
                    <select value={campusFilter} onChange={e => handleCampusFilterChange(e.target.value)} className="campus-select">
                      <option value="both">Both Campuses</option>
                      <option value="west">West Campus</option>
                      <option value="east">East Campus</option>
                    </select>
                  </div>
                  <button className="clear-button" onClick={clearSearch}>Reset</button>
                </div>

                <div className="location-section">
                  <button
                    className={`location-button ${locationPermission === 'granted' ? 'active' : ''}`}
                    onClick={getUserLocation}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? 'Getting location...' :
                      locationPermission === 'granted' ? 'Update My Location' : 'Enable Location Services (optional)'}
                    <div className="location-info-icon">
                      i
                      <div className="location-tooltip">
                        Used to show your distance from vending machines and sort results by proximity. Your location is never stored or shared.
                      </div>
                    </div>
                  </button>
                  {userLocation && (
                    <p className="location-status">Location services enabled. *Location may not be 100% accurate*</p>
                  )}
                </div>

                {searchPerformed && (
                  <div className="search-results">
                    <div className="search-results-header">
                      {searchResults.length > 0 && searchResults[0].searchType === 'product' && (
                        <div className="product-header">
                          <ProductImage productName={searchTerm} size="large" className="search-product-image" />
                          <div className="product-header-text">
                            <h3>{searchTerm}</h3>
                            <p className="product-subtitle">
                              Found in {searchResults.length} vending machine{searchResults.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {renderSearchResults()}
                  </div>
                )}
                {!searchPerformed && (
                  <div className="search-results">{renderSearchResults()}</div>
                )}
              </div>
            </div>

            <div className="map-section">
              <h2>
                {searchPerformed && searchTerm ? `Vending Machines with "${searchTerm}"` : 'Campus Vending Machine Map'}
              </h2>
              <div className="map-container">
                <VendingMap
                  visibleMachines={visibleMachines}
                  inlineMachine={inlineMachineProducts?.machine || null}
                  userLocation={userLocation}
                  onMachineClick={handleMachineClick}
                />
              </div>
            </div>
          </div>

          <Modal isOpen={campusMismatchModal.open} onClose={() => setCampusMismatchModal({ open: false, campus: '', building: '', machines: [] })}>
            <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>Building on Different Campus</h2>
              <p style={{ marginBottom: '1.5rem' }}>
                The building <strong>{campusMismatchModal.building}</strong> is on{' '}
                <strong>{campusMismatchModal.campus.charAt(0).toUpperCase() + campusMismatchModal.campus.slice(1)} Campus</strong>.<br />
                Would you like to view its items?
              </p>
              <div className="modal-btn-row" style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
                <button
                  className="modal-btn-blue"
                  onClick={() => {
                    setCampusFilter(campusMismatchModal.campus);
                    setCampusMismatchModal({ open: false, campus: '', building: '', machines: [] });
                    setSearchResults(campusMismatchModal.machines.map(m => ({ machine: m, products: m.products, searchType: 'location', relevanceScore: 1 })));
                    setSearchPerformed(true);
                    setSearchTerm(campusMismatchModal.building);
                    setVisibleMachines(campusMismatchModal.machines);
                    setContentAnimKey(prev => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ minWidth: 120, height: 48, fontSize: 16, fontWeight: 600, borderRadius: 12, border: 'none', color: 'white', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 4px 15px rgba(59,130,246,0.18)', cursor: 'pointer' }}
                >
                  Yes, show items
                </button>
                <button
                  className="clear-button"
                  onClick={() => setCampusMismatchModal({ open: false, campus: '', building: '', machines: [] })}
                  style={{ minWidth: 120, height: 48, fontSize: 16, fontWeight: 600, borderRadius: 12, border: '2px solid #f87171', background: '#f87171', color: 'white', boxShadow: '0 4px 15px rgba(248,113,113,0.18)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>

    </div>
  );
}
