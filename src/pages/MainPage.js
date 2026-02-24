import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SearchBar from '../components/SearchBar';
import ProductImage from '../components/ProductImage';
import Modal from '../components/Modal';
import VendingMachineItemCard from '../components/VendingMachineItemCard';
import VendingMachineCard from '../components/VendingMachineCard';
import FloatingActionButton from '../components/FloatingActionButton';
import SubmissionModal from '../components/SubmissionModal';
import Navigation from '../components/Navigation';
import { groupProductsByCategory } from '../data/productCategories';
import { vendingMachines } from '../data/vendingMachines';
import './MainPage.css';

import { calculateDistance } from '../utils/distance';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Distance calculation function
const formatDistance = (distance) => {
  if (distance < 0.1) {
    // Convert to feet if less than 0.1 miles
    return `${Math.round(distance * 5280)} ft`;
  }
  return `${distance.toFixed(1)} mi`;
};

// Create a component to handle map updates
function MapUpdater({ visibleMachines, userLocation }) {
  const map = useMap();
  
  // Fit map bounds to visible markers and user location
  React.useEffect(() => {
    if (!map) return;
    
    try {
      // Add longer delay for campus filter changes to ensure DOM is ready
      const timer = setTimeout(() => {
        if (map && map.getContainer() && visibleMachines.length > 0) {
          const points = [...visibleMachines.map(machine => machine.location)];
          
          // Include user location in bounds if available
          if (userLocation) {
            points.push([userLocation.latitude, userLocation.longitude]);
          }
          
          if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            // Additional safety check
            if (map._container) {
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          }
        }
      }, 200); // Increased delay
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.warn('Map update error:', error);
    }
  }, [visibleMachines, userLocation, map]);
  
  return null;
}

// User location marker component
function UserLocationMarker({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    try {
      if (position && map.getContainer()) {
        map.flyTo(position, map.getZoom());
      }
    } catch (error) {
      console.warn('User location marker error:', error);
    }
  }, [position, map]);
  
  if (!position) return null;
  
  return (
    <>
      <Circle 
        center={position} 
        radius={4} 
        pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.65 }} 
      />
    </>
  );
}

// ============== SIMPLIFIED SEARCH SYSTEM ==============

// Product aliases - mapping alternative names to the actual product names
const createProductAliases = () => {
  return {

    // Doritos variations
    "purple doritos": "doritos spicy sweet chili",
    "spicy sweet chili doritos": "doritos spicy sweet chili",
    "spicy doritos": "doritos spicy sweet chili",
    "sweet chili doritos": "doritos spicy sweet chili",

    "red doritos": "doritos nacho cheese",
    "orange doritos": "doritos nacho cheese",
    "nacho cheese doritos": "doritos nacho cheese",
    "classic doritos": "doritos nacho cheese",
    "cheese doritos": "doritos nacho cheese",
    "nacho doritos": "doritos nacho cheese",

    "blue doritos": "doritos cool ranch",
    "cool ranch doritos": "doritos cool ranch",
    "ranch doritos": "doritos cool ranch",
    
    // Lays variations
    "classic lays": "lays classic",
    "original lays": "lays classic",
    "regular lays": "lays classic",

    "bbq lays": "lays barbecue",
    "lays bbq": "lays barbecue",
    "barbecue lays": "lays barbecue",

    "sour cream and onion lays": "lays sour cream & onion",
    "lays sour cream and onion": "lays sour cream & onion",
    "sour cream & onion lays": "lays sour cream & onion",

    "salt and vinegar lays": "lays salt & vinegar",
    "lays salt and vinegar": "lays salt & vinegar",
    "salt & vinegar lays": "lays salt & vinegar",
    "salt lays": "lays salt & vinegar",

    // Cheetos variations
    "regular cheetos": "cheetos",
    "original cheetos": "cheetos",

    "spicy cheetos": "cheetos cheddar jalepeno",
    "hot cheetos": "cheetos cheddar jalepeno",
    "cheetos cheddar & jalepeno": "cheetos cheddar jalepeno",
    "cheetos cheddar and jalepeno": "cheetos cheddar jalepeno",
    "cheddar and jalepeno cheetos": "cheetos cheddar jalepeno",
    "cheddar & jalepeno cheetos": "cheetos cheddar jalepeno",

    // Drinks
    "coke": "coca cola",
    "coca-cola": "coca cola",
    "classic coke": "coca cola",
  
    "diet coca cola": "diet coke",
    "coca cola zero": "coke zero",

    "mtn dew": "mountain dew",
    "dew": "mountain dew",
    "dr pepper": "dr. pepper",
    "doctor pepper": "dr. pepper",
    
    // Candy
    "reeses": "reese's peanut butter cups",
    "reeses cups": "reese's peanut butter cups",
    "reeses peanut butter cups": "reese's peanut butter cups",
    "reese's cups": "reese's peanut butter cups",
    "peanut butter cups": "reese's peanut butter cups",
    "chocolate peanut butter cups": "reese's peanut butter cups",

    "kit kat": "kitkat",
    "kit-kat": "kitkat",
    "snicker's": "snickers",
  };
};

// Normalize product names for better matching
const normalizeProductName = (product) => {
  return product
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[&]/g, 'and') // Replace & with 'and'
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Simple search class focused on product name matching
class VendingMachineSearch {
  constructor(machines) {
    this.machines = machines;
    this.productAliases = createProductAliases();
    
    // Create reverse lookup for aliases
    this.aliasLookup = {};
    Object.entries(this.productAliases).forEach(([alias, canonical]) => {
      this.aliasLookup[normalizeProductName(alias)] = normalizeProductName(canonical);
    });
  }
  
  // Get the canonical product name from an alias or return the original
  getCanonicalProductName(searchTerm) {
    const normalized = normalizeProductName(searchTerm);
    return this.aliasLookup[normalized] || normalized;
  }
  
  // Check if a machine product matches the search term
  productMatches(machineProduct, searchTerm) {
    const normalizedMachineProduct = normalizeProductName(machineProduct);
    const canonicalSearchTerm = this.getCanonicalProductName(searchTerm);
    
    // Direct match with canonical name
    if (normalizedMachineProduct.includes(canonicalSearchTerm)) {
      return true;
    }
    
    // Check if the machine product when canonicalized matches the search
    const canonicalMachineProduct = this.getCanonicalProductName(machineProduct);
    if (canonicalMachineProduct.includes(canonicalSearchTerm)) {
      return true;
    }
    
    return false;
  }
  
  // Main search function
  search(searchTerm, userLocation = null) {
    if (!searchTerm.trim()) {
      return {
        results: [],
        searchType: 'empty'
      };
    }
    
    const normalizedSearch = normalizeProductName(searchTerm);
    
    // Try product search first
    const productResults = this.searchByProduct(normalizedSearch, userLocation);
    if (productResults.results.length > 0) {
      return productResults;
    }
    
    // If no product results, try location search
    return this.searchByLocation(normalizedSearch, userLocation);
  }
  
  searchByProduct(searchTerm, userLocation) {
    const results = [];
    
    this.machines.forEach(machine => {
      const matchingProducts = machine.products.filter(product => 
        this.productMatches(product, searchTerm)
      );
      
      if (matchingProducts.length > 0) {
        results.push({
          machine,
          products: matchingProducts,
          searchType: 'product',
          relevanceScore: matchingProducts.length
        });
      }
    });
    
    // Add distance information and sort
    if (userLocation) {
      results.forEach(result => {
        result.distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          result.machine.location[0],
          result.machine.location[1]
        );
      });
      results.sort((a, b) => a.distance - b.distance);
    } else {
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    return {
      results,
      searchType: 'product'
    };
  }
  
  searchByLocation(locationTerm, userLocation) {
    const results = [];
    
    this.machines.forEach(machine => {
      if (
        normalizeProductName(machine.name).includes(locationTerm) ||
        normalizeProductName(machine.building).includes(locationTerm)
      ) {
        results.push({
          machine,
          products: machine.products,
          searchType: 'location',
          relevanceScore: 1
        });
      }
    });
    
    if (userLocation) {
      results.forEach(result => {
        result.distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          result.machine.location[0],
          result.machine.location[1]
        );
      });
      results.sort((a, b) => a.distance - b.distance);
    }
    
    return {
      results,
      searchType: 'location'
    };
  }
}

// ============== MAIN COMPONENT ==============

function MainPage() {
  // Duke University campus center coordinates
  const dukeCenter = [36.0014, -78.9382];
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleMachines, setVisibleMachines] = useState([]);
  

  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [campusFilter, setCampusFilter] = useState('both'); // 'east', 'west', 'both'
  const [clearTrigger, setClearTrigger] = useState(0); // Counter to trigger clearing
  const searchInputRef = useRef(null);
  const [inlineMachineProducts, setInlineMachineProducts] = useState(null); // {machine: ...} or null
  // State for expanded/collapsed product categories in the inline product list
  const [inlineExpandedCategories, setInlineExpandedCategories] = useState({});
  const [contentAnimKey, setContentAnimKey] = useState(0);
  const [campusMismatchModal, setCampusMismatchModal] = useState({ open: false, campus: '', building: '', machines: [] });
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  // Define which buildings are on which campus
  const campusBuildings = {
    west: ['LSRC', 'Physics', 'Teer', 'Wilkinson', 'Rueben Cooke', 'Social Sciences', 'Allen', 'Perkins', 'Wu', 'BC', 'Flowers', 'Few', 'Wilson Recreation Center', 'Craven', 'Wannamaker', 'Crowell', 'Kilgo', 'Fitzpatrick', 'Keohane', 'Arts Annex', 'Rubenstein Arts Center'],
    east: ['Pegram', 'Bassett', 'Brown', 'Alspaugh', 'Giles', 'Wilson Residence', 'West House', 'Eastern Union', 'West Duke', 'Brodie', 'Blackwell', 'Randolph', 'Bell Tower', 'Trinity', 'Southgate', 'Gilbert Addoms', 'Classroom', 'Biddle', 'Friedl']
  };
  
  // Function to determine which campus a machine is on
  const getMachineCampus = React.useCallback((machine) => {
    if (campusBuildings.west.some(building => machine.building.includes(building))) {
      return 'west';
    } else if (campusBuildings.east.some(building => machine.building.includes(building))) {
      return 'east';
    }
    // Default to west if building not found in either list
    return 'west';
  }, [campusBuildings.east, campusBuildings.west]);
  
  // Filter machines based on campus selection
  const getFilteredMachines = React.useCallback((machines) => {
    if (campusFilter === 'both') {
      return machines;
    }
    return machines.filter(machine => getMachineCampus(machine) === campusFilter);
  }, [campusFilter, getMachineCampus]);
  
  // Initialize the search engine
  const searchEngine = React.useMemo(() => {
    return new VendingMachineSearch(vendingMachines);
  }, []);
  

  
  // Request user location
  const getUserLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLoadingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationPermission('granted');
        setIsLoadingLocation(false);
        
        // If there's already a search performed, re-run search to update distances
        if (searchPerformed && searchTerm) {
          const searchResult = searchEngine.search(searchTerm, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setSearchResults(searchResult.results);
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        setLocationPermission('denied');
        setIsLoadingLocation(false);
        
        if (error.code === 1) { // Permission denied
          alert("Location permission denied. Enable location services to see nearby vending machines.");
        } else if (error.code === 2) { // Position unavailable
          alert("Location information is unavailable.");
        } else if (error.code === 3) { // Timeout
          alert("The request to get user location timed out.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [searchPerformed, searchTerm, searchEngine]);

  // Get user location on component mount
  useEffect(() => {
    const checkLocationPermission = () => {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' })
          .then(permissionStatus => {
            setLocationPermission(permissionStatus.state);
            // If permission is already granted, get location automatically
            if (permissionStatus.state === 'granted') {
              getUserLocation();
            }
          })
          .catch(error => {
            console.error("Error checking location permission:", error);
          });
      }
    };
    
    checkLocationPermission();
  }, [getUserLocation]);
  
  // Main search handler
  const handleSearch = (term) => {
    if (!term.trim()) {
      clearSearch();
      return;
    }

    // Always clear inline machine view when a new search is performed
    setInlineMachineProducts(null);

    const searchResult = searchEngine.search(term, userLocation);

    // If the search is a location search and the campus filter is not 'both', check for campus mismatch
    if (searchResult.results.length > 0 && searchResult.results[0].searchType === 'location' && campusFilter !== 'both') {
      // All results are for the same building, so check the campus of the first result
      const buildingCampus = getMachineCampus(searchResult.results[0].machine);
      if (buildingCampus !== campusFilter) {
        setCampusMismatchModal({
          open: true,
          campus: buildingCampus,
          building: searchResult.results[0].machine.building,
          machines: searchResult.results.map(r => r.machine)
        });
        // Don't update results yet
        return;
      }
    }

    // Apply campus filter to search results
    const filteredResults = {
      ...searchResult,
      results: searchResult.results.filter(result => {
        if (campusFilter === 'both') return true;
        return getMachineCampus(result.machine) === campusFilter;
      })
    };

    setSearchResults(filteredResults.results);
    setSearchPerformed(true);
    setSearchTerm(term);

    // Update visible machines with campus filter applied
    const matchingMachines = filteredResults.results.map(result => result.machine);
    setVisibleMachines(matchingMachines);

    // Animate content in
    setContentAnimKey(prev => prev + 1);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle campus filter change
  const handleCampusFilterChange = (newFilter) => {
    setCampusFilter(newFilter);
    
    // If there's an active search, re-run it with the new filter
    if (searchPerformed && searchTerm) {
      const searchResult = searchEngine.search(searchTerm, userLocation);
      const filteredResults = {
        ...searchResult,
        results: searchResult.results.filter(result => {
          if (newFilter === 'both') return true;
          return getMachineCampus(result.machine) === newFilter;
        })
      };
      
      setSearchResults(filteredResults.results);
      setVisibleMachines(filteredResults.results.map(result => result.machine));
    } else {
      // If no search is active, just update the visible machines on the map
      setVisibleMachines(getFilteredMachines(vendingMachines));
    }
  };
  
  // Clear search function
  const clearSearch = () => {
    setSearchResults([]);
    setSearchPerformed(false);
    setSearchTerm('');
    setVisibleMachines(getFilteredMachines(vendingMachines));
    setInlineMachineProducts(null); // Clear inline product view
    // Trigger clearing the search input
    setClearTrigger(prev => prev + 1);
    // Re-trigger main content animation
    setContentAnimKey(prev => prev + 1);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Initialize visible machines with campus filter on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Add longer delay to prevent map errors during rapid updates
    const timer = setTimeout(() => {
      const filtered = getFilteredMachines(vendingMachines);
      setVisibleMachines(filtered);
    }, 150); // Increased delay
    
    return () => clearTimeout(timer);
  }, []); // Only run on mount, not when campusFilter or getFilteredMachines change
  
  // Handle campus filter changes separately
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!searchPerformed) {
      // Only update visible machines if no search is active
      const filtered = getFilteredMachines(vendingMachines);
      setVisibleMachines(filtered);
    }
  }, [campusFilter, searchPerformed]); // getFilteredMachines is stable, no need to include in deps
  

  
  // Render just category summaries for map popups (no individual items)
  const renderCategorySummary = (products) => {
    const groupedProducts = groupProductsByCategory(products);
    
    return (
      <div className="category-summary">
        {Object.entries(groupedProducts).map(([category, products]) => (
          <div key={category} className="category-item">
            <span className="category-name">{category}</span>
            <span className="category-count">({products.length})</span>
          </div>
        ))}
      </div>
    );
  };



  // Render grouped, collapsible product list for a machine
  const renderGroupedProductList = (machine) => {
    const grouped = groupProductsByCategory(machine.products || []);
    const categories = Object.entries(grouped);
    const elements = [];
    for (let i = 0; i < categories.length; i++) {
      const [category, products] = categories[i];
      const key = `${machine.id}-${category}`;
      const isExpanded = inlineExpandedCategories[key] !== false; // default to expanded
      elements.push(
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
    }
    return <div className="grouped-products">{elements}</div>;
  };

  // Render search results - always show products for inlineMachineProducts if set
  const renderSearchResults = () => {
    if (inlineMachineProducts && inlineMachineProducts.machine) {
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
          {products.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', margin: '2rem 0' }}>
              No products found for this machine.
            </div>
          ) : (
            renderGroupedProductList(inlineMachineProducts.machine)
          )}
        </div>
      );
    }
    // Only show 'no results' if a search has been performed
    if (searchPerformed && searchResults.length === 0) {
      return <p className="no-results">No results found. Try a different search term.</p>;
    }
    // Only check searchType if searchResults is not empty
    if (searchResults.length > 0 && searchResults[0].searchType === 'location') {
      // Group by building
      const buildingGroups = {};
      searchResults.forEach(result => {
        const b = result.machine.building;
        if (!buildingGroups[b]) buildingGroups[b] = [];
        buildingGroups[b].push(result.machine);
      });
      const buildings = Object.keys(buildingGroups);
      // If only one building and multiple machines, show machine cards inline
      if (buildings.length === 1 && buildingGroups[buildings[0]].length > 1) {
        return (
          <div className="results-list">
            <h2 style={{textAlign: 'center', marginBottom: '1rem'}}>Which machine in {buildings[0]}?</h2>
            {buildingGroups[buildings[0]].map((machine, idx) => (
              <VendingMachineCard
                key={machine.id}
                machine={machine}
                onClick={() => setInlineMachineProducts({ machine })}
              />
            ))}
          </div>
        );
      }
      // If only one building and one machine, show grouped dropdowns for that machine
      if (buildings.length === 1 && buildingGroups[buildings[0]].length === 1) {
        const machine = buildingGroups[buildings[0]][0];
        return (
          <div className="results-list">
            <div className="inline-header-row">
              <button className="inline-back-btn" onClick={clearSearch} aria-label="Back">
                <span className="inline-back-chevron">&#8249;</span>
              </button>
              <span className="inline-machine-name">{machine.name}</span>
              {machine.creditCardOnly && (
                <span className="credit-card-only-badge">Credit card only</span>
              )}
            </div>
            {renderGroupedProductList(machine)}
          </div>
        );
      }
      // Otherwise, show all items in all matching machines as cards
      const allItems = [];
      searchResults.forEach(result => {
        result.products.forEach(product => {
          allItems.push({ product, machine: result.machine });
        });
      });
      return (
        <div className="results-list">
          {allItems.map((item, idx) => (
            <VendingMachineItemCard key={item.product + idx} product={item.product} machine={item.machine} />
          ))}
        </div>
      );
    }
    // For product search, show the default result cards
    if (searchResults.length > 0) {
      return (
        <div className="results-list">
          {searchResults.map((result, index) => (
            <div key={index} className="result-item">
              <div className="result-content">
                <div className="result-header">
                  <h4>{result.machine.name}</h4>
                  <div className="result-badges">
                    {result.machine.creditCardOnly && (
                      <span className="credit-card-only-badge">Credit card only</span>
                    )}
                    {result.distance !== undefined && (
                      <span className="distance-badge">
                        {formatDistance(result.distance)}
                      </span>
                    )}
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
        <Navigation />
        <div className="content-container">
          <div className="container main-content">
        <div key={contentAnimKey} className="main-content-inner" style={{animation: 'slideUp 0.6s ease-out'}}>
          <div className="search-section">
            <h2>Find Snacks & Drinks</h2>
            <div className="search-container">
              <SearchBar onSearch={handleSearch} inputRef={searchInputRef} clearTrigger={clearTrigger} />
              
              {/* Campus Filter */}
              <div className="campus-filter">
                <select 
                  value={campusFilter} 
                  onChange={(e) => handleCampusFilterChange(e.target.value)}
                  className="campus-select"
                >
                  <option value="both">Both Campuses</option>
                  <option value="west">West Campus</option>
                  <option value="east">East Campus</option>
                </select>
              </div>
              
              <button className="clear-button" onClick={clearSearch}>
                Reset
              </button>
            </div>
            
            {/* Location Button */}
            <div className="location-section">
              <button 
                className={`location-button ${locationPermission === 'granted' ? 'active' : ''}`}
                onClick={getUserLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? 'Getting location...' : 
                 locationPermission === 'granted' ? 'Update My Location' : 'Enable Location Services (optional)'}
                
                {/* Info icon with tooltip */}
                <div className="location-info-icon">
                  i
                  <div className="location-tooltip">
                    Used to show your distance from vending machines and sort results by proximity. Your location is never stored or shared.
                  </div>
                </div>
              </button>
              {userLocation && (
                <p className="location-status">
                  Location services enabled. *Location may not be 100% accurate*
                </p>
              )}
            </div>
            
            {searchPerformed && (
              <div className="search-results">
                <div className="search-results-header">
                  {searchResults.length > 0 && searchResults[0].searchType === 'product' && (
                    <div className="product-header">
                      <ProductImage 
                        productName={searchTerm} 
                        size="large" 
                        className="search-product-image" 
                      />
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
              <div className="search-results">
                {renderSearchResults()}
              </div>
            )}
          </div>
        </div>
        
        <div className="map-section">
          <h2>
            {searchPerformed && searchTerm ? 
              `Vending Machines with "${searchTerm}"` : 
              'Campus Vending Machine Map'
            }
          </h2>
          <div className="map-container">
            <MapContainer 
              center={dukeCenter} 
              zoom={16} 
              scrollWheelZoom={true} 
              style={{ height: "500px", width: "100%" }}
              key={`${inlineMachineProducts ? inlineMachineProducts.machine.id : visibleMachines.length}-${campusFilter}-${searchPerformed}`}
              whenCreated={(mapInstance) => {
                setTimeout(() => {
                  if (mapInstance && mapInstance.getContainer()) {
                    mapInstance.invalidateSize();
                  }
                }, 100);
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {(inlineMachineProducts
                ? [inlineMachineProducts.machine]
                : visibleMachines
              ).map(machine => (
                <Marker 
                  key={machine.id} 
                  position={machine.location}
                >
                  <Popup>
                    <div 
                      className="machine-popup clickable-popup"
                      onClick={() => {
                        setInlineMachineProducts({ machine });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <h3>{machine.name}</h3>
                      {machine.creditCardOnly && (
                        <p className="credit-card-only-badge">Credit card only</p>
                      )}
                      <p><strong>Building:</strong> {machine.building}</p>
                      <p><strong>Floor:</strong> {machine.floor}</p>
                      <p><strong>Notes:</strong> {machine.notes}</p>
                      {userLocation && (
                        <p><strong>Distance:</strong> {
                          formatDistance(calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            machine.location[0],
                            machine.location[1]
                          ))
                        }</p>
                      )}
                      <div className="popup-products">
                        <p><strong>Available Categories:</strong></p>
                        {renderCategorySummary(machine.products)}
                      </div>
                      <div className="popup-click-hint">
                        <p><em>Click to view all products →</em></p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* User location marker */}
              {userLocation && (
                <UserLocationMarker 
                  position={[userLocation.latitude, userLocation.longitude]}
                />
              )}
              
              {/* Map updater component to handle map view changes */}
              <MapUpdater 
                visibleMachines={visibleMachines} 
                userLocation={userLocation}
              />
            </MapContainer>
          </div>
        </div>
      </div>
      <Modal isOpen={campusMismatchModal.open} onClose={() => setCampusMismatchModal({ open: false, campus: '', building: '', machines: [] })}>
        <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Building on Different Campus</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            The building <strong>{campusMismatchModal.building}</strong> is on <strong>{campusMismatchModal.campus.charAt(0).toUpperCase() + campusMismatchModal.campus.slice(1)} Campus</strong>.<br />
            Would you like to view its items?
          </p>
          <div className="modal-btn-row" style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <button
              className="modal-btn-blue"
              onClick={() => {
                setCampusFilter(campusMismatchModal.campus);
                setCampusMismatchModal({ open: false, campus: '', building: '', machines: [] });
                setSearchResults(campusMismatchModal.machines.map(machine => ({ machine, products: machine.products, searchType: 'location', relevanceScore: 1 })));
                setSearchPerformed(true);
                setSearchTerm(campusMismatchModal.building);
                setVisibleMachines(campusMismatchModal.machines);
                setContentAnimKey(prev => prev + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ minWidth: 120, height: 48, fontSize: 16, fontWeight: 600, borderRadius: 12, border: 'none', color: 'white', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 4px 15px rgba(59,130,246,0.18)', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
            >
              Yes, show items
            </button>
            <button
              className="clear-button"
              onClick={() => setCampusMismatchModal({ open: false, campus: '', building: '', machines: [] })}
              style={{ minWidth: 120, height: 48, fontSize: 16, fontWeight: 600, borderRadius: 12, border: '2px solid #f87171', background: '#f87171', color: 'white', boxShadow: '0 4px 15px rgba(248,113,113,0.18)', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
        </div>
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton 
        onClick={() => setSubmissionModalOpen(true)}
        isMinimized={false}
      />
      
      {/* Submission Modal */}
      <SubmissionModal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
      />
    </div>
  );
}

export default MainPage;