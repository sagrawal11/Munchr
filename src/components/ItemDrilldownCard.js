'use client';

// Item-level drill-down card used by BOTH the real /operator dashboard and the public /demo page.
// Pick a product from the dropdown to see where (which buildings) and when (hour of day) it's
// searched. Data comes from report.itemBreakdowns (see lib/demandReport.js → computeDemandReport).

import { useState } from 'react';
import { pct, hourLabel } from '../../lib/chartUtils';

export default function ItemDrilldownCard({ items }) {
  const [selected, setSelected] = useState('');

  if (!items || items.length === 0) {
    return (
      <div className="analytics-card span-2">
        <h2>Item Deep-Dive</h2>
        <p className="card-subtitle">Pick a product to see where and when it&apos;s searched</p>
        <p className="empty-state">No item-level data yet.</p>
      </div>
    );
  }

  const item = items.find(i => i.product === selected) || items[0];
  const maxHour = Math.max(...item.byHour.map(b => b.count), 0);
  const maxBldg = Math.max(...item.topBuildings.map(b => b.count), 0);

  return (
    <div className="analytics-card span-2">
      <div className="item-dd-head">
        <div>
          <h2>Item Deep-Dive</h2>
          <p className="card-subtitle">Where and when a specific product is searched</p>
        </div>
        <select
          className="item-select"
          value={item.product}
          onChange={e => setSelected(e.target.value)}
          aria-label="Select a product"
        >
          {items.map(i => (
            <option key={i.product} value={i.product}>
              {i.product} ({i.total.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      <div className="item-stat-row">
        <span className="item-stat"><strong>{item.total.toLocaleString()}</strong> searches</span>
        {item.unmet > 0 && (
          <span className="item-stat alert"><strong>{item.unmet.toLocaleString()}</strong> with no result</span>
        )}
        <span className="item-stat">
          stocked in <strong>{item.machinesStocking.toLocaleString()}</strong> machine{item.machinesStocking !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="item-detail-grid">
        <div>
          <h3>Most searched in</h3>
          {item.topBuildings.length === 0 ? (
            <p className="empty-state">
              No building data — these searches returned no result, so there&apos;s no machine to attribute.
            </p>
          ) : (
            <div className="bar-list">
              {item.topBuildings.map((b, i) => (
                <div key={b.building + i} className="bar-row">
                  <span className="bar-label" title={b.building}>{b.building}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct(b.count, maxBldg)}%` }} />
                  </div>
                  <span className="bar-value">{b.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3>When it&apos;s searched</h3>
          {maxHour === 0 ? (
            <p className="empty-state">No timing data for this item yet.</p>
          ) : (
            <div className="hour-histogram">
              {item.byHour.map(b => (
                <div key={b.hour} className="hour-col" title={`${hourLabel(b.hour)}: ${b.count.toLocaleString()}`}>
                  <div className="hour-bar" style={{ height: `${pct(b.count, maxHour)}%` }} />
                  {b.hour % 6 === 0 && <span className="hour-tick">{hourLabel(b.hour)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
