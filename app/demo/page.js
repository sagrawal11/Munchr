'use client';

// Public, no-auth demo of the Munchr operator dashboard, rendered from a clearly-labeled
// ILLUSTRATIVE sample dataset (lib/demo/sampleDemandData.js). This never touches the real
// /operator dashboard or the production analytics_events table — it exists purely as a
// shareable artifact for outreach ("here's what the demand intelligence looks like").

import { sampleReport, sampleMeta } from '../../lib/demo/sampleDemandData';
import { pct, hourLabel } from '../../lib/chartUtils';
import ItemDrilldownCard from '../../src/components/ItemDrilldownCard';
import '../operator/operator.css';
import './demo.css';

export default function DemoDashboard() {
  // Precomputed at generation time (scripts/generate-demo-dataset.mjs) from the same engine
  // the real dashboard uses — shipped aggregated so the bundle stays tiny at any scale.
  const report = sampleReport;
  const h = report.headline;

  return (
    <div className="operator-dashboard">
      <div className="demo-banner no-print">
        <span className="demo-banner-icon">🧪</span>
        <span className="demo-banner-text">
          <strong>Demo — illustrative sample data.</strong> Figures below are a synthetic
          illustration of Munchr at a fully-deployed fleet scale, shown to demonstrate the
          product and the magnitude of demand it captures. They are not real measured analytics.
        </span>
      </div>

      <div className="operator-header">
        <div>
          <h1>Munchr Analytics</h1>
          <p className="operator-subtitle">
            Student demand intelligence for vending operators · illustrative at-scale example · {sampleMeta.label}
          </p>
        </div>
        <div className="operator-header-right no-print">
          <button className="demo-print-btn" onClick={() => window.print()}>Print / Save as PDF</button>
        </div>
      </div>

      <p className="demo-lede">
        Sales data shows what students <em>bought</em>. Munchr shows what they{' '}
        <strong>searched for and couldn&apos;t find</strong> — unmet demand that walked away
        from the machines.
      </p>

      <div className="stats-grid">
        <StatCard label="Est. Demand Lost" value={`$${h.estimatedLostRevenue.toLocaleString()}`} icon="💸" highlight={h.estimatedLostRevenue > 0} />
        <StatCard label="Total Searches" value={h.totalSearches.toLocaleString()} icon="🔍" />
        <StatCard label="Unique Sessions" value={h.uniqueSessions.toLocaleString()} icon="👤" />
        <StatCard label="No-Result Rate" value={`${Math.round(h.noResultRate * 100)}%`} icon="⚠️" highlight={h.noResultRate > 0} />
      </div>

      <p className="demo-note">
        Illustrative figures at a fully-deployed fleet scale — they show the <em>magnitude</em> of
        demand Munchr captures (what students searched for, when, and where) as usage grows.
      </p>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h2>Top Product Searches</h2>
          <p className="card-subtitle">What students are looking for most</p>
          <BarList items={report.topSearches.map(i => ({ label: i.product, value: i.count }))} emptyText="No searches recorded yet" />
        </div>

        <div className="analytics-card unmet-demand">
          <h2>Unmet Demand</h2>
          <p className="card-subtitle">Searched but not found — lost opportunity</p>
          <BarList
            items={report.unmetProducts.map(i => ({ label: i.product, value: i.count, note: i.machinesStocking === 0 ? 'not stocked' : `in ${i.machinesStocking}` }))}
            emptyText="No zero-result searches — great coverage!"
            alert
          />
        </div>

        <div className="analytics-card requests-card">
          <h2>Direct Requests</h2>
          <p className="card-subtitle">Asked for via the on-machine QR — explicit demand</p>
          <BarList
            items={report.topRequests.map(i => ({ label: i.product, value: i.count, note: i.machinesStocking === 0 ? 'not stocked' : `in ${i.machinesStocking}` }))}
            emptyText="No direct requests yet"
          />
        </div>

        <div className="analytics-card">
          <h2>When Students Search</h2>
          <p className="card-subtitle">Search volume by hour of day</p>
          <HourHistogram byHour={report.byHour} />
        </div>

        <div className="analytics-card">
          <h2>Demand by Building</h2>
          <p className="card-subtitle">Where students look for machines</p>
          <BarList items={report.topBuildings.map(i => ({ label: i.building, value: i.count }))} emptyText="No machine views recorded yet" />
        </div>

        <div className="analytics-card span-2">
          <h2>Engagement Funnel</h2>
          <p className="card-subtitle">Search intent → machine interest (true conversion comes from sales via Integrations)</p>
          <div className="funnel">
            <FunnelStep label="Searches" value={h.totalSearches} />
            <span className="funnel-arrow">→</span>
            <FunnelStep label="Machine Views" value={h.machineViews} />
            <div className="funnel-rate">
              <span className="funnel-rate-value">{h.totalSearches > 0 ? Math.round((h.machineViews / h.totalSearches) * 100) : 0}%</span>
              <span className="funnel-rate-label">search → view</span>
            </div>
          </div>
        </div>

        <ItemDrilldownCard items={report.itemBreakdowns} />

        <div className="analytics-card callout span-2">
          <h2>Recommended Actions</h2>
          <p className="card-subtitle">Rule-based stocking suggestions from the data</p>
          {report.recommendations.length === 0 ? (
            <p className="empty-state">Not enough signal yet for confident recommendations.</p>
          ) : (
            <ul className="reco-list">
              {report.recommendations.map((r, i) => <li key={i}>{r.text}</li>)}
            </ul>
          )}
        </div>
      </div>

      <p className="demo-note" style={{ marginTop: '2rem', textAlign: 'center' }}>
        Generated by Munchr · Demand intelligence for campus vending · Illustrative sample data
      </p>
    </div>
  );
}

function FunnelStep({ label, value }) {
  return (
    <div className="funnel-step">
      <span className="funnel-value">{(value ?? 0).toLocaleString()}</span>
      <span className="funnel-label">{label}</span>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{value ?? '—'}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function BarList({ items, emptyText, alert }) {
  if (!items || items.length === 0) return <p className="empty-state">{emptyText}</p>;
  const max = Math.max(...items.map(i => i.value));
  return (
    <div className="bar-list">
      {items.map((item, i) => (
        <div key={item.label + i} className="bar-row">
          <span className="bar-label" title={item.label}>{item.label}</span>
          <div className="bar-track">
            <div className={`bar-fill ${alert ? 'alert' : ''}`} style={{ width: `${pct(item.value, max)}%` }} />
          </div>
          <span className="bar-value">{item.value}{item.note ? <em> · {item.note}</em> : null}</span>
        </div>
      ))}
    </div>
  );
}

function HourHistogram({ byHour }) {
  const max = Math.max(...byHour.map(b => b.count), 0);
  if (max === 0) return <p className="empty-state">No search timing data yet</p>;
  return (
    <div className="hour-histogram">
      {byHour.map(b => (
        <div key={b.hour} className="hour-col" title={`${hourLabel(b.hour)}: ${b.count}`}>
          <div className="hour-bar" style={{ height: `${pct(b.count, max)}%` }} />
          {b.hour % 6 === 0 && <span className="hour-tick">{hourLabel(b.hour)}</span>}
        </div>
      ))}
    </div>
  );
}
