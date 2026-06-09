import React from 'react';
import './Navigation.css';

const Navigation = () => {
  const isActive = typeof window !== 'undefined' && window.location.pathname === '/';

  return (
    <div className="tab-navigation">
      <a
        href="/"
        className={`tab ${isActive ? 'active' : ''}`}
      >
        🥤 Vending Machines
      </a>
    </div>
  );
};

export default Navigation;
