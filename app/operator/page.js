'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
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
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/operator/login');
      } else {
        setSession(session);
        setLoading(false);
      }
    });
  }, [router]);

  useEffect(() => {
    if (!session) return;
    fetchStats();
  }, [session, period]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    setStatsLoading(true);
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();

    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', since);

    if (error) {
      console.error('Error fetching analytics:', error);
      setStatsLoading(false);
      return;
    }

    const searches = events.filter(e => e.event_type === 'search_performed');
    const noResults = events.filter(e => e.event_type === 'no_results_returned');
    const machineClicks = events.filter(e => e.event_type === 'machine_clicked');
    const directionsClicks = events.filter(e => e.event_type === 'directions_clicked');

    // Top searched products
    const queryCounts = {};
    searches.forEach(e => {
      if (e.query) queryCounts[e.query] = (queryCounts[e.query] || 0) + 1;
    });
    const topQueries = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // No-result searches
    const noResultCounts = {};
    noResults.forEach(e => {
      if (e.query) noResultCounts[e.query] = (noResultCounts[e.query] || 0) + 1;
    });
    const topNoResults = Object.entries(noResultCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    // Top machines clicked
    const machineCounts = {};
    machineClicks.forEach(e => {
      const key = e.building_id || e.machine_id || 'Unknown';
      machineCounts[key] = (machineCounts[key] || 0) + 1;
    });
    const topMachines = Object.entries(machineCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([building, count]) => ({ building, count }));

    // Unique sessions
    const uniqueSessions = new Set(events.map(e => e.session_id)).size;

    setStats({
      totalSearches: searches.length,
      totalMachineClicks: machineClicks.length,
      totalDirectionsClicks: directionsClicks.length,
      noResultSearches: noResults.length,
      uniqueSessions,
      topQueries,
      topNoResults,
      topMachines,
    });
    setStatsLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/operator/login');
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#64748b' }}>Loading...</div>;
  }

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
              <button
                key={p.value}
                className={`period-btn ${period === p.value ? 'active' : ''}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      {statsLoading ? (
        <div className="stats-loading">Loading analytics data...</div>
      ) : stats ? (
        <>
          {/* Summary cards */}
          <div className="stats-grid">
            <StatCard label="Total Searches" value={stats.totalSearches} icon="🔍" />
            <StatCard label="Unique Sessions" value={stats.uniqueSessions} icon="👤" />
            <StatCard label="Machine Views" value={stats.totalMachineClicks} icon="📍" />
            <StatCard label="No-Result Searches" value={stats.noResultSearches} icon="⚠️" highlight={stats.noResultSearches > 0} />
          </div>

          <div className="analytics-grid">
            {/* Top searches */}
            <div className="analytics-card">
              <h2>Top Product Searches</h2>
              <p className="card-subtitle">What students are looking for most</p>
              {stats.topQueries.length === 0 ? (
                <p className="empty-state">No searches recorded yet</p>
              ) : (
                <div className="ranked-list">
                  {stats.topQueries.map((item, i) => (
                    <div key={item.query} className="ranked-item">
                      <span className="rank">#{i + 1}</span>
                      <span className="ranked-label">{item.query}</span>
                      <span className="ranked-count">{item.count} search{item.count !== 1 ? 'es' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unmet demand */}
            <div className="analytics-card unmet-demand">
              <h2>Unmet Demand</h2>
              <p className="card-subtitle">Searches that returned no results — lost opportunity</p>
              {stats.topNoResults.length === 0 ? (
                <p className="empty-state">No zero-result searches — great coverage!</p>
              ) : (
                <div className="ranked-list">
                  {stats.topNoResults.map((item, i) => (
                    <div key={item.query} className="ranked-item alert">
                      <span className="rank">#{i + 1}</span>
                      <span className="ranked-label">{item.query}</span>
                      <span className="ranked-count">{item.count} missed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top machine views */}
            <div className="analytics-card">
              <h2>Most Viewed Buildings</h2>
              <p className="card-subtitle">Where students are looking for machines</p>
              {stats.topMachines.length === 0 ? (
                <p className="empty-state">No machine views recorded yet</p>
              ) : (
                <div className="ranked-list">
                  {stats.topMachines.map((item, i) => (
                    <div key={item.building} className="ranked-item">
                      <span className="rank">#{i + 1}</span>
                      <span className="ranked-label">{item.building}</span>
                      <span className="ranked-count">{item.count} view{item.count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* No data yet callout */}
            <div className="analytics-card callout">
              <h2>Coming Soon</h2>
              <p className="card-subtitle">More analytics as data accumulates</p>
              <ul className="coming-soon-list">
                <li>Searches by time of day</li>
                <li>Campus-level demand breakdown</li>
                <li>Seasonal trends</li>
                <li>Product placement recommendations</li>
                <li>Inventory freshness tracking</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Failed to load analytics data.</div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div className={`stat-card ${highlight ? 'highlight' : ''}`}>
      <span className="stat-icon">{icon}</span>
      <span className="stat-value">{value?.toLocaleString() ?? '—'}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
