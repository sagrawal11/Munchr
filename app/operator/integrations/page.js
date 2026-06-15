'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { parseCsv, buildCatalogFromCsv, guessMapping, CSV_FIELDS } from '../../../lib/integrations/csv';
import { commitCatalog } from '../../../lib/integrations/commit';
import '../operator.css';
import './integrations.css';

const NONE = '';

export default function IntegrationsPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState('csv'); // 'csv' | 'nayax'
  const [committing, setCommitting] = useState(false);
  const [msg, setMsg] = useState(null);

  // CSV state
  const [fileName, setFileName] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});

  // Nayax state
  const [nayaxToken, setNayaxToken] = useState('');
  const [nayaxEnv, setNayaxEnv] = useState('production');
  const [nayaxSales, setNayaxSales] = useState(false);
  const [nayaxLoading, setNayaxLoading] = useState(false);
  const [nayaxCatalog, setNayaxCatalog] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/operator/login');
      else { setSession(session); setLoading(false); }
    });
  }, [router]);

  const csvCatalog = useMemo(() => {
    if (!csvText || !mapping.machineName || !mapping.productName) return null;
    return buildCatalogFromCsv(csvText, mapping);
  }, [csvText, mapping]);

  if (loading) return <div className="inv-center">Loading…</div>;

  const catalog = provider === 'nayax' ? nayaxCatalog : csvCatalog;
  const flash = (type, text) => setMsg({ type, text });

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const { headers: hdrs } = parseCsv(text);
    setFileName(file.name); setCsvText(text); setHeaders(hdrs); setMapping(guessMapping(hdrs)); setMsg(null);
  };
  const setField = (field, header) => setMapping(m => ({ ...m, [field]: header || undefined }));

  const fetchNayax = async () => {
    setNayaxLoading(true); setMsg(null); setNayaxCatalog(null);
    try {
      const res = await fetch('/api/integrations/nayax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ token: nayaxToken, env: nayaxEnv, includeSales: nayaxSales }),
      });
      const data = await res.json();
      if (!res.ok) { flash('error', data.error || 'Nayax fetch failed'); return; }
      setNayaxCatalog(data.catalog);
      flash('success', `Fetched from Nayax — ${data.catalog.machines.length} machines, ${data.catalog.inventory.length} products.`);
    } catch (e) {
      flash('error', `Nayax fetch failed: ${e.message}`);
    } finally {
      setNayaxLoading(false);
    }
  };

  const onCommit = async () => {
    if (!catalog) return;
    setCommitting(true); setMsg(null);
    const res = await commitCatalog(supabase, catalog);
    setCommitting(false);
    if (res.error) flash('error', `Import failed: ${res.error.message}`);
    else flash('success', `Imported ✓ — ${res.applied.machines} new machines, ${res.applied.inventory} inventory rows, ${res.applied.sales} sales.`);
  };

  return (
    <div className="operator-dashboard">
      <div className="operator-header">
        <div>
          <h1>Integrations</h1>
          <p className="operator-subtitle">Connect your vending stack — import via CSV or the Nayax API</p>
        </div>
        <div className="operator-header-right">
          <button className="report-link-btn" onClick={() => router.push('/operator')}>← Dashboard</button>
        </div>
      </div>

      {msg && <div className={`inv-flash ${msg.type}`}>{msg.text}</div>}

      <div className="integ-tabs">
        <button className={`integ-tab ${provider === 'csv' ? 'active' : ''}`} onClick={() => setProvider('csv')}>📄 CSV export</button>
        <button className={`integ-tab ${provider === 'nayax' ? 'active' : ''}`} onClick={() => setProvider('nayax')}>🔌 Nayax API</button>
      </div>

      {provider === 'csv' && (
        <>
          <div className="integ-card">
            <h2 className="inv-section-title">1. Upload a CSV export</h2>
            <p className="integ-hint">Export machines/products/inventory (and optionally sales) from any VMS. We&apos;ll auto-detect the columns.</p>
            <label className="integ-upload">
              <input type="file" accept=".csv,text/csv" onChange={onFile} />
              {fileName ? `📄 ${fileName}` : 'Choose CSV file…'}
            </label>
          </div>

          {headers.length > 0 && (
            <div className="integ-card">
              <h2 className="inv-section-title">2. Map columns</h2>
              <p className="integ-hint">Machine name and Product name are required.</p>
              <div className="integ-map-grid">
                {CSV_FIELDS.map(f => (
                  <label key={f.key} className="integ-map-row">
                    <span className="integ-field">{f.label}{f.required && <em className="integ-req"> *</em>}</span>
                    <select value={mapping[f.key] || NONE} onChange={e => setField(f.key, e.target.value)}>
                      <option value={NONE}>— not mapped —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {provider === 'nayax' && (
        <div className="integ-card">
          <h2 className="inv-section-title">Connect Nayax</h2>
          <p className="integ-hint">
            In Nayax Core → Account Settings → Security and Login → User Tokens → <strong>Show Token</strong>, copy it and paste below.
            Your token is used server-side only and never stored.
          </p>
          <div className="integ-map-grid">
            <label className="integ-map-row">
              <span className="integ-field">Lynx API token <em className="integ-req">*</em></span>
              <input type="password" value={nayaxToken} onChange={e => setNayaxToken(e.target.value)} placeholder="Bearer token from Nayax Core" />
            </label>
            <label className="integ-map-row">
              <span className="integ-field">Environment</span>
              <select value={nayaxEnv} onChange={e => setNayaxEnv(e.target.value)}>
                <option value="production">Production</option>
                <option value="qa">QA / sandbox</option>
              </select>
            </label>
            <label className="integ-map-row integ-checkbox">
              <input type="checkbox" checked={nayaxSales} onChange={e => setNayaxSales(e.target.checked)} />
              <span className="integ-field">Also pull recent sales (slower)</span>
            </label>
          </div>
          <button className="inv-save-btn" disabled={!nayaxToken || nayaxLoading} onClick={fetchNayax}>
            {nayaxLoading ? 'Fetching from Nayax…' : 'Fetch from Nayax'}
          </button>
        </div>
      )}

      {catalog && (
        <div className="integ-card">
          <h2 className="inv-section-title">Preview</h2>
          <div className="integ-preview">
            <PreviewStat value={catalog.machines.length} label="Machines" />
            <PreviewStat value={catalog.products.length} label="Products" />
            <PreviewStat value={catalog.inventory.length} label="Inventory rows" />
            <PreviewStat value={catalog.sales.length} label="Sales rows" />
            <PreviewStat value={catalog.errors.length} label="Errors" alert={catalog.errors.length > 0} />
          </div>
          {catalog.errors.length > 0 && (
            <details className="integ-errors">
              <summary>{catalog.errors.length} issues</summary>
              <ul>{catalog.errors.slice(0, 20).map((e, i) => <li key={i}>{e.row ? `Row ${e.row}: ` : ''}{e.reason}</li>)}</ul>
            </details>
          )}
          <button className="inv-save-btn" disabled={committing} onClick={onCommit}>
            {committing ? 'Importing…' : 'Import into Munchr'}
          </button>
          <p className="integ-hint" style={{ marginTop: '0.75rem' }}>
            Matches machines/products to existing records (by name or machine ID); new ones are created.
            Inventory availability is updated; sales are appended.
          </p>
        </div>
      )}
    </div>
  );
}

function PreviewStat({ value, label, alert }) {
  return (
    <div className={`integ-stat ${alert ? 'alert' : ''}`}>
      <span className="integ-stat-value">{value.toLocaleString()}</span>
      <span className="integ-stat-label">{label}</span>
    </div>
  );
}
