'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { vendingMachines } from '../../src/data/vendingMachines';
import { computeDemandReport } from '../../lib/demandReport';
import { pct, hourLabel } from '../../lib/chartUtils';
import './operator.css';

const PERIODS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 14 days', value: 14 },
  { label: 'Last 30 days', value: 30 },
];

export default function OperatorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(14);
  const [report, setReport] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [machines, setMachines] = useState(vendingMachines);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/operator/login');
      else { setSession(session); setLoading(false); }
    });
  }, [router]);

  // Live catalog (for unmet-demand cross-reference), static fallback.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/machines')
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (!cancelled && data?.machines?.length) setMachines(data.machines); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();
    const { data: events, error } = await supabase.from('analytics_events').select('*').gte('timestamp', since);
    if (error) { console.error('Error fetching analytics:', error); setStatsLoading(false); return; }
    setReport(computeDemandReport(events || [], machines));
    setStatsLoading(false);
  }, [period, machines]);

  useEffect(() => { if (session) fetchStats(); }, [session, fetchStats]);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/operator/login'); };

  if (loading) return <div className="stats-loading">Loading…</div>;

  const h = report?.headline;

  return (
    <div className="operator-dashboard">
      <div className="operator-header">
        <div>
          <h1>Munchr Analytics</h1>
          <p className="operator-subtitle">Student demand intelligence for vending operators</p>
        </div>
        <div className="operator-header-right">
          <div className="period-selector">
            {PERIODS.map(p => (
              <button key={p.value} className={`period-btn ${period === p.value ? 'active' : ''}`} onClick={() => setPeriod(p.value)}>
                {p.label}
              </button>
            ))}
          </div>
          <button className="report-link-btn" onClick={() => router.push('/operator/report')}>📄 Demand Report</button>
          <button className="report-link-btn" onClick={() => router.push('/operator/inventory')}>✏️ Edit Inventory</button>
          <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      {statsLoading || !report ? (
        <div className="stats-loading">Loading analytics data...</div>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Est. Demand Lost" value={`$${h.estimatedLostRevenue.toLocaleString()}`} icon="💸" highlight={h.estimatedLostRevenue > 0} />
            <StatCard label="Total Searches" value={h.totalSearches.toLocaleString()} icon="🔍" />
            <StatCard label="Unique Sessions" value={h.uniqueSessions.toLocaleString()} icon="👤" />
            <StatCard label="No-Result Rate" value={`${Math.round(h.noResultRate * 100)}%`} icon="⚠️" highlight={h.noResultRate > 0} />
          </div>

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
              <h2>Conversion Funnel</h2>
              <p className="card-subtitle">Search intent → machine interest → high-intent directions</p>
              <div className="funnel">
                <FunnelStep label="Searches" value={h.totalSearches} />
                <span className="funnel-arrow">→</span>
                <FunnelStep label="Machine Views" value={h.machineViews} />
                <span className="funnel-arrow">→</span>
                <FunnelStep label="Directions" value={h.directionsClicks} />
                <div className="funnel-rate">
                  <span className="funnel-rate-value">{Math.round((h.viewToDirectionsRate || 0) * 100)}%</span>
                  <span className="funnel-rate-label">view → directions</span>
                </div>
              </div>
            </div>

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
        </>
      )}
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
