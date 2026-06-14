'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { vendingMachines } from '../../../src/data/vendingMachines';
import { computeDemandReport } from '../../../lib/demandReport';
import '../operator.css';
import './report.css';

const PERIODS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

export default function DemandReportPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  // Catalog: static fallback, swapped for live Supabase data once loaded.
  const [machines, setMachines] = useState(vendingMachines);

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
    fetchReport();
  }, [session, period, machines]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReport = async () => {
    setReportLoading(true);
    const since = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString();
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', since);

    if (error) {
      console.error('Error fetching analytics:', error);
      setReportLoading(false);
      return;
    }
    setReport(computeDemandReport(events || [], machines));
    setReportLoading(false);
  };

  if (loading) {
    return <div className="report-center">Loading…</div>;
  }

  const periodLabel = PERIODS.find(p => p.value === period)?.label || `${period} days`;

  return (
    <div className="report-page">
      {/* Toolbar — hidden when printing */}
      <div className="report-toolbar no-print">
        <button className="report-back" onClick={() => router.push('/operator')}>← Dashboard</button>
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
        <button className="report-print" onClick={() => window.print()}>Print / Save as PDF</button>
      </div>

      {reportLoading || !report ? (
        <div className="report-center">Building report…</div>
      ) : (
        <ReportBody report={report} periodLabel={periodLabel} machineCount={machines.length} />
      )}
    </div>
  );
}

function ReportBody({ report, periodLabel, machineCount }) {
  const { headline, topSearches, unmetProducts, topBuildings, byHour, recommendations, config } = report;
  const hasData = headline.totalSearches > 0;
  const peakHour = byHour.reduce((a, b) => (b.count > a.count ? b : a), byHour[0]);

  return (
    <div className="report-sheet">
      {/* Header */}
      <header className="report-head">
        <div>
          <h1>Duke Vending Demand Report</h1>
          <p className="report-meta">
            Student search demand · last {periodLabel} · {machineCount} machines tracked
          </p>
        </div>
        <div className="report-brand">Munchr</div>
      </header>

      <p className="report-lede">
        Sales data shows what students <em>bought</em>. This report shows what they <strong>searched for and couldn&apos;t find</strong> —
        unmet demand that walked away from the machines.
      </p>

      {!hasData ? (
        <div className="report-center" style={{ padding: '3rem 0' }}>
          No search data in this window yet. Drive student usage (QR codes near machines, dorm channels),
          then this report fills in automatically.
        </div>
      ) : (
        <>
          {/* Headline numbers */}
          <div className="report-kpis">
            <Kpi value={`$${headline.estimatedLostRevenue.toLocaleString()}`} label="Est. demand lost" emphasis />
            <Kpi value={headline.totalSearches.toLocaleString()} label="Student searches" />
            <Kpi value={headline.uniqueSessions.toLocaleString()} label="Unique students" />
            <Kpi value={`${Math.round(headline.noResultRate * 100)}%`} label="No-result rate" />
          </div>

          <p className="report-formula">
            Estimated demand lost = {headline.totalUnmetSearches.toLocaleString()} no-result searches
            × ${config.avgVendPrice.toFixed(2)} avg vend price × {Math.round(config.conversionRate * 100)}% conservative conversion.
            Figures are directional estimates of <em>post-search demand</em>, not guaranteed sales.
          </p>

          <div className="report-cols">
            {/* Unmet demand — the headline insight */}
            <section className="report-section highlight">
              <h2>What students wanted but couldn&apos;t find</h2>
              {unmetProducts.length === 0 ? (
                <p className="report-empty">No zero-result searches — strong coverage.</p>
              ) : (
                <ol className="report-list">
                  {unmetProducts.map(item => (
                    <li key={item.product}>
                      <span className="ri-label">{item.product}</span>
                      <span className="ri-count">
                        {item.count} missed
                        {item.machinesStocking === 0 ? ' · not stocked anywhere' : ` · in ${item.machinesStocking} machine${item.machinesStocking !== 1 ? 's' : ''}`}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Top demand */}
            <section className="report-section">
              <h2>Top searched products</h2>
              <ol className="report-list">
                {topSearches.map(item => (
                  <li key={item.product}>
                    <span className="ri-label">{item.product}</span>
                    <span className="ri-count">{item.count}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Where demand concentrates */}
            <section className="report-section">
              <h2>Where students look for machines</h2>
              {topBuildings.length === 0 ? (
                <p className="report-empty">No machine views recorded yet.</p>
              ) : (
                <ol className="report-list">
                  {topBuildings.map(item => (
                    <li key={item.building}>
                      <span className="ri-label">{item.building}</span>
                      <span className="ri-count">{item.count} views</span>
                    </li>
                  ))}
                </ol>
              )}
              <p className="report-note">Peak search hour: {formatHour(peakHour.hour)} ({peakHour.count} searches).</p>
            </section>

            {/* Recommendations */}
            <section className="report-section reco">
              <h2>Recommended actions</h2>
              {recommendations.length === 0 ? (
                <p className="report-empty">Not enough signal yet for confident recommendations.</p>
              ) : (
                <ul className="report-reco-list">
                  {recommendations.map((r, i) => (
                    <li key={i}>{r.text}</li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}

      <footer className="report-foot">
        Generated by Munchr · Demand intelligence for campus vending · munchr.app
      </footer>
    </div>
  );
}

function Kpi({ value, label, emphasis }) {
  return (
    <div className={`report-kpi ${emphasis ? 'emph' : ''}`}>
      <span className="report-kpi-value">{value}</span>
      <span className="report-kpi-label">{label}</span>
    </div>
  );
}

function formatHour(h) {
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}
